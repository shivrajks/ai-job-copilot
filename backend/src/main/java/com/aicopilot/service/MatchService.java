package com.aicopilot.service;

import com.aicopilot.dto.MatchDtos.CategoryBreakdown;
import com.aicopilot.dto.MatchDtos.MatchResult;
import com.aicopilot.entity.JobDescription;
import com.aicopilot.entity.Resume;
import com.aicopilot.entity.User;
import com.aicopilot.exception.AppException;
import com.aicopilot.match.EducationLevel;
import com.aicopilot.match.SkillSynonymMap;
import com.aicopilot.repository.JobDescriptionRepository;
import com.aicopilot.repository.ResumeRepository;
import com.aicopilot.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MatchService {

    private static final double SKILL_WEIGHT = 0.45;
    private static final double EXPERIENCE_WEIGHT = 0.20;
    private static final double EDUCATION_WEIGHT = 0.15;
    private static final double CERTIFICATION_WEIGHT = 0.10;
    private static final double TITLE_WEIGHT = 0.10;

    private static final int REQUIRED_WEIGHT = 3;
    private static final int PREFERRED_WEIGHT = 1;
    private static final double NICE_TO_HAVE_BONUS = 0.5;

    private final ResumeRepository resumeRepository;
    private final JobDescriptionRepository jobDescriptionRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public MatchResult matchResumeToJob(UUID resumeId, UUID jdId, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new AppException("Resume not found", HttpStatus.NOT_FOUND));

        JobDescription jd = jobDescriptionRepository.findById(jdId)
                .orElseThrow(() -> new AppException("Job description not found", HttpStatus.NOT_FOUND));

        if (!resume.getUser().getId().equals(user.getId()) || !jd.getUser().getId().equals(user.getId())) {
            throw new AppException("Access denied", HttpStatus.FORBIDDEN);
        }

        if (resume.getParsingStatus() != Resume.ParsingStatus.PARSED) {
            throw new AppException("Resume must be parsed before matching", HttpStatus.BAD_REQUEST);
        }

        if (jd.getAnalysisStatus() != JobDescription.AnalysisStatus.ANALYZED) {
            throw new AppException("Job description must be analyzed before matching", HttpStatus.BAD_REQUEST);
        }

        JsonNode resumeData = parseJson(resume.getStructuredData());
        JsonNode jdData = parseJson(jd.getStructuredData());

        if (resumeData == null || jdData == null) {
            throw new AppException("Structured data is missing or unparseable", HttpStatus.BAD_REQUEST);
        }

        CategoryBreakdown skillBreakdown = calculateSkillScore(resumeData, jdData);
        CategoryBreakdown experienceBreakdown = calculateExperienceScore(resumeData, jdData);
        CategoryBreakdown educationBreakdown = calculateEducationScore(resumeData, jdData);
        CategoryBreakdown certificationBreakdown = calculateCertificationScore(resumeData, jdData);
        CategoryBreakdown titleBreakdown = calculateTitleScore(resumeData, jdData);

        Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();
        breakdown.put("skillMatch", skillBreakdown);
        breakdown.put("experienceMatch", experienceBreakdown);
        breakdown.put("educationMatch", educationBreakdown);
        breakdown.put("certificationMatch", certificationBreakdown);
        breakdown.put("titleMatch", titleBreakdown);

        int atsScore = (int) Math.round(
                skillBreakdown.getScore() * SKILL_WEIGHT +
                experienceBreakdown.getScore() * EXPERIENCE_WEIGHT +
                educationBreakdown.getScore() * EDUCATION_WEIGHT +
                certificationBreakdown.getScore() * CERTIFICATION_WEIGHT +
                titleBreakdown.getScore() * TITLE_WEIGHT
        );

        JsonNode jdSkills = jdData.get("skills");
        List<String> resumeSkills = extractStringArray(resumeData, "skills");
        List<String> jdRequired = extractStringArray(jdSkills, "required");
        List<String> jdPreferred = extractStringArray(jdSkills, "preferred");

        List<String> matchedSkills = findMatchedSkills(resumeSkills, jdRequired, jdPreferred);
        List<String> missingSkills = findMissingSkills(resumeSkills, jdRequired, jdPreferred);

        int matchPercentage = (int) Math.round(skillBreakdown.getScore());

        List<String> strengths = generateStrengths(skillBreakdown, experienceBreakdown,
                educationBreakdown, certificationBreakdown, titleBreakdown, matchedSkills);
        List<String> weaknesses = generateWeaknesses(skillBreakdown, experienceBreakdown,
                educationBreakdown, certificationBreakdown, missingSkills);

        jd.setMatchScore(atsScore);
        jobDescriptionRepository.save(jd);

        log.info("Match computed: resume={} job={} atsScore={} matchPct={}",
                resumeId, jdId, atsScore, matchPercentage);

        return MatchResult.builder()
                .resumeId(resumeId)
                .jobDescriptionId(jdId)
                .atsScore(atsScore)
                .matchPercentage(matchPercentage)
                .categoryBreakdown(breakdown)
                .matchedSkills(matchedSkills)
                .missingSkills(missingSkills)
                .strengths(strengths)
                .weaknesses(weaknesses)
                .analyzedAt(LocalDateTime.now())
                .build();
    }

    private CategoryBreakdown calculateSkillScore(JsonNode resumeData, JsonNode jdData) {
        List<String> resumeSkills = extractStringArray(resumeData, "skills");
        JsonNode jdSkills = jdData.get("skills");

        List<String> required = extractStringArray(jdSkills, "required");
        List<String> preferred = extractStringArray(jdSkills, "preferred");
        List<String> niceToHave = extractStringArray(jdSkills, "niceToHave");

        List<String> normalizedResume = resumeSkills.stream().map(SkillSynonymMap::normalize).toList();

        int matchedRequired = 0;
        for (String skill : required) {
            String normalized = SkillSynonymMap.normalize(skill);
            if (normalizedResume.contains(normalized)) matchedRequired++;
        }

        int matchedPreferred = 0;
        for (String skill : preferred) {
            String normalized = SkillSynonymMap.normalize(skill);
            if (normalizedResume.contains(normalized)) matchedPreferred++;
        }

        int matchedNiceToHave = 0;
        for (String skill : niceToHave) {
            String normalized = SkillSynonymMap.normalize(skill);
            if (normalizedResume.contains(normalized)) matchedNiceToHave++;
        }

        int totalWeighted = required.size() * REQUIRED_WEIGHT + preferred.size() * PREFERRED_WEIGHT;
        double earned = matchedRequired * REQUIRED_WEIGHT + matchedPreferred * PREFERRED_WEIGHT
                + matchedNiceToHave * NICE_TO_HAVE_BONUS;

        int score = totalWeighted > 0 ? (int) Math.round(Math.min(earned / totalWeighted * 100, 100)) : 0;

        String detail = String.format("%d/%d required, %d/%d preferred matched",
                matchedRequired, required.size(), matchedPreferred, preferred.size());

        return CategoryBreakdown.builder()
                .score(score)
                .weight(SKILL_WEIGHT)
                .label("Skill Match")
                .detail(detail)
                .build();
    }

    private CategoryBreakdown calculateExperienceScore(JsonNode resumeData, JsonNode jdData) {
        double resumeYears = calculateTotalExperienceYears(resumeData);
        JsonNode quals = jdData.get("qualifications");
        double requiredYears = quals != null && quals.has("experienceYears") && !quals.get("experienceYears").isNull()
                ? quals.get("experienceYears").asDouble()
                : 0;

        int score;
        String detail;

        if (requiredYears <= 0) {
            score = 100;
            detail = "No specific experience requirement";
        } else {
            double ratio = Math.min(resumeYears / requiredYears, 1.0);
            score = (int) Math.round(ratio * 100);
            detail = String.format("%.1f years vs %.0f years required", resumeYears, requiredYears);
        }

        return CategoryBreakdown.builder()
                .score(score)
                .weight(EXPERIENCE_WEIGHT)
                .label("Experience Match")
                .detail(detail)
                .build();
    }

    private CategoryBreakdown calculateEducationScore(JsonNode resumeData, JsonNode jdData) {
        JsonNode quals = jdData.get("qualifications");
        String jdEducationText = quals != null && quals.has("education") && !quals.get("education").isNull()
                ? quals.get("education").asText()
                : null;

        if (jdEducationText == null || jdEducationText.isBlank()) {
            return CategoryBreakdown.builder()
                    .score(100)
                    .weight(EDUCATION_WEIGHT)
                    .label("Education Match")
                    .detail("No specific education requirement")
                    .build();
        }

        EducationLevel jdLevel = EducationLevel.fromString(jdEducationText);
        EducationLevel resumeLevel = findHighestResumeEducation(resumeData);

        int score;
        String detail;

        if (resumeLevel.getLevel() >= jdLevel.getLevel()) {
            score = 100;
            detail = String.format("%s meets or exceeds %s requirement",
                    resumeLevel.name(), jdLevel.name());
        } else if (resumeLevel.getLevel() == jdLevel.getLevel() - 1) {
            score = 60;
            detail = String.format("%s is close to %s requirement",
                    resumeLevel.name(), jdLevel.name());
        } else {
            score = 30;
            detail = String.format("%s is below %s requirement",
                    resumeLevel.name(), jdLevel.name());
        }

        return CategoryBreakdown.builder()
                .score(score)
                .weight(EDUCATION_WEIGHT)
                .label("Education Match")
                .detail(detail)
                .build();
    }

    private CategoryBreakdown calculateCertificationScore(JsonNode resumeData, JsonNode jdData) {
        List<String> resumeCerts = extractStringArray(resumeData, "certifications");
        JsonNode quals = jdData.get("qualifications");
        List<String> jdCerts = quals != null ? extractStringArray(quals, "certifications") : List.of();

        if (jdCerts.isEmpty()) {
            return CategoryBreakdown.builder()
                    .score(100)
                    .weight(CERTIFICATION_WEIGHT)
                    .label("Certification Match")
                    .detail("No certifications required")
                    .build();
        }

        List<String> normalizedResume = resumeCerts.stream().map(String::toLowerCase).map(String::trim).toList();
        int matched = 0;

        for (String cert : jdCerts) {
            String normalized = cert.toLowerCase().trim();
            if (normalizedResume.contains(normalized)) matched++;
        }

        int score = (int) Math.round((double) matched / jdCerts.size() * 100);
        String detail = String.format("%d/%d certifications matched", matched, jdCerts.size());

        return CategoryBreakdown.builder()
                .score(score)
                .weight(CERTIFICATION_WEIGHT)
                .label("Certification Match")
                .detail(detail)
                .build();
    }

    private CategoryBreakdown calculateTitleScore(JsonNode resumeData, JsonNode jdData) {
        JsonNode basicInfo = jdData.get("basicInfo");
        String jdSeniority = basicInfo != null && basicInfo.has("seniority") && !basicInfo.get("seniority").isNull()
                ? basicInfo.get("seniority").asText()
                : null;

        JsonNode experience = resumeData.get("experience");
        if (experience == null || !experience.isArray() || experience.isEmpty()) {
            return CategoryBreakdown.builder()
                    .score(50)
                    .weight(TITLE_WEIGHT)
                    .label("Title Match")
                    .detail("No experience entries to analyze")
                    .build();
        }

        int resumeSeniorityLevel = 0;
        List<String> resumeTitles = new ArrayList<>();
        for (JsonNode exp : experience) {
            if (exp.has("title") && !exp.get("title").isNull()) {
                String title = exp.get("title").asText();
                resumeTitles.add(title);
                int level = detectSeniorityLevel(title);
                if (level > resumeSeniorityLevel) {
                    resumeSeniorityLevel = level;
                }
            }
        }

        if (jdSeniority == null || jdSeniority.isBlank()) {
            return CategoryBreakdown.builder()
                    .score(100)
                    .weight(TITLE_WEIGHT)
                    .label("Title Match")
                    .detail("No seniority requirement specified")
                    .build();
        }

        int jdSeniorityLevel = detectSeniorityLevel(jdSeniority);

        int score;
        String detail;

        if (resumeSeniorityLevel >= jdSeniorityLevel) {
            score = 100;
            detail = String.format("Seniority level matches or exceeds requirement");
        } else if (resumeSeniorityLevel >= jdSeniorityLevel - 1) {
            score = 60;
            detail = String.format("Seniority level is close to requirement");
        } else {
            score = 20;
            detail = String.format("Seniority level is below requirement");
        }

        return CategoryBreakdown.builder()
                .score(score)
                .weight(TITLE_WEIGHT)
                .label("Title Match")
                .detail(detail)
                .build();
    }

    private List<String> generateStrengths(CategoryBreakdown skill, CategoryBreakdown exp,
                                            CategoryBreakdown edu, CategoryBreakdown cert,
                                            CategoryBreakdown title, List<String> matchedSkills) {
        List<String> strengths = new ArrayList<>();

        if (skill.getScore() >= 80) {
            strengths.add("Strong skill alignment with job requirements");
        } else if (matchedSkills.size() >= 5) {
            strengths.add("Good coverage of required skills");
        }

        if (exp.getScore() >= 100) {
            strengths.add("Experience meets or exceeds requirements");
        }

        if (edu.getScore() >= 100) {
            strengths.add("Education qualifications are well-aligned");
        }

        if (cert.getScore() >= 100 && !cert.getDetail().contains("No certifications")) {
            strengths.add("All required certifications are covered");
        }

        if (title.getScore() >= 100) {
            strengths.add("Seniority level matches the role");
        }

        return strengths;
    }

    private List<String> generateWeaknesses(CategoryBreakdown skill, CategoryBreakdown exp,
                                             CategoryBreakdown edu, CategoryBreakdown cert,
                                             List<String> missingSkills) {
        List<String> weaknesses = new ArrayList<>();

        if (skill.getScore() < 50) {
            weaknesses.add("Significant skill gap: only " + skill.getScore() + "% of required skills matched");
        } else if (skill.getScore() < 70) {
            weaknesses.add("Moderate skill gap: " + (missingSkills.size()) + " required skills not found");
        }

        if (exp.getScore() < 50) {
            weaknesses.add("Experience level is significantly below requirements");
        } else if (exp.getScore() < 80) {
            weaknesses.add("Experience is below the required level");
        }

        if (edu.getScore() < 60) {
            weaknesses.add("Education requirements may not be fully satisfied");
        }

        if (cert.getScore() < 50) {
            weaknesses.add("Missing required certifications");
        }

        if (!missingSkills.isEmpty() && !weaknesses.stream().anyMatch(w -> w.contains("skill gap"))) {
            weaknesses.add("Missing skills: " + String.join(", ", missingSkills));
        }

        return weaknesses;
    }

    private List<String> findMatchedSkills(List<String> resumeSkills, List<String> required, List<String> preferred) {
        List<String> normalized = resumeSkills.stream().map(SkillSynonymMap::normalize).toList();
        List<String> matched = new ArrayList<>();

        for (String skill : required) {
            if (normalized.contains(SkillSynonymMap.normalize(skill))) {
                matched.add(skill);
            }
        }
        for (String skill : preferred) {
            String normalizedSkill = SkillSynonymMap.normalize(skill);
            if (normalized.contains(normalizedSkill) && !matched.contains(skill)) {
                matched.add(skill);
            }
        }

        return matched;
    }

    private List<String> findMissingSkills(List<String> resumeSkills, List<String> required, List<String> preferred) {
        List<String> normalized = resumeSkills.stream().map(SkillSynonymMap::normalize).toList();
        List<String> missing = new ArrayList<>();

        for (String skill : required) {
            if (!normalized.contains(SkillSynonymMap.normalize(skill))) {
                missing.add(skill);
            }
        }
        for (String skill : preferred) {
            String normalizedSkill = SkillSynonymMap.normalize(skill);
            if (!normalized.contains(normalizedSkill) && !missing.contains(skill)) {
                missing.add(skill);
            }
        }

        return missing;
    }

    private double calculateTotalExperienceYears(JsonNode resumeData) {
        JsonNode experience = resumeData.get("experience");
        if (experience == null || !experience.isArray()) return 0;

        double totalYears = 0;
        List<LocalDate[]> periods = new ArrayList<>();

        for (JsonNode exp : experience) {
            LocalDate start = parseDate(exp, "startDate");
            LocalDate end = parseDate(exp, "endDate");

            if (start == null) continue;
            if (end == null) end = LocalDate.now();

            periods.add(new LocalDate[]{start, end});
        }

        periods.sort((a, b) -> a[0].compareTo(b[0]));

        if (periods.isEmpty()) return 0;

        LocalDate mergedStart = periods.get(0)[0];
        LocalDate mergedEnd = periods.get(0)[1];

        for (int i = 1; i < periods.size(); i++) {
            LocalDate currStart = periods.get(i)[0];
            LocalDate currEnd = periods.get(i)[1];

            if (currStart.isBefore(mergedEnd) || currStart.isEqual(mergedEnd)) {
                if (currEnd.isAfter(mergedEnd)) {
                    mergedEnd = currEnd;
                }
            } else {
                totalYears += ChronoUnit.DAYS.between(mergedStart, mergedEnd) / 365.0;
                mergedStart = currStart;
                mergedEnd = currEnd;
            }
        }

        totalYears += ChronoUnit.DAYS.between(mergedStart, mergedEnd) / 365.0;

        return Math.round(totalYears * 10.0) / 10.0;
    }

    private LocalDate parseDate(JsonNode node, String field) {
        if (!node.has(field) || node.get(field).isNull()) return null;
        String text = node.get(field).asText().trim();
        if (text.isEmpty() || text.equalsIgnoreCase("present")) return null;

        try {
            return YearMonth.parse(text, DateTimeFormatter.ofPattern("yyyy-MM")).atDay(1);
        } catch (DateTimeParseException e) {
            try {
                return LocalDate.parse(text + "-01", DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            } catch (DateTimeParseException e2) {
                try {
                    return LocalDate.parse(text);
                } catch (DateTimeParseException e3) {
                    log.warn("Could not parse date: {}", text);
                    return null;
                }
            }
        }
    }

    private EducationLevel findHighestResumeEducation(JsonNode resumeData) {
        JsonNode education = resumeData.get("education");
        if (education == null || !education.isArray() || education.isEmpty()) {
            return EducationLevel.NONE;
        }

        EducationLevel highest = EducationLevel.NONE;
        for (JsonNode edu : education) {
            String degree = edu.has("degree") && !edu.get("degree").isNull()
                    ? edu.get("degree").asText() : "";
            String field = edu.has("field") && !edu.get("field").isNull()
                    ? edu.get("field").asText() : "";

            EducationLevel level = EducationLevel.fromString(degree + " " + field);
            if (level.getLevel() > highest.getLevel()) {
                highest = level;
            }
        }

        return highest;
    }

    private int detectSeniorityLevel(String title) {
        if (title == null) return 0;
        String lower = title.toLowerCase();

        if (containsAny(lower, "director", "head of", "vp ", "vice president", "chief", "cto", "cfo")) return 5;
        if (containsAny(lower, "principal", "staff", "architect")) return 4;
        if (containsAny(lower, "senior", "sr.", "lead", "manager")) return 3;
        if (containsAny(lower, "mid", "intermediate", "mid-level")) return 2;
        if (containsAny(lower, "junior", "jr.", "associate", "trainee", "intern", "entry")) return 1;

        return 2;
    }

    private boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword)) return true;
        }
        return false;
    }

    private JsonNode parseJson(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            return objectMapper.readTree(json);
        } catch (Exception e) {
            log.warn("Failed to parse structured data JSON", e);
            return null;
        }
    }

    private List<String> extractStringArray(JsonNode parent, String field) {
        if (parent == null || !parent.has(field)) return List.of();
        JsonNode node = parent.get(field);
        if (!node.isArray()) return List.of();

        List<String> result = new ArrayList<>();
        for (JsonNode element : node) {
            if (!element.isNull()) {
                result.add(element.asText().trim());
            }
        }
        return result;
    }

    public int computeScore(String resumeStructuredData, String jdStructuredData) {
        JsonNode resumeData = parseJson(resumeStructuredData);
        JsonNode jdData = parseJson(jdStructuredData);
        if (resumeData == null || jdData == null) return 0;

        int skillScore = calculateSkillScore(resumeData, jdData).getScore();
        int expScore = calculateExperienceScore(resumeData, jdData).getScore();
        int eduScore = calculateEducationScore(resumeData, jdData).getScore();
        int certScore = calculateCertificationScore(resumeData, jdData).getScore();
        int titleScore = calculateTitleScore(resumeData, jdData).getScore();

        return (int) Math.round(
                skillScore * SKILL_WEIGHT +
                expScore * EXPERIENCE_WEIGHT +
                eduScore * EDUCATION_WEIGHT +
                certScore * CERTIFICATION_WEIGHT +
                titleScore * TITLE_WEIGHT
        );
    }
}
