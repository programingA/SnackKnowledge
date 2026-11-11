package com.snackknowledge.backend.controller;

import com.snackknowledge.backend.dto.KnowledgeQuestionRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.server.ResponseStatusException;
import com.snackknowledge.backend.dto.KnowledgeResponse;
import com.snackknowledge.backend.service.KnowledgeService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import com.snackknowledge.backend.service.KnowledgeAnswerService;
import com.snackknowledge.backend.dto.KnowledgeQuizResponse;
import com.snackknowledge.backend.dto.KnowledgeExplanationRequest;
import com.snackknowledge.backend.dto.KnowledgeGenerateRequest;
import com.snackknowledge.backend.dto.KnowledgeGenerateResponse;

import java.util.List;
import java.util.Map;

@RestController
public class KnowledgeController {

    private final KnowledgeService knowledgeService;
    private final KnowledgeAnswerService knowledgeAnswerService;

    public KnowledgeController(
            KnowledgeService knowledgeService,
            KnowledgeAnswerService knowledgeAnswerService
    ){
        this.knowledgeService = knowledgeService;
        this.knowledgeAnswerService = knowledgeAnswerService;
    }

    @GetMapping("/api/knowledge")
    public List<KnowledgeResponse> getKnowledgeList() {
        return knowledgeService.getKnowledgeResponseList();
    }

    @GetMapping("/api/knowledge/{id}")
    public KnowledgeResponse getKnowledge(
            @PathVariable("id") Long id
    ) {
        return knowledgeService.getKnowledge(id);
    }

    @PostMapping("/api/knowledge/{id}/questions")
    public Map<String, String> receiveQuestion(
            @PathVariable("id") Long id,
            @RequestBody KnowledgeQuestionRequest request
    ) {
        if (request.question() == null || request.question().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "질문을 입력해주세요."
            );
        }

        KnowledgeResponse knowledge =
                knowledgeService.getKnowledge(id);
        String answer = knowledgeAnswerService.answer(knowledge, request.question());

        return Map.of("answer", answer);
    }

    @PostMapping("/api/knowledge/{id}/quiz")
    public KnowledgeQuizResponse generateQuiz(@PathVariable("id") Long id) {
        KnowledgeResponse knowledge = knowledgeService.getKnowledge(id);

        return knowledgeAnswerService.generateQuiz(knowledge);
    }

    @PostMapping("/api/knowledge/{id}/explanations")
    public Map<String, String> receiveExplanation(
            @PathVariable Long id,
            @RequestBody KnowledgeExplanationRequest request
    ) {
        String explanation = request.explanation();

        if (explanation == null || explanation.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "설명을 입력해주세요."
            );
        }
        KnowledgeResponse knowledge = knowledgeService.getKnowledge(id);

        String feedback = knowledgeAnswerService.giveExplanationFeedback(knowledge, explanation);
        return Map.of("feedback", feedback);
    }

    @PostMapping("/api/knowledge/generate")
    public KnowledgeGenerateResponse generateKnowledge(
            @RequestBody KnowledgeGenerateRequest request
    ) {
        String topic = request.topic();

        if (topic == null || topic.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "주제를 입력해주세요."
            );
        }

        return knowledgeAnswerService.generateKnowledge(topic.strip());
    }
}
