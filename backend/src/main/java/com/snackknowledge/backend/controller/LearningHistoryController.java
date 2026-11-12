package com.snackknowledge.backend.controller;

import com.snackknowledge.backend.repository.KnowledgeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.time.Instant;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/me/learning-history")
public class LearningHistoryController {
    private static final Set<String> ACTIVITIES = Set.of("read", "question", "quiz", "explanation");

    private final JdbcClient jdbc;
    private final KnowledgeRepository knowledgeRepository;

    public LearningHistoryController(JdbcClient jdbc, KnowledgeRepository knowledgeRepository) {
        this.jdbc = jdbc;
        this.knowledgeRepository = knowledgeRepository;
    }

    @GetMapping
    public List<LearningActivity> list(Principal principal) {
        return jdbc.sql("""
                SELECT k.id, k.title, h.activity, h.learned_at
                FROM member_learning_history h
                JOIN knowledge k ON k.id = h.knowledge_id
                WHERE h.username = ?
                ORDER BY h.learned_at DESC, h.knowledge_id DESC, h.activity
                LIMIT 100
                """)
                .param(principal.getName())
                .query((row, index) -> new LearningActivity(
                        row.getLong("id"), row.getString("title"),
                        row.getString("activity"), row.getTimestamp("learned_at").toInstant()))
                .list();
    }

    @PostMapping("/{id}/{activity}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void record(@PathVariable("id") long id, @PathVariable("activity") String activity, Principal principal) {
        if (!ACTIVITIES.contains(activity)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        }
        int affected = jdbc.sql("""
                INSERT INTO member_learning_history (username, knowledge_id, activity)
                SELECT ?, id, ? FROM knowledge WHERE id = ?
                ON DUPLICATE KEY UPDATE learned_at = CURRENT_TIMESTAMP(6)
                """).params(principal.getName(), activity, id).update();
        if (affected == 0 && !knowledgeRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
    }

    public record LearningActivity(long id, String title, String activity, Instant learnedAt) {}
}
