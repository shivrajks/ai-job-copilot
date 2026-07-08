package com.aicopilot.controller;

import com.aicopilot.dto.AnalyticsDtos.AnalyticsResponse;
import com.aicopilot.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<AnalyticsResponse> getDashboardAnalytics(
            @AuthenticationPrincipal UserDetails userDetails) {
        AnalyticsResponse response = analyticsService.getDashboardAnalytics(getUserId(userDetails));
        return ResponseEntity.ok(response);
    }

    private UUID getUserId(UserDetails userDetails) {
        return UUID.fromString(userDetails.getUsername());
    }
}
