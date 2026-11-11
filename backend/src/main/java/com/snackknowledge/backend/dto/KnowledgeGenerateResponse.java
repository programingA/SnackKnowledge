package com.snackknowledge.backend.dto;

public record KnowledgeGenerateResponse(
        String category,
        String title,
        String summary,
        String content
) {

}
