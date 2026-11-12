package com.snackknowledge.backend.service;

import com.snackknowledge.backend.dto.KnowledgeResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.LinkedHashMap;
import java.util.UUID;

@Service
public class GeneratedStudyCards {
    private static final String SESSION_KEY = GeneratedStudyCards.class.getName();
    private static final int MAX_PREVIEWS = 12;
    private final JdbcClient jdbc;

    public GeneratedStudyCards(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public synchronized UUID remember(HttpSession session, String category, String title, String summary, String content) {
        var id = UUID.randomUUID();
        if (!(session.getAttribute(SESSION_KEY) instanceof Previews)) {
            session.setAttribute(SESSION_KEY, new Previews());
        }
        var previews = (Previews) session.getAttribute(SESSION_KEY);
        if (previews.size() >= MAX_PREVIEWS) previews.pollFirstEntry();
        previews.put(id, new KnowledgeResponse(null, category, title, summary, content));
        return id;
    }

    public synchronized UUID reconnect(HttpSession session, KnowledgeResponse knowledge) {
        if (session.getAttribute(SESSION_KEY) instanceof Previews previews) {
            var existing = previews.entrySet().stream()
                    .filter(entry -> entry.getValue().equals(knowledge)).map(java.util.Map.Entry::getKey).findFirst();
            if (existing.isPresent()) return existing.get();
        }
        return remember(session, knowledge.category(), knowledge.title(), knowledge.summary(), knowledge.content());
    }

    public StudyCard resolve(HttpSession session, String source, UUID id, Principal principal) {
        return switch (source) {
            case "preview" -> preview(session, id);
            case "saved" -> saved(id, principal);
            case "community" -> publicCard(id);
            default -> throw unavailableCard();
        };
    }

    private synchronized StudyCard preview(HttpSession session, UUID id) {
        if (!(session.getAttribute(SESSION_KEY) instanceof Previews previews) || !previews.containsKey(id)) {
            throw unavailableCard();
        }
        return new StudyCard(id, previews.get(id));
    }

    private StudyCard saved(UUID id, Principal principal) {
        if (principal == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        return jdbc.sql("""
                SELECT card_id, category, title, summary, content FROM member_generated_card
                WHERE username = ? AND card_id = ?
                """).params(principal.getName(), id.toString())
                .query((row, index) -> new StudyCard(UUID.fromString(row.getString("card_id")),
                        new KnowledgeResponse(null, row.getString("category"), row.getString("title"),
                                row.getString("summary"), row.getString("content"))))
                .optional().orElseThrow(this::unavailableCard);
    }

    private StudyCard publicCard(UUID id) {
        return jdbc.sql("""
                SELECT c.card_id, c.category, c.title, c.summary, c.content
                FROM community_share s
                JOIN member_generated_card c ON c.username = s.username AND c.card_id = s.card_id
                WHERE s.share_id = ? AND s.status = 'APPROVED'
                """).param(id.toString())
                .query((row, index) -> new StudyCard(UUID.fromString(row.getString("card_id")),
                        new KnowledgeResponse(null, row.getString("category"), row.getString("title"),
                                row.getString("summary"), row.getString("content"))))
                .optional().orElseThrow(this::unavailableCard);
    }

    private ResponseStatusException unavailableCard() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "학습할 카드를 찾지 못했어요.");
    }

    private static final class Previews extends LinkedHashMap<UUID, KnowledgeResponse> {}

    public record StudyCard(UUID id, KnowledgeResponse knowledge) {
        public String key() {
            return "generated:" + id;
        }
    }
}
