package com.aicopilot.ai.service;

import java.util.UUID;

public interface CoverLetterAiService {

    CoverLetterResponse generate(
            UUID resumeId,
            String resumeJson,
            String tailoredResumeJson,
            String jdJson,
            int atsScore,
            String matchedSkills,
            String missingSkills,
            String recommendations,
            String companyName,
            String hiringManager,
            String tone,
            String template);

    boolean isAvailable();

    final class CoverLetterResponse {
        private final String coverLetterJson;
        private final boolean success;
        private final String errorMessage;

        private CoverLetterResponse(String coverLetterJson, boolean success, String errorMessage) {
            this.coverLetterJson = coverLetterJson;
            this.success = success;
            this.errorMessage = errorMessage;
        }

        public static CoverLetterResponse success(String coverLetterJson) {
            return new CoverLetterResponse(coverLetterJson, true, null);
        }

        public static CoverLetterResponse failure(String errorMessage) {
            return new CoverLetterResponse(null, false, errorMessage);
        }

        public String getCoverLetterJson() { return coverLetterJson; }
        public boolean isSuccess() { return success; }
        public String getErrorMessage() { return errorMessage; }
    }
}
