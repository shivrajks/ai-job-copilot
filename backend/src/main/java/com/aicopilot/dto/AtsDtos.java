package com.aicopilot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public final class AtsDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AtsReport {
        private UUID resumeId;
        private UUID jobDescriptionId;
        private int atsScore;
        private int matchPercentage;
        private ScoreExplanation scoreExplanation;
        private List<CategoryExplanation> categoryExplanations;
        private List<Recommendation> recommendations;
        private List<String> missingSkills;
        private LocalDateTime analyzedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScoreExplanation {
        private int overallScore;
        private String summary;
        private List<ScoreContribution> contributions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScoreContribution {
        private String category;
        private String label;
        private int score;
        private double weight;
        private double weightedPoints;
        private String detail;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryExplanation {
        private String category;
        private String label;
        private int score;
        private double weight;
        private String explanation;
        private String detail;
        private List<String> strengths;
        private List<String> weaknesses;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Recommendation {
        private String category;
        private String label;
        private String description;
        private String priority;
        private double estimatedImpact;
        private String type;
    }

    private AtsDtos() {}
}
