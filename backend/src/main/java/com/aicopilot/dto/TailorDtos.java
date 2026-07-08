package com.aicopilot.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

public final class TailorDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TailorProposal {
        private UUID resumeId;
        private UUID jobDescriptionId;
        private int originalAtsScore;
        private int estimatedNewAtsScore;
        private String originalStructuredData;
        private String tailoredStructuredData;
        private List<SectionChange> changes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SectionChange {
        private String section;
        private String changeType;
        private String originalText;
        private String suggestedText;
        private String reason;
        private String recommendationType;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SaveTailoredRequest {
        @NotBlank(message = "Tailored structured data is required")
        private String tailoredStructuredData;

        @NotBlank(message = "Resume name is required")
        private String name;
    }

    private TailorDtos() {}
}
