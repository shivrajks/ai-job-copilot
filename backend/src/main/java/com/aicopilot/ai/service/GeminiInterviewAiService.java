package com.aicopilot.ai.service;

import com.aicopilot.ai.prompt.InterviewPrompts;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.SystemMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import dev.langchain4j.model.output.Response;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@ConditionalOnProperty(name = "ai.provider", havingValue = "gemini", matchIfMissing = false)
public class GeminiInterviewAiService implements InterviewAiService {

    private final String apiKey;
    private final String modelName;
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private ChatLanguageModel model;

    public GeminiInterviewAiService(
            @Value("${gemini.api-key}") String apiKey,
            @Value("${gemini.flash-model:gemini-2.0-flash}") String modelName) {
        this.apiKey = apiKey;
        this.modelName = modelName;
    }

    @PostConstruct
    public void init() {
        if (apiKey != null && !apiKey.isBlank() && !apiKey.isEmpty()) {
            this.model = GoogleAiGeminiChatModel.builder()
                    .apiKey(apiKey)
                    .modelName(modelName)
                    .build();
            log.info("Gemini interview service initialized with model: {}", modelName);
        } else {
            log.warn("Gemini API key is empty or not set. Interview generation will be unavailable.");
        }
    }

    @Override
    public InterviewResponse generate(
            UUID resumeId, String resumeJson, String tailoredResumeJson,
            String jdJson, int atsScore, String matchedSkills, String missingSkills,
            int count, String difficulty, String seniority, String role, String company,
            String categoryMix, String coverLetterJson) {
        if (model == null) {
            return InterviewResponse.failure(
                    "Gemini AI model is not initialized. Check GEMINI_API_KEY.");
        }

        try {
            String systemPrompt = InterviewPrompts.buildSystemPrompt();
            String userPrompt = InterviewPrompts.buildPrompt(
                    resumeJson, jdJson, count, difficulty, seniority, role, company,
                    categoryMix, atsScore, matchedSkills, missingSkills,
                    buildTailoredSection(tailoredResumeJson),
                    buildCoverLetterSection(coverLetterJson));

            List<ChatMessage> messages = List.of(
                    new SystemMessage(systemPrompt),
                    new UserMessage(userPrompt)
            );
            Response<AiMessage> response = model.generate(messages);
            String text = response.content().text();

            if (text.startsWith("```")) {
                int firstNewline = text.indexOf('\n');
                int lastFence = text.lastIndexOf("```");
                if (firstNewline != -1 && lastFence > firstNewline) {
                    text = text.substring(firstNewline + 1, lastFence).trim();
                }
            }

            try {
                MAPPER.readTree(text);
            } catch (Exception e) {
                log.error("AI response is not valid JSON for interview questions {}", resumeId);
                return InterviewResponse.failure("AI response was malformed: invalid JSON");
            }

            return InterviewResponse.success(text);
        } catch (Exception e) {
            log.error("Failed to generate interview questions with Gemini AI", e);
            return InterviewResponse.failure("Interview question generation failed: " + e.getMessage());
        }
    }

    @Override
    public ScoreResponse score(String question, String suggestedAnswer,
                                String candidateAnswer, String keyPoints) {
        if (model == null) {
            return ScoreResponse.failure(
                    "Gemini AI model is not initialized. Check GEMINI_API_KEY.");
        }

        try {
            String systemPrompt = InterviewPrompts.buildScoreSystemPrompt();
            String userPrompt = InterviewPrompts.buildScorePrompt(
                    question, suggestedAnswer, candidateAnswer, keyPoints);

            List<ChatMessage> messages = List.of(
                    new SystemMessage(systemPrompt),
                    new UserMessage(userPrompt)
            );
            Response<AiMessage> response = model.generate(messages);
            String text = response.content().text();

            if (text.startsWith("```")) {
                int firstNewline = text.indexOf('\n');
                int lastFence = text.lastIndexOf("```");
                if (firstNewline != -1 && lastFence > firstNewline) {
                    text = text.substring(firstNewline + 1, lastFence).trim();
                }
            }

            try {
                MAPPER.readTree(text);
            } catch (Exception e) {
                log.error("AI score response is not valid JSON");
                return ScoreResponse.failure("AI score response was malformed: invalid JSON");
            }

            return ScoreResponse.success(text);
        } catch (Exception e) {
            log.error("Failed to score interview answer with Gemini AI", e);
            return ScoreResponse.failure("Interview scoring failed: " + e.getMessage());
        }
    }

    @Override
    public boolean isAvailable() {
        return model != null;
    }

    private String buildTailoredSection(String tailoredResumeJson) {
        if (tailoredResumeJson == null || tailoredResumeJson.isBlank()
                || "{}".equals(tailoredResumeJson.trim())) {
            return "";
        }
        return "=== TAILORED RESUME ===\n" + tailoredResumeJson + "\n";
    }

    private String buildCoverLetterSection(String coverLetterJson) {
        if (coverLetterJson == null || coverLetterJson.isBlank()
                || "{}".equals(coverLetterJson.trim())) {
            return "";
        }
        return "=== COVER LETTER ===\n" + coverLetterJson + "\n";
    }
}
