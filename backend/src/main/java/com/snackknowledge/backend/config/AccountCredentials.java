package com.snackknowledge.backend.config;

import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.regex.Pattern;

public final class AccountCredentials {
    private static final Pattern USERNAME = Pattern.compile("[a-z0-9_]{3,30}");

    private AccountCredentials() {}

    public static String normalizeUsername(String username) {
        return username == null ? "" : username.strip().toLowerCase(Locale.ROOT);
    }

    public static boolean validUsername(String username) {
        return USERNAME.matcher(username).matches();
    }

    public static boolean acceptsPassword(String password) {
        return password != null && !password.isEmpty()
                && password.length() <= 72
                && password.getBytes(StandardCharsets.UTF_8).length <= 72;
    }

    public static boolean validNewPassword(String password) {
        return acceptsPassword(password) && !password.isBlank()
                && password.codePointCount(0, password.length()) >= 15;
    }
}
