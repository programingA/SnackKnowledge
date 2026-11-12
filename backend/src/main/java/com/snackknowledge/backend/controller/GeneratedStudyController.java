package com.snackknowledge.backend.controller;

import com.snackknowledge.backend.dto.KnowledgeExplanationRequest;
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
@RequestMapping("/api/study/generated/{source}/{id}")
public class GeneratedStudyController {
    private final GeneratedStudyCards cards;
    private final KnowledgeStudyService study;

    public GeneratedStudyController(GeneratedStudyCards cards, KnowledgeStudyService study) {
        this.cards = cards;
        this.study = study;
    }

    @GetMapping("/questions")
    public KnowledgeStudyService.Conversation conversation(
            @PathVariable("source") String source, @PathVariable("id") UUID id, HttpSession session, Principal principal) {
        return study.conversation(session, cards.resolve(session, source, id, principal).key());
    }

    @PostMapping("/questions")
    public KnowledgeStudyService.QuestionResult ask(
            @PathVariable("source") String source, @PathVariable("id") UUID id, HttpSession session,
            Principal principal, @RequestBody KnowledgeQuestionRequest request) {
        var card = cards.resolve(session, source, id, principal);
        return study.ask(session, card.key(), card.knowledge(), request.question());
    }

    @PostMapping("/quiz")
    public QuizAttemptService.QuizQuestion quiz(
            @PathVariable("source") String source, @PathVariable("id") UUID id, HttpSession session, Principal principal) {
        var card = cards.resolve(session, source, id, principal);
        return study.nextQuiz(session, card.key(), card.knowledge());
    }

    @PostMapping("/explanations")
    public Map<String, String> explanation(
            @PathVariable("source") String source, @PathVariable("id") UUID id, HttpSession session,
            Principal principal, @RequestBody KnowledgeExplanationRequest request) {
        var card = cards.resolve(session, source, id, principal);
        return Map.of("feedback", study.explain(card.knowledge(), request.explanation()));
    }
}
