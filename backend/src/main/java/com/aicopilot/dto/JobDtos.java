package com.aicopilot.dto;

import com.aicopilot.entity.Job;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class JobDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "Job title is required")
        private String title;

        @NotBlank(message = "Company is required")
        private String company;

        private String location;
        private String employmentType;
        private String workMode;
        private Integer salaryMin;
        private Integer salaryMax;
        private String description;
        private List<String> skillsRequired;
        private String experienceRequired;
        private String source;
        private String sourceUrl;
        private String notes;
        private LocalDate dateSaved;
        private LocalDate deadline;
        private String priority;

        @Builder.Default
        private String status = "SAVED";

        private LocalDate appliedDate;
        private List<LocalDate> interviewDates;
        private String offerStatus;
        private String rejectionReason;
        private LocalDate followUpDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        @NotBlank(message = "Job title is required")
        private String title;

        @NotBlank(message = "Company is required")
        private String company;

        private String location;
        private String employmentType;
        private String workMode;
        private Integer salaryMin;
        private Integer salaryMax;
        private String description;
        private List<String> skillsRequired;
        private String experienceRequired;
        private String source;
        private String sourceUrl;
        private String notes;
        private LocalDate dateSaved;
        private LocalDate deadline;
        private String priority;
        private String status;
        private LocalDate appliedDate;
        private List<LocalDate> interviewDates;
        private String offerStatus;
        private String rejectionReason;
        private LocalDate followUpDate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusUpdateRequest {
        @NotBlank(message = "Status is required")
        private String status;

        private String rejectionReason;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FavoriteRequest {
        private boolean favorite;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ArchiveRequest {
        private boolean archived;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JobListItem {
        private UUID id;
        private String title;
        private String company;
        private String location;
        private String employmentType;
        private String workMode;
        private Integer salaryMin;
        private Integer salaryMax;
        private String source;
        private String sourceUrl;
        private String status;
        private String priority;
        private boolean isFavorite;
        private boolean isArchived;
        private LocalDate dateSaved;
        private LocalDate deadline;
        private LocalDate appliedDate;
        private LocalDate followUpDate;
        private String offerStatus;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JobDetail {
        private UUID id;
        private String title;
        private String company;
        private String location;
        private String employmentType;
        private String workMode;
        private Integer salaryMin;
        private Integer salaryMax;
        private String description;
        private List<String> skillsRequired;
        private String experienceRequired;
        private String source;
        private String sourceUrl;
        private String notes;
        private LocalDate dateSaved;
        private LocalDate deadline;
        private String priority;
        private boolean isFavorite;
        private boolean isArchived;
        private String status;
        private LocalDate appliedDate;
        private List<LocalDate> interviewDates;
        private String offerStatus;
        private String rejectionReason;
        private LocalDate followUpDate;
        private UUID resumeId;
        private String resumeName;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JobStats {
        private long total;
        private long saved;
        private long applied;
        private long interviewing;
        private long offers;
        private long accepted;
        private long rejected;
        private long withdrawn;
        private long archived;
        private long favorites;
    }

    public static JobListItem toListItem(Job job) {
        return JobListItem.builder()
                .id(job.getId())
                .title(job.getTitle())
                .company(job.getCompany())
                .location(job.getLocation())
                .employmentType(job.getEmploymentType() != null ? job.getEmploymentType().name() : null)
                .workMode(job.getWorkMode() != null ? job.getWorkMode().name() : null)
                .salaryMin(job.getSalaryMin())
                .salaryMax(job.getSalaryMax())
                .source(job.getSource() != null ? job.getSource().name() : null)
                .sourceUrl(job.getSourceUrl())
                .status(job.getStatus().name())
                .priority(job.getPriority().name())
                .isFavorite(job.isFavorite())
                .isArchived(job.isArchived())
                .dateSaved(job.getDateSaved())
                .deadline(job.getDeadline())
                .appliedDate(job.getAppliedDate())
                .followUpDate(job.getFollowUpDate())
                .offerStatus(job.getOfferStatus() != null ? job.getOfferStatus().name() : null)
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .build();
    }

    public static JobDetail toDetail(Job job) {
        return JobDetail.builder()
                .id(job.getId())
                .title(job.getTitle())
                .company(job.getCompany())
                .location(job.getLocation())
                .employmentType(job.getEmploymentType() != null ? job.getEmploymentType().name() : null)
                .workMode(job.getWorkMode() != null ? job.getWorkMode().name() : null)
                .salaryMin(job.getSalaryMin())
                .salaryMax(job.getSalaryMax())
                .description(job.getDescription())
                .skillsRequired(parseStringList(job.getSkillsRequired()))
                .experienceRequired(job.getExperienceRequired())
                .source(job.getSource() != null ? job.getSource().name() : null)
                .sourceUrl(job.getSourceUrl())
                .notes(job.getNotes())
                .dateSaved(job.getDateSaved())
                .deadline(job.getDeadline())
                .priority(job.getPriority().name())
                .isFavorite(job.isFavorite())
                .isArchived(job.isArchived())
                .status(job.getStatus().name())
                .appliedDate(job.getAppliedDate())
                .interviewDates(parseLocalDateList(job.getInterviewDates()))
                .offerStatus(job.getOfferStatus() != null ? job.getOfferStatus().name() : null)
                .rejectionReason(job.getRejectionReason())
                .followUpDate(job.getFollowUpDate())
                .resumeId(job.getResume() != null ? job.getResume().getId() : null)
                .resumeName(job.getResume() != null ? job.getResume().getName() : null)
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .build();
    }

    private static List<String> parseStringList(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            com.fasterxml.jackson.core.type.TypeReference<List<String>> typeRef = new com.fasterxml.jackson.core.type.TypeReference<>() {};
            return new com.fasterxml.jackson.databind.ObjectMapper().readValue(json, typeRef);
        } catch (Exception e) {
            return List.of();
        }
    }

    private static List<LocalDate> parseLocalDateList(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            com.fasterxml.jackson.core.type.TypeReference<List<String>> typeRef = new com.fasterxml.jackson.core.type.TypeReference<>() {};
            List<String> dates = new com.fasterxml.jackson.databind.ObjectMapper().readValue(json, typeRef);
            return dates.stream().map(LocalDate::parse).toList();
        } catch (Exception e) {
            return List.of();
        }
    }

    public static String toJsonString(Object value) {
        if (value == null) return null;
        try {
            return new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(value);
        } catch (Exception e) {
            return null;
        }
    }
}
