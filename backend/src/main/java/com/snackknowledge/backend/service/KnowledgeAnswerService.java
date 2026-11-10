package com.snackknowledge.backend.service;

import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.responses.ResponseCreateParams;
import com.snackknowledge.backend.dto.KnowledgeResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.snackknowledge.backend.dto.KnowledgeQuizResponse;

import javax.swing.*;
import java.util.stream.Collectors;

@Service
public class KnowledgeAnswerService {

    private final OpenAIClient client;

    public KnowledgeAnswerService(@Value("${openai.api-key}")String apiKey) {
        this.client = apiKey.isBlank()
                ? null
                : OpenAIOkHttpClient.builder().apiKey(apiKey).build();
    }

    public String answer(KnowledgeResponse knowledge, String question) {
        if (client == null) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE, "OpenAI API 키를 설정해주세요."
            );
        }

        String input = """
                제목: %s
                본문: %s

                질문: %s
                """.formatted(knowledge.title(), knowledge.content(), question);

        var params = ResponseCreateParams.builder()
                .model("gpt-5.6-terra")
                .instructions("본문을 참고해 한국어로 쉽게 답하세요. 근거가 부족하면 그렇게 알려주세요.")
                .input(input)
                .maxOutputTokens(600L)
                .build();

        var response = client.responses().create(params);

        return response.output().stream()
                .flatMap(item -> item.message().stream())
                .flatMap(message -> message.content().stream())
                .flatMap(content -> content.outputText().stream())
                .map(text -> text.text())
                .collect(Collectors.joining("\n"));
    }

    public KnowledgeQuizResponse generateQuiz(KnowledgeResponse knowledge) {
        if(client == null) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "OpneAI API 키를 설정해주세요."
            );
        }

        var params = ResponseCreateParams.builder()
                .model("gpt-5.6-terra")
                .instructions("""
                        본문을 바탕으로 한국어 객관식 퀴즈 한 문제를 만드세요.
                        보기는 서로 다른 네 개로 만들고, 정답은 하나만 두세요.
                        correctIndex는 0부터 3 사이의 정답 위치입니다.
                        해설은 본문에 근거해 짧게 작성하세요.
                        """)
                .input(knowledge.content())
                .maxOutputTokens(1000L)
                .text(KnowledgeQuizResponse.class)
                .build();

        var response = client.responses().create(params);

        KnowledgeQuizResponse quiz = response.output().stream()
                .flatMap(item -> item.message().stream())
                .flatMap(message -> message.content().stream())
                .flatMap(content -> content.outputText().stream())
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "퀴즈를 생성하지 못했어요."
                ));

        if (quiz.options() == null || quiz.options().size() != 4
            || quiz.correctIndex() < 0 || quiz.correctIndex() >= 4){
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "퀴즈의 보기 또는 정답 위치가 올바르지 않아요."
            );
        }

        return quiz;
    }
}
