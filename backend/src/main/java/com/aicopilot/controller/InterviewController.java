package com.aicopilot.controller;

import com.aicopilot.dto.InterviewDtos.*;
import com.aicopilot.service.InterviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping("/generate")
    public ResponseEntity<SessionDetail> generateInterview(
            @Valid @RequestBody GenerateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        SessionDetail session = interviewService.generateAndSave(
                request.getResumeId(),
                request.getJobDescriptionId(),
                getUserId(userDetails),
                request.getDifficulty(),
                request.getQuestionCount(),
                request.getTitle());
        return ResponseEntity.ok(session);
    }

    @PostMapping("/{id}/score")
    public ResponseEntity<ScoreResponse> scoreInterview(
            @PathVariable UUID id,
            @Valid @RequestBody ScoreRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        ScoreResponse score = interviewService.submitAnswers(
                id, getUserId(userDetails), request);
        return ResponseEntity.ok(score);
    }

    @GetMapping
    public ResponseEntity<List<SessionListItem>> listSessions(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<SessionListItem> sessions = interviewService.listSessions(
                getUserId(userDetails));
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SessionDetail> getSession(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        SessionDetail detail = interviewService.getSession(
                id, getUserId(userDetails));
        return ResponseEntity.ok(detail);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        interviewService.deleteSession(id, getUserId(userDetails));
        return ResponseEntity.noContent().build();
    }

    private UUID getUserId(UserDetails userDetails) {
        return UUID.fromString(userDetails.getUsername());
    }
}
