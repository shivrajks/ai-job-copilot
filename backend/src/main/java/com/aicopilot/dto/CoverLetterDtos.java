package com.aicopilot.dto;

import com.aicopilot.entity.CoverLetter;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public final class CoverLetterDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CoverLetterContent {
        private String subject;
        private String salutation;
        private List<String> body;
        private String closing;
        private String signature;
        private String fullText;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CoverLetterProposal {
        private UUID resumeId;
        private UUID jobDescriptionId;
        private CoverLetterContent content;
        private String tone;
        private String template;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GenerateRequest {
        @NotNull(message = "Resume ID is required")
        private UUID resumeId;

        private UUID jobDescriptionId;

        @NotBlank(message = "Tone is required")
        private String tone;

        @NotBlank(message = "Template is required")
        private String template;

        private String companyName;
        private String hiringManager;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SaveRequest {
        @NotBlank(message = "Content is required")
        private String content;

        @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Title must be at most 255 characters")
        private String title;

        private String tone;
        private String template;
        private String companyName;
        private String hiringManager;
        private String recipientTitle;
        private UUID jobDescriptionId;
        private UUID resumeId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        @NotBlank(message = "Content is required")
        private String content;

        @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Title must be at most 255 characters")
        private String title;

        private String tone;
        private String template;
        private String companyName;
        private String hiringManager;
        private String recipientTitle;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CoverLetterListItem {
        private UUID id;
        private String title;
        private String companyName;
        private String tone;
        private String template;
        private String preview;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CoverLetterDetail {
        private UUID id;
        private String title;
        private String content;
        private String tone;
        private String template;
        private String companyName;
        private String hiringManager;
        private String recipientTitle;
        private UUID resumeId;
        private UUID jobDescriptionId;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    public static CoverLetterListItem toListItem(CoverLetter cl) {
        String preview = cl.getContent();
        if (preview != null && preview.length() > 120) {
            preview = preview.substring(0, 120).trim() + "...";
        }
        return CoverLetterListItem.builder()
                .id(cl.getId())
                .title(cl.getTitle())
                .companyName(cl.getCompanyName())
                .tone(cl.getTone())
                .template(cl.getTemplate())
                .preview(preview)
                .createdAt(cl.getCreatedAt())
                .updatedAt(cl.getUpdatedAt())
                .build();
    }

    public static CoverLetterDetail toDetail(CoverLetter cl) {
        return CoverLetterDetail.builder()
                .id(cl.getId())
                .title(cl.getTitle())
                .content(cl.getContent())
                .tone(cl.getTone())
                .template(cl.getTemplate())
                .companyName(cl.getCompanyName())
                .hiringManager(cl.getHiringManager())
                .recipientTitle(cl.getRecipientTitle())
                .resumeId(cl.getResume() != null ? cl.getResume().getId() : null)
                .jobDescriptionId(cl.getJobDescription() != null ? cl.getJobDescription().getId() : null)
                .createdAt(cl.getCreatedAt())
                .updatedAt(cl.getUpdatedAt())
                .build();
    }

    private CoverLetterDtos() {}
}
