package com.aicopilot.dto;

import com.aicopilot.entity.Resume;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

public class ResumeDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UploadResponse {
        private UUID id;
        private String name;
        private String status;
        private String message;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResumeListItem {
        private UUID id;
        private String name;
        private Integer versionNum;
        private String parsingStatus;
        private Boolean isActive;
        private Long fileSize;
        private Integer atsScore;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResumeDetail {
        private UUID id;
        private String name;
        private Integer versionNum;
        private String parsingStatus;
        private String errorMessage;
        private Boolean isActive;
        private String originalFileUrl;
        private String parsedContent;
        private String structuredData;
        private Long fileSize;
        private String mimeType;
        private Integer atsScore;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RenameRequest {
        @NotBlank(message = "Name is required")
        private String name;
    }

    /**
     * Maps a Resume entity to a ResumeListItem for list views.
     */
    public static ResumeListItem toListItem(Resume resume) {
        return ResumeListItem.builder()
                .id(resume.getId())
                .name(resume.getName())
                .versionNum(resume.getVersionNum())
                .parsingStatus(resume.getParsingStatus().name())
                .isActive(resume.getIsActive())
                .fileSize(resume.getFileSize())
                .atsScore(resume.getAtsScore())
                .createdAt(resume.getCreatedAt())
                .build();
    }

    /**
     * Maps a Resume entity to a ResumeDetail for detail views.
     */
    public static ResumeDetail toDetail(Resume resume) {
        return ResumeDetail.builder()
                .id(resume.getId())
                .name(resume.getName())
                .versionNum(resume.getVersionNum())
                .parsingStatus(resume.getParsingStatus().name())
                .errorMessage(resume.getErrorMessage())
                .isActive(resume.getIsActive())
                // Do not expose server-side storage paths to API consumers.
                .originalFileUrl(null)
                .parsedContent(resume.getParsedContent())
                .structuredData(resume.getStructuredData())
                .fileSize(resume.getFileSize())
                .mimeType(resume.getMimeType())
                .atsScore(resume.getAtsScore())
                .createdAt(resume.getCreatedAt())
                .updatedAt(resume.getUpdatedAt())
                .build();
    }
}
