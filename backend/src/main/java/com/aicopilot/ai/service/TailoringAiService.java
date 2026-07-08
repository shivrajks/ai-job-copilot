package com.aicopilot.ai.service;

import java.util.UUID;

public interface TailoringAiService {

    TailorResponse tailor(UUID resumeId, String resumeJson, String jdJson,
                          int atsScore, String missingSkills, String recommendations);

    boolean isAvailable();

    final class TailorResponse {
        private final String tailoredStructuredData;
        private final boolean success;
        private final String errorMessage;

        private TailorResponse(String tailoredStructuredData, boolean success, String errorMessage) {
            this.tailoredStructuredData = tailoredStructuredData;
            this.success = success;
            this.errorMessage = errorMessage;
        }

        public static TailorResponse success(String tailoredStructuredData) {
            return new TailorResponse(tailoredStructuredData, true, null);
        }

        public static TailorResponse failure(String errorMessage) {
            return new TailorResponse(null, false, errorMessage);
        }

        public String getTailoredStructuredData() { return tailoredStructuredData; }
        public boolean isSuccess() { return success; }
        public String getErrorMessage() { return errorMessage; }
    }
}
