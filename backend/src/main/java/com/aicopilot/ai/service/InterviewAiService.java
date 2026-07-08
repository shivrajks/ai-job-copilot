package com.aicopilot.ai.service;

import java.util.UUID;

public interface InterviewAiService {

    InterviewResponse generate(
            UUID resumeId,
            String resumeJson,
            String tailoredResumeJson,
            String jdJson,
            int atsScore,
            String matchedSkills,
            String missingSkills,
            int count,
            String difficulty,
            String seniority,
            String role,
            String company,
            String categoryMix,
            String coverLetterJson);

    ScoreResponse score(
            String question,
            String suggestedAnswer,
            String candidateAnswer,
            String keyPoints);

    boolean isAvailable();

    final class InterviewResponse {
        private final String questionsJson;
        private final boolean success;
        private final String errorMessage;

        private InterviewResponse(String questionsJson, boolean success, String errorMessage) {
            this.questionsJson = questionsJson;
            this.success = success;
            this.errorMessage = errorMessage;
        }

        public static InterviewResponse success(String questionsJson) {
            return new InterviewResponse(questionsJson, true, null);
        }

        public static InterviewResponse failure(String errorMessage) {
            return new InterviewResponse(null, false, errorMessage);
        }

        public String getQuestionsJson() { return questionsJson; }
        public boolean isSuccess() { return success; }
        public String getErrorMessage() { return errorMessage; }
    }

    final class ScoreResponse {
        private final String scoreJson;
        private final boolean success;
        private final String errorMessage;

        private ScoreResponse(String scoreJson, boolean success, String errorMessage) {
            this.scoreJson = scoreJson;
            this.success = success;
            this.errorMessage = errorMessage;
        }

        public static ScoreResponse success(String scoreJson) {
            return new ScoreResponse(scoreJson, true, null);
        }

        public static ScoreResponse failure(String errorMessage) {
            return new ScoreResponse(null, false, errorMessage);
        }

        public String getScoreJson() { return scoreJson; }
        public boolean isSuccess() { return success; }
        public String getErrorMessage() { return errorMessage; }
    }
}
