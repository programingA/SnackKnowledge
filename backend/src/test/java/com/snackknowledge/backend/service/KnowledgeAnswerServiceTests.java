package com.snackknowledge.backend.service;

import com.openai.client.OpenAIClient;
import com.openai.models.responses.Response;
import com.openai.models.responses.ResponseStatus;
import com.openai.models.responses.StructuredResponse;
import com.openai.models.responses.StructuredResponseCreateParams;
import com.openai.models.responses.StructuredResponseOutputItem;
import com.openai.models.responses.StructuredResponseOutputMessage;
import com.openai.services.blocking.ResponseService;
import com.snackknowledge.backend.dto.KnowledgeGenerateResponse;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.function.LongFunction;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class KnowledgeAnswerServiceTests {
    @Test
    void retriesAnOutputLimitWithMoreSpaceAndUsesOnlyTheCompleteResponse() {
        Response partial = response(ResponseStatus.INCOMPLETE, Response.IncompleteDetails.Reason.MAX_OUTPUT_TOKENS);
        Response complete = response(ResponseStatus.COMPLETED, null);
        @SuppressWarnings("unchecked")
        LongFunction<Response> generate = mock(LongFunction.class);
        when(generate.apply(3_072)).thenReturn(partial);
        when(generate.apply(6_144)).thenReturn(complete);

        assertSame(complete, KnowledgeAnswerService.requireCompleteTextResponse(generate));
        verify(generate).apply(3_072);
        verify(generate).apply(6_144);
        verifyNoMoreInteractions(generate);
    }

    @Test
    void doesNotReturnAStillIncompleteResponse() {
        Response partial = response(ResponseStatus.INCOMPLETE, Response.IncompleteDetails.Reason.MAX_OUTPUT_TOKENS);
        var error = assertThrows(ResponseStatusException.class,
                () -> KnowledgeAnswerService.requireCompleteTextResponse(tokens -> partial));

        assertEquals(HttpStatus.BAD_GATEWAY, error.getStatusCode());
    }

    @Test
    void rejectedTopicStopsBeforeCardGeneration() {
        var client = mock(OpenAIClient.class);
        var responses = mock(ResponseService.class);
        when(client.responses()).thenReturn(responses);
        stubDrafts(responses, structured(new KnowledgeAiPolicy.Decision(KnowledgeAiPolicy.Verdict.INPUT_REJECTED)));

        var error = assertThrows(ResponseStatusException.class,
                () -> new KnowledgeAnswerService(client).generateKnowledge("검토 대상 주제"));

        assertEquals(422, error.getStatusCode().value());
        verify(responses, times(1)).create(ArgumentMatchers.<StructuredResponseCreateParams<Object>>any());
        verify(client, never()).images();
    }

    @Test
    void rejectedCardDraftNeverReachesTheCaller() {
        var client = mock(OpenAIClient.class);
        var responses = mock(ResponseService.class);
        when(client.responses()).thenReturn(responses);
        var card = new KnowledgeGenerateResponse("과학", "빛", "요약", "검토 대상 본문");
        stubDrafts(responses, structured(new KnowledgeAiPolicy.Decision(KnowledgeAiPolicy.Verdict.APPROVED)),
                structured(card), structured(new KnowledgeAiPolicy.Decision(KnowledgeAiPolicy.Verdict.OUTPUT_REJECTED)));

        var error = assertThrows(ResponseStatusException.class,
                () -> new KnowledgeAnswerService(client).generateKnowledge("빛의 산란"));

        assertEquals(HttpStatus.BAD_GATEWAY, error.getStatusCode());
        verify(responses, times(3)).create(ArgumentMatchers.<StructuredResponseCreateParams<Object>>any());
        verify(client, never()).images();
    }

    private void stubDrafts(ResponseService responses, StructuredResponse<?> first, StructuredResponse<?>... rest) {
        doReturn(first, (Object[]) rest).when(responses)
                .create(ArgumentMatchers.<StructuredResponseCreateParams<Object>>any());
    }

    @SuppressWarnings("unchecked")
    private <T> StructuredResponse<T> structured(T result) {
        StructuredResponse<T> response = mock(StructuredResponse.class);
        StructuredResponseOutputItem<T> item = mock(StructuredResponseOutputItem.class);
        StructuredResponseOutputMessage<T> message = mock(StructuredResponseOutputMessage.class);
        StructuredResponseOutputMessage.Content<T> content = mock(StructuredResponseOutputMessage.Content.class);
        when(response.status()).thenReturn(Optional.of(ResponseStatus.COMPLETED));
        when(response.output()).thenReturn(List.of(item));
        when(item.message()).thenReturn(Optional.of(message));
        when(message.content()).thenReturn(List.of(content));
        when(content.outputText()).thenReturn(Optional.of(result));
        return response;
    }


    private Response response(ResponseStatus status, Response.IncompleteDetails.Reason reason) {
        Response response = mock(Response.class);
        when(response.status()).thenReturn(Optional.of(status));
        if (reason != null) {
            Response.IncompleteDetails details = mock(Response.IncompleteDetails.class);
            when(details.reason()).thenReturn(Optional.of(reason));
            when(response.incompleteDetails()).thenReturn(Optional.of(details));
        }
        return response;
    }
}

