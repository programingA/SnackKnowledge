package com.snackknowledge.backend.controller;

import com.snackknowledge.backend.repository.WrongAnswerRepository;
import com.snackknowledge.backend.service.QuizAttemptService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/me/wrong-answers")
public class WrongAnswerController {
    private final WrongAnswerRepository repository;
    private final QuizAttemptService attempts;

    public WrongAnswerController(WrongAnswerRepository repository, QuizAttemptService attempts) {
        this.repository = repository;
        this.attempts = attempts;
    }

    @GetMapping
    public List<WrongAnswerRepository.NoteSummary> list(Principal principal) {
        return repository.list(principal.getName());
    }

    @PostMapping("/{id}/retry")
    public QuizAttemptService.QuizQuestion retry(@PathVariable("id") UUID id, Principal principal, HttpSession session) {
        var quiz = repository.find(principal.getName(), id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return attempts.startPractice(session, quiz);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("id") UUID id, Principal principal) {
        repository.delete(principal.getName(), id);
    }
}
