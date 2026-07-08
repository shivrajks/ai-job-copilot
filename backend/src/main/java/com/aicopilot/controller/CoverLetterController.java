package com.aicopilot.controller;

import com.aicopilot.dto.CoverLetterDtos.*;
import com.aicopilot.service.CoverLetterService;
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
@RequestMapping("/cover-letters")
@RequiredArgsConstructor
public class CoverLetterController {

    private final CoverLetterService coverLetterService;

    @PostMapping("/generate")
    public ResponseEntity<CoverLetterProposal> generateCoverLetter(
            @Valid @RequestBody GenerateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        CoverLetterProposal proposal = coverLetterService.generateProposal(
                request.getResumeId(),
                request.getJobDescriptionId(),
                getUserId(userDetails),
                request.getTone(),
                request.getTemplate(),
                request.getCompanyName(),
                request.getHiringManager());
        return ResponseEntity.ok(proposal);
    }

    @PostMapping
    public ResponseEntity<CoverLetterDetail> saveCoverLetter(
            @Valid @RequestBody SaveRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        CoverLetterDetail detail = coverLetterService.saveCoverLetter(
                getUserId(userDetails), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(detail);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CoverLetterDetail> updateCoverLetter(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        CoverLetterDetail detail = coverLetterService.updateCoverLetter(
                id, getUserId(userDetails), request);
        return ResponseEntity.ok(detail);
    }

    @GetMapping
    public ResponseEntity<List<CoverLetterListItem>> listCoverLetters(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<CoverLetterListItem> letters = coverLetterService.listCoverLetters(
                getUserId(userDetails));
        return ResponseEntity.ok(letters);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CoverLetterDetail> getCoverLetter(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        CoverLetterDetail detail = coverLetterService.getCoverLetter(
                id, getUserId(userDetails));
        return ResponseEntity.ok(detail);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCoverLetter(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        coverLetterService.deleteCoverLetter(id, getUserId(userDetails));
        return ResponseEntity.noContent().build();
    }

    private UUID getUserId(UserDetails userDetails) {
        return UUID.fromString(userDetails.getUsername());
    }
}
