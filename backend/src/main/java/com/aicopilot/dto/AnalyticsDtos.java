package com.aicopilot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public final class AnalyticsDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnalyticsResponse {
        private ApplicationAnalytics applications;
        private ResumeAnalytics resumes;
        private JobDescriptionAnalytics jobDescriptions;
        private InterviewAnalytics interviews;
        private CoverLetterAnalytics coverLetters;
        private List<RecentActivity> recentActivity;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplicationAnalytics {
        private long total;
        private long appliedThisWeek;
        private long appliedThisMonth;
        private List<StageCount> byStage;
        private List<CompanyCount> byCompany;
        private double successRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StageCount {
        private String stage;
        private long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompanyCount {
        private String company;
        private long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResumeAnalytics {
        private long total;
        private long active;
        private Double averageAtsScore;
        private Integer highestAtsScore;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JobDescriptionAnalytics {
        private long total;
        private Double averageMatchScore;
        private List<String> topSkills;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InterviewAnalytics {
        private long totalSessions;
        private Double averageScore;
        private List<ScoreTrend> scoreTrend;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScoreTrend {
        private int score;
        private LocalDateTime date;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CoverLetterAnalytics {
        private long generatedCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivity {
        private String type;
        private String description;
        private LocalDateTime timestamp;
        private UUID entityId;
    }

    private AnalyticsDtos() {}
}
