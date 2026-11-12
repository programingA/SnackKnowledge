package com.snackknowledge.backend.controller;

import com.snackknowledge.backend.controller.GeneratedCardController.Card;
import com.snackknowledge.backend.controller.GeneratedCardController.CardSummary;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
public class CommunityController {
    private final JdbcClient jdbc;

    public CommunityController(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping("/api/community/cards")
    public List<CardSummary> list() {
        return listCards("APPROVED");
    }

    @GetMapping("/api/admin/community/reviews")
    public List<CardSummary> pendingReviews() {
        return listCards("PENDING");
    }

    private List<CardSummary> listCards(String status) {
        return jdbc.sql("""
                SELECT s.share_id, c.category, c.title, c.summary
                FROM community_share s
                JOIN member_generated_card c ON c.username = s.username AND c.card_id = s.card_id
                WHERE s.status = ?
                ORDER BY s.submitted_at DESC, s.share_id
                """).param(status).query((row, index) -> new CardSummary(row.getString("share_id"), row.getString("category"),
                        row.getString("title"), row.getString("summary")))
                .list();
    }

    @GetMapping("/api/community/cards/{id}")
    public Card read(@PathVariable("id") UUID id) {
        return readCard(id, "APPROVED");
    }

    @GetMapping("/api/admin/community/reviews/{id}")
    public Card readReview(@PathVariable("id") UUID id) {
        return readCard(id, "PENDING");
    }

    private Card readCard(UUID id, String status) {
        return jdbc.sql("""
                SELECT c.category, c.title, c.summary, c.content, c.image
                FROM community_share s
                JOIN member_generated_card c ON c.username = s.username AND c.card_id = s.card_id
                WHERE s.share_id = ? AND s.status = ?
                """).params(id.toString(), status)
                .query((row, index) -> {
                    byte[] image = row.getBytes("image");
                    return new Card(row.getString("category"), row.getString("title"), row.getString("summary"),
                            row.getString("content"), image == null ? null : Base64.getEncoder().encodeToString(image));
                }).optional()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/api/admin/community/reviews/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void decide(@PathVariable("id") UUID id, @RequestBody ReviewDecision decision) {
        String status = decision.status();
        if (!"APPROVED".equals(status) && !"REJECTED".equals(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        }
        int changed = jdbc.sql("UPDATE community_share SET status = ? WHERE share_id = ? AND status = 'PENDING'")
                .params(status, id.toString()).update();
        if (changed == 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT);
        }
    }

    @GetMapping("/api/me/community-shares/{cardId}")
    public ShareStatus status(@PathVariable("cardId") UUID cardId, Principal principal) {
        return new ShareStatus(findStatus(principal.getName(), cardId).orElse("PRIVATE"));
    }

    @PutMapping("/api/me/community-shares/{cardId}")
    public ShareStatus submit(@PathVariable("cardId") UUID cardId, Principal principal) {
        String username = principal.getName();
        jdbc.sql("""
                INSERT INTO community_share (share_id, username, card_id)
                SELECT ?, username, card_id FROM member_generated_card WHERE username = ? AND card_id = ?
                ON DUPLICATE KEY UPDATE share_id = community_share.share_id
                """).params(UUID.randomUUID().toString(), username, cardId.toString()).update();
        return new ShareStatus(findStatus(username, cardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)));
    }

    @DeleteMapping("/api/me/community-shares/{cardId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void withdraw(@PathVariable("cardId") UUID cardId, Principal principal) {
        jdbc.sql("DELETE FROM community_share WHERE username = ? AND card_id = ?")
                .params(principal.getName(), cardId.toString()).update();
    }

    private Optional<String> findStatus(String username, UUID cardId) {
        return jdbc.sql("SELECT status FROM community_share WHERE username = ? AND card_id = ?")
                .params(username, cardId.toString()).query(String.class).optional();
    }

    public record ReviewDecision(String status) {}
    public record ShareStatus(String status) {}
}
