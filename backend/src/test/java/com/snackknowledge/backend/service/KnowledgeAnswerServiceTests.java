package com.snackknowledge.backend.service;

import com.openai.models.responses.Response;
import com.openai.models.responses.ResponseStatus;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

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

