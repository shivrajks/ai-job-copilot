package com.aicopilot.controller;

import com.aicopilot.dto.ApplicationDtos;
import com.aicopilot.dto.ApplicationDtos.*;
import com.aicopilot.service.ApplicationService;
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
@RequestMapping("/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping
    public ResponseEntity<ApplicationDetail> createApplication(
            @Valid @RequestBody CreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        ApplicationDetail response = applicationService.createApplication(request, getUserId(userDetails));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ApplicationListItem>> listApplications(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(applicationService.listUserApplications(getUserId(userDetails)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationDetail> getApplication(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(applicationService.getApplication(getUserId(userDetails), id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApplicationDetail> updateApplication(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                applicationService.updateApplication(getUserId(userDetails), id, request));
    }

    @PutMapping("/{id}/stage")
    public ResponseEntity<ApplicationDetail> updateApplicationStage(
            @PathVariable UUID id,
            @Valid @RequestBody StageUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                applicationService.updateApplicationStage(getUserId(userDetails), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        applicationService.deleteApplication(getUserId(userDetails), id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/batch/stage")
    public ResponseEntity<List<ApplicationDetail>> batchUpdateStage(
            @RequestParam String stage,
            @Valid @RequestBody BatchIdsRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<ApplicationDetail> results = applicationService.batchUpdateStage(
                getUserId(userDetails), request.getIds(), stage);
        return ResponseEntity.ok(results);
    }

    @DeleteMapping("/batch")
    public ResponseEntity<Void> batchDelete(
            @Valid @RequestBody BatchIdsRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        applicationService.batchDelete(getUserId(userDetails), request.getIds());
        return ResponseEntity.noContent().build();
    }

    private UUID getUserId(UserDetails userDetails) {
        return UUID.fromString(userDetails.getUsername());
    }
}
