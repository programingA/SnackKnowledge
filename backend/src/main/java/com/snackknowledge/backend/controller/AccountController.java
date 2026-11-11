package com.snackknowledge.backend.controller;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/account")
public class AccountController {
    private final JdbcClient jdbc;
    private final PasswordEncoder encoder;

    public AccountController(JdbcClient jdbc, PasswordEncoder encoder) {
        this.jdbc = jdbc;
        this.encoder = encoder;
    }

    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken token) {
        return Map.of("header", token.getHeaderName(), "token", token.getToken());
    }

    @GetMapping("/session")
    public Session session(Principal principal) {
        return new Session(principal == null ? null : principal.getName());
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public void register(@RequestBody Credentials request) {
        String username = request.username() == null ? "" : request.username().strip().toLowerCase(Locale.ROOT);
        String password = request.password();
        if (!username.matches("[a-z0-9_]{3,30}") || password == null
                || password.length() < 8 || password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        }
        try {
            jdbc.sql("INSERT INTO member_account (username, password_hash) VALUES (?, ?)")
                    .params(username, encoder.encode(password)).update();
        } catch (DuplicateKeyException error) {
            throw new ResponseStatusException(HttpStatus.CONFLICT);
        }
    }

    public record Credentials(String username, String password) {}
    public record Session(String username) {}
}
