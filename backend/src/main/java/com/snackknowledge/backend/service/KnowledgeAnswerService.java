package com.snackknowledge.backend.service;

import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.responses.ResponseCreateParams;
import com.snackknowledge.backend.dto.KnowledgeResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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
}
