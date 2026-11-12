package com.snackknowledge.backend.config;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;

@Component
public class CommunityReviewAccess {
    private final JdbcClient jdbc;

    public CommunityReviewAccess(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public boolean canReview(String username) {
        return jdbc.sql("SELECT username FROM community_moderator WHERE username = ?")
                .param(username).query(String.class).optional().isPresent();
    }
}
