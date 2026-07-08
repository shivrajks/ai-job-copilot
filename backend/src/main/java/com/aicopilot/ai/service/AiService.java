package com.aicopilot.ai.service;

import com.aicopilot.ai.dto.AiDtos.ParseResponse;

import java.util.UUID;

public interface AiService {
    ParseResponse parseResume(UUID resumeId, String rawText);
    boolean isAvailable();
}
