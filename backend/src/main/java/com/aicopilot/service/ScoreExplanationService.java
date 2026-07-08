package com.aicopilot.service;

import com.aicopilot.dto.AtsDtos.CategoryExplanation;
import com.aicopilot.dto.AtsDtos.ScoreContribution;
import com.aicopilot.dto.AtsDtos.ScoreExplanation;
import com.aicopilot.dto.MatchDtos.CategoryBreakdown;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class ScoreExplanationService {

    public ScoreExplanation buildScoreExplanation(int atsScore, Map<String, CategoryBreakdown> breakdown) {
        List<ScoreContribution> contributions = new ArrayList<>();
        for (var entry : breakdown.entrySet()) {
            CategoryBreakdown cb = entry.getValue();
            double weightedPoints = cb.getScore() * cb.getWeight();
            contributions.add(ScoreContribution.builder()
                    .category(entry.getKey())
                    .label(cb.getLabel())
                    .score(cb.getScore())
                    .weight(cb.getWeight())
                    .weightedPoints(Math.round(weightedPoints * 100.0) / 100.0)
                    .detail(cb.getDetail())
                    .build());
        }

        String summary = buildSummary(atsScore, contributions);

        return ScoreExplanation.builder()
                .overallScore(atsScore)
                .summary(summary)
                .contributions(contributions)
                .build();
    }

    public List<CategoryExplanation> buildCategoryExplanations(Map<String, CategoryBreakdown> breakdown,
                                                                List<String> strengths, List<String> weaknesses) {
        List<CategoryExplanation> explanations = new ArrayList<>();
        for (var entry : breakdown.entrySet()) {
            CategoryBreakdown cb = entry.getValue();
            List<String> catStrengths = filterByCategory(strengths, cb.getLabel());
            List<String> catWeaknesses = filterByCategory(weaknesses, cb.getLabel());
            String explanation = buildCategoryExplanationText(entry.getKey(), cb);
            explanations.add(CategoryExplanation.builder()
                    .category(entry.getKey())
                    .label(cb.getLabel())
                    .score(cb.getScore())
                    .weight(cb.getWeight())
                    .explanation(explanation)
                    .detail(cb.getDetail())
                    .strengths(catStrengths)
                    .weaknesses(catWeaknesses)
                    .build());
        }
        return explanations;
    }

    private String buildSummary(int atsScore, List<ScoreContribution> contributions) {
        StringBuilder sb = new StringBuilder();
        sb.append("Your overall ATS score is ").append(atsScore).append(" out of 100. ");
        if (atsScore >= 80) {
            sb.append("Your resume is well-aligned with this job description.");
        } else if (atsScore >= 60) {
            sb.append("Your resume is moderately aligned. Several improvements are recommended.");
        } else if (atsScore >= 40) {
            sb.append("Your resume has significant gaps that need attention.");
        } else {
            sb.append("Your resume does not currently align well with this role.");
        }
        sb.append(" The score is calculated from five weighted categories:");
        for (int i = 0; i < contributions.size(); i++) {
            ScoreContribution c = contributions.get(i);
            sb.append(" ").append(c.getLabel()).append(" (").append((int)(c.getWeight() * 100)).append("% weight)");
            if (i < contributions.size() - 1) sb.append(",");
            else sb.append(".");
        }
        return sb.toString();
    }

    private String buildCategoryExplanationText(String category, CategoryBreakdown cb) {
        return switch (category) {
            case "skillMatch" -> "Skill match compares your listed skills against the job's required, preferred, and nice-to-have skills. Required skills are weighted 3x, preferred 1x, and nice-to-have provides bonus. " + cb.getDetail() + ".";
            case "experienceMatch" -> "Experience match compares your total years of professional experience against the job's requirement. " + cb.getDetail() + ".";
            case "educationMatch" -> "Education match compares your highest education level against the job's education requirement. " + cb.getDetail() + ".";
            case "certificationMatch" -> "Certification match checks whether you hold the certifications requested by the job. " + cb.getDetail() + ".";
            case "titleMatch" -> "Title match evaluates whether your seniority level aligns with the role's expectations. " + cb.getDetail() + ".";
            default -> cb.getLabel() + ": " + cb.getDetail() + ".";
        };
    }

    private List<String> filterByCategory(List<String> items, String label) {
        if (items == null) return List.of();
        String prefix = switch (label) {
            case "Skill Match" -> "skill";
            case "Experience Match" -> "experience";
            case "Education Match" -> "education";
            case "Certification Match" -> "certification";
            case "Title Match" -> "seniority";
            default -> "";
        };
        return items.stream()
                .filter(i -> i.toLowerCase().contains(prefix))
                .toList();
    }
}
