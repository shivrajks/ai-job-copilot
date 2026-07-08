package com.aicopilot.controller;

import com.aicopilot.dto.JobDescriptionDtos;
import com.aicopilot.dto.JobDescriptionDtos.*;
import com.aicopilot.service.JobDescriptionService;
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
@RequestMapping("/job-descriptions")
@RequiredArgsConstructor
public class JobDescriptionController {

    private final JobDescriptionService jobDescriptionService;

    @PostMapping
    public ResponseEntity<JobDescriptionDetail> createJobDescription(
            @Valid @RequestBody CreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        JobDescriptionDetail response = jobDescriptionService.createJobDescription(
                request, getUserId(userDetails));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<JobDescriptionListItem>> listJobDescriptions(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                jobDescriptionService.listUserJobDescriptions(getUserId(userDetails)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobDescriptionDetail> getJobDescription(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                jobDescriptionService.getJobDescription(getUserId(userDetails), id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobDescriptionDetail> updateJobDescription(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                jobDescriptionService.updateJobDescription(getUserId(userDetails), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJobDescription(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        jobDescriptionService.deleteJobDescription(getUserId(userDetails), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/analyze")
    public ResponseEntity<JobDescriptionDetail> analyzeJobDescription(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        JobDescriptionDetail response = jobDescriptionService.analyzeJobDescription(
                getUserId(userDetails), id);
        return ResponseEntity.ok(response);
    }

    private UUID getUserId(UserDetails userDetails) {
        return UUID.fromString(userDetails.getUsername());
    }
}
