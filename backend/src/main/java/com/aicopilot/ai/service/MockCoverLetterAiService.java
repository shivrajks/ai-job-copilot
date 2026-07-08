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
public class MockCoverLetterAiService implements CoverLetterAiService {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public CoverLetterResponse generate(
            UUID resumeId, String resumeJson, String tailoredResumeJson,
            String jdJson, int atsScore, String matchedSkills, String missingSkills,
            String recommendations, String companyName, String hiringManager,
            String tone, String template) {
        log.info("Mock generating cover letter for resume: {} (atsScore={}, tone={}, template={})",
                resumeId, atsScore, tone, template);

        try {
            JsonNode resume = MAPPER.readTree(resumeJson);
            JsonNode jd = MAPPER.readTree(jdJson);

            String name = extractField(resume, "personalInfo", "fullName", "Candidate");
            String role = extractField(jd, "basicInfo", "title", "the role");
            String company = companyName != null ? companyName
                    : extractField(jd, "basicInfo", "company", "your company");
            String manager = hiringManager != null ? hiringManager : "Hiring Manager";
            String location = extractField(jd, "basicInfo", "location", "");
            String seniority = extractField(jd, "basicInfo", "seniority", "");

            String email = extractField(resume, "personalInfo", "email", "");
            String phone = extractField(resume, "personalInfo", "phone", "");
            String linkedin = extractField(resume, "personalInfo", "linkedin", "");
            String resumeSummary = resume.has("summary") && !resume.get("summary").isNull()
                    ? resume.get("summary").asText() : null;

            String skillsText = "";
            if (resume.has("skills") && resume.get("skills").isArray()) {
                ArrayNode skills = (ArrayNode) resume.get("skills");
                java.util.List<String> skillList = new java.util.ArrayList<>();
                for (JsonNode s : skills) skillList.add(s.asText());
                skillsText = String.join(", ", skillList);
            }

            String expText = "";
            if (resume.has("experience") && resume.get("experience").isArray()) {
                ArrayNode exp = (ArrayNode) resume.get("experience");
                java.util.List<String> roles = new java.util.ArrayList<>();
                for (JsonNode e : exp) {
                    String title = e.has("title") ? e.get("title").asText() : "";
                    String comp = e.has("company") ? e.get("company").asText() : "";
                    roles.add(title + " at " + comp);
                }
                expText = String.join(", ", roles);
            }

            String salutation = hiringManager != null
                    ? "Dear " + hiringManager + ","
                    : "Dear Hiring Manager,";

            String subject = "Application for " + role + " at " + company;
            String titleStr = role + " — " + company;

            String opening = "I am writing to express my strong interest in the "
                    + (seniority.isEmpty() ? "" : seniority + " ")
                    + role + " position at " + company + "."
                    + (location.isEmpty() ? "" : " Located in " + location + ", this role aligns perfectly with my professional experience and career goals.")
                    + " With a background in " + expText + ", I am confident in my ability to contribute effectively to your team.";

            String body1 = "Throughout my career, I have developed expertise in "
                    + skillsText + ". "
                    + (resumeSummary != null ? resumeSummary + " " : "")
                    + "My experience has equipped me with the skills necessary to excel in this role and drive meaningful results for " + company + ".";

            String body2 = "I am particularly drawn to this opportunity because it combines my technical expertise with the chance to work on impactful projects. "
                    + "I believe my background in " + expText + " "
                    + "would allow me to hit the ground running and make immediate contributions to your team.";

            String body3 = "";
            if (matchedSkills != null && !matchedSkills.isEmpty()) {
                body3 = "My resume aligns well with this position, with strong matches in areas including "
                        + matchedSkills + ". "
                        + "I am eager to bring this expertise to " + company + " and help drive your continued success.";
            }

            String closing = "Thank you for considering my application. I would welcome the opportunity to discuss how my experience and skills align with the needs of your team. "
                    + "I look forward to the possibility of contributing to " + company + "'s success.";

            String signature = "Sincerely,\n" + name;
            if (!email.isEmpty()) signature += "\n" + email;
            if (!phone.isEmpty()) signature += "\n" + phone;
            if (!linkedin.isEmpty()) signature += "\n" + linkedin;

            ArrayNode bodyArray = MAPPER.createArrayNode();
            bodyArray.add(body1);
            bodyArray.add(body2);
            if (!body3.isEmpty()) bodyArray.add(body3);

            StringBuilder fullText = new StringBuilder();
            fullText.append(subject).append("\n\n");
            fullText.append(salutation).append("\n\n");
            fullText.append(opening).append("\n\n");
            fullText.append(body1).append("\n\n");
            fullText.append(body2).append("\n\n");
            if (!body3.isEmpty()) fullText.append(body3).append("\n\n");
            fullText.append(closing).append("\n\n");
            fullText.append(signature);

            ObjectNode result = MAPPER.createObjectNode();
            result.put("subject", subject);
            result.put("salutation", salutation);
            result.set("body", bodyArray);
            result.put("closing", closing);
            result.put("signature", signature);
            result.put("fullText", fullText.toString());

            String json = MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(result);

            log.info("Mock cover letter generated for resume {}: subject='{}', length={} chars",
                    resumeId, subject, fullText.length());

            return CoverLetterResponse.success(json);
        } catch (Exception e) {
            log.error("Mock cover letter generation failed for resume {}", resumeId, e);
            return CoverLetterResponse.failure("Mock cover letter generation failed: " + e.getMessage());
        }
    }

    @Override
    public boolean isAvailable() {
        return true;
    }

    private String extractField(JsonNode root, String parent, String field, String fallback) {
        try {
            if (root.has(parent) && root.get(parent).has(field)
                    && !root.get(parent).get(field).isNull()) {
                return root.get(parent).get(field).asText();
            }
        } catch (Exception ignored) {}
        return fallback;
    }
}
