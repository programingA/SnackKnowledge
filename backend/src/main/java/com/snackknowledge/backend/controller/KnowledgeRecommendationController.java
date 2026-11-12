package com.snackknowledge.backend.controller;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/me/recommendations")
public class KnowledgeRecommendationController {
    private final JdbcClient jdbc;

    public KnowledgeRecommendationController(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping
    public List<Recommendation> list(Principal principal) {
        return jdbc.sql("""
                WITH interest_signals AS (
                    SELECT k.category, 3 AS points
                    FROM member_bookmark b JOIN knowledge k ON k.id = b.knowledge_id
                    WHERE b.username = :username
                    UNION ALL
                    SELECT k.category, 1 AS points
                    FROM member_learning_history h JOIN knowledge k ON k.id = h.knowledge_id
                    WHERE h.username = :username AND h.activity = 'read'
                ),
                interests AS (
                    SELECT category, SUM(points) AS points
                    FROM interest_signals
                    GROUP BY category
                )
                SELECT k.id, k.category, k.title, k.summary, COALESCE(i.points, 0) AS score
                FROM knowledge k
                LEFT JOIN interests i ON i.category = k.category
                WHERE NOT EXISTS (
                    SELECT 1 FROM member_learning_history h
                    WHERE h.username = :username AND h.knowledge_id = k.id AND h.activity = 'read'
                )
                AND NOT EXISTS (
                    SELECT 1 FROM member_bookmark b
                    WHERE b.username = :username AND b.knowledge_id = k.id
                )
                ORDER BY score DESC, k.id DESC
                LIMIT 6
                """).param("username", principal.getName())
                .query((row, index) -> new Recommendation(
                        row.getLong("id"), row.getString("category"), row.getString("title"),
                        row.getString("summary"), row.getInt("score") > 0))
                .list();
    }

    public record Recommendation(long id, String category, String title, String summary, boolean matchedInterest) {}
}
