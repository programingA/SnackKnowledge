package com.snackknowledge.backend.controller;

import com.snackknowledge.backend.dto.KnowledgeQuestionRequest;
import com.snackknowledge.backend.service.KnowledgeIllustrationService;
import com.snackknowledge.backend.service.KnowledgeStudyService;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.time.Duration;
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
import com.snackknowledge.backend.service.QuizAttemptService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import com.snackknowledge.backend.dto.KnowledgeExplanationRequest;
import com.snackknowledge.backend.dto.KnowledgeGenerateRequest;
import com.snackknowledge.backend.dto.KnowledgeGenerateResponse;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.security.Principal;

@RestController
public class KnowledgeController {

    private final KnowledgeService knowledgeService;
    private final KnowledgeAnswerService knowledgeAnswerService;
    private final QuizAttemptService quizAttemptService;
    private final KnowledgeStudyService study;
    private final KnowledgeIllustrationService illustrations;

    public KnowledgeController(
            KnowledgeService knowledgeService,
            KnowledgeAnswerService knowledgeAnswerService,
            QuizAttemptService quizAttemptService,
            KnowledgeStudyService study,
            KnowledgeIllustrationService illustrations
    ){
        this.knowledgeService = knowledgeService;
        this.knowledgeAnswerService = knowledgeAnswerService;
        this.quizAttemptService = quizAttemptService;
        this.study = study;
        this.illustrations = illustrations;
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

    @GetMapping("/api/knowledge/{id}/image")
    public ResponseEntity<byte[]> image(@PathVariable("id") Long id) {
        return illustrations.find(id).map(bytes -> ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("image/webp"))
                .cacheControl(CacheControl.maxAge(Duration.ofHours(24)))
                .body(bytes)).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/api/knowledge/{id}/questions")
    public KnowledgeStudyService.Conversation conversation(@PathVariable("id") Long id, HttpSession session) {
        knowledgeService.getKnowledge(id);
        return study.conversation(session, id);
    }

    @PostMapping("/api/knowledge/{id}/questions")
    public KnowledgeStudyService.QuestionResult receiveQuestion(
            @PathVariable("id") Long id,
            @RequestBody KnowledgeQuestionRequest request,
            HttpSession session
    ) {
        return study.ask(session, knowledgeService.getKnowledge(id), request.question());
    }

    @PostMapping("/api/knowledge/{id}/quiz")
    public QuizAttemptService.QuizQuestion generateQuiz(@PathVariable("id") Long id, HttpSession session) {
        return study.nextQuiz(session, knowledgeService.getKnowledge(id));
    }

    @PostMapping("/api/quizzes/{quizId}/submissions")
    public QuizAttemptService.QuizGrade submitQuiz(
            @PathVariable("quizId") UUID quizId,
            @RequestBody QuizSubmission submission,
            HttpServletRequest request,
            Principal principal
    ) {
        return quizAttemptService.grade(request.getSession(false), quizId, submission.selectedIndex(),
                principal == null ? null : principal.getName());
    }

    public record QuizSubmission(Integer selectedIndex) {}

    @PostMapping("/api/knowledge/{id}/explanations")
    public Map<String, String> receiveExplanation(
            @PathVariable Long id,
            @RequestBody KnowledgeExplanationRequest request
    ) {
        String explanation = request.explanation();

        int length = explanation == null ? 0 : explanation.strip().codePointCount(0, explanation.strip().length());
        if (length < 20 || length > 1500) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "설명을 20~1,500자로 입력해주세요."
            );
        }
        KnowledgeResponse knowledge = knowledgeService.getKnowledge(id);

        String feedback = knowledgeAnswerService.giveExplanationFeedback(knowledge, explanation.strip());
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
