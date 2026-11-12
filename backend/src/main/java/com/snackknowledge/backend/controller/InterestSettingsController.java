package com.snackknowledge.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.HashSet;
import java.util.List;

@RestController
@RequestMapping("/api/me/interests")
public class InterestSettingsController {
    private final JdbcClient jdbc;

    public InterestSettingsController(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public InterestSettings settings(Principal principal) {
        var categories = categories();
        var selected = new HashSet<>(jdbc.sql("SELECT category FROM member_interest WHERE username = ?")
                .param(principal.getName()).query(String.class).list());
        return new InterestSettings(categories, categories.stream().filter(selected::contains).toList());
    }

    @PutMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void save(@RequestBody InterestSelection request, Principal principal) {
        var selected = request.categories();
        if (selected == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        var unique = new HashSet<>(selected);
        if (unique.size() != selected.size() || !new HashSet<>(categories()).containsAll(unique)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        }

        String username = principal.getName();
        jdbc.sql("SELECT username FROM member_account WHERE username = ? FOR UPDATE")
                .param(username).query(String.class).optional()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        jdbc.sql("DELETE FROM member_interest WHERE username = ?").param(username).update();
        for (String category : selected) {
            jdbc.sql("INSERT INTO member_interest (username, category) VALUES (?, ?)")
                    .params(username, category).update();
        }
    }

    private List<String> categories() {
        return jdbc.sql("""
                SELECT DISTINCT category FROM knowledge
                WHERE category IS NOT NULL AND TRIM(category) <> ''
                ORDER BY category
                """).query(String.class).list();
    }

    public record InterestSettings(List<String> categories, List<String> selected) {}
    public record InterestSelection(List<String> categories) {}
}
