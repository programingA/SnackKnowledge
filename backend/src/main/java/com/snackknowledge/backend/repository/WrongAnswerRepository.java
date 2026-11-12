package com.snackknowledge.backend.repository;

import com.snackknowledge.backend.dto.KnowledgeQuizResponse;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class WrongAnswerRepository {
    private final JdbcClient jdbc;

    public WrongAnswerRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public void save(String username, UUID quizId, long knowledgeId, String knowledgeTitle, KnowledgeQuizResponse quiz) {
        var options = quiz.options();
        jdbc.sql("""
                INSERT INTO member_wrong_answer
                    (username, quiz_id, knowledge_id, knowledge_title, question, option_a, option_b,
                     option_c, option_d, correct_index, explanation)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE quiz_id = member_wrong_answer.quiz_id
                """)
                .params(username, quizId.toString(), knowledgeId, knowledgeTitle, quiz.question(),
                        options.get(0), options.get(1), options.get(2), options.get(3),
                        quiz.correctIndex(), quiz.explanation())
                .update();
    }

    public List<NoteSummary> list(String username) {
        return jdbc.sql("""
                SELECT quiz_id, knowledge_title, question, saved_at
                FROM member_wrong_answer
                WHERE username = ?
                ORDER BY saved_at DESC, quiz_id
                """).param(username)
                .query((row, index) -> new NoteSummary(
                        UUID.fromString(row.getString("quiz_id")), row.getString("knowledge_title"),
                        row.getString("question"), row.getTimestamp("saved_at").toInstant()))
                .list();
    }

    public Optional<KnowledgeQuizResponse> find(String username, UUID quizId) {
        return jdbc.sql("""
                SELECT question, option_a, option_b, option_c, option_d, correct_index, explanation
                FROM member_wrong_answer WHERE username = ? AND quiz_id = ?
                """).params(username, quizId.toString())
                .query((row, index) -> new KnowledgeQuizResponse(row.getString("question"),
                        List.of(row.getString("option_a"), row.getString("option_b"),
                                row.getString("option_c"), row.getString("option_d")),
                        row.getInt("correct_index"), row.getString("explanation")))
                .optional();
    }

    public void delete(String username, UUID quizId) {
        jdbc.sql("DELETE FROM member_wrong_answer WHERE username = ? AND quiz_id = ?")
                .params(username, quizId.toString()).update();
    }

    public record NoteSummary(UUID id, String knowledgeTitle, String question, Instant savedAt) {}
}
