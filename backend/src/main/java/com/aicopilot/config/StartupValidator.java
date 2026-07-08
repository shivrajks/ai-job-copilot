package com.aicopilot.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class StartupValidator {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${ai.provider:mock}")
    private String aiProvider;

    @Value("${gemini.api-key:}")
    private String geminiApiKey;

    @Value("${spring.mail.host:}")
    private String smtpHost;

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    @PostConstruct
    public void validate() {
        boolean hasErrors = false;

        // Validate JWT_SECRET
        if (jwtSecret == null || jwtSecret.isBlank()) {
            log.error("FATAL: JWT_SECRET is not configured. Set the JWT_SECRET environment variable.");
            hasErrors = true;
        } else if (jwtSecret.length() < 32) {
            log.error("FATAL: JWT_SECRET is too short ({} chars). Use at least 32 characters for security.", jwtSecret.length());
            hasErrors = true;
        }

        // Validate Database URL
        if (datasourceUrl == null || datasourceUrl.isBlank()) {
            log.error("FATAL: DATABASE_URL is not configured. Set spring.datasource.url or DB_HOST.");
            hasErrors = true;
        }

        // Validate Gemini API key if Gemini provider is selected
        if ("gemini".equalsIgnoreCase(aiProvider)) {
            if (geminiApiKey == null || geminiApiKey.isBlank()) {
                log.error("FATAL: AI provider is set to 'gemini' but GEMINI_API_KEY is not configured.");
                hasErrors = true;
            } else {
                log.info("Gemini AI provider enabled.");
            }
        } else {
            log.info("AI provider set to '{}'. Gemini AI features will use mock responses.", aiProvider);
        }

        // Warn if SMTP is not configured
        if (smtpHost == null || smtpHost.isBlank()) {
            log.warn("SMTP not configured. Password reset emails will not be sent. Set SMTP_HOST to enable.");
        } else {
            log.info("SMTP configured: {}", smtpHost);
        }

        if (hasErrors) {
            log.error("Startup validation failed. Please configure the required environment variables and restart.");
        } else {
            log.info("Startup validation passed.");
        }
    }
}
