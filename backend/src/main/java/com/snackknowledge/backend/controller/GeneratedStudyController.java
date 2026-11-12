package com.snackknowledge.backend.controller;

import com.snackknowledge.backend.dto.KnowledgeExplanationRequest;
import com.snackknowledge.backend.dto.KnowledgeGenerateResponse;
import com.snackknowledge.backend.dto.KnowledgeResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import com.snackknowledge.backend.dto.KnowledgeQuestionRequest;
import com.snackknowledge.backend.service.GeneratedStudyCards;
import com.snackknowledge.backend.service.KnowledgeStudyService;
import com.snackknowledge.backend.service.QuizAttemptService;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/study/generated")
public class GeneratedStudyController {
    private final GeneratedStudyCards cards;
    private final KnowledgeStudyService study;

    public GeneratedStudyController(GeneratedStudyCards cards, KnowledgeStudyService study) {
        this.cards = cards;
        this.study = study;
    }

    @PostMapping("/previews")
    public PreviewReference reconnect(@RequestBody KnowledgeGenerateResponse card, HttpSession session) {
        if (!hasText(card.category(), 100) || !hasText(card.title(), 255)
                || !hasText(card.summary(), 2000) || !hasText(card.content(), 12000)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이 카드의 학습 기능을 연결할 수 없어요.");
        }
        return new PreviewReference(cards.reconnect(session,
                new KnowledgeResponse(null, card.category(), card.title(), card.summary(), card.content())));
    }

    private boolean hasText(String value, int maxLength) {
        return value != null && !value.isBlank() && value.length() <= maxLength;
    }

    public record PreviewReference(UUID studyId) {}

    @GetMapping("/{source}/{id}/questions")
    public KnowledgeStudyService.Conversation conversation(
            @PathVariable("source") String source, @PathVariable("id") UUID id, HttpSession session, Principal principal) {
        return study.conversation(session, cards.resolve(session, source, id, principal).key());
    }

    @PostMapping("/{source}/{id}/questions")
    public KnowledgeStudyService.QuestionResult ask(
            @PathVariable("source") String source, @PathVariable("id") UUID id, HttpSession session,
            Principal principal, @RequestBody KnowledgeQuestionRequest request) {
        var card = cards.resolve(session, source, id, principal);
        return study.ask(session, card.key(), card.knowledge(), request.question());
    }

    @PostMapping("/{source}/{id}/quiz")
    public QuizAttemptService.QuizQuestion quiz(
            @PathVariable("source") String source, @PathVariable("id") UUID id, HttpSession session, Principal principal) {
        var card = cards.resolve(session, source, id, principal);
        return study.nextQuiz(session, card.key(), card.knowledge());
    }

    @PostMapping("/{source}/{id}/explanations")
    public Map<String, String> explanation(
            @PathVariable("source") String source, @PathVariable("id") UUID id, HttpSession session,
            Principal principal, @RequestBody KnowledgeExplanationRequest request) {
        var card = cards.resolve(session, source, id, principal);
        return Map.of("feedback", study.explain(card.knowledge(), request.explanation()));
    }
}
