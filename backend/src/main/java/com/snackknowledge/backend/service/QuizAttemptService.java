package com.snackknowledge.backend.service;

import com.snackknowledge.backend.dto.KnowledgeQuizResponse;
import com.snackknowledge.backend.repository.WrongAnswerRepository;
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
    private final WrongAnswerRepository wrongAnswers;
    private final Clock clock;

    public QuizAttemptService(WrongAnswerRepository wrongAnswers) {
        this.wrongAnswers = wrongAnswers;
        this.clock = Clock.systemUTC();
    }

    public QuizQuestion start(HttpSession session, long knowledgeId, String knowledgeTitle, KnowledgeQuizResponse quiz) {
        return start(session, quiz, new Source(knowledgeId, knowledgeTitle));
    }

    public QuizQuestion startPractice(HttpSession session, KnowledgeQuizResponse quiz) {
        return start(session, quiz, null);
    }

    private QuizQuestion start(HttpSession session, KnowledgeQuizResponse quiz, Source source) {
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
            var snapshot = new KnowledgeQuizResponse(quiz.question(), options, quiz.correctIndex(), quiz.explanation());
            attempts.put(id, new Attempt(snapshot, source, now.plus(VALID_FOR), null));
        }
        return new QuizQuestion(id, quiz.question(), options);
    }

    public QuizGrade grade(HttpSession session, UUID quizId, Integer selectedIndex, String username) {
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
            var quiz = attempt.quiz();
            if (selectedIndex >= quiz.options().size()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "답안을 확인해주세요.");
            }
            if (attempt.selectedIndex() != null && !attempt.selectedIndex().equals(selectedIndex)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 제출한 퀴즈예요.");
            }
            boolean correct = selectedIndex == quiz.correctIndex();
            if (attempt.selectedIndex() == null) {
                if (!correct && username != null && attempt.source() != null) {
                    var source = attempt.source();
                    wrongAnswers.save(username, quizId, source.id(), source.title(), quiz);
                }
                attempts.put(quizId, new Attempt(quiz, attempt.source(), attempt.expiresAt(), selectedIndex));
            }
            return new QuizGrade(correct, quiz.correctIndex(), quiz.explanation());
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

    private record Source(long id, String title) {}
    private record Attempt(KnowledgeQuizResponse quiz, Source source, Instant expiresAt, Integer selectedIndex) {}

    public record QuizQuestion(UUID quizId, String question, List<String> options) {}
    public record QuizGrade(boolean correct, int correctIndex, String explanation) {}
}
