package com.snackknowledge.backend.controller;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/me/overview")
public class MemberOverviewController {
    private final JdbcClient jdbc;

    public MemberOverviewController(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public MemberOverview overview(Principal principal) {
        String username = principal.getName();
        var interests = jdbc.sql("""
                SELECT i.category FROM member_interest i
                WHERE i.username = ?
                  AND EXISTS (SELECT 1 FROM knowledge k WHERE k.category = i.category)
                ORDER BY i.category
                """).param(username).query(String.class).list();

        return jdbc.sql("""
                SELECT
                    (SELECT COUNT(*) FROM member_bookmark b JOIN knowledge k ON k.id = b.knowledge_id
                        WHERE b.username = :username) AS bookmarks,
                    (SELECT COUNT(*) FROM member_learning_history h JOIN knowledge k ON k.id = h.knowledge_id
                        WHERE h.username = :username) AS learning_activities,
                    (SELECT COUNT(*) FROM member_generated_card g WHERE g.username = :username) AS generated_cards,
                    (SELECT COUNT(*) FROM member_wrong_answer w WHERE w.username = :username) AS wrong_answers
                """).param("username", username)
                .query((row, index) -> new MemberOverview(
                        row.getLong("bookmarks"), row.getLong("learning_activities"),
                        row.getLong("generated_cards"), row.getLong("wrong_answers"), interests))
                .single();
    }

    public record MemberOverview(long bookmarks, long learningActivities, long generatedCards,
                                 long wrongAnswers, List<String> interests) {}
}
