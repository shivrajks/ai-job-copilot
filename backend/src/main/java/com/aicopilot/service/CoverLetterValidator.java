package com.aicopilot.service;

import com.aicopilot.exception.AppException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
public class CoverLetterValidator {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    public void validate(String resumeJson, String coverLetterJson) {
        if (resumeJson == null || coverLetterJson == null) {
            throw new AppException("Resume and cover letter data are required", HttpStatus.BAD_REQUEST);
        }

        try {
            JsonNode resume = MAPPER.readTree(resumeJson);
            JsonNode coverLetter = MAPPER.readTree(coverLetterJson);

            validateStructure(coverLetter);

            String fullText = coverLetter.has("fullText")
                    ? coverLetter.get("fullText").asText() : "";

            validateSkillsNotInvented(resume, fullText);
            log.debug("Cover letter validation passed");
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Cover letter validation failed with unexpected error", e);
            throw new AppException("Failed to validate cover letter: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private void validateStructure(JsonNode coverLetter) {
        Set<String> required = Set.of("subject", "salutation", "body", "closing", "signature", "fullText");
        List<String> missing = new ArrayList<>();
        for (String field : required) {
            if (!coverLetter.has(field)) {
                missing.add(field);
            }
        }
        if (!missing.isEmpty()) {
            throw new AppException("Cover letter is missing required fields: " + String.join(", ", missing),
                    HttpStatus.BAD_REQUEST);
        }

        JsonNode body = coverLetter.get("body");
        if (!body.isArray() || body.isEmpty()) {
            throw new AppException("Cover letter body must be a non-empty array of paragraphs",
                    HttpStatus.BAD_REQUEST);
        }
    }

    private void validateSkillsNotInvented(JsonNode resume, String fullText) {
        Set<String> resumeSkills = new HashSet<>();
        JsonNode skills = resume.get("skills");
        if (skills != null && skills.isArray()) {
            for (JsonNode skill : skills) {
                resumeSkills.add(skill.asText().toLowerCase().trim());
            }
        }

        if (resumeSkills.isEmpty()) return;

        String lowerText = fullText.toLowerCase();
        List<String> suspected = new ArrayList<>();

        for (String skill : resumeSkills) {
            if (skill.length() < 3) continue;
            if (skill.matches(".*\\d.*")) continue;
            if (!lowerText.contains(skill)) {
                if (skill.contains(" ")) {
                    boolean found = false;
                    for (String part : skill.split("\\s+")) {
                        if (part.length() >= 3 && lowerText.contains(part)) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        suspected.add(skill);
                    }
                } else {
                    suspected.add(skill);
                }
            }
        }

        if (suspected.size() > resumeSkills.size() / 2) {
            log.warn("Cover letter mentions few resume skills: {}/{} mentioned",
                    resumeSkills.size() - suspected.size(), resumeSkills.size());
        }
    }
}
