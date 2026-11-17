package com.snackknowledge.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class AiUsageMetrics {
    private static final Logger log = LoggerFactory.getLogger(AiUsageMetrics.class);
    private final JdbcClient jdbc;

    public AiUsageMetrics(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public void recordAnsweredQuestion() {
        update(jdbc.sql("UPDATE ai_usage_totals SET answered_questions = answered_questions + 1 WHERE id = 1"));
    }

    public void recordTokens(long input, long output, long total) {
        update(jdbc.sql("""
                UPDATE ai_usage_totals
                SET input_tokens = input_tokens + ?, output_tokens = output_tokens + ?, total_tokens = total_tokens + ?
                WHERE id = 1
                """).params(input, output, total));
    }

    private void update(JdbcClient.StatementSpec statement) {
        try {
            statement.update();
        } catch (DataAccessException error) {
            log.warn("Unable to record AI usage metrics", error);
        }
    }

    public Totals totals() {
        return jdbc.sql("""
                SELECT tracking_started_at, answered_questions, input_tokens, output_tokens, total_tokens
                FROM ai_usage_totals WHERE id = 1
                """).query((row, index) -> new Totals(row.getTimestamp("tracking_started_at").toInstant(),
                        row.getLong("answered_questions"), row.getLong("input_tokens"),
                        row.getLong("output_tokens"), row.getLong("total_tokens"))).single();
    }

    public record Totals(Instant trackingStartedAt, long answeredQuestions, long inputTokens,
                         long outputTokens, long totalTokens) {}
}
