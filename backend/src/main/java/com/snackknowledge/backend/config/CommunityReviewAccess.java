package com.snackknowledge.backend.config;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
public class CommunityReviewAccess {
    private final JdbcClient jdbc;

    public CommunityReviewAccess(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public boolean canReview(Authentication user) {
        if (user == null || !user.isAuthenticated() || user instanceof AnonymousAuthenticationToken) return false;
        if (isAdmin(user)) return true;
        return jdbc.sql("SELECT username FROM community_moderator WHERE username = ?")
                .param(user.getName()).query(String.class).optional().isPresent();
    }

    public static boolean isAdmin(Authentication user) {
        return user != null && user.isAuthenticated()
                && user.getAuthorities().stream().anyMatch(role -> "ROLE_ADMIN".equals(role.getAuthority()));
    }
}
