package com.aicopilot.ai.service;

import com.aicopilot.ai.dto.AiDtos.ParseResponse;
import com.aicopilot.ai.prompt.JobDescriptionAnalysisPrompts;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.SystemMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import dev.langchain4j.model.output.Response;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@ConditionalOnProperty(name = "ai.provider", havingValue = "gemini", matchIfMissing = false)
public class GeminiJobDescriptionAiService implements JobDescriptionAiService {

    private final String apiKey;
    private final String modelName;
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private ChatLanguageModel model;

    public GeminiJobDescriptionAiService(
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
            log.info("Gemini JD analysis service initialized with model: {}", modelName);
        } else {
            log.warn("Gemini API key is empty or not set. JD analysis will be unavailable.");
        }
    }

    @Override
    public ParseResponse analyzeJobDescription(UUID jdId, String rawText) {
        if (model == null) {
            return ParseResponse.failure("Gemini AI model is not initialized. Check GEMINI_API_KEY.");
        }

        try {
            String systemPrompt = JobDescriptionAnalysisPrompts.JD_ANALYSIS_SYSTEM;
            String userPrompt = JobDescriptionAnalysisPrompts.buildAnalysisPrompt(rawText);

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
                log.error("AI response is not valid JSON for job description {}", jdId);
                return ParseResponse.failure("AI response was malformed: invalid JSON");
            }

            return ParseResponse.success(text, rawText);
        } catch (Exception e) {
            log.error("Failed to analyze job description {} with Gemini AI", jdId, e);
            return ParseResponse.failure("AI analysis failed: " + e.getMessage());
        }
    }

    @Override
    public boolean isAvailable() {
        return model != null;
    }
}
