package com.aicopilot.controller;

import com.aicopilot.dto.AtsDtos.AtsReport;
import com.aicopilot.dto.MatchDtos.MatchResult;
import com.aicopilot.service.MatchService;
import com.aicopilot.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/match")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;
    private final RecommendationService recommendationService;

    @PostMapping("/resume/{resumeId}/job/{jobId}")
    public ResponseEntity<MatchResult> matchResumeToJob(
            @PathVariable UUID resumeId,
            @PathVariable UUID jobId,
            @AuthenticationPrincipal UserDetails userDetails) {
        MatchResult result = matchService.matchResumeToJob(
                resumeId, jobId, getUserId(userDetails));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/resume/{resumeId}/job/{jobId}/report")
    public ResponseEntity<AtsReport> getAtsReport(
            @PathVariable UUID resumeId,
            @PathVariable UUID jobId,
            @AuthenticationPrincipal UserDetails userDetails) {
        AtsReport report = recommendationService.generateReport(
                resumeId, jobId, getUserId(userDetails));
        return ResponseEntity.ok(report);
    }

    private UUID getUserId(UserDetails userDetails) {
        return UUID.fromString(userDetails.getUsername());
    }
}
