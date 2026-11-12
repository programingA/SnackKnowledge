package com.snackknowledge.backend.controller;

import com.snackknowledge.backend.config.AccountCredentials;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
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
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void register(@RequestBody Credentials request) {
        String username = AccountCredentials.normalizeUsername(request.username());
        String password = request.password();
        if (!AccountCredentials.validUsername(username) || !AccountCredentials.validNewPassword(password)
                || !password.equals(request.passwordConfirmation())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        }
        try {
            jdbc.sql("INSERT INTO member_account (username, password_hash) VALUES (?, ?)")
                    .params(username, encoder.encode(password)).update();
        } catch (DuplicateKeyException ignored) {
            // Match the response for a new account without changing its existing password.
        }
    }

    public record Credentials(String username, String password, String passwordConfirmation) {}
    public record Session(String username) {}
}
