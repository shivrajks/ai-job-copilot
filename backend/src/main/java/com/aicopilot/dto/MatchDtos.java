package com.aicopilot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public final class MatchDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MatchResult {
        private UUID resumeId;
        private UUID jobDescriptionId;
        private int atsScore;
        private int matchPercentage;
        private Map<String, CategoryBreakdown> categoryBreakdown;
        private List<String> matchedSkills;
        private List<String> missingSkills;
        private List<String> strengths;
        private List<String> weaknesses;
        private LocalDateTime analyzedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryBreakdown {
        private int score;
        private double weight;
        private String label;
        private String detail;
    }

    private MatchDtos() {}
}
