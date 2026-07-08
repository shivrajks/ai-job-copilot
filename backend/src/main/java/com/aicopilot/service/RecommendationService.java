package com.aicopilot.service;

import com.aicopilot.dto.AtsDtos.AtsReport;
import com.aicopilot.dto.AtsDtos.CategoryExplanation;
import com.aicopilot.dto.AtsDtos.Recommendation;
import com.aicopilot.dto.AtsDtos.ScoreExplanation;
import com.aicopilot.dto.MatchDtos.CategoryBreakdown;
import com.aicopilot.dto.MatchDtos.MatchResult;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationService {

    private static final double SKILL_WEIGHT = 0.45;
    private static final double EXPERIENCE_WEIGHT = 0.20;
    private static final double EDUCATION_WEIGHT = 0.15;
    private static final double CERTIFICATION_WEIGHT = 0.10;

    private static final double HIGH_PRIORITY_THRESHOLD = 3.0;
    private static final double MEDIUM_PRIORITY_THRESHOLD = 1.0;

    private final MatchService matchService;
    private final ScoreExplanationService scoreExplanationService;

    public AtsReport generateReport(UUID resumeId, UUID jdId, UUID userId) {
        MatchResult matchResult = matchService.matchResumeToJob(resumeId, jdId, userId);

        ScoreExplanation scoreExplanation = scoreExplanationService.buildScoreExplanation(
                matchResult.getAtsScore(), matchResult.getCategoryBreakdown());

        List<CategoryExplanation> categoryExplanations = scoreExplanationService.buildCategoryExplanations(
                matchResult.getCategoryBreakdown(), matchResult.getStrengths(), matchResult.getWeaknesses());

        List<Recommendation> recommendations = buildAllRecommendations(matchResult);

        recommendations.sort(Comparator.<Recommendation, Integer>comparing(r -> switch (r.getPriority()) {
            case "HIGH" -> 0;
            case "MEDIUM" -> 1;
            case "LOW" -> 2;
            default -> 3;
        }).thenComparingDouble(Recommendation::getEstimatedImpact).reversed());

        return AtsReport.builder()
                .resumeId(matchResult.getResumeId())
                .jobDescriptionId(matchResult.getJobDescriptionId())
                .atsScore(matchResult.getAtsScore())
                .matchPercentage(matchResult.getMatchPercentage())
                .scoreExplanation(scoreExplanation)
                .categoryExplanations(categoryExplanations)
                .recommendations(recommendations)
                .missingSkills(matchResult.getMissingSkills())
                .analyzedAt(matchResult.getAnalyzedAt())
                .build();
    }

    private List<Recommendation> buildAllRecommendations(MatchResult matchResult) {
        List<Recommendation> all = new ArrayList<>();
        all.addAll(buildSkillRecommendations(matchResult.getCategoryBreakdown(), matchResult.getMissingSkills()));
        all.addAll(buildExperienceRecommendations(matchResult.getCategoryBreakdown()));
        all.addAll(buildEducationRecommendations(matchResult.getCategoryBreakdown()));
        all.addAll(buildCertificationRecommendations(matchResult.getCategoryBreakdown()));
        all.addAll(buildTitleRecommendations(matchResult.getCategoryBreakdown()));
        return all;
    }

    private List<Recommendation> buildSkillRecommendations(Map<String, CategoryBreakdown> breakdown,
                                                           List<String> missingSkills) {
        List<Recommendation> recs = new ArrayList<>();
        CategoryBreakdown skill = breakdown.get("skillMatch");
        if (skill == null) return recs;

        String detail = skill.getDetail();
        int requiredSize = 0;
        int preferredSize = 0;
        int matchedRequired = 0;
        int matchedPreferred = 0;

        try {
            String[] parts = detail.split(",");
            if (parts.length >= 1) {
                String requiredPart = parts[0].trim();
                String[] requiredParts = requiredPart.split("/");
                if (requiredParts.length >= 2) {
                    matchedRequired = Integer.parseInt(requiredParts[0].trim());
                    String[] requiredTotalParts = requiredParts[1].split(" ");
                    requiredSize = Integer.parseInt(requiredTotalParts[0].trim());
                }
            }
            if (parts.length >= 2) {
                String preferredPart = parts[1].trim();
                String[] preferredParts = preferredPart.split("/");
                if (preferredParts.length >= 2) {
                    matchedPreferred = Integer.parseInt(preferredParts[0].trim());
                    String[] preferredTotalParts = preferredParts[1].split(" ");
                    preferredSize = Integer.parseInt(preferredTotalParts[0].trim());
                }
            }
        } catch (NumberFormatException e) {
            log.warn("Could not parse skill detail: {}", detail);
            return recs;
        }

        int totalWeighted = requiredSize * 3 + preferredSize * 1;
        if (totalWeighted <= 0) return recs;

        if (!missingSkills.isEmpty() && requiredSize > 0) {
            int missingRequired = requiredSize - matchedRequired;
            if (missingRequired > 0) {
                double impactPerSkill = (3.0 / totalWeighted) * 100 * SKILL_WEIGHT;
                for (String skillName : missingSkills) {
                    double impact = Math.round(impactPerSkill * 100.0) / 100.0;
                    String priority = calculatePriority(impact);
                    recs.add(Recommendation.builder()
                            .category("skillMatch")
                            .label("Skill Match")
                            .description("Add \"" + skillName + "\" to your resume. This is a required skill for this position.")
                            .priority(priority)
                            .estimatedImpact(impact)
                            .type("SKILL")
                            .build());
                }
            }
        }

        if (preferredSize > 0 && matchedPreferred < preferredSize) {
            int missingPreferred = preferredSize - matchedPreferred;
            double impactPerSkill = (1.0 / totalWeighted) * 100 * SKILL_WEIGHT;
            for (int i = matchedPreferred; i < preferredSize; i++) {
                double impact = Math.round(impactPerSkill * 100.0) / 100.0;
                String priority = calculatePriority(impact);
                recs.add(Recommendation.builder()
                        .category("skillMatch")
                        .label("Skill Match")
                        .description("Adding preferred skills will improve your alignment with this role.")
                        .priority(priority)
                        .estimatedImpact(impact)
                        .type("SKILL")
                        .build());
            }
        }

        return recs;
    }

    private List<Recommendation> buildExperienceRecommendations(Map<String, CategoryBreakdown> breakdown) {
        List<Recommendation> recs = new ArrayList<>();
        CategoryBreakdown exp = breakdown.get("experienceMatch");
        if (exp == null || exp.getScore() >= 100) return recs;

        String detail = exp.getDetail();
        double resumeYears = 0;
        double requiredYears = 0;
        try {
            if (detail.contains("vs")) {
                String[] parts = detail.split("vs");
                if (parts.length >= 2) {
                    resumeYears = Double.parseDouble(parts[0].trim().split(" ")[0]);
                    String requiredPart = parts[1].trim();
                    requiredYears = Double.parseDouble(requiredPart.split(" ")[0]);
                }
            }
        } catch (NumberFormatException e) {
            log.warn("Could not parse experience detail: {}", detail);
        }

        String description;
        double impact;
        String priority;

        if (requiredYears > 0 && resumeYears < requiredYears) {
            double gap = requiredYears - resumeYears;
            double currentPoints = exp.getScore() * EXPERIENCE_WEIGHT;
            double potentialPoints = 100 * EXPERIENCE_WEIGHT;
            impact = Math.round((potentialPoints - currentPoints) * 100.0) / 100.0;
            priority = calculatePriority(impact);

            if (gap >= 2) {
                description = String.format("Your experience (%.1f years) is significantly below the %.0f years required. Consider highlighting projects, internships, and freelance work to close this gap.", resumeYears, requiredYears);
            } else {
                description = String.format("Your experience (%.1f years) is close to the %.0f years required. Adding relevant project experience could help.", resumeYears, requiredYears);
            }
        } else {
            double currentPoints = exp.getScore() * EXPERIENCE_WEIGHT;
            double potentialPoints = 100 * EXPERIENCE_WEIGHT;
            impact = Math.round((potentialPoints - currentPoints) * 100.0) / 100.0;
            priority = calculatePriority(impact);
            description = "Consider adding more detail to your experience section, including quantifiable achievements and relevant technologies used.";
        }

        recs.add(Recommendation.builder()
                .category("experienceMatch")
                .label("Experience Match")
                .description(description)
                .priority(priority)
                .estimatedImpact(impact)
                .type("EXPERIENCE")
                .build());

        return recs;
    }

    private List<Recommendation> buildEducationRecommendations(Map<String, CategoryBreakdown> breakdown) {
        List<Recommendation> recs = new ArrayList<>();
        CategoryBreakdown edu = breakdown.get("educationMatch");
        if (edu == null || edu.getScore() >= 100) return recs;

        double currentPoints = edu.getScore() * EDUCATION_WEIGHT;
        double potentialPoints = 100 * EDUCATION_WEIGHT;
        double impact = Math.round((potentialPoints - currentPoints) * 100.0) / 100.0;
        String priority = calculatePriority(impact);

        String description;
        String detail = edu.getDetail();
        if (detail.contains("below")) {
            description = "Your education level is below what this role requires. Consider highlighting relevant coursework or certifications that demonstrate equivalent knowledge.";
        } else if (detail.contains("close")) {
            description = "Your education level is close to the requirement. Emphasizing your field of study or relevant projects can strengthen this area.";
        } else {
            description = "Your education section could be improved by adding more detail about your degree, institution, and relevant coursework.";
        }

        recs.add(Recommendation.builder()
                .category("educationMatch")
                .label("Education Match")
                .description(description)
                .priority(priority)
                .estimatedImpact(impact)
                .type("EDUCATION")
                .build());

        return recs;
    }

    private List<Recommendation> buildCertificationRecommendations(Map<String, CategoryBreakdown> breakdown) {
        List<Recommendation> recs = new ArrayList<>();
        CategoryBreakdown cert = breakdown.get("certificationMatch");
        if (cert == null || cert.getScore() >= 100) return recs;
        if (cert.getDetail().contains("No certifications")) return recs;

        int matched = 0;
        int total = 0;
        try {
            String detail = cert.getDetail();
            if (detail.contains("/")) {
                String[] parts = detail.split("/");
                matched = Integer.parseInt(parts[0].trim());
                String[] totalParts = parts[1].split(" ");
                total = Integer.parseInt(totalParts[0].trim());
            }
        } catch (NumberFormatException e) {
            log.warn("Could not parse certification detail: {}", cert.getDetail());
        }

        if (total <= 0) return recs;

        double impactPerCert = total > 0 ? Math.round(((100.0 / total) * CERTIFICATION_WEIGHT) * 100.0) / 100.0 : 0;
        String priority = calculatePriority(impactPerCert);

        for (int i = matched; i < total; i++) {
            recs.add(Recommendation.builder()
                    .category("certificationMatch")
                    .label("Certification Match")
                    .description("Add the required certifications to meet the job requirements and improve your match score.")
                    .priority(priority)
                    .estimatedImpact(impactPerCert)
                    .type("CERTIFICATION")
                    .build());
        }

        return recs;
    }

    private List<Recommendation> buildTitleRecommendations(Map<String, CategoryBreakdown> breakdown) {
        List<Recommendation> recs = new ArrayList<>();
        CategoryBreakdown title = breakdown.get("titleMatch");
        if (title == null || title.getScore() >= 100) return recs;

        double currentPoints = title.getScore() * 0.10;
        double potentialPoints = 100 * 0.10;
        double impact = Math.round((potentialPoints - currentPoints) * 100.0) / 100.0;
        String priority = calculatePriority(impact);

        String description;
        if (title.getScore() < 50) {
            description = "Your current title or seniority level does not align with this role. Consider highlighting leadership or advanced responsibilities in your experience descriptions.";
        } else {
            description = "Your seniority level is partially aligned. Strengthen your title descriptions by emphasizing relevant leadership or technical ownership.";
        }

        recs.add(Recommendation.builder()
                .category("titleMatch")
                .label("Title Match")
                .description(description)
                .priority(priority)
                .estimatedImpact(impact)
                .type("TITLE")
                .build());

        return recs;
    }

    private String calculatePriority(double impact) {
        if (impact >= HIGH_PRIORITY_THRESHOLD) return "HIGH";
        if (impact >= MEDIUM_PRIORITY_THRESHOLD) return "MEDIUM";
        return "LOW";
    }
}
