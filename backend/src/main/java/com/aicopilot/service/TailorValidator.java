package com.aicopilot.service;

import com.aicopilot.exception.AppException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
public class TailorValidator {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private static final Set<String> NEVER_CHANGE_PERSONAL_FIELDS = Set.of(
            "fullName", "email", "phone", "location", "linkedin", "portfolio");

    public void validate(String originalJson, String tailoredJson) {
        if (originalJson == null || tailoredJson == null) {
            throw new AppException("Original and tailored resume data are required", HttpStatus.BAD_REQUEST);
        }

        try {
            JsonNode original = MAPPER.readTree(originalJson);
            JsonNode tailored = MAPPER.readTree(tailoredJson);

            validatePersonalInfo(original, tailored);
            validateExperience(original, tailored);
            validateEducation(original, tailored);
            validateCertifications(original, tailored);
            validateLanguages(original, tailored);
            validateSkills(original, tailored);

            log.debug("Tailor validation passed for resume");
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Tailor validation failed with unexpected error", e);
            throw new AppException("Failed to validate tailored resume: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private void validatePersonalInfo(JsonNode original, JsonNode tailored) {
        JsonNode origPI = original.get("personalInfo");
        JsonNode tailPI = tailored.get("personalInfo");

        if (origPI == null && tailPI == null) return;
        if (origPI == null || tailPI == null) {
            throw new AppException("Tailored resume must include personalInfo section", HttpStatus.BAD_REQUEST);
        }

        List<String> changes = new ArrayList<>();
        for (String field : NEVER_CHANGE_PERSONAL_FIELDS) {
            String origVal = origPI.has(field) && !origPI.get(field).isNull()
                    ? origPI.get(field).asText() : null;
            String tailVal = tailPI.has(field) && !tailPI.get(field).isNull()
                    ? tailPI.get(field).asText() : null;

            if (!nullSafeEquals(origVal, tailVal)) {
                changes.add(field);
            }
        }

        if (!changes.isEmpty()) {
            log.warn("Personal info fields changed: {}", changes);
            throw new AppException(
                    "Personal information cannot be changed: " + String.join(", ", changes),
                    HttpStatus.BAD_REQUEST);
        }
    }

    private void validateExperience(JsonNode original, JsonNode tailored) {
        JsonNode origExp = original.get("experience");
        JsonNode tailExp = tailored.get("experience");

        if (origExp == null && tailExp == null) return;
        if (origExp == null || tailExp == null || !origExp.isArray() || !tailExp.isArray()) {
            throw new AppException("Experience section must have the same structure as the original",
                    HttpStatus.BAD_REQUEST);
        }

        if (origExp.size() != tailExp.size()) {
            throw new AppException(
                    "Experience entry count changed: " + origExp.size() + " -> " + tailExp.size()
                            + ". Cannot add or remove experience entries.",
                    HttpStatus.BAD_REQUEST);
        }

        List<String> errors = new ArrayList<>();
        for (int i = 0; i < origExp.size(); i++) {
            JsonNode orig = origExp.get(i);
            JsonNode tail = tailExp.get(i);

            if (!nullSafeEquals(getText(orig, "company"), getText(tail, "company"))) {
                errors.add("entry[" + i + "].company changed");
            }
            if (!nullSafeEquals(getText(orig, "title"), getText(tail, "title"))) {
                errors.add("entry[" + i + "].title changed");
            }
            if (!nullSafeEquals(getText(orig, "startDate"), getText(tail, "startDate"))) {
                errors.add("entry[" + i + "].startDate changed");
            }
            if (!nullSafeEquals(getText(orig, "endDate"), getText(tail, "endDate"))) {
                errors.add("entry[" + i + "].endDate changed");
            }
        }

        if (!errors.isEmpty()) {
            log.warn("Experience validation failed: {}", errors);
            throw new AppException(
                    "Experience data integrity violation: " + String.join("; ", errors),
                    HttpStatus.BAD_REQUEST);
        }
    }

    private void validateEducation(JsonNode original, JsonNode tailored) {
        JsonNode origEdu = original.get("education");
        JsonNode tailEdu = tailored.get("education");

        if (origEdu == null && tailEdu == null) return;
        if (origEdu == null || tailEdu == null || !origEdu.isArray() || !tailEdu.isArray()) {
            throw new AppException("Education section must have the same structure as the original",
                    HttpStatus.BAD_REQUEST);
        }

        if (origEdu.size() != tailEdu.size()) {
            throw new AppException(
                    "Education entry count changed: " + origEdu.size() + " -> " + tailEdu.size()
                            + ". Cannot add or remove education entries.",
                    HttpStatus.BAD_REQUEST);
        }

        List<String> errors = new ArrayList<>();
        for (int i = 0; i < origEdu.size(); i++) {
            JsonNode orig = origEdu.get(i);
            JsonNode tail = tailEdu.get(i);

            if (!nullSafeEquals(getText(orig, "institution"), getText(tail, "institution"))) {
                errors.add("entry[" + i + "].institution changed");
            }
            if (!nullSafeEquals(getText(orig, "degree"), getText(tail, "degree"))) {
                errors.add("entry[" + i + "].degree changed");
            }
            if (!nullSafeEquals(getText(orig, "field"), getText(tail, "field"))) {
                errors.add("entry[" + i + "].field changed");
            }
            if (!nullSafeNumberEquals(orig, tail, "startYear")) {
                errors.add("entry[" + i + "].startYear changed");
            }
            if (!nullSafeNumberEquals(orig, tail, "endYear")) {
                errors.add("entry[" + i + "].endYear changed");
            }
            if (!nullSafeEquals(getText(orig, "gpa"), getText(tail, "gpa"))) {
                errors.add("entry[" + i + "].gpa changed");
            }
        }

        if (!errors.isEmpty()) {
            log.warn("Education validation failed: {}", errors);
            throw new AppException(
                    "Education data integrity violation: " + String.join("; ", errors),
                    HttpStatus.BAD_REQUEST);
        }
    }

    private void validateCertifications(JsonNode original, JsonNode tailored) {
        List<String> origCerts = extractStringArray(original, "certifications");
        List<String> tailCerts = extractStringArray(tailored, "certifications");

        if (!new HashSet<>(origCerts).equals(new HashSet<>(tailCerts))) {
            throw new AppException(
                    "Certifications cannot be added or removed. Only existing certifications are allowed.",
                    HttpStatus.BAD_REQUEST);
        }
    }

    private void validateLanguages(JsonNode original, JsonNode tailored) {
        List<String> origLangs = extractStringArray(original, "languages");
        List<String> tailLangs = extractStringArray(tailored, "languages");

        if (!origLangs.equals(tailLangs)) {
            throw new AppException(
                    "Languages cannot be changed. Only existing languages are allowed.",
                    HttpStatus.BAD_REQUEST);
        }
    }

    private void validateSkills(JsonNode original, JsonNode tailored) {
        Set<String> origSkills = new HashSet<>(extractStringArray(original, "skills"));

        if (origSkills.isEmpty()) return;

        List<String> tailSkills = extractStringArray(tailored, "skills");

        for (String origSkill : origSkills) {
            if (!tailSkills.contains(origSkill)) {
                throw new AppException(
                        "Original skills cannot be removed: \"" + origSkill + "\"",
                        HttpStatus.BAD_REQUEST);
            }
        }
    }

    private String getText(JsonNode node, String field) {
        if (node == null || !node.has(field) || node.get(field).isNull()) return null;
        return node.get(field).asText();
    }

    private boolean nullSafeEquals(String a, String b) {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;
        return a.equals(b);
    }

    private boolean nullSafeNumberEquals(JsonNode a, JsonNode b, String field) {
        boolean aHas = a.has(field) && !a.get(field).isNull();
        boolean bHas = b.has(field) && !b.get(field).isNull();
        if (!aHas && !bHas) return true;
        if (aHas != bHas) return false;
        return a.get(field).asDouble() == b.get(field).asDouble();
    }

    private List<String> extractStringArray(JsonNode parent, String field) {
        if (parent == null || !parent.has(field)) return List.of();
        JsonNode node = parent.get(field);
        if (!node.isArray()) return List.of();
        List<String> result = new ArrayList<>();
        for (JsonNode element : node) {
            if (!element.isNull()) {
                result.add(element.asText());
            }
        }
        return result;
    }
}
