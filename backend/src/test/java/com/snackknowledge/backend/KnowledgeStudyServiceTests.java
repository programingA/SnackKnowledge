package com.snackknowledge.backend;

import com.snackknowledge.backend.dto.KnowledgeQuizResponse;
import com.snackknowledge.backend.dto.KnowledgeResponse;
import com.snackknowledge.backend.service.KnowledgeAnswerService;
import com.snackknowledge.backend.service.KnowledgeStudyService;
import com.snackknowledge.backend.service.QuizAttemptService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class KnowledgeStudyServiceTests {
    private final KnowledgeAnswerService ai = mock(KnowledgeAnswerService.class);
    private final QuizAttemptService attempts = mock(QuizAttemptService.class);
    private final KnowledgeStudyService study = new KnowledgeStudyService(ai, attempts);
    private final MockHttpSession session = new MockHttpSession();
    private final KnowledgeResponse sky = new KnowledgeResponse(1L, "과학", "하늘", "빛의 산란", "파란빛이 더 잘 흩어져요.");

    @Test
    void keepsCardHistoryAndBlocksTheSixthQuestion() {
        when(ai.answer(eq(sky), anyString(), anyList())).thenReturn("답변");
        for (int turn = 1; turn <= 5; turn++) {
            assertEquals(turn, study.ask(session, sky, "질문 " + turn).conversation().turns().size());
        }
        verify(ai).answer(sky, "질문 2", List.of(new KnowledgeStudyService.Turn("질문 1", "답변")));
        assertEquals(5, study.conversation(session, 1L).turns().size());
        assertTrue(study.conversation(session, 2L).turns().isEmpty());
        assertTrue(study.conversation(new MockHttpSession(), 1L).turns().isEmpty());
        var rejected = assertThrows(ResponseStatusException.class, () -> study.ask(session, sky, "여섯 번째 질문"));
        assertEquals(HttpStatus.TOO_MANY_REQUESTS, rejected.getStatusCode());
        verify(ai, times(5)).answer(eq(sky), anyString(), anyList());
    }

    @Test
    void failedAnswersDoNotUseAQuestion() {
        when(ai.answer(eq(sky), anyString(), anyList())).thenReturn("");
        assertThrows(ResponseStatusException.class, () -> study.ask(session, sky, "질문"));
        assertTrue(study.conversation(session, sky.id()).turns().isEmpty());
    }

    @Test
    void retriesDuplicateQuestionsAndKeepsTheQuizSource() {
        var first = quiz("낮 하늘이 파란 이유는?");
        var duplicate = quiz("낮 하늘이 파란 이유는 !");
        var next = quiz("노을에서 붉은빛이 남는 이유는?");
        when(ai.generateQuiz(eq(sky), anyList())).thenReturn(first, duplicate, next);
        when(attempts.start(eq(session), eq(sky.id()), eq(sky.title()), any()))
                .thenAnswer(call -> {
                    KnowledgeQuizResponse quiz = call.getArgument(3);
                    return new QuizAttemptService.QuizQuestion(UUID.randomUUID(), quiz.question(), quiz.options());
                });

        assertEquals(first.question(), study.nextQuiz(session, sky).question());
        assertEquals(next.question(), study.nextQuiz(session, sky).question());
        verify(ai, times(2)).generateQuiz(sky, List.of(first.question()));
        verify(attempts, never()).start(session, sky.id(), sky.title(), duplicate);
    }

    private KnowledgeQuizResponse quiz(String question) {
        return new KnowledgeQuizResponse(question, List.of("하나", "둘", "셋", "넷"), 0, "해설");
    }
}
