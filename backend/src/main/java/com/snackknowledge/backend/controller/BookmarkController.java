package com.snackknowledge.backend.controller;

import com.snackknowledge.backend.repository.KnowledgeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/me/bookmarks")
public class BookmarkController {
    private final JdbcClient jdbc;
    private final KnowledgeRepository knowledgeRepository;

    public BookmarkController(JdbcClient jdbc, KnowledgeRepository knowledgeRepository) {
        this.jdbc = jdbc;
        this.knowledgeRepository = knowledgeRepository;
    }

    @GetMapping
    public List<BookmarkedKnowledge> list(Principal principal) {
        return jdbc.sql("""
                SELECT CAST(k.id AS CHAR) AS id, k.category, k.title, k.summary, b.saved_at, 'knowledge' AS source
                FROM member_bookmark b JOIN knowledge k ON k.id = b.knowledge_id
                WHERE b.username = :username
                UNION ALL
                SELECT s.share_id, c.category, c.title, c.summary, b.saved_at, 'community'
                FROM member_community_bookmark b
                JOIN community_share s ON s.share_id = b.share_id
                JOIN member_generated_card c ON c.username = s.username AND c.card_id = s.card_id
                WHERE b.username = :username AND s.status = 'APPROVED'
                ORDER BY saved_at DESC, source, id DESC
                """)
                .param("username", principal.getName())
                .query((row, index) -> {
                    String source = row.getString("source");
                    Object id = "community".equals(source) ? row.getString("id") : row.getLong("id");
                    return new BookmarkedKnowledge(id, row.getString("category"), row.getString("title"),
                            row.getString("summary"), source);
                }).list();
    }

    @GetMapping("/{id}")
    public BookmarkStatus status(@PathVariable("id") long id, Principal principal) {
        boolean saved = jdbc.sql("SELECT 1 FROM member_bookmark WHERE username = ? AND knowledge_id = ?")
                .params(principal.getName(), id).query(Integer.class).optional().isPresent();
        return new BookmarkStatus(saved);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void save(@PathVariable("id") long id, Principal principal) {
        int affected = jdbc.sql("""
                INSERT INTO member_bookmark (username, knowledge_id)
                SELECT ?, id FROM knowledge WHERE id = ?
                ON DUPLICATE KEY UPDATE saved_at = member_bookmark.saved_at
                """).params(principal.getName(), id).update();
        if (affected == 0 && !knowledgeRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@PathVariable("id") long id, Principal principal) {
        jdbc.sql("DELETE FROM member_bookmark WHERE username = ? AND knowledge_id = ?")
                .params(principal.getName(), id).update();
    }

    @PutMapping("/community/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void saveCommunity(@PathVariable("id") UUID id, Principal principal) {
        int affected = jdbc.sql("""
                INSERT INTO member_community_bookmark (username, share_id)
                SELECT ?, share_id FROM community_share WHERE share_id = ? AND status = 'APPROVED'
                ON DUPLICATE KEY UPDATE saved_at = member_community_bookmark.saved_at
                """).params(principal.getName(), id.toString()).update();
        if (affected == 0 && jdbc.sql("SELECT 1 FROM community_share WHERE share_id = ? AND status = 'APPROVED'")
                .param(id.toString()).query(Integer.class).optional().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/community/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeCommunity(@PathVariable("id") UUID id, Principal principal) {
        jdbc.sql("DELETE FROM member_community_bookmark WHERE username = ? AND share_id = ?")
                .params(principal.getName(), id.toString()).update();
    }

    public record BookmarkedKnowledge(Object id, String category, String title, String summary, String source) {}
    public record BookmarkStatus(boolean saved) {}
}
