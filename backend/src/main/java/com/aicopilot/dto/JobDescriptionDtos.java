package com.aicopilot.dto;

import com.aicopilot.entity.JobDescription;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

public class JobDescriptionDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "Title is required")
        private String title;

        private String company;
        private String rawText;
        private String sourceUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        @NotBlank(message = "Title is required")
        private String title;

        private String company;
        private String rawText;
        private String sourceUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JobDescriptionListItem {
        private UUID id;
        private String title;
        private String company;
        private String sourceUrl;
        private Integer matchScore;
        private String analysisStatus;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JobDescriptionDetail {
        private UUID id;
        private String title;
        private String company;
        private String rawText;
        private String sourceUrl;
        private String extractedSkills;
        private Integer matchScore;
        private String analysisStatus;
        private LocalDateTime analyzedAt;
        private Integer analysisAttempts;
        private String errorMessage;
        private String structuredData;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    public static JobDescriptionListItem toListItem(JobDescription jd) {
        return JobDescriptionListItem.builder()
                .id(jd.getId())
                .title(jd.getTitle())
                .company(jd.getCompany())
                .sourceUrl(jd.getSourceUrl())
                .matchScore(jd.getMatchScore())
                .analysisStatus(jd.getAnalysisStatus() != null ? jd.getAnalysisStatus().name() : "PENDING")
                .createdAt(jd.getCreatedAt())
                .build();
    }

    public static JobDescriptionDetail toDetail(JobDescription jd) {
        return JobDescriptionDetail.builder()
                .id(jd.getId())
                .title(jd.getTitle())
                .company(jd.getCompany())
                .rawText(jd.getRawText())
                .sourceUrl(jd.getSourceUrl())
                .extractedSkills(jd.getExtractedSkills())
                .matchScore(jd.getMatchScore())
                .analysisStatus(jd.getAnalysisStatus() != null ? jd.getAnalysisStatus().name() : "PENDING")
                .analyzedAt(jd.getAnalyzedAt())
                .analysisAttempts(jd.getAnalysisAttempts())
                .errorMessage(jd.getErrorMessage())
                .structuredData(jd.getStructuredData())
                .createdAt(jd.getCreatedAt())
                .updatedAt(jd.getUpdatedAt())
                .build();
    }
}
