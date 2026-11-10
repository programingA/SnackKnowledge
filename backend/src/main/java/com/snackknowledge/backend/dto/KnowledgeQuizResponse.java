package com.snackknowledge.backend.dto;

import java.util.List;

public record KnowledgeQuizResponse(
        String question,
        List<String> options,
        int correctIndex,
        String explanation
) {

}
