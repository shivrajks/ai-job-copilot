package com.aicopilot.dto;

import com.aicopilot.entity.InterviewSession;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public final class InterviewDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GenerateRequest {
        @NotNull(message = "Resume ID is required")
        private UUID resumeId;

        private UUID jobDescriptionId;

        @NotBlank(message = "Difficulty is required")
        private String difficulty;

        @Min(value = 1, message = "Question count must be at least 1")
        @Max(value = 15, message = "Question count must be at most 15")
        @Builder.Default
        private int questionCount = 8;

        private String title;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SessionData {
        private String title;
        private String difficulty;
        private List<InterviewQuestion> questions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InterviewQuestion {
        private String id;
        private String category;
        private String difficulty;
        private String question;
        private String suggestedAnswer;
        private List<String> keyPoints;
        private String estimatedTime;
        private List<String> followUpQuestions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserAnswer {
        @NotBlank(message = "Question ID is required")
        private String questionId;

        @NotBlank(message = "Answer is required")
        private String answer;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScoreRequest {
        @NotEmpty(message = "Answers are required")
        private List<UserAnswer> answers;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InterviewFeedback {
        private String questionId;
        private int overallScore;
        private int relevanceScore;
        private int clarityScore;
        private int completenessScore;
        private List<String> strengths;
        private List<String> improvements;
        private String suggestedAnswer;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScoreResponse {
        private List<InterviewFeedback> feedback;
        private int overallScore;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SessionListItem {
        private UUID id;
        private String title;
        private String sessionType;
        private String difficulty;
        private String status;
        private Integer questionCount;
        private Integer answeredCount;
        private Integer overallScore;
        private String companyName;
        private String roleTitle;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SessionDetail {
        private UUID id;
        private String title;
        private String sessionType;
        private String difficulty;
        private String status;
        private String questions;
        private String responses;
        private Integer overallScore;
        private String feedback;
        private Integer questionCount;
        private Integer answeredCount;
        private UUID resumeId;
        private UUID jobDescriptionId;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    public static SessionListItem toListItem(InterviewSession session) {
        String companyName = null;
        String roleTitle = null;
        if (session.getJobDescription() != null) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper =
                        new com.fasterxml.jackson.databind.ObjectMapper();
                var jdData = session.getJobDescription().getStructuredData();
                if (jdData != null) {
                    var root = mapper.readTree(jdData);
                    if (root.has("basicInfo")) {
                        var info = root.get("basicInfo");
                        if (info.has("company") && !info.get("company").isNull())
                            companyName = info.get("company").asText();
                        if (info.has("title") && !info.get("title").isNull())
                            roleTitle = info.get("title").asText();
                    }
                }
            } catch (Exception ignored) {}
        }
        return SessionListItem.builder()
                .id(session.getId())
                .title(session.getTitle())
                .sessionType(session.getSessionType())
                .difficulty(session.getDifficulty())
                .status(session.getStatus())
                .questionCount(session.getQuestionCount())
                .answeredCount(session.getAnsweredCount())
                .overallScore(session.getOverallScore())
                .companyName(companyName)
                .roleTitle(roleTitle)
                .createdAt(session.getCreatedAt())
                .updatedAt(session.getUpdatedAt())
                .build();
    }

    public static SessionDetail toDetail(InterviewSession session) {
        return SessionDetail.builder()
                .id(session.getId())
                .title(session.getTitle())
                .sessionType(session.getSessionType())
                .difficulty(session.getDifficulty())
                .status(session.getStatus())
                .questions(session.getQuestions())
                .responses(session.getResponses())
                .overallScore(session.getOverallScore())
                .feedback(session.getFeedback())
                .questionCount(session.getQuestionCount())
                .answeredCount(session.getAnsweredCount())
                .resumeId(session.getResume() != null ? session.getResume().getId() : null)
                .jobDescriptionId(session.getJobDescription() != null ? session.getJobDescription().getId() : null)
                .createdAt(session.getCreatedAt())
                .updatedAt(session.getUpdatedAt())
                .build();
    }

    private InterviewDtos() {}
}
