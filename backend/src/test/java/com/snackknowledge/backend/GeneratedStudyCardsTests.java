package com.snackknowledge.backend;

import com.snackknowledge.backend.dto.KnowledgeQuizResponse;
import com.snackknowledge.backend.dto.KnowledgeResponse;
import com.snackknowledge.backend.service.GeneratedStudyCards;
import com.snackknowledge.backend.service.KnowledgeAnswerService;
import com.snackknowledge.backend.service.KnowledgeStudyService;
import com.snackknowledge.backend.service.QuizAttemptService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GeneratedStudyCardsTests {
    private final GeneratedStudyCards cards = new GeneratedStudyCards(mock(JdbcClient.class));

    @Test
    void previewIsLimitedToItsSessionAndPrivateCardsRequireLogin() {
        var session = new MockHttpSession();
        UUID id = cards.remember(session, "과학", "제목", "요약", "생성한 본문");
        assertEquals("생성한 본문", cards.resolve(session, "preview", id, null).knowledge().content());

        var missing = assertThrows(ResponseStatusException.class,
                () -> cards.resolve(new MockHttpSession(), "preview", id, null));
        assertEquals(HttpStatus.NOT_FOUND, missing.getStatusCode());

        var privateCard = assertThrows(ResponseStatusException.class, () -> cards.resolve(session, "saved", id, null));
        assertEquals(HttpStatus.UNAUTHORIZED, privateCard.getStatusCode());
    }

    @Test
    void reconnectingTheSamePreviewKeepsItsStudyIdentifier() {
        var session = new MockHttpSession();
        var card = new KnowledgeResponse(null, "과학", "제목", "요약", "생성한 본문");
        UUID id = cards.reconnect(session, card);
        assertEquals(id, cards.reconnect(session, card));
        assertNotEquals(id, cards.reconnect(new MockHttpSession(), card));
    }

    @Test
    void generatedCardsUseTheirOwnHistoryAndReuseServerGrading() {
        var session = new MockHttpSession();
        UUID id = cards.remember(session, "과학", "제목", "요약", "생성한 본문");
        var card = cards.resolve(session, "preview", id, null);
        var ai = mock(KnowledgeAnswerService.class);
        var attempts = mock(QuizAttemptService.class);
        var study = new KnowledgeStudyService(ai, attempts);
        when(ai.answer(card.knowledge(), "질문", List.of())).thenReturn("답변");

        study.ask(session, card.key(), card.knowledge(), "질문");
        assertEquals(List.of(new KnowledgeStudyService.Turn("질문", "답변")),
                study.conversation(session, card.key()).turns());
        assertTrue(study.conversation(session, 1L).turns().isEmpty());

        var quiz = new KnowledgeQuizResponse("문제", List.of("A", "B", "C", "D"), 0, "해설");
        var attempt = new QuizAttemptService.QuizQuestion(UUID.randomUUID(), quiz.question(), quiz.options());
        when(ai.generateQuiz(card.knowledge(), List.of())).thenReturn(quiz);
        when(attempts.startPractice(session, quiz)).thenReturn(attempt);

        assertEquals(attempt, study.nextQuiz(session, card.key(), card.knowledge()));
        verify(attempts).startPractice(session, quiz);
    }
}

