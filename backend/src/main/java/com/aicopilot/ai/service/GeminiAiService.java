package com.aicopilot.ai.service;

import com.aicopilot.ai.dto.AiDtos.ParseResponse;
import com.aicopilot.ai.prompt.ResumeParsingPrompts;
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
public class GeminiAiService implements AiService {

    private final String apiKey;
    private final String modelName;
    private ChatLanguageModel model;

    public GeminiAiService(
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
            log.info("Gemini AI service initialized with model: {}", modelName);
        } else {
            log.warn("Gemini API key is empty or not set. AI features will be unavailable.");
        }
    }

    @Override
    public ParseResponse parseResume(UUID resumeId, String rawText) {
        log.info("AI parse request: resumeId={}, chars={}", resumeId, rawText != null ? rawText.length() : 0);

        if (model == null) {
            log.warn("AI parse failed: model not initialized for resume: {}", resumeId);
            return ParseResponse.failure("Gemini AI model is not initialized. Check GEMINI_API_KEY.");
        }

        try {
            String systemPrompt = ResumeParsingPrompts.RESUME_PARSER_SYSTEM;
            String userPrompt = ResumeParsingPrompts.buildParsePrompt(rawText);

            List<ChatMessage> messages = List.of(
                    new SystemMessage(systemPrompt),
                    new UserMessage(userPrompt)
            );
            Response<AiMessage> response = model.generate(messages);
            String text = response.content().text();

            // Strip markdown code fences if Gemini wraps JSON in ```json...```
            if (text.startsWith("```")) {
                int firstNewline = text.indexOf('\n');
                int lastFence = text.lastIndexOf("```");
                if (firstNewline != -1 && lastFence > firstNewline) {
                    text = text.substring(firstNewline + 1, lastFence).trim();
                }
            }

            return ParseResponse.success(text, rawText);
        } catch (Exception e) {
            log.error("Failed to parse resume {} with Gemini AI", resumeId, e);
            return ParseResponse.failure("AI parsing failed: " + e.getMessage());
        }
    }

    @Override
    public boolean isAvailable() {
        return model != null;
    }
}
