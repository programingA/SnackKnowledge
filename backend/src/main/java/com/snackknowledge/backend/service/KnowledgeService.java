package com.snackknowledge.backend.service;

import com.snackknowledge.backend.dto.KnowledgeResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.snackknowledge.backend.entity.Knowledge;
import com.snackknowledge.backend.repository.KnowledgeRepository;
import java.util.ArrayList;
import java.util.Optional;

import java.util.List;

@Service
public class KnowledgeService {
    private final KnowledgeRepository knowledgeRepository;

    public KnowledgeService(KnowledgeRepository knowledgeRepository)
    {
        this.knowledgeRepository = knowledgeRepository;
    }

    private final List<KnowledgeResponse> knowledgeResponseList = List.of(
            new KnowledgeResponse(
                    1L,
                    "과학",
                    "하늘은 왜 파란색일까?",
                    "빛이 대기에서 흩어지는 원리는 알아봐요.",
                    "햇빛이 대기를 통과할 때 파란빛이 붉은빛보다 더 잘 산란되어 하늘이 파랗게 보입니다."
            ),
            new KnowledgeResponse(
                    2L,
                    "우주",
                    "달은 스스로 빛나지 않아요",
                    "달빛은 어디에서 오는 걸까요?",
                    "달은 태양빛을 반사해 밝게 보입니다."
            )
    );

    public List<KnowledgeResponse> getKnowledgeResponseList() {
        List<Knowledge> rows = knowledgeRepository.findAll();
        List<KnowledgeResponse> responses = new ArrayList<>();

        for (Knowledge knowledge : rows) {
            responses.add(new KnowledgeResponse(
               knowledge.getId(),
               knowledge.getCategory(),
               knowledge.getTitle(),
               knowledge.getSummary(),
               knowledge.getContent()
            ));
        }

        return responses;
    }

    public KnowledgeResponse getKnowledge(Long id) {
        Optional<Knowledge> result = knowledgeRepository.findById(id);

        if (result.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "해당 지식을 찾을 수 없습니다."
            );
        }

        Knowledge knowledge = result.get();

        return new KnowledgeResponse(
                knowledge.getId(),
                knowledge.getCategory(),
                knowledge.getTitle(),
                knowledge.getSummary(),
                knowledge.getContent()
        );
    }
}
