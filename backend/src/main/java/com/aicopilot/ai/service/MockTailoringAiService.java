package com.aicopilot.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@ConditionalOnProperty(name = "ai.provider", havingValue = "mock", matchIfMissing = true)
public class MockTailoringAiService implements TailoringAiService {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public TailorResponse tailor(UUID resumeId, String resumeJson, String jdJson,
                                  int atsScore, String missingSkills, String recommendations) {
        log.info("Mock tailoring resume: {} (atsScore={})", resumeId, atsScore);

        try {
            JsonNode resume = MAPPER.readTree(resumeJson);
            JsonNode jd = MAPPER.readTree(jdJson);
            ObjectNode tailored = resume.deepCopy();

            StringBuilder changesJson = new StringBuilder();
            changesJson.append("[");

            boolean first = true;

            if (resume.has("summary") && resume.get("summary") != null && !resume.get("summary").isNull()) {
                String original = resume.get("summary").asText();
                String suggested = original;
                if (!original.endsWith(".")) {
                    suggested = original + " Dedicated to delivering high-quality results in fast-paced environments.";
                }
                tailored.put("summary", suggested);

                if (!first) changesJson.append(",");
                changesJson.append(String.format(
                        "{\"section\":\"summary\",\"changeType\":\"REPHRASE\",\"originalText\":\"%s\",\"suggestedText\":\"%s\",\"reason\":\"Enhanced summary to better align with job requirements\"}",
                        escapeJson(truncate(original, 100)),
                        escapeJson(truncate(suggested, 100))));
                first = false;
            }

            ArrayNode modifiedSkills = tailored.putArray("skills");
            if (resume.has("skills") && resume.get("skills").isArray()) {
                for (JsonNode skill : resume.get("skills")) {
                    modifiedSkills.add(skill.asText());
                }
            }

            JsonNode jdSkills = jd.get("skills");
            if (jdSkills != null) {
                java.util.Set<String> existingSkills = new java.util.HashSet<>();
                if (resume.has("skills") && resume.get("skills").isArray()) {
                    for (JsonNode s : resume.get("skills")) {
                        existingSkills.add(s.asText().toLowerCase().trim());
                    }
                }

                java.util.List<String> added = new java.util.ArrayList<>();
                for (String tier : new String[]{"required", "preferred"}) {
                    if (jdSkills.has(tier) && jdSkills.get(tier).isArray()) {
                        for (JsonNode skill : jdSkills.get(tier)) {
                            String name = skill.asText().trim();
                            if (!existingSkills.contains(name.toLowerCase())) {
                                added.add(name);
                                existingSkills.add(name.toLowerCase());
                            }
                        }
                    }
                }

                for (String skill : added) {
                    modifiedSkills.add(skill);
                }

                if (!added.isEmpty()) {
                    if (!first) changesJson.append(",");
                    changesJson.append(String.format(
                            "{\"section\":\"skills\",\"changeType\":\"ADD_KEYWORDS\",\"originalText\":\"%d skills\",\"suggestedText\":\"%d skills (added %d)\",\"reason\":\"Added missing required and preferred skills from job description\"}",
                            resume.get("skills").size(),
                            resume.get("skills").size() + added.size(),
                            added.size()));
                    first = false;
                }
            }

            if (resume.has("experience") && resume.get("experience").isArray()) {
                ArrayNode newExperiences = tailored.putArray("experience");
                int idx = 0;
                for (JsonNode exp : resume.get("experience")) {
                    ObjectNode expCopy = exp.deepCopy();
                    if (expCopy.has("highlights") && expCopy.get("highlights").isArray()
                            && expCopy.get("highlights").size() > 0) {
                        ArrayNode enhanced = expCopy.putArray("highlights");
                        for (JsonNode hl : exp.get("highlights")) {
                            String text = hl.asText();
                            if (!text.toLowerCase().contains("successfully")
                                    && !text.toLowerCase().contains("effectively")) {
                                text = "Successfully " + text.substring(0, 1).toLowerCase() + text.substring(1);
                            }
                            enhanced.add(text);
                        }

                        if (!first) changesJson.append(",");
                        changesJson.append(String.format(
                                "{\"section\":\"experience\",\"changeType\":\"ENHANCE\",\"originalText\":\"Enhanced bullet points for %s\",\"suggestedText\":\"Added impact-oriented language\",\"reason\":\"Improved bullet points for experience entry %d to use stronger action verbs\"}",
                                escapeJson(expCopy.has("title") ? expCopy.get("title").asText() : "position"),
                                idx));
                        first = false;
                    }
                    newExperiences.add(expCopy);
                    idx++;
                }
            }

            changesJson.append("]");

            String tailoredJson = MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(tailored);

            String resultJson = String.format(
                    "{\"tailoredResume\":%s,\"changes\":%s}",
                    tailoredJson, changesJson.toString());

            return TailorResponse.success(resultJson);
        } catch (Exception e) {
            log.error("Mock tailoring failed for resume {}", resumeId, e);
            return TailorResponse.failure("Mock tailoring failed: " + e.getMessage());
        }
    }

    @Override
    public boolean isAvailable() {
        return true;
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    private String truncate(String s, int max) {
        if (s == null) return "";
        return s.length() <= max ? s : s.substring(0, max) + "...";
    }
}
