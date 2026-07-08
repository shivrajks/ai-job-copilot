package com.aicopilot.controller;

import com.aicopilot.dto.JobDtos.*;
import com.aicopilot.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    @PostMapping
    public ResponseEntity<JobDetail> createJob(
            @Valid @RequestBody CreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        JobDetail response = jobService.createJob(request, getUserId(userDetails));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<JobListItem>> listJobs(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String location,
            @RequestParam(name = "work_mode", required = false) String workMode,
            @RequestParam(name = "favorite", required = false) Boolean isFavorite,
            @RequestParam(name = "archived", required = false) Boolean isArchived,
            @RequestParam(required = false) String priority,
            @RequestParam(name = "date_from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(name = "date_to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(name = "sort_field", defaultValue = "createdAt") String sortField,
            @RequestParam(name = "sort_direction", defaultValue = "desc") String sortDirection,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(jobService.listUserJobs(
                getUserId(userDetails), search, status, company, location,
                workMode, isFavorite, isArchived, priority,
                dateFrom, dateTo, page, size, sortField, sortDirection));
    }

    @GetMapping("/stats")
    public ResponseEntity<JobStats> getJobStats(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(jobService.getJobStats(getUserId(userDetails)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobDetail> getJob(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(jobService.getJob(getUserId(userDetails), id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobDetail> updateJob(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(jobService.updateJob(getUserId(userDetails), id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<JobDetail> updateJobStatus(
            @PathVariable UUID id,
            @Valid @RequestBody StatusUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(jobService.updateJobStatus(getUserId(userDetails), id, request));
    }

    @PatchMapping("/{id}/favorite")
    public ResponseEntity<JobDetail> toggleFavorite(
            @PathVariable UUID id,
            @Valid @RequestBody FavoriteRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(jobService.toggleFavorite(getUserId(userDetails), id, request));
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<JobDetail> toggleArchive(
            @PathVariable UUID id,
            @Valid @RequestBody ArchiveRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(jobService.toggleArchive(getUserId(userDetails), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        jobService.deleteJob(getUserId(userDetails), id);
        return ResponseEntity.noContent().build();
    }

    private UUID getUserId(UserDetails userDetails) {
        return UUID.fromString(userDetails.getUsername());
    }
}
