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
                SELECT k.id, k.category, k.title, k.summary
                FROM member_bookmark b JOIN knowledge k ON k.id = b.knowledge_id
                WHERE b.username = ?
                ORDER BY b.saved_at DESC, b.knowledge_id DESC
                """)
                .param(principal.getName())
                .query(BookmarkedKnowledge.class).list();
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

    public record BookmarkedKnowledge(long id, String category, String title, String summary) {}
    public record BookmarkStatus(boolean saved) {}
}
