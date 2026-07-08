package com.aicopilot.dto;

import com.aicopilot.entity.Application;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class ApplicationDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "Company is required")
        private String company;

        @NotBlank(message = "Role is required")
        private String role;

        private String location;
        private Integer salaryMin;
        private Integer salaryMax;
        private String jobUrl;
        private UUID resumeId;
        private String notes;

        @Builder.Default
        private String stage = "SAVED";

        private LocalDateTime appliedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        @NotBlank(message = "Company is required")
        private String company;

        @NotBlank(message = "Role is required")
        private String role;

        private String location;
        private Integer salaryMin;
        private Integer salaryMax;
        private String jobUrl;
        private UUID resumeId;
        private String notes;
        private String stage;
        private LocalDateTime appliedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StageUpdateRequest {
        @NotBlank(message = "Stage is required")
        private String stage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplicationListItem {
        private UUID id;
        private String company;
        private String role;
        private String location;
        private String stage;
        private UUID resumeId;
        private String resumeName;
        private LocalDateTime appliedAt;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplicationDetail {
        private UUID id;
        private String company;
        private String role;
        private String location;
        private Integer salaryMin;
        private Integer salaryMax;
        private String jobUrl;
        private UUID resumeId;
        private String resumeName;
        private UUID jobDescriptionId;
        private String jobDescriptionTitle;
        private String stage;
        private String notes;
        private LocalDateTime appliedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BatchStageRequest {
        @NotBlank(message = "Stage is required")
        private String stage;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BatchIdsRequest {
        private List<UUID> ids;
    }

    public static ApplicationListItem toListItem(Application application) {
        return ApplicationListItem.builder()
                .id(application.getId())
                .company(application.getCompany())
                .role(application.getRole())
                .location(application.getLocation())
                .stage(application.getStage().name())
                .resumeId(application.getResume() != null ? application.getResume().getId() : null)
                .resumeName(application.getResume() != null ? application.getResume().getName() : null)
                .appliedAt(application.getAppliedAt())
                .createdAt(application.getCreatedAt())
                .build();
    }

    public static ApplicationDetail toDetail(Application application) {
        return ApplicationDetail.builder()
                .id(application.getId())
                .company(application.getCompany())
                .role(application.getRole())
                .location(application.getLocation())
                .salaryMin(application.getSalaryMin())
                .salaryMax(application.getSalaryMax())
                .jobUrl(application.getJobUrl())
                .resumeId(application.getResume() != null ? application.getResume().getId() : null)
                .resumeName(application.getResume() != null ? application.getResume().getName() : null)
                .jobDescriptionId(application.getJobDescription() != null ? application.getJobDescription().getId() : null)
                .jobDescriptionTitle(application.getJobDescription() != null ? application.getJobDescription().getTitle() : null)
                .stage(application.getStage().name())
                .notes(application.getNotes())
                .appliedAt(application.getAppliedAt())
                .createdAt(application.getCreatedAt())
                .updatedAt(application.getUpdatedAt())
                .build();
    }
}
