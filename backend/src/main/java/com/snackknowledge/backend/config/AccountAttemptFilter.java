package com.snackknowledge.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

final class AccountAttemptFilter extends OncePerRequestFilter {
    private static final String REGISTER = "/api/account/register";
    private static final String LOGIN = "/api/account/login";

    private final AttemptWindow registrations = new AttemptWindow(5, Duration.ofMinutes(10));
    private final AttemptWindow loginsByAddress = new AttemptWindow(20, Duration.ofMinutes(1));
    private final AttemptWindow loginsByUsername = new AttemptWindow(8, Duration.ofMinutes(1));

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return !"POST".equals(request.getMethod()) || !(REGISTER.equals(path) || LOGIN.equals(path));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        long now = System.nanoTime();
        String address = request.getRemoteAddr();
        if (REGISTER.equals(request.getServletPath())) {
            if (!limit(registrations.recordAttempt(address, now), response)) chain.doFilter(request, response);
            return;
        }

        if (limit(loginsByAddress.recordAttempt(address, now), response)) return;
        String username = AccountCredentials.normalizeUsername(request.getParameter("username"));
        if (!AccountCredentials.validUsername(username)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        if (limit(loginsByUsername.recordAttempt(username, now), response)) return;
        if (!AccountCredentials.acceptsPassword(request.getParameter("password"))) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        chain.doFilter(request, response);
    }

    private boolean limit(long retryAfterSeconds, HttpServletResponse response) {
        if (retryAfterSeconds == 0) return false;
        response.setStatus(429);
        response.setHeader(HttpHeaders.RETRY_AFTER, Long.toString(retryAfterSeconds));
        return true;
    }

    private static final class AttemptWindow {
        private static final int MAX_KEYS = 4096;
        private static final long CLEANUP_INTERVAL = Duration.ofSeconds(30).toNanos();
        private final int allowedAttempts;
        private final long windowNanos;
        private final Map<String, Window> attempts = new HashMap<>();
        private long lastCleanup = System.nanoTime();

        AttemptWindow(int allowedAttempts, Duration window) {
            this.allowedAttempts = allowedAttempts;
            this.windowNanos = window.toNanos();
        }

        synchronized long recordAttempt(String key, long now) {
            if (now - lastCleanup >= CLEANUP_INTERVAL) {
                attempts.values().removeIf(window -> now - window.expiresAt >= 0);
                lastCleanup = now;
            }
            Window window = attempts.get(key);
            if (window == null || now - window.expiresAt >= 0) {
                if (window == null && attempts.size() >= MAX_KEYS) return 30;
                attempts.put(key, new Window(now + windowNanos));
                return 0;
            }
            if (window.count >= allowedAttempts) {
                return Duration.ofNanos(window.expiresAt - now).toSeconds() + 1;
            }
            window.count++;
            return 0;
        }

        private static final class Window {
            private final long expiresAt;
            private int count = 1;

            Window(long expiresAt) {
                this.expiresAt = expiresAt;
            }
        }
    }
}
