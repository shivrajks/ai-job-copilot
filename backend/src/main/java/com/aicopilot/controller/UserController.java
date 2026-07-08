package com.aicopilot.controller;

import com.aicopilot.dto.UserDtos.*;
import com.aicopilot.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/users/me")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(userService.getProfile(userId));
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(userService.updateProfile(userId, request));
    }

    @PutMapping("/password")
    public ResponseEntity<MessageResponse> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(userService.changePassword(userId, request));
    }

    @GetMapping("/settings")
    public ResponseEntity<UserSettingsResponse> getSettings(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(userService.getSettings(userId));
    }

    @PutMapping("/settings")
    public ResponseEntity<UserSettingsResponse> updateSettings(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateSettingsRequest request) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(userService.updateSettings(userId, request));
    }

    @GetMapping("/sessions")
    public ResponseEntity<SessionInfo> getSessions(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(userService.getSessionInfo(userId));
    }
}
