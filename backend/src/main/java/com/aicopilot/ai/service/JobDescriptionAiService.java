package com.aicopilot.ai.service;

import com.aicopilot.ai.dto.AiDtos.ParseResponse;

import java.util.UUID;

public interface JobDescriptionAiService {
    ParseResponse analyzeJobDescription(UUID jdId, String rawText);
    boolean isAvailable();
}
