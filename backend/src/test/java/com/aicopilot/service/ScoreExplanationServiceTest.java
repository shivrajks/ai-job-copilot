package com.aicopilot.service;

import com.aicopilot.dto.AtsDtos.CategoryExplanation;
import com.aicopilot.dto.AtsDtos.ScoreContribution;
import com.aicopilot.dto.AtsDtos.ScoreExplanation;
import com.aicopilot.dto.MatchDtos.CategoryBreakdown;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class ScoreExplanationServiceTest {

    private final ScoreExplanationService service = new ScoreExplanationService();

    private CategoryBreakdown cb(int score, double weight, String label, String detail) {
        return CategoryBreakdown.builder()
                .score(score)
                .weight(weight)
                .label(label)
                .detail(detail)
                .build();
    }

    @Nested
    @DisplayName("buildScoreExplanation")
    class BuildScoreExplanation {

        @Test
        @DisplayName("Should build score explanation with all contributions")
        void shouldBuildFullScoreExplanation() {
            Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();
            breakdown.put("skillMatch", cb(80, 0.45, "Skill Match", "3/4 Required, 2/3 Preferred"));
            breakdown.put("experienceMatch", cb(70, 0.20, "Experience Match", "3.5 years vs 5 years"));
            breakdown.put("educationMatch", cb(100, 0.15, "Education Match", "degree matches"));
            breakdown.put("certificationMatch", cb(50, 0.10, "Certification Match", "1/3"));
            breakdown.put("titleMatch", cb(90, 0.10, "Title Match", "seniority aligned"));

            ScoreExplanation result = service.buildScoreExplanation(78, breakdown);

            assertThat(result.getOverallScore()).isEqualTo(78);
            assertThat(result.getSummary()).contains("78 out of 100")
                    .contains("Skill Match (45% weight)")
                    .contains("Experience Match (20% weight)")
                    .contains("Education Match (15% weight)")
                    .contains("Certification Match (10% weight)")
                    .contains("Title Match (10% weight)");

            assertThat(result.getContributions()).hasSize(5);

            ScoreContribution skill = result.getContributions().get(0);
            assertThat(skill.getCategory()).isEqualTo("skillMatch");
            assertThat(skill.getScore()).isEqualTo(80);
            assertThat(skill.getWeight()).isEqualTo(0.45);
            assertThat(skill.getWeightedPoints()).isEqualTo(36.0);
        }

        @Test
        @DisplayName("Should generate high-score summary for score >= 80")
        void summaryForHighScore() {
            Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();
            breakdown.put("skillMatch", cb(100, 1.0, "Skill Match", "perfect"));

            ScoreExplanation result = service.buildScoreExplanation(85, breakdown);

            assertThat(result.getSummary()).contains("well-aligned");
        }

        @Test
        @DisplayName("Should generate moderate summary for score >= 60 and < 80")
        void summaryForModerateScore() {
            Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();
            breakdown.put("skillMatch", cb(70, 1.0, "Skill Match", "good"));

            ScoreExplanation result = service.buildScoreExplanation(70, breakdown);

            assertThat(result.getSummary()).contains("moderately aligned");
        }

        @Test
        @DisplayName("Should generate low summary for score >= 40 and < 60")
        void summaryForLowScore() {
            Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();
            breakdown.put("skillMatch", cb(50, 1.0, "Skill Match", "average"));

            ScoreExplanation result = service.buildScoreExplanation(50, breakdown);

            assertThat(result.getSummary()).contains("significant gaps");
        }

        @Test
        @DisplayName("Should generate poor summary for score < 40")
        void summaryForPoorScore() {
            Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();
            breakdown.put("skillMatch", cb(20, 1.0, "Skill Match", "poor"));

            ScoreExplanation result = service.buildScoreExplanation(25, breakdown);

            assertThat(result.getSummary()).contains("does not currently align");
        }

        @Test
        @DisplayName("Should compute weightedPoints correctly with rounding")
        void weightedPointsRounding() {
            Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();
            breakdown.put("skillMatch", cb(67, 0.45, "Skill Match", "detail"));

            ScoreExplanation result = service.buildScoreExplanation(67, breakdown);

            assertThat(result.getContributions().get(0).getWeightedPoints()).isEqualTo(30.15);
        }
    }

    @Nested
    @DisplayName("buildCategoryExplanations")
    class BuildCategoryExplanations {

        @Test
        @DisplayName("Should build explanations for all categories with strengths and weaknesses")
        void shouldBuildAllCategoryExplanations() {
            Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();
            breakdown.put("skillMatch", cb(80, 0.45, "Skill Match", "3/4 Required"));
            breakdown.put("experienceMatch", cb(60, 0.20, "Experience Match", "3 vs 5"));
            breakdown.put("educationMatch", cb(100, 0.15, "Education Match", "matches"));
            breakdown.put("certificationMatch", cb(0, 0.10, "Certification Match", "none"));
            breakdown.put("titleMatch", cb(70, 0.10, "Title Match", "aligned"));

            List<String> strengths = List.of("skill Java expertise", "experience 3 years");
            List<String> weaknesses = List.of("certification missing certs", "education gap");

            List<CategoryExplanation> explanations = service.buildCategoryExplanations(breakdown, strengths, weaknesses);

            assertThat(explanations).hasSize(5);

            CategoryExplanation skillExp = explanations.get(0);
            assertThat(skillExp.getCategory()).isEqualTo("skillMatch");
            assertThat(skillExp.getLabel()).isEqualTo("Skill Match");
            assertThat(skillExp.getScore()).isEqualTo(80);
            assertThat(skillExp.getWeight()).isEqualTo(0.45);
            assertThat(skillExp.getExplanation()).contains("Skill match", "Required", "preferred");
            assertThat(skillExp.getDetail()).isEqualTo("3/4 Required");
            assertThat(skillExp.getStrengths()).containsExactly("skill Java expertise");
            assertThat(skillExp.getWeaknesses()).isEmpty();
        }

        @Test
        @DisplayName("Should filter strengths and weaknesses by category label")
        void shouldFilterStrengthsAndWeaknesses() {
            Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();
            breakdown.put("skillMatch", cb(80, 0.45, "Skill Match", "detail"));

            List<String> strengths = List.of("skill Java", "experience strong", "education good");
            List<String> weaknesses = List.of("experience gap", "certification missing");

            List<CategoryExplanation> explanations = service.buildCategoryExplanations(breakdown, strengths, weaknesses);

            assertThat(explanations.get(0).getStrengths()).containsExactly("skill Java");
            assertThat(explanations.get(0).getWeaknesses()).isEmpty();
        }

        @Test
        @DisplayName("Should handle null strengths and weaknesses")
        void shouldHandleNullStrengths() {
            Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();
            breakdown.put("skillMatch", cb(80, 0.45, "Skill Match", "detail"));

            List<CategoryExplanation> explanations = service.buildCategoryExplanations(breakdown, null, null);

            assertThat(explanations.get(0).getStrengths()).isEmpty();
            assertThat(explanations.get(0).getWeaknesses()).isEmpty();
        }

        @Test
        @DisplayName("Should generate correct explanation text per category type")
        void shouldGenerateCategorySpecificText() {
            Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();
            breakdown.put("skillMatch", cb(80, 0.45, "Skill Match", "matched 3/4"));
            breakdown.put("experienceMatch", cb(60, 0.20, "Experience Match", "3 years vs 5"));
            breakdown.put("educationMatch", cb(100, 0.15, "Education Match", "degree matches"));
            breakdown.put("certificationMatch", cb(0, 0.10, "Certification Match", "none listed"));
            breakdown.put("titleMatch", cb(70, 0.10, "Title Match", "aligned"));

            List<CategoryExplanation> explanations = service.buildCategoryExplanations(breakdown, List.of(), List.of());

            assertThat(explanations.get(0).getExplanation()).contains("Skill match");
            assertThat(explanations.get(1).getExplanation()).contains("Experience match");
            assertThat(explanations.get(2).getExplanation()).contains("Education match");
            assertThat(explanations.get(3).getExplanation()).contains("Certification match");
            assertThat(explanations.get(4).getExplanation()).contains("Title match");
        }

        @Test
        @DisplayName("Should handle unknown category with generic text")
        void shouldHandleUnknownCategory() {
            Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();
            breakdown.put("unknownCategory", cb(50, 0.50, "Custom Label", "some detail"));

            List<CategoryExplanation> explanations = service.buildCategoryExplanations(breakdown, List.of(), List.of());

            assertThat(explanations).hasSize(1);
            assertThat(explanations.get(0).getExplanation()).contains("Custom Label").contains("some detail");
        }

        @Test
        @DisplayName("Should filter weaknesses by category label prefix")
        void shouldFilterWeaknessesByPrefix() {
            Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();
            breakdown.put("skillMatch", cb(50, 0.45, "Skill Match", "detail"));
            breakdown.put("experienceMatch", cb(50, 0.20, "Experience Match", "detail"));

            List<String> weaknesses = List.of("skill missing Java", "experience insufficient years");

            List<CategoryExplanation> explanations = service.buildCategoryExplanations(breakdown, List.of(), weaknesses);

            assertThat(explanations.get(0).getWeaknesses()).containsExactly("skill missing Java");
            assertThat(explanations.get(1).getWeaknesses()).containsExactly("experience insufficient years");
        }
    }
}
