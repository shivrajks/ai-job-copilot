package com.aicopilot.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
@ConditionalOnProperty(name = "ai.provider", havingValue = "mock", matchIfMissing = true)
public class MockInterviewAiService implements InterviewAiService {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public InterviewResponse generate(
            UUID resumeId, String resumeJson, String tailoredResumeJson,
            String jdJson, int atsScore, String matchedSkills, String missingSkills,
            int count, String difficulty, String seniority, String role, String company,
            String categoryMix, String coverLetterJson) {
        log.info("Mock generating {} {} interview questions for resume {} (role={})",
                count, difficulty, resumeId, role);

        try {
            JsonNode resume = MAPPER.readTree(resumeJson != null ? resumeJson : "{}");
            JsonNode jd = MAPPER.readTree(jdJson != null ? jdJson : "{}");

            String name = extractField(resume, "personalInfo", "fullName", "the candidate");
            String roleTitle = role != null ? role : extractField(jd, "basicInfo", "title", "the role");
            String companyName = company != null ? company
                    : extractField(jd, "basicInfo", "company", "the company");

            List<String> resumeSkills = new ArrayList<>();
            if (resume.has("skills") && resume.get("skills").isArray()) {
                for (JsonNode s : resume.get("skills")) resumeSkills.add(s.asText());
            }

            List<String> resumeCompanies = new ArrayList<>();
            if (resume.has("experience") && resume.get("experience").isArray()) {
                for (JsonNode e : resume.get("experience")) {
                    if (e.has("company") && !e.get("company").isNull())
                        resumeCompanies.add(e.get("company").asText());
                }
            }

            String summary = resume.has("summary") && !resume.get("summary").isNull()
                    ? resume.get("summary").asText() : null;

            int hrCount = Math.max(1, (int) Math.ceil(count * 0.2));
            int behavioralCount = Math.max(1, (int) Math.ceil(count * 0.3));
            int technicalCount = count - hrCount - behavioralCount;

            ArrayNode questions = MAPPER.createArrayNode();

            for (int i = 0; i < hrCount; i++) {
                questions.add(buildHrQuestion(i + 1, name, roleTitle, companyName,
                        summary, resumeSkills, resumeCompanies, difficulty));
            }
            for (int i = 0; i < behavioralCount; i++) {
                questions.add(buildBehavioralQuestion(hrCount + i + 1, name, resumeCompanies,
                        resumeSkills, summary, difficulty));
            }
            for (int i = 0; i < technicalCount; i++) {
                questions.add(buildTechnicalQuestion(hrCount + behavioralCount + i + 1,
                        resumeSkills, roleTitle, difficulty, matchedSkills));
            }

            ObjectNode result = MAPPER.createObjectNode();
            result.set("questions", questions);

            String json = MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(result);

            log.info("Mock interview generated: {} questions for resume {}", count, resumeId);

            return InterviewResponse.success(json);
        } catch (Exception e) {
            log.error("Mock interview generation failed for resume {}", resumeId, e);
            return InterviewResponse.failure("Mock interview generation failed: " + e.getMessage());
        }
    }

    @Override
    public ScoreResponse score(String question, String suggestedAnswer,
                                String candidateAnswer, String keyPoints) {
        log.info("Mock scoring interview answer");

        try {
            int relevanceScore = 7;
            int clarityScore = 7;
            int completenessScore = 6;
            int overallScore = (relevanceScore + clarityScore + completenessScore) / 3;

            ObjectNode result = MAPPER.createObjectNode();
            result.put("overallScore", overallScore);
            result.put("relevanceScore", relevanceScore);
            result.put("clarityScore", clarityScore);
            result.put("completenessScore", completenessScore);

            ArrayNode strengths = MAPPER.createArrayNode();
            strengths.add("Addressed the question directly");
            strengths.add("Used relevant examples");
            result.set("strengths", strengths);

            ArrayNode improvements = MAPPER.createArrayNode();
            improvements.add("Consider structuring with STAR format");
            improvements.add("Provide more specific metrics if available");
            result.set("improvements", improvements);

            result.put("suggestedAnswer", suggestedAnswer != null ? suggestedAnswer : "");

            String json = MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(result);

            return ScoreResponse.success(json);
        } catch (Exception e) {
            log.error("Mock scoring failed", e);
            return ScoreResponse.failure("Mock scoring failed: " + e.getMessage());
        }
    }

    @Override
    public boolean isAvailable() {
        return true;
    }

    private ObjectNode buildHrQuestion(int num, String name, String role, String company,
                                        String summary, List<String> skills,
                                        List<String> companies, String difficulty) {
        ObjectNode q = MAPPER.createObjectNode();
        q.put("id", "q-" + num);
        q.put("category", "HR");
        q.put("difficulty", difficulty.equals("hard") ? "MEDIUM" : "EASY");

        String question;
        String answer;
        String time;
        List<String> keyPoints = new ArrayList<>();

        switch (num % 4) {
            case 0 -> {
                question = "Why are you interested in the " + role + " role at " + company + "?";
                answer = "Based on my background, I believe the " + role + " role at " + company
                        + " aligns well with my experience in "
                        + (skills.size() > 3 ? String.join(", ", skills.subList(0, Math.min(3, skills.size())))
                        : String.join(", ", skills))
                        + ". I am particularly drawn to the opportunity to apply my skills in a meaningful way.";
                keyPoints.add("Connection between resume skills and role requirements");
                keyPoints.add("Specific interest in the company");
                keyPoints.add("Enthusiasm for the role's responsibilities");
                time = "2-3 minutes";
            }
            case 1 -> {
                question = "Tell me about yourself and how your experience relates to this role.";
                answer = (summary != null ? summary : "I have a background in "
                        + String.join(", ", skills.subList(0, Math.min(3, skills.size())))
                        + ", with experience at " + (companies.isEmpty() ? "various organizations" : String.join(", ", companies))
                        + ". My career has been focused on delivering results and growing my expertise.")
                        + " I am excited about the opportunity to bring this experience to " + company + ".";
                keyPoints.add("Brief career overview");
                keyPoints.add("Relevant experience highlights");
                keyPoints.add("Alignment with the role");
                time = "2-3 minutes";
            }
            case 2 -> {
                question = "What are your greatest professional strengths?";
                String skillsList = skills.size() > 3 ? String.join(", ", skills.subList(0, 3)) : String.join(", ", skills);
                answer = "My key strengths include " + skillsList
                        + ". I have developed these through my experience at "
                        + (companies.isEmpty() ? "various organizations" : String.join(", ", companies))
                        + " and they align directly with the requirements of this role.";
                keyPoints.add("Specific skill examples");
                keyPoints.add("How strengths apply to the role");
                time = "2 minutes";
            }
            default -> {
                question = "Where do you see yourself professionally in the next few years?";
                answer = "I am looking to grow my expertise in "
                        + (skills.isEmpty() ? "my field" : String.join(", ", skills.subList(0, Math.min(2, skills.size()))))
                        + " and take on increasing responsibility. This role at " + company
                        + " represents an ideal next step in my career journey.";
                keyPoints.add("Career growth trajectory");
                keyPoints.add("Alignment with role progression");
                keyPoints.add("Long-term commitment to the field");
                time = "1-2 minutes";
            }
        }

        q.put("question", question);
        q.put("suggestedAnswer", answer);
        q.put("estimatedTime", time);

        ArrayNode kp = MAPPER.createArrayNode();
        for (String p : keyPoints) kp.add(p);
        q.set("keyPoints", kp);

        ArrayNode followUps = MAPPER.createArrayNode();
        followUps.add("Can you elaborate on that with a specific example?");
        followUps.add("How does this relate to the challenges our team is facing?");
        q.set("followUpQuestions", followUps);

        return q;
    }

    private ObjectNode buildBehavioralQuestion(int num, String name, List<String> companies,
                                                List<String> skills, String summary, String difficulty) {
        ObjectNode q = MAPPER.createObjectNode();
        q.put("id", "q-" + num);
        q.put("category", "BEHAVIORAL");
        q.put("difficulty", difficulty.equals("easy") ? "EASY" : difficulty.equals("hard") ? "HARD" : "MEDIUM");

        String question;
        String answer;
        String time;
        List<String> keyPoints = new ArrayList<>();

        switch (num % 3) {
            case 0 -> {
                question = "Tell me about a time you faced a challenging problem at work. How did you approach it?";
                answer = "In my role at "
                        + (companies.isEmpty() ? "a previous company" : companies.get(0))
                        + ", I encountered a situation where "
                        + (summary != null ? "I needed to address a complex challenge. " : "a project required careful problem-solving. ")
                        + "I approached it systematically by analyzing the root cause, developing potential solutions, "
                        + "collaborating with stakeholders, and implementing the most effective approach. "
                        + "The outcome was positive and taught me valuable lessons in problem-solving.";
                keyPoints.add("Situation context");
                keyPoints.add("Systematic approach");
                keyPoints.add("Collaboration with team");
                keyPoints.add("Positive outcome");
                time = "3-4 minutes";
            }
            case 1 -> {
                question = "Describe a situation where you had to work collaboratively on a team project.";
                answer = "At " + (companies.isEmpty() ? "a previous organization" : companies.get(0))
                        + ", I worked on a cross-functional team project where I contributed my expertise in "
                        + (skills.isEmpty() ? "my area" : String.join(", ", skills.subList(0, Math.min(2, skills.size()))))
                        + ". I collaborated closely with team members, communicated effectively, "
                        + "and ensured we met our deadlines. The experience reinforced the importance of teamwork.";
                keyPoints.add("Team collaboration example");
                keyPoints.add("Communication skills");
                keyPoints.add("Project outcome");
                time = "3 minutes";
            }
            default -> {
                question = "Tell me about a time you made a mistake at work. How did you handle it?";
                answer = "Early in my career at "
                        + (companies.isEmpty() ? "a previous company" : companies.get(0))
                        + ", I made an error in judgment on a task. I immediately took ownership, "
                        + "informed my supervisor, and worked to rectify the situation. "
                        + "I learned the importance of double-checking my work and communicating proactively. "
                        + "This experience made me a more thorough professional.";
                keyPoints.add("Ownership and accountability");
                keyPoints.add("Learning from mistakes");
                keyPoints.add("Proactive communication");
                time = "2-3 minutes";
            }
        }

        q.put("question", question);
        q.put("suggestedAnswer", answer);
        q.put("estimatedTime", time);

        ArrayNode kp = MAPPER.createArrayNode();
        for (String p : keyPoints) kp.add(p);
        q.set("keyPoints", kp);

        ArrayNode followUps = MAPPER.createArrayNode();
        followUps.add("What was the most important lesson you took away?");
        followUps.add("How would you handle a similar situation differently now?");
        q.set("followUpQuestions", followUps);

        return q;
    }

    private ObjectNode buildTechnicalQuestion(int num, List<String> skills, String role,
                                               String difficulty, String matchedSkills) {
        ObjectNode q = MAPPER.createObjectNode();
        q.put("id", "q-" + num);
        q.put("category", "TECHNICAL");
        q.put("difficulty", difficulty.equals("easy") ? "EASY" : difficulty.equals("hard") ? "HARD" : "MEDIUM");

        String question;
        String answer;
        String time;
        List<String> keyPoints = new ArrayList<>();

        String primarySkill = skills.isEmpty() ? "your area of expertise"
                : skills.get(num % skills.size());

        switch (difficulty) {
            case "easy" -> {
                question = "Can you describe your experience with " + primarySkill + "?";
                answer = "I have worked extensively with " + primarySkill
                        + " throughout my career. I have applied it in various projects, "
                        + "developing a strong understanding of its core concepts and best practices. "
                        + "I continue to stay updated with the latest developments.";
                keyPoints.add("Hands-on experience with " + primarySkill);
                keyPoints.add("Project examples");
                keyPoints.add("Continuous learning");
                time = "2-3 minutes";
            }
            case "hard" -> {
                question = "Can you walk me through how you would design a scalable solution using "
                        + primarySkill + " and related technologies?";
                answer = "When designing a scalable solution with " + primarySkill
                        + ", I would start by understanding the requirements and constraints. "
                        + "I would then architect the system considering factors like performance, reliability, "
                        + "and maintainability. Key decisions would include technology choices, data flow, "
                        + "and communication patterns between components.";
                keyPoints.add("System design approach");
                keyPoints.add("Scalability considerations");
                keyPoints.add("Technology decisions");
                keyPoints.add("Trade-off analysis");
                time = "4-5 minutes";
            }
            default -> {
                question = "How would you approach troubleshooting a production issue involving "
                        + primarySkill + "?";
                answer = "I would follow a systematic debugging approach: first, identify the symptoms "
                        + "and gather relevant logs and metrics. Then, isolate the root cause by "
                        + "checking recent changes, dependencies, and configuration. "
                        + "Once identified, I would implement a fix, test it thoroughly, "
                        + "and monitor to ensure the issue is resolved.";
                keyPoints.add("Systematic troubleshooting");
                keyPoints.add("Log and metric analysis");
                keyPoints.add("Root cause identification");
                keyPoints.add("Fix and verification");
                time = "3-4 minutes";
            }
        }

        q.put("question", question);
        q.put("suggestedAnswer", answer);
        q.put("estimatedTime", time);

        ArrayNode kp = MAPPER.createArrayNode();
        for (String p : keyPoints) kp.add(p);
        q.set("keyPoints", kp);

        ArrayNode followUps = MAPPER.createArrayNode();
        followUps.add("What alternatives did you consider?");
        followUps.add("How would you handle edge cases?");
        q.set("followUpQuestions", followUps);

        return q;
    }

    private String extractField(JsonNode root, String parent, String field, String fallback) {
        try {
            if (root.has(parent) && root.get(parent).has(field)
                    && !root.get(parent).get(field).isNull()) {
                return root.get(parent).get(field).asText();
            }
        } catch (Exception e) {
            return fallback;
        }
        return fallback;
    }
}
