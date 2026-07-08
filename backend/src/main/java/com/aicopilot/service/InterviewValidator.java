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
public class InterviewValidator {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    public void validate(String resumeJson, String questionsJson) {
        if (resumeJson == null || questionsJson == null) {
            throw new AppException("Resume and question data are required", HttpStatus.BAD_REQUEST);
        }

        try {
            JsonNode resume = MAPPER.readTree(resumeJson);
            JsonNode questions = MAPPER.readTree(questionsJson);

            validateQuestionStructure(questions);

            String fullText = extractAllText(questions);
            validateSkillsNotInvented(resume, fullText);
            validateCompaniesNotInvented(resume, fullText);

            log.debug("Interview question validation passed");
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Interview validation failed with unexpected error", e);
            throw new AppException("Failed to validate interview questions: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private void validateQuestionStructure(JsonNode root) {
        JsonNode questions = root.get("questions");
        if (questions == null || !questions.isArray() || questions.isEmpty()) {
            throw new AppException("Interview questions must contain a non-empty 'questions' array",
                    HttpStatus.BAD_REQUEST);
        }

        Set<String> validCategories = Set.of("HR", "TECHNICAL", "BEHAVIORAL");
        Set<String> validDifficulties = Set.of("EASY", "MEDIUM", "HARD");

        int index = 0;
        for (JsonNode q : questions) {
            index++;
            if (!q.has("id") || q.get("id").asText().isBlank()) {
                throw new AppException("Question " + index + " is missing required field: id",
                        HttpStatus.BAD_REQUEST);
            }
            if (!q.has("question") || q.get("question").asText().isBlank()) {
                throw new AppException("Question " + index + " is missing required field: question",
                        HttpStatus.BAD_REQUEST);
            }
            if (!q.has("suggestedAnswer") || q.get("suggestedAnswer").asText().isBlank()) {
                throw new AppException("Question " + index + " is missing required field: suggestedAnswer",
                        HttpStatus.BAD_REQUEST);
            }
            if (q.has("category") && !validCategories.contains(q.get("category").asText())) {
                throw new AppException("Question " + index + " has invalid category: "
                        + q.get("category").asText(), HttpStatus.BAD_REQUEST);
            }
            if (q.has("difficulty") && !validDifficulties.contains(q.get("difficulty").asText())) {
                throw new AppException("Question " + index + " has invalid difficulty: "
                        + q.get("difficulty").asText(), HttpStatus.BAD_REQUEST);
            }
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
                suspected.add(skill);
            }
        }

        if (suspected.size() > resumeSkills.size() / 2) {
            log.warn("Questions mention few resume skills: {}/{} mentioned",
                    resumeSkills.size() - suspected.size(), resumeSkills.size());
        }
    }

    private void validateCompaniesNotInvented(JsonNode resume, String fullText) {
        Set<String> resumeCompanies = new HashSet<>();
        JsonNode experience = resume.get("experience");
        if (experience != null && experience.isArray()) {
            for (JsonNode exp : experience) {
                if (exp.has("company") && !exp.get("company").isNull()) {
                    resumeCompanies.add(exp.get("company").asText().toLowerCase().trim());
                }
            }
        }

        if (resumeCompanies.isEmpty()) return;

        String lowerText = fullText.toLowerCase();
        for (String company : resumeCompanies) {
            if (company.length() < 3) continue;
            if (!lowerText.contains(company)) {
                log.debug("Company '{}' not mentioned in interview questions", company);
            }
        }
    }

    public void validateScoreResponse(String scoreJson) {
        if (scoreJson == null) {
            throw new AppException("Score data is required", HttpStatus.BAD_REQUEST);
        }

        try {
            JsonNode score = MAPPER.readTree(scoreJson);

            if (!score.has("overallScore") || !score.has("relevanceScore")
                    || !score.has("clarityScore") || !score.has("completenessScore")) {
                throw new AppException("Score response is missing required score fields",
                        HttpStatus.BAD_REQUEST);
            }

            Set<String> validFields = Set.of("overallScore", "relevanceScore", "clarityScore",
                    "completenessScore", "strengths", "improvements", "suggestedAnswer");
            for (Iterator<String> it = score.fieldNames(); it.hasNext();) {
                String field = it.next();
                if (!validFields.contains(field)) {
                    log.warn("Unexpected field in score response: {}", field);
                }
            }
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException("Failed to validate score response: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private String extractAllText(JsonNode root) {
        StringBuilder sb = new StringBuilder();
        JsonNode questions = root.get("questions");
        if (questions != null && questions.isArray()) {
            for (JsonNode q : questions) {
                if (q.has("question")) sb.append(q.get("question").asText()).append(" ");
                if (q.has("suggestedAnswer")) sb.append(q.get("suggestedAnswer").asText()).append(" ");
                if (q.has("keyPoints") && q.get("keyPoints").isArray()) {
                    for (JsonNode kp : q.get("keyPoints")) {
                        sb.append(kp.asText()).append(" ");
                    }
                }
                if (q.has("followUpQuestions") && q.get("followUpQuestions").isArray()) {
                    for (JsonNode fq : q.get("followUpQuestions")) {
                        sb.append(fq.asText()).append(" ");
                    }
                }
            }
        }
        return sb.toString();
    }
}
