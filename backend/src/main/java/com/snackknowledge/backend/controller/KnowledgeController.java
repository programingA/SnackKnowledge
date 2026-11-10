package com.snackknowledge.backend.controller;

import com.snackknowledge.backend.dto.KnowledgeResponse;
import com.snackknowledge.backend.service.KnowledgeService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class KnowledgeController {

    private final KnowledgeService knowledgeService;

    public KnowledgeController(
            KnowledgeService knowledgeService
    ){
        this.knowledgeService = knowledgeService;
    }

    @GetMapping("/api/knowledge")
    public List<KnowledgeResponse> getKnowledgeList() {
        return knowledgeService.getKnowledgeResponseList();
    }

    @GetMapping("/api/knowledge/{id}")
    public KnowledgeResponse getKnowledge(
            @PathVariable("id") Long id
    ) {
        return knowledgeService.getKnowledge(id);
    }
}
