package com.snackknowledge.backend.dto;

public record KnowledgeResponse(
        Long id,
        String category,
        String title,
        String summary,
        String content
) {

}
