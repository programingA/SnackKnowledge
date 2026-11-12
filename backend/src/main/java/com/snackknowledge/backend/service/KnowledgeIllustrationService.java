package com.snackknowledge.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;

import java.sql.Types;
import java.util.Base64;
import java.util.Optional;

@Service
public class KnowledgeIllustrationService {
    private static final Logger log = LoggerFactory.getLogger(KnowledgeIllustrationService.class);
    private static final int MAX_IMAGE_BYTES = 3 * 1024 * 1024;

    private final JdbcClient jdbc;
    private final KnowledgeAnswerService ai;

    public KnowledgeIllustrationService(JdbcClient jdbc, KnowledgeAnswerService ai) {
        this.jdbc = jdbc;
        this.ai = ai;
    }

    public Optional<byte[]> find(long id) {
        return jdbc.sql("""
                SELECT image FROM knowledge_illustration
                JOIN knowledge ON knowledge.id = knowledge_illustration.knowledge_id
                WHERE knowledge_id = ?
                """).param(id).query((row, index) -> row.getBytes("image")).optional();
    }

    @Bean
    @ConditionalOnProperty(name = "knowledge.images.backfill", havingValue = "true")
    ApplicationRunner backfillKnowledgeIllustrations() {
        return args -> {
            var missing = jdbc.sql("""
                    SELECT id, title, summary FROM knowledge
                    WHERE NOT EXISTS (SELECT 1 FROM knowledge_illustration WHERE knowledge_id = knowledge.id)
                    ORDER BY id
                    """).query((row, index) -> new Subject(row.getLong("id"), row.getString("title"),
                            row.getString("summary"))).list();
            int saved = 0;
            for (Subject subject : missing) {
                String encoded = ai.generateCardImage(subject.title(), subject.summary());
                if (encoded == null) continue;

                byte[] image;
                try {
                    image = Base64.getDecoder().decode(encoded);
                } catch (IllegalArgumentException invalidImage) {
                    log.warn("Invalid illustration returned for knowledge {}", subject.id());
                    continue;
                }
                if (image.length == 0 || image.length > MAX_IMAGE_BYTES) continue;

                jdbc.sql("""
                        INSERT INTO knowledge_illustration (knowledge_id, image) VALUES (:id, :image)
                        ON DUPLICATE KEY UPDATE knowledge_id = knowledge_illustration.knowledge_id
                        """).param("id", subject.id()).param("image", image, Types.BLOB).update();
                saved++;
            }
            log.info("Knowledge illustration backfill stored {} of {} missing images", saved, missing.size());
        };
    }

    private record Subject(long id, String title, String summary) {}
}
