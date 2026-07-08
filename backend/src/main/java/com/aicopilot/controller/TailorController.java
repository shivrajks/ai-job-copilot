package com.aicopilot.controller;

import com.aicopilot.dto.ResumeDtos.ResumeDetail;
import com.aicopilot.dto.TailorDtos.SaveTailoredRequest;
import com.aicopilot.dto.TailorDtos.TailorProposal;
import com.aicopilot.service.TailoringService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/resumes")
@RequiredArgsConstructor
public class TailorController {

    private final TailoringService tailoringService;

    @PostMapping("/{resumeId}/tailor/{jobId}")
    public ResponseEntity<TailorProposal> generateTailorProposal(
            @PathVariable UUID resumeId,
            @PathVariable UUID jobId,
            @AuthenticationPrincipal UserDetails userDetails) {
        TailorProposal proposal = tailoringService.generateTailorProposal(
                resumeId, jobId, getUserId(userDetails));
        return ResponseEntity.ok(proposal);
    }

    @PostMapping("/{resumeId}/save-tailored")
    public ResponseEntity<ResumeDetail> saveTailoredResume(
            @PathVariable UUID resumeId,
            @Valid @RequestBody SaveTailoredRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        ResumeDetail detail = tailoringService.saveTailoredResume(
                resumeId, getUserId(userDetails), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(detail);
    }

    private UUID getUserId(UserDetails userDetails) {
        return UUID.fromString(userDetails.getUsername());
    }
}
