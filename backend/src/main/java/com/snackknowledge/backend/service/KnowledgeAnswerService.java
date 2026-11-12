package com.snackknowledge.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.errors.OpenAIException;
import com.openai.models.images.ImageGenerateParams;
import com.openai.models.responses.Response;
import com.openai.models.responses.ResponseCreateParams;
import com.openai.models.responses.ResponseStatus;
import com.snackknowledge.backend.dto.KnowledgeResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.snackknowledge.backend.dto.KnowledgeQuizResponse;
import com.snackknowledge.backend.dto.KnowledgeGenerateResponse;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.function.LongFunction;
import java.util.stream.Collectors;

@Service
public class KnowledgeAnswerService {

    private static final Logger log = LoggerFactory.getLogger(KnowledgeAnswerService.class);

    private static final String TEXT_MODEL = "gpt-5.6-terra";
    private static final ObjectMapper JSON = new ObjectMapper();
    private static final long TEXT_OUTPUT_TOKENS = 3_072;
    private static final long RETRY_TEXT_OUTPUT_TOKENS = 6_144;

    private final OpenAIClient client;

    @Autowired
    public KnowledgeAnswerService(@Value("${openai.api-key}") String apiKey) {
        this(apiKey.isBlank() ? null : OpenAIOkHttpClient.builder().apiKey(apiKey).build());
    }

    KnowledgeAnswerService(OpenAIClient client) {
        this.client = client;
    }

    public String answer(KnowledgeResponse knowledge, String question, List<KnowledgeStudyService.Turn> history) {
        var input = Map.of("card", knowledge, "history", history, "question", question);
        return reviewDraft("question", input, requestText(json(input), KnowledgeAiPolicy.QUESTION));
    }

    public String giveExplanationFeedback(KnowledgeResponse knowledge, String explanation) {
        var input = Map.of("card", knowledge, "explanation", explanation);
        return reviewDraft("explanation", input, requestText(json(input), KnowledgeAiPolicy.EXPLANATION));
    }

    private String requestText(String input, String instructions) {
        if (client == null) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE, "OpenAI API 키를 설정해주세요."
            );
        }

        var response = requireCompleteTextResponse(maxTokens -> client.responses().create(ResponseCreateParams.builder()
                .model(TEXT_MODEL)
                .instructions(KnowledgeAiPolicy.RULES + instructions)
                .input(input)
                .store(false)
                .maxOutputTokens(maxTokens)
                .build()));

        return response.output().stream()
                .flatMap(item -> item.message().stream())
                .flatMap(message -> message.content().stream())
                .flatMap(content -> content.outputText().stream())
                .map(text -> text.text())
                .collect(Collectors.joining("\n"));
    }

    static Response requireCompleteTextResponse(LongFunction<Response> generate) {
        Response response = generate.apply(TEXT_OUTPUT_TOKENS);
        if (response.status().filter(ResponseStatus.INCOMPLETE::equals).isPresent()
                && response.incompleteDetails().flatMap(Response.IncompleteDetails::reason)
                    .filter(Response.IncompleteDetails.Reason.MAX_OUTPUT_TOKENS::equals).isPresent()) {
            response = generate.apply(RETRY_TEXT_OUTPUT_TOKENS);
        }
        if (response.status().filter(ResponseStatus.COMPLETED::equals).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI 답변이 끝까지 생성되지 않았어요. 다시 질문해주세요.");
        }
        return response;
    }

    public KnowledgeQuizResponse generateQuiz(KnowledgeResponse knowledge, List<String> previousQuestions) {
        var input = Map.of("card", knowledge, "previousQuestions", previousQuestions);
        var quiz = requestStructured(json(input), KnowledgeAiPolicy.QUIZ, KnowledgeQuizResponse.class, 3_072);
        if (!hasText(quiz.question(), 500) || !hasText(quiz.explanation(), 2_000)
                || quiz.options() == null || quiz.options().size() != 4
                || quiz.options().stream().anyMatch(option -> !hasText(option, 500))
                || quiz.options().stream().map(String::strip).distinct().count() != 4
                || quiz.correctIndex() < 0 || quiz.correctIndex() >= 4) {
            throw invalidOutput();
        }
        return reviewDraft("quiz", input, quiz);
    }

    public KnowledgeGenerateResponse generateKnowledge(String inputTopic) {
        String topic = inputTopic == null ? "" : inputTopic.strip();
        if (!hasText(topic, 100)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "주제는 1~100자로 입력해주세요.");
        }
        var input = Map.of("topic", topic);
        checkVerdict(requestStructured(json(input), KnowledgeAiPolicy.TOPIC_REVIEW, KnowledgeAiPolicy.Decision.class, 1_536));
        var card = requestStructured(json(input), KnowledgeAiPolicy.CARD, KnowledgeGenerateResponse.class, 3_072);
        if (!hasText(card.category(), 100) || !hasText(card.title(), 255)
                || !hasText(card.summary(), 2_000) || !hasText(card.content(), 12_000)) {
            throw invalidOutput();
        }
        return reviewDraft("card", input, card);
    }

    private <T> T reviewDraft(String operation, Object input, T draft) {
        if (draft instanceof String text && text.isBlank()) throw invalidOutput();
        var review = Map.of("operation", operation, "request", input, "draft", draft);
        checkVerdict(requestStructured(json(review), KnowledgeAiPolicy.OUTPUT_REVIEW, KnowledgeAiPolicy.Decision.class, 3_072));
        return draft;
    }

    private static void checkVerdict(KnowledgeAiPolicy.Decision decision) {
        if (decision.verdict() == KnowledgeAiPolicy.Verdict.APPROVED) return;
        if (decision.verdict() == KnowledgeAiPolicy.Verdict.INPUT_REJECTED) {
            throw new ResponseStatusException(HttpStatus.valueOf(422), "학습에 적합한 주제나 현재 카드와 관련된 내용으로 다시 입력해주세요.");
        }
        throw invalidOutput();
    }

    private <T> T requestStructured(String input, String instructions, Class<T> type, long maxTokens) {
        if (client == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "OpenAI API 키를 설정해주세요.");
        }
        try {
            var response = client.responses().create(ResponseCreateParams.builder()
                    .model(TEXT_MODEL)
                    .instructions(KnowledgeAiPolicy.RULES + instructions)
                    .input(input)
                    .store(false)
                    .maxOutputTokens(maxTokens)
                    .text(type)
                    .build());
            if (response.status().filter(ResponseStatus.COMPLETED::equals).isEmpty()) throw invalidOutput();
            return response.output().stream()
                    .flatMap(item -> item.message().stream())
                    .flatMap(message -> message.content().stream())
                    .flatMap(content -> content.outputText().stream())
                    .findFirst()
                    .orElseThrow(KnowledgeAnswerService::invalidOutput);
        } catch (OpenAIException error) {
            log.warn("Knowledge AI request failed ({})", error.getClass().getSimpleName());
            throw invalidOutput();
        }
    }

    private static boolean hasText(String text, int maxLength) {
        return text != null && !text.isBlank() && text.codePointCount(0, text.length()) <= maxLength;
    }

    private static String json(Object data) {
        try {
            return JSON.writeValueAsString(data);
        } catch (JsonProcessingException error) {
            throw new IllegalStateException("Could not encode the AI request", error);
        }
    }

    private static ResponseStatusException invalidOutput() {
        return new ResponseStatusException(HttpStatus.BAD_GATEWAY, "검토를 통과한 AI 결과를 받지 못했어요. 다시 시도해주세요.");
    }

    public String generateCardImage(String title, String summary) {
        if (client == null) return null;

        var params = ImageGenerateParams.builder()
                .model("gpt-image-1.5")
                .size("1536x1024")
                .quality(ImageGenerateParams.Quality.LOW)
                .outputFormat(ImageGenerateParams.OutputFormat.WEBP)
                .prompt("""
                        Create a landscape editorial illustration for a beginner-friendly knowledge card.
                        Show the central concept clearly with a warm color palette.
                        Use no text, lettering, formulas, logos, or watermarks in the image.
                        Use the title and summary below as subject material only.

                        Title: %s
                        Summary: %s
                        """.formatted(title, summary))
                .build();

        try {
            return client.images()
                    .withOptions(options -> options.timeout(Duration.ofSeconds(60)).maxRetries(0))
                    .generate(params)
                    .data().stream()
                    .flatMap(images -> images.stream())
                    .flatMap(image -> image.b64Json().stream())
                    .filter(image -> !image.isBlank())
                    .findFirst()
                    .orElse(null);
        } catch (OpenAIException error) {
            log.warn("Knowledge card image generation failed ({})", error.getClass().getSimpleName());
            return null;
        }
    }
}
