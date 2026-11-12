package com.snackknowledge.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import org.springframework.security.web.csrf.CsrfFilter;

@Configuration
public class SecurityConfig {
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    UserDetailsService userDetailsService(JdbcClient jdbc) {
        return username -> jdbc.sql("SELECT username, password_hash FROM member_account WHERE username = ?")
                .param(AccountCredentials.normalizeUsername(username))
                .query((row, index) -> User.withUsername(row.getString("username"))
                        .password(row.getString("password_hash")).roles("MEMBER").build())
                .optional()
                .orElseThrow(() -> new UsernameNotFoundException("Account not found"));
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, CommunityReviewAccess reviewAccess) throws Exception {
        return http
                .authorizeHttpRequests(rules -> rules
                        .requestMatchers("/api/admin/community/**").access((authentication, context) -> {
                            var user = authentication.get();
                            return new AuthorizationDecision(user != null && user.isAuthenticated()
                                    && !(user instanceof AnonymousAuthenticationToken)
                                    && reviewAccess.canReview(user.getName()));
                        })
                        .requestMatchers("/api/me/**").authenticated()
                        .anyRequest().permitAll())
                .csrf(csrf -> csrf.ignoringRequestMatchers("/api/knowledge/**"))
                .addFilterAfter(new AccountAttemptFilter(), CsrfFilter.class)
                .requestCache(cache -> cache.disable())
                .exceptionHandling(errors -> errors
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .formLogin(login -> login
                        .loginPage("/api/account/login")
                        .loginProcessingUrl("/api/account/login")
                        .successHandler((request, response, auth) -> response.setStatus(204))
                        .failureHandler((request, response, error) -> response.setStatus(401)))
                .logout(logout -> logout
                        .logoutUrl("/api/account/logout")
                        .logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler(HttpStatus.NO_CONTENT)))
                .build();
    }
}
