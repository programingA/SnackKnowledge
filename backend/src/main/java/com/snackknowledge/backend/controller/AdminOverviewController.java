package com.snackknowledge.backend.controller;

import com.snackknowledge.backend.service.AiUsageMetrics;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
public class AdminOverviewController {
    private final JdbcClient jdbc;
    private final AiUsageMetrics metrics;

    public AdminOverviewController(JdbcClient jdbc, AiUsageMetrics metrics) {
        this.jdbc = jdbc;
        this.metrics = metrics;
    }

    @GetMapping("/api/admin/overview")
    @Transactional(readOnly = true)
    public Overview overview() {
        long members = jdbc.sql("""
                SELECT COUNT(*) FROM member_account a
                WHERE NOT EXISTS (SELECT 1 FROM member_admin admin WHERE admin.username = a.username)
                """).query(Long.class).single();
        long generatedCards = jdbc.sql("SELECT COUNT(*) FROM member_generated_card")
                .query(Long.class).single();
        var pending = jdbc.sql("""
                SELECT s.share_id, c.title, c.category, s.username, s.submitted_at
                FROM community_share s
                JOIN member_generated_card c ON c.username = s.username AND c.card_id = s.card_id
                WHERE s.status = 'PENDING'
                ORDER BY s.submitted_at DESC, s.share_id
                """).query((row, index) -> new PendingReview(UUID.fromString(row.getString("share_id")),
                        row.getString("title"), row.getString("category"), row.getString("username"),
                        row.getTimestamp("submitted_at").toInstant()))
                .list();

        return new Overview(members, generatedCards, pending.size(), pending, metrics.totals());
    }

    public record PendingReview(UUID id, String title, String category, String applicant, Instant submittedAt) {}
    public record Overview(long members, long generatedCards, int pendingCount,
                           List<PendingReview> pendingReviews, AiUsageMetrics.Totals usage) {}
}
