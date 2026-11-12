package com.snackknowledge.backend.service;

import com.snackknowledge.backend.dto.KnowledgeQuizResponse;
import com.snackknowledge.backend.dto.KnowledgeResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class KnowledgeStudyService {
    private static final int QUESTION_LIMIT = 5;
    private static final int MAX_QUESTION_LENGTH = 300;
    private static final int QUIZ_ATTEMPTS = 3;
    private static final int QUIZ_PROMPT_HISTORY = 12;
    private static final String SESSION_KEY = KnowledgeStudyService.class.getName();

    private final KnowledgeAnswerService ai;
    private final QuizAttemptService quizzes;

    public KnowledgeStudyService(KnowledgeAnswerService ai, QuizAttemptService quizzes) {
        this.ai = ai;
        this.quizzes = quizzes;
    }

    public Conversation conversation(HttpSession session, long id) {
        var chat = cardStudy(session, id).turns;
        synchronized (chat) {
            return new Conversation(List.copyOf(chat), QUESTION_LIMIT);
        }
    }

    public QuestionResult ask(HttpSession session, KnowledgeResponse knowledge, String input) {
        String question = input == null ? "" : input.strip();
        if (question.isEmpty() || question.codePointCount(0, question.length()) > MAX_QUESTION_LENGTH) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "질문은 1~300자로 입력해주세요.");
        }
        var chat = cardStudy(session, knowledge.id()).turns;
        synchronized (chat) {
            if (chat.size() >= QUESTION_LIMIT) {
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "이 카드에서 질문할 수 있는 5회를 모두 사용했어요.");
            }
            String answer = ai.answer(knowledge, question, List.copyOf(chat));
            if (answer.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI 답변을 받지 못했어요.");
            }
            chat.add(new Turn(question, answer));
            return new QuestionResult(answer, new Conversation(List.copyOf(chat), QUESTION_LIMIT));
        }
    }

    public QuizAttemptService.QuizQuestion nextQuiz(HttpSession session, KnowledgeResponse knowledge) {
        var previous = cardStudy(session, knowledge.id()).quizQuestions;
        synchronized (previous) {
            var recent = List.copyOf(previous.subList(Math.max(0, previous.size() - QUIZ_PROMPT_HISTORY), previous.size()));
            for (int attempt = 0; attempt < QUIZ_ATTEMPTS; attempt++) {
                KnowledgeQuizResponse quiz = ai.generateQuiz(knowledge, recent);
                String question = quiz.question();
                if (question != null && previous.stream().noneMatch(old -> sameQuestion(old, question))) {
                    var result = quizzes.start(session, knowledge.id(), knowledge.title(), quiz);
                    previous.add(question);
                    return result;
                }
            }
        }
        throw new ResponseStatusException(HttpStatus.CONFLICT, "이 카드에서 다른 퀴즈를 만들지 못했어요.");
    }

    private static boolean sameQuestion(String first, String second) {
        String firstKey = quizKey(first);
        String secondKey = quizKey(second);
        if (firstKey.equals(secondKey)) return true;
        if (firstKey.length() < 10 || secondKey.length() < 10) return false;

        var firstTrigrams = trigrams(firstKey);
        var secondTrigrams = trigrams(secondKey);
        long shared = firstTrigrams.stream().filter(secondTrigrams::contains).count();
        return 2.0 * shared / (firstTrigrams.size() + secondTrigrams.size()) >= 0.8;
    }

    private static Set<String> trigrams(String text) {
        var result = new HashSet<String>();
        for (int index = 0; index + 3 <= text.length(); index++) {
            result.add(text.substring(index, index + 3));
        }
        return result;
    }

    private static String quizKey(String question) {
        return question.toLowerCase(Locale.ROOT).replaceAll("[^\\p{L}\\p{N}]", "");
    }

    private synchronized CardStudy cardStudy(HttpSession session, long id) {
        if (!(session.getAttribute(SESSION_KEY) instanceof StudySession)) {
            session.setAttribute(SESSION_KEY, new StudySession());
        }
        var state = (StudySession) session.getAttribute(SESSION_KEY);
        return state.cards.computeIfAbsent(id, ignored -> new CardStudy());
    }

    private static final class StudySession {
        private final Map<Long, CardStudy> cards = new HashMap<>();
    }

    private static final class CardStudy {
        private final List<Turn> turns = new ArrayList<>();
        private final List<String> quizQuestions = new ArrayList<>();
    }

    public record Turn(String question, String answer) {}
    public record Conversation(List<Turn> turns, int limit) {}
    public record QuestionResult(String answer, Conversation conversation) {}
}
