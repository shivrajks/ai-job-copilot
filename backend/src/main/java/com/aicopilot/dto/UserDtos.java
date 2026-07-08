package com.aicopilot.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

public class UserDtos {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class UpdateProfileRequest {
        @NotBlank(message = "Full name is required")
        @Size(min = 1, max = 255, message = "Full name must be between 1 and 255 characters")
        private String fullName;

        @Size(max = 500, message = "Avatar URL must not exceed 500 characters")
        private String avatarUrl;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ChangePasswordRequest {
        @NotBlank(message = "Current password is required")
        private String currentPassword;

        @NotBlank(message = "New password is required")
        @Size(min = 8, message = "New password must be at least 8 characters")
        @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
            message = "Password must contain uppercase, lowercase, number, and special character"
        )
        private String newPassword;

        @NotBlank(message = "Confirm password is required")
        private String confirmPassword;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ProfileResponse {
        private UUID id;
        private String email;
        private String fullName;
        private String avatarUrl;
        private String planTier;
        private LocalDateTime createdAt;
        private UserSettingsResponse settings;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UserSettingsResponse {
        private String theme;
        private String defaultDashboardPage;
        private UUID defaultResumeId;
        private String defaultResumeName;
        private String defaultSortField;
        private String defaultSortDirection;
        private boolean notifyPasswordReset;
        private boolean notifyResumeParsed;
        private boolean notifyAtsComplete;
        private boolean notifyInterviewReady;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class UpdateSettingsRequest {
        private String theme;
        private String defaultDashboardPage;
        private UUID defaultResumeId;
        private String defaultSortField;
        private String defaultSortDirection;
        private Boolean notifyPasswordReset;
        private Boolean notifyResumeParsed;
        private Boolean notifyAtsComplete;
        private Boolean notifyInterviewReady;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class MessageResponse {
        private String message;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SessionInfo {
        private int activeSessions;
    }
}
