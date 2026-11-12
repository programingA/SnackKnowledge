package com.snackknowledge.backend.service;

import com.snackknowledge.backend.dto.KnowledgeQuizResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.UUID;

@Service
public class QuizAttemptService {
    private static final String SESSION_KEY = QuizAttemptService.class.getName();
    private static final Duration VALID_FOR = Duration.ofMinutes(30);
    private static final int MAX_QUIZZES = 12;
    private final Clock clock;

    public QuizAttemptService() {
        this(Clock.systemUTC());
    }

    QuizAttemptService(Clock clock) {
        this.clock = clock;
    }

    public QuizQuestion start(HttpSession session, KnowledgeQuizResponse quiz) {
        if (quiz == null || quiz.question() == null || quiz.question().isBlank()
                || quiz.options() == null || quiz.options().size() != 4
                || quiz.options().stream().anyMatch(option -> option == null || option.isBlank())
                || quiz.correctIndex() < 0 || quiz.correctIndex() >= quiz.options().size()
                || quiz.explanation() == null || quiz.explanation().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "퀴즈를 생성하지 못했어요.");
        }
        var options = List.copyOf(quiz.options());
        UUID id = UUID.randomUUID();
        var attempts = getOrCreateAttempts(session);
        Instant now = clock.instant();
        synchronized (attempts) {
            attempts.values().removeIf(attempt -> !now.isBefore(attempt.expiresAt()));
            if (attempts.size() >= MAX_QUIZZES) attempts.pollFirstEntry();
            attempts.put(id, new Attempt(options.size(), quiz.correctIndex(), quiz.explanation(),
                    now.plus(VALID_FOR), null));
        }
        return new QuizQuestion(id, quiz.question(), options);
    }

    public QuizGrade grade(HttpSession session, UUID quizId, Integer selectedIndex) {
        if (selectedIndex == null || selectedIndex < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "답안을 확인해주세요.");
        }
        if (session == null || !(session.getAttribute(SESSION_KEY) instanceof Attempts attempts)) {
            throw unavailableQuiz();
        }
        synchronized (attempts) {
            Attempt attempt = attempts.get(quizId);
            if (attempt == null || !clock.instant().isBefore(attempt.expiresAt())) {
                attempts.remove(quizId);
                throw unavailableQuiz();
            }
            if (selectedIndex >= attempt.optionCount()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "답안을 확인해주세요.");
            }
            if (attempt.selectedIndex() != null && !attempt.selectedIndex().equals(selectedIndex)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 제출한 퀴즈예요.");
            }
            if (attempt.selectedIndex() == null) {
                attempts.put(quizId, new Attempt(attempt.optionCount(), attempt.correctIndex(), attempt.explanation(),
                        attempt.expiresAt(), selectedIndex));
            }
            return new QuizGrade(selectedIndex == attempt.correctIndex(), attempt.correctIndex(), attempt.explanation());
        }
    }

    private synchronized Attempts getOrCreateAttempts(HttpSession session) {
        if (session.getAttribute(SESSION_KEY) instanceof Attempts existing) return existing;
        var attempts = new Attempts();
        session.setAttribute(SESSION_KEY, attempts);
        return attempts;
    }

    private ResponseStatusException unavailableQuiz() {
        return new ResponseStatusException(HttpStatus.GONE, "퀴즈가 만료됐어요. 새로 만들어주세요.");
    }

    private static final class Attempts extends LinkedHashMap<UUID, Attempt> {}

    private record Attempt(int optionCount, int correctIndex, String explanation,
                           Instant expiresAt, Integer selectedIndex) {}

    public record QuizQuestion(UUID quizId, String question, List<String> options) {}
    public record QuizGrade(boolean correct, int correctIndex, String explanation) {}
}
