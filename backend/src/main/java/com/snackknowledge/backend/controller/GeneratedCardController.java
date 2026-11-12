package com.snackknowledge.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.sql.Types;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/me/generated-cards")
public class GeneratedCardController {
    private static final int MAX_IMAGE_BYTES = 3 * 1024 * 1024;
    private final JdbcClient jdbc;

    public GeneratedCardController(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping
    public List<CardSummary> list(Principal principal) {
        return jdbc.sql("""
                SELECT card_id, category, title, summary
                FROM member_generated_card WHERE username = ?
                ORDER BY saved_at DESC, card_id
                """).param(principal.getName())
                .query((row, index) -> new CardSummary(row.getString("card_id"), row.getString("category"),
                        row.getString("title"), row.getString("summary")))
                .list();
    }

    @GetMapping("/{id}")
    public Card read(@PathVariable("id") UUID id, Principal principal) {
        return jdbc.sql("""
                SELECT category, title, summary, content, image
                FROM member_generated_card WHERE username = ? AND card_id = ?
                """).params(principal.getName(), id.toString())
                .query((row, index) -> {
                    byte[] image = row.getBytes("image");
                    return new Card(row.getString("category"), row.getString("title"),
                            row.getString("summary"), row.getString("content"),
                            image == null ? null : Base64.getEncoder().encodeToString(image));
                }).optional()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void save(@PathVariable("id") UUID id, @RequestBody Card card, Principal principal) {
        if (!validText(card.category(), 100) || !validText(card.title(), 255)
                || !validText(card.summary(), 2000) || !validText(card.content(), 12000)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        }
        byte[] image = decodeImage(card.imageBase64());
        jdbc.sql("""
                INSERT INTO member_generated_card (username, card_id, category, title, summary, content, image)
                VALUES (:username, :id, :category, :title, :summary, :content, :image)
                ON DUPLICATE KEY UPDATE card_id = member_generated_card.card_id
                """)
                .param("username", principal.getName()).param("id", id.toString())
                .param("category", card.category()).param("title", card.title())
                .param("summary", card.summary()).param("content", card.content())
                .param("image", image, Types.BLOB)
                .update();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("id") UUID id, Principal principal) {
        jdbc.sql("DELETE FROM member_generated_card WHERE username = ? AND card_id = ?")
                .params(principal.getName(), id.toString()).update();
    }

    private boolean validText(String text, int maxLength) {
        return text != null && text.length() <= maxLength && !text.isBlank();
    }

    private byte[] decodeImage(String base64) {
        if (base64 == null) return null;
        if (base64.length() > MAX_IMAGE_BYTES / 3 * 4) {
            throw new ResponseStatusException(HttpStatus.CONTENT_TOO_LARGE);
        }
        byte[] image;
        try {
            image = Base64.getDecoder().decode(base64);
        } catch (IllegalArgumentException error) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        }
        if (image.length < 12 || !"RIFF".equals(new String(image, 0, 4, StandardCharsets.US_ASCII))
                || !"WEBP".equals(new String(image, 8, 4, StandardCharsets.US_ASCII))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        }
        return image;
    }

    public record CardSummary(String id, String category, String title, String summary) {}
    public record Card(String category, String title, String summary, String content, String imageBase64) {}
}
