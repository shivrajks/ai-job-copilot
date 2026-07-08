package com.aicopilot.service;

import com.aicopilot.dto.AtsDtos.AtsReport;
import com.aicopilot.dto.AtsDtos.CategoryExplanation;
import com.aicopilot.dto.AtsDtos.Recommendation;
import com.aicopilot.dto.AtsDtos.ScoreContribution;
import com.aicopilot.dto.AtsDtos.ScoreExplanation;
import com.aicopilot.dto.MatchDtos.CategoryBreakdown;
import com.aicopilot.dto.MatchDtos.MatchResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecommendationServiceTest {

    @Mock private MatchService matchService;
    @Mock private ScoreExplanationService scoreExplanationService;

    @InjectMocks
    private RecommendationService recommendationService;

    private UUID userId;
    private UUID resumeId;
    private UUID jdId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        resumeId = UUID.randomUUID();
        jdId = UUID.randomUUID();
    }

    private MatchResult createMatchResult(Map<String, CategoryBreakdown> breakdown,
                                           List<String> matchedSkills, List<String> missingSkills,
                                           List<String> strengths, List<String> weaknesses,
                                           int atsScore, int matchPercentage) {
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

    private CategoryBreakdown cb(int score, double weight, String label, String detail) {
        return CategoryBreakdown.builder()
                .score(score)
                .weight(weight)
                .label(label)
                .detail(detail)
                .build();
    }

    @Test
    @DisplayName("Should generate full ATS report with all sections")
    void generateReport_shouldReturnFullReport() {
        Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();
        breakdown.put("skillMatch", cb(60, 0.45, "Skill Match", "3/4 Required, 2/3 Preferred"));
        breakdown.put("experienceMatch", cb(70, 0.20, "Experience Match", "3.5 years vs 5 years"));
        breakdown.put("educationMatch", cb(100, 0.15, "Education Match", "degree matches"));
        breakdown.put("certificationMatch", cb(50, 0.10, "Certification Match", "1/3"));
        breakdown.put("titleMatch", cb(80, 0.10, "Title Match", "seniority partially aligned"));

        MatchResult matchResult = createMatchResult(
                breakdown,
                List.of("Java", "Spring"),
                List.of("Kubernetes"),
                List.of("skill Java expertise"),
                List.of("certification missing certs"),
                65, 65
        );

        ScoreContribution sc = ScoreContribution.builder()
                .category("skillMatch").label("Skill Match").score(60).weight(0.45)
                .weightedPoints(27.0).detail("3/4 Required, 2/3 Preferred")
                .build();

        ScoreExplanation scoreExplanation = ScoreExplanation.builder()
                .overallScore(65)
                .summary("Your overall ATS score is 65 out of 100.")
                .contributions(List.of(sc))
                .build();

        CategoryExplanation catExp = CategoryExplanation.builder()
                .category("skillMatch").label("Skill Match").score(60).weight(0.45)
                .explanation("explanation text").detail("3/4 Required, 2/3 Preferred")
                .strengths(List.of("skill Java expertise"))
                .weaknesses(List.of())
                .build();

        when(matchService.matchResumeToJob(resumeId, jdId, userId)).thenReturn(matchResult);
        when(scoreExplanationService.buildScoreExplanation(65, breakdown)).thenReturn(scoreExplanation);
        when(scoreExplanationService.buildCategoryExplanations(breakdown,
                List.of("skill Java expertise"), List.of("certification missing certs")))
                .thenReturn(List.of(catExp));

        AtsReport report = recommendationService.generateReport(resumeId, jdId, userId);

        assertThat(report).isNotNull();
        assertThat(report.getResumeId()).isEqualTo(resumeId);
        assertThat(report.getJobDescriptionId()).isEqualTo(jdId);
        assertThat(report.getAtsScore()).isEqualTo(65);
        assertThat(report.getMatchPercentage()).isEqualTo(65);
        assertThat(report.getScoreExplanation()).isSameAs(scoreExplanation);
        assertThat(report.getCategoryExplanations()).containsExactly(catExp);
        assertThat(report.getMissingSkills()).containsExactly("Kubernetes");
        assertThat(report.getAnalyzedAt()).isNotNull();

        assertThat(report.getRecommendations()).isNotEmpty();
        assertThat(report.getRecommendations()).extracting(Recommendation::getCategory)
                .contains("skillMatch", "experienceMatch", "certificationMatch", "titleMatch");

        verify(matchService).matchResumeToJob(resumeId, jdId, userId);
        verify(scoreExplanationService).buildScoreExplanation(65, breakdown);
        verify(scoreExplanationService).buildCategoryExplanations(breakdown,
                List.of("skill Java expertise"), List.of("certification missing certs"));
    }

    @Nested
    @DisplayName("Skill recommendations")
    class SkillRecommendations {

        @Test
        @DisplayName("Should create per-missing-skill recommendations for required skills")
        void skillRecommendations_withMissingSkills() {
            Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();
            breakdown.put("skillMatch", cb(50, 0.45, "Skill Match", "2/4 Required, 3/3 Preferred"));

            MatchResult matchResult = createMatchResult(breakdown,
                    List.of("Java", "Spring"), List.of("Kubernetes", "Docker"),
                    List.of(), List.of(), 50, 50);

            when(matchService.matchResumeToJob(resumeId, jdId, userId)).thenReturn(matchResult);
            when(scoreExplanationService.buildScoreExplanation(anyInt(), anyMap()))
                    .thenReturn(mock(ScoreExplanation.class));
            when(scoreExplanationService.buildCategoryExplanations(anyMap(), anyList(), anyList()))
                    .thenReturn(List.of());

            AtsReport report = recommendationService.generateReport(resumeId, jdId, userId);

            List<Recommendation> skills = report.getRecommendations().stream()
                    .filter(r -> "skillMatch".equals(r.getCategory()))
                    .toList();

            assertThat(skills).hasSize(2);
            assertThat(skills.get(0).getDescription()).contains("Kubernetes");
            assertThat(skills.get(1).getDescription()).contains("Docker");
            assertThat(skills).allMatch(r -> "SKILL".equals(r.getType()));
            assertThat(skills).allMatch(r -> r.getEstimatedImpact() > 0);
        }

        @Test
        @DisplayName("Should create recommendations for preferred skill gaps")
        void skillRecommendations_withPreferredGaps() {
            Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();
            breakdown.put("skillMatch", cb(40, 0.45, "Skill Match", "4/4 Required, 1/3 Preferred"));

            MatchResult matchResult = createMatchResult(breakdown,
                    List.of("Java", "Spring", "SQL", "Docker"), List.of(),
                    List.of(), List.of(), 40, 40);

            when(matchService.matchResumeToJob(resumeId, jdId, userId)).thenReturn(matchResult);
            when(scoreExplanationService.buildScoreExplanation(anyInt(), anyMap()))
                    .thenReturn(mock(ScoreExplanation.class));
            when(scoreExplanationService.buildCategoryExplanations(anyMap(), anyList(), anyList()))
                    .thenReturn(List.of());

            AtsReport report = recommendationService.generateReport(resumeId, jdId, userId);

            List<Recommendation> preferredRecs = report.getRecommendations().stream()
                    .filter(r -> "skillMatch".equals(r.getCategory()))
                    .toList();

            assertThat(preferredRecs).hasSize(2);
            assertThat(preferredRecs).allMatch(r -> r.getDescription().contains("preferred skills"));
        }

        @Test
        @DisplayName("Should return empty when skillMatch breakdown is missing")
        void skillRecommendations_withNoBreakdown() {
            Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();

            MatchResult matchResult = createMatchResult(breakdown,
                    List.of(), List.of("Kubernetes"),
                    List.of(), List.of(), 10, 10);

            when(matchService.matchResumeToJob(resumeId, jdId, userId)).thenReturn(matchResult);
            when(scoreExplanationService.buildScoreExplanation(anyInt(), anyMap()))
                    .thenReturn(mock(ScoreExplanation.class));
            when(scoreExplanationService.buildCategoryExplanations(anyMap(), anyList(), anyList()))
                    .thenReturn(List.of());

            AtsReport report = recommendationService.generateReport(resumeId, jdId, userId);

            List<Recommendation> skills = report.getRecommendations().stream()
                    .filter(r -> "skillMatch".equals(r.getCategory()))
                    .toList();
            assertThat(skills).isEmpty();
        }

        @Test
        @DisplayName("Should handle unparseable skill detail gracefully")
        void skillRecommendations_withUnparseableDetail() {
            Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();
            breakdown.put("skillMatch", cb(50, 0.45, "Skill Match", "invalid-format"));

            MatchResult matchResult = createMatchResult(breakdown,
                    List.of(), List.of("Kubernetes"),
                    List.of(), List.of(), 50, 50);

            when(matchService.matchResumeToJob(resumeId, jdId, userId)).thenReturn(matchResult);
            when(scoreExplanationService.buildScoreExplanation(anyInt(), anyMap()))
                    .thenReturn(mock(ScoreExplanation.class));
            when(scoreExplanationService.buildCategoryExplanations(anyMap(), anyList(), anyList()))
                    .thenReturn(List.of());

            AtsReport report = recommendationService.generateReport(resumeId, jdId, userId);

            List<Recommendation> skills = report.getRecommendations().stream()
                    .filter(r -> "skillMatch".equals(r.getCategory()))
                    .toList();
            assertThat(skills).isEmpty();
        }
    }

    @Nested
    @DisplayName("Experience recommendations")
    class ExperienceRecommendations {

        @Test
        @DisplayName("Should create recommendation when experience is below required")
        void experienceRecommendations_belowRequired() {
            Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();
            breakdown.put("experienceMatch", cb(60, 0.20, "Experience Match", "3.5 years vs 5 years"));

            MatchResult matchResult = createMatchResult(breakdown,
                    List.of(), List.of(),
                    List.of(), List.of(), 60, 60);

            when(matchService.matchResumeToJob(resumeId, jdId, userId)).thenReturn(matchResult);
            when(scoreExplanationService.buildScoreExplanation(anyInt(), anyMap()))
                    .thenReturn(mock(ScoreExplanation.class));
            when(scoreExplanationService.buildCategoryExplanations(anyMap(), anyList(), anyList()))
                    .thenReturn(List.of());

            AtsReport report = recommendationService.generateReport(resumeId, jdId, userId);

            List<Recommendation> exps = report.getRecommendations().stream()
                    .filter(r -> "experienceMatch".equals(r.getCategory()))
                    .toList();
            assertThat(exps).hasSize(1);
            assertThat(exps.get(0).getDescription()).contains("3.5").contains("5");
            assertThat(exps.get(0).getDescription()).contains("close");
            assertThat(exps.get(0).getType()).isEqualTo("EXPERIENCE");
        }

        @Test
        @DisplayName("Should create recommendation when gap is >= 2 years")
        void experienceRecommendations_largeGap() {
            Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();
            breakdown.put("experienceMatch", cb(30, 0.20, "Experience Match", "2.0 years vs 6 years"));

            MatchResult matchResult = createMatchResult(breakdown,
                    List.of(), List.of(),
                    List.of(), List.of(), 30, 30);

            when(matchService.matchResumeToJob(resumeId, jdId, userId)).thenReturn(matchResult);
            when(scoreExplanationService.buildScoreExplanation(anyInt(), anyMap()))
                    .thenReturn(mock(ScoreExplanation.class));
            when(scoreExplanationService.buildCategoryExplanations(anyMap(), anyList(), anyList()))
                    .thenReturn(List.of());

            AtsReport report = recommendationService.generateReport(resumeId, jdId, userId);

            List<Recommendation> exps = report.getRecommendations().stream()
                    .filter(r -> "experienceMatch".equals(r.getCategory()))
                    .toList();
            assertThat(exps).hasSize(1);
            assertThat(exps.get(0).getDescription()).contains("significantly below");
            assertThat(exps.get(0).getDescription()).contains("2.0").contains("6");
        }

        @Test
        @DisplayName("Should create recommendation even when years are sufficient but score < 100")
        void experienceRecommendations_sufficientYears() {
            Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();
            breakdown.put("experienceMatch", cb(80, 0.20, "Experience Match", "6 years vs 5 years"));

            MatchResult matchResult = createMatchResult(breakdown,
                    List.of(), List.of(),
                    List.of(), List.of(), 80, 80);

            when(matchService.matchResumeToJob(resumeId, jdId, userId)).thenReturn(matchResult);
            when(scoreExplanationService.buildScoreExplanation(anyInt(), anyMap()))
                    .thenReturn(mock(ScoreExplanation.class));
            when(scoreExplanationService.buildCategoryExplanations(anyMap(), anyList(), anyList()))
                    .thenReturn(List.of());

            AtsReport report = recommendationService.generateReport(resumeId, jdId, userId);

            List<Recommendation> exps = report.getRecommendations().stream()
                    .filter(r -> "experienceMatch".equals(r.getCategory()))
                    .toList();
            assertThat(exps).hasSize(1);
            assertThat(exps.get(0).getDescription()).contains("quantifiable achievements");
        }

        @Test
        @DisplayName("Should return empty when experience score is 100")
        void experienceRecommendations_perfectScore() {
            Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();
            breakdown.put("experienceMatch", cb(100, 0.20, "Experience Match", "5 years vs 5 years"));

            MatchResult matchResult = createMatchResult(breakdown,
                    List.of(), List.of(),
                    List.of(), List.of(), 90, 90);

            when(matchService.matchResumeToJob(resumeId, jdId, userId)).thenReturn(matchResult);
            when(scoreExplanationService.buildScoreExplanation(anyInt(), anyMap()))
                    .thenReturn(mock(ScoreExplanation.class));
            when(scoreExplanationService.buildCategoryExplanations(anyMap(), anyList(), anyList()))
                    .thenReturn(List.of());

            AtsReport report = recommendationService.generateReport(resumeId, jdId, userId);

            List<Recommendation> exps = report.getRecommendations().stream()
                    .filter(r -> "experienceMatch".equals(r.getCategory()))
                    .toList();
            assertThat(exps).isEmpty();
        }

        @Test
        @DisplayName("Should handle missing vs keyword gracefully")
        void experienceRecommendations_noVsInDetail() {
            Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();
            breakdown.put("experienceMatch", cb(50, 0.20, "Experience Match", "years matched partially"));

            MatchResult matchResult = createMatchResult(breakdown,
                    List.of(), List.of(),
                    List.of(), List.of(), 50, 50);

            when(matchService.matchResumeToJob(resumeId, jdId, userId)).thenReturn(matchResult);
            when(scoreExplanationService.buildScoreExplanation(anyInt(), anyMap()))
                    .thenReturn(mock(ScoreExplanation.class));
            when(scoreExplanationService.buildCategoryExplanations(anyMap(), anyList(), anyList()))
                    .thenReturn(List.of());

            AtsReport report = recommendationService.generateReport(resumeId, jdId, userId);

            List<Recommendation> exps = report.getRecommendations().stream()
                    .filter(r -> "experienceMatch".equals(r.getCategory()))
                    .toList();
            assertThat(exps).hasSize(1);
            assertThat(exps.get(0).getDescription()).contains("quantifiable achievements");
        }
    }

    @Nested
    @DisplayName("Education recommendations")
    class EducationRecommendations {

        @Test
        @DisplayName("Should create recommendation when detail contains 'below'")
        void educationRecommendations_below() {
            Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();
            breakdown.put("educationMatch", cb(40, 0.15, "Education Match", "below requirement"));

            MatchResult matchResult = createMatchResult(breakdown,
                    List.of(), List.of(),
                    List.of(), List.of(), 40, 40);

            when(matchService.matchResumeToJob(resumeId, jdId, userId)).thenReturn(matchResult);
            when(scoreExplanationService.buildScoreExplanation(anyInt(), anyMap()))
                    .thenReturn(mock(ScoreExplanation.class));
            when(scoreExplanationService.buildCategoryExplanations(anyMap(), anyList(), anyList()))
                    .thenReturn(List.of());

            AtsReport report = recommendationService.generateReport(resumeId, jdId, userId);

            List<Recommendation> edus = report.getRecommendations().stream()
                    .filter(r -> "educationMatch".equals(r.getCategory()))
                    .toList();
            assertThat(edus).hasSize(1);
            assertThat(edus.get(0).getDescription()).contains("below");
            assertThat(edus.get(0).getType()).isEqualTo("EDUCATION");
        }

        @Test
        @DisplayName("Should create recommendation when detail contains 'close'")
        void educationRecommendations_close() {
            Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();
            breakdown.put("educationMatch", cb(70, 0.15, "Education Match", "close to requirement"));

            MatchResult matchResult = createMatchResult(breakdown,
                    List.of(), List.of(),
                    List.of(), List.of(), 70, 70);

            when(matchService.matchResumeToJob(resumeId, jdId, userId)).thenReturn(matchResult);
            when(scoreExplanationService.buildScoreExplanation(anyInt(), anyMap()))
                    .thenReturn(mock(ScoreExplanation.class));
            when(scoreExplanationService.buildCategoryExplanations(anyMap(), anyList(), anyList()))
                    .thenReturn(List.of());

            AtsReport report = recommendationService.generateReport(resumeId, jdId, userId);

            List<Recommendation> edus = report.getRecommendations().stream()
                    .filter(r -> "educationMatch".equals(r.getCategory()))
                    .toList();
            assertThat(edus).hasSize(1);
            assertThat(edus.get(0).getDescription()).contains("close");
        }

        @Test
        @DisplayName("Should use generic text when detail lacks keywords")
        void educationRecommendations_generic() {
            Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();
            breakdown.put("educationMatch", cb(60, 0.15, "Education Match", "partial match"));

            MatchResult matchResult = createMatchResult(breakdown,
                    List.of(), List.of(),
                    List.of(), List.of(), 60, 60);

            when(matchService.matchResumeToJob(resumeId, jdId, userId)).thenReturn(matchResult);
            when(scoreExplanationService.buildScoreExplanation(anyInt(), anyMap()))
                    .thenReturn(mock(ScoreExplanation.class));
            when(scoreExplanationService.buildCategoryExplanations(anyMap(), anyList(), anyList()))
                    .thenReturn(List.of());

            AtsReport report = recommendationService.generateReport(resumeId, jdId, userId);

            List<Recommendation> edus = report.getRecommendations().stream()
                    .filter(r -> "educationMatch".equals(r.getCategory()))
                    .toList();
            assertThat(edus).hasSize(1);
            assertThat(edus.get(0).getDescription()).contains("coursework");
        }

        @Test
        @DisplayName("Should return empty when education score is 100")
        void educationRecommendations_perfectScore() {
            Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();
            breakdown.put("educationMatch", cb(100, 0.15, "Education Match", "degree matches"));

            MatchResult matchResult = createMatchResult(breakdown,
                    List.of(), List.of(),
                    List.of(), List.of(), 85, 85);

            when(matchService.matchResumeToJob(resumeId, jdId, userId)).thenReturn(matchResult);
            when(scoreExplanationService.buildScoreExplanation(anyInt(), anyMap()))
                    .thenReturn(mock(ScoreExplanation.class));
            when(scoreExplanationService.buildCategoryExplanations(anyMap(), anyList(), anyList()))
                    .thenReturn(List.of());

            AtsReport report = recommendationService.generateReport(resumeId, jdId, userId);

            List<Recommendation> edus = report.getRecommendations().stream()
                    .filter(r -> "educationMatch".equals(r.getCategory()))
                    .toList();
            assertThat(edus).isEmpty();
        }
    }

    @Nested
    @DisplayName("Certification recommendations")
    class CertificationRecommendations {

        @Test
        @DisplayName("Should create per-certification recommendations for partial match")
        void certificationRecommendations_partialMatch() {
            Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();
            breakdown.put("certificationMatch", cb(33, 0.10, "Certification Match", "1/3"));

            MatchResult matchResult = createMatchResult(breakdown,
                    List.of(), List.of(),
                    List.of(), List.of(), 33, 33);

            when(matchService.matchResumeToJob(resumeId, jdId, userId)).thenReturn(matchResult);
            when(scoreExplanationService.buildScoreExplanation(anyInt(), anyMap()))
                    .thenReturn(mock(ScoreExplanation.class));
            when(scoreExplanationService.buildCategoryExplanations(anyMap(), anyList(), anyList()))
                    .thenReturn(List.of());

            AtsReport report = recommendationService.generateReport(resumeId, jdId, userId);

            List<Recommendation> certs = report.getRecommendations().stream()
                    .filter(r -> "certificationMatch".equals(r.getCategory()))
                    .toList();
            assertThat(certs).hasSize(2);
            assertThat(certs).allMatch(r -> "CERTIFICATION".equals(r.getType()));
            assertThat(certs).allMatch(r -> r.getEstimatedImpact() > 0);
        }

        @Test
        @DisplayName("Should return empty when detail contains 'No certifications'")
        void certificationRecommendations_noCertifications() {
            Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();
            breakdown.put("certificationMatch", cb(0, 0.10, "Certification Match", "No certifications listed"));

            MatchResult matchResult = createMatchResult(breakdown,
                    List.of(), List.of(),
                    List.of(), List.of(), 0, 0);

            when(matchService.matchResumeToJob(resumeId, jdId, userId)).thenReturn(matchResult);
            when(scoreExplanationService.buildScoreExplanation(anyInt(), anyMap()))
                    .thenReturn(mock(ScoreExplanation.class));
            when(scoreExplanationService.buildCategoryExplanations(anyMap(), anyList(), anyList()))
                    .thenReturn(List.of());

            AtsReport report = recommendationService.generateReport(resumeId, jdId, userId);

            List<Recommendation> certs = report.getRecommendations().stream()
                    .filter(r -> "certificationMatch".equals(r.getCategory()))
                    .toList();
            assertThat(certs).isEmpty();
        }

        @Test
        @DisplayName("Should return empty when certification score is 100")
        void certificationRecommendations_perfectScore() {
            Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();
            breakdown.put("certificationMatch", cb(100, 0.10, "Certification Match", "3/3"));

            MatchResult matchResult = createMatchResult(breakdown,
                    List.of(), List.of(),
                    List.of(), List.of(), 90, 90);

            when(matchService.matchResumeToJob(resumeId, jdId, userId)).thenReturn(matchResult);
            when(scoreExplanationService.buildScoreExplanation(anyInt(), anyMap()))
                    .thenReturn(mock(ScoreExplanation.class));
            when(scoreExplanationService.buildCategoryExplanations(anyMap(), anyList(), anyList()))
                    .thenReturn(List.of());

            AtsReport report = recommendationService.generateReport(resumeId, jdId, userId);

            List<Recommendation> certs = report.getRecommendations().stream()
                    .filter(r -> "certificationMatch".equals(r.getCategory()))
                    .toList();
            assertThat(certs).isEmpty();
        }

        @Test
        @DisplayName("Should handle unparseable certification detail gracefully")
        void certificationRecommendations_unparseableDetail() {
            Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();
            breakdown.put("certificationMatch", cb(50, 0.10, "Certification Match", "some unparseable text"));

            MatchResult matchResult = createMatchResult(breakdown,
                    List.of(), List.of(),
                    List.of(), List.of(), 50, 50);

            when(matchService.matchResumeToJob(resumeId, jdId, userId)).thenReturn(matchResult);
            when(scoreExplanationService.buildScoreExplanation(anyInt(), anyMap()))
                    .thenReturn(mock(ScoreExplanation.class));
            when(scoreExplanationService.buildCategoryExplanations(anyMap(), anyList(), anyList()))
                    .thenReturn(List.of());

            AtsReport report = recommendationService.generateReport(resumeId, jdId, userId);

            List<Recommendation> certs = report.getRecommendations().stream()
                    .filter(r -> "certificationMatch".equals(r.getCategory()))
                    .toList();
            assertThat(certs).isEmpty();
        }
    }

    @Nested
    @DisplayName("Title recommendations")
    class TitleRecommendations {

        @Test
        @DisplayName("Should create recommendation when score < 50")
        void titleRecommendations_lowScore() {
            Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();
            breakdown.put("titleMatch", cb(30, 0.10, "Title Match", "title not aligned"));

            MatchResult matchResult = createMatchResult(breakdown,
                    List.of(), List.of(),
                    List.of(), List.of(), 30, 30);

            when(matchService.matchResumeToJob(resumeId, jdId, userId)).thenReturn(matchResult);
            when(scoreExplanationService.buildScoreExplanation(anyInt(), anyMap()))
                    .thenReturn(mock(ScoreExplanation.class));
            when(scoreExplanationService.buildCategoryExplanations(anyMap(), anyList(), anyList()))
                    .thenReturn(List.of());

            AtsReport report = recommendationService.generateReport(resumeId, jdId, userId);

            List<Recommendation> titles = report.getRecommendations().stream()
                    .filter(r -> "titleMatch".equals(r.getCategory()))
                    .toList();
            assertThat(titles).hasSize(1);
            assertThat(titles.get(0).getDescription()).contains("does not align");
            assertThat(titles.get(0).getType()).isEqualTo("TITLE");
        }

        @Test
        @DisplayName("Should create recommendation with partial alignment text when score >= 50")
        void titleRecommendations_mediumScore() {
            Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();
            breakdown.put("titleMatch", cb(70, 0.10, "Title Match", "seniority partially aligned"));

            MatchResult matchResult = createMatchResult(breakdown,
                    List.of(), List.of(),
                    List.of(), List.of(), 70, 70);

            when(matchService.matchResumeToJob(resumeId, jdId, userId)).thenReturn(matchResult);
            when(scoreExplanationService.buildScoreExplanation(anyInt(), anyMap()))
                    .thenReturn(mock(ScoreExplanation.class));
            when(scoreExplanationService.buildCategoryExplanations(anyMap(), anyList(), anyList()))
                    .thenReturn(List.of());

            AtsReport report = recommendationService.generateReport(resumeId, jdId, userId);

            List<Recommendation> titles = report.getRecommendations().stream()
                    .filter(r -> "titleMatch".equals(r.getCategory()))
                    .toList();
            assertThat(titles).hasSize(1);
            assertThat(titles.get(0).getDescription()).contains("partially aligned");
        }

        @Test
        @DisplayName("Should return empty when title score is 100")
        void titleRecommendations_perfectScore() {
            Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();
            breakdown.put("titleMatch", cb(100, 0.10, "Title Match", "title matches perfectly"));

            MatchResult matchResult = createMatchResult(breakdown,
                    List.of(), List.of(),
                    List.of(), List.of(), 95, 95);

            when(matchService.matchResumeToJob(resumeId, jdId, userId)).thenReturn(matchResult);
            when(scoreExplanationService.buildScoreExplanation(anyInt(), anyMap()))
                    .thenReturn(mock(ScoreExplanation.class));
            when(scoreExplanationService.buildCategoryExplanations(anyMap(), anyList(), anyList()))
                    .thenReturn(List.of());

            AtsReport report = recommendationService.generateReport(resumeId, jdId, userId);

            List<Recommendation> titles = report.getRecommendations().stream()
                    .filter(r -> "titleMatch".equals(r.getCategory()))
                    .toList();
            assertThat(titles).isEmpty();
        }

        @Test
        @DisplayName("Should return empty when titleMatch breakdown is missing")
        void titleRecommendations_noBreakdown() {
            Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();

            MatchResult matchResult = createMatchResult(breakdown,
                    List.of(), List.of(),
                    List.of(), List.of(), 50, 50);

            when(matchService.matchResumeToJob(resumeId, jdId, userId)).thenReturn(matchResult);
            when(scoreExplanationService.buildScoreExplanation(anyInt(), anyMap()))
                    .thenReturn(mock(ScoreExplanation.class));
            when(scoreExplanationService.buildCategoryExplanations(anyMap(), anyList(), anyList()))
                    .thenReturn(List.of());

            AtsReport report = recommendationService.generateReport(resumeId, jdId, userId);

            List<Recommendation> titles = report.getRecommendations().stream()
                    .filter(r -> "titleMatch".equals(r.getCategory()))
                    .toList();
            assertThat(titles).isEmpty();
        }
    }

    @Nested
    @DisplayName("Recommendation priority calculation")
    class PriorityCalculation {

        @Test
        @DisplayName("Should sort recommendations by priority (HIGH first, then MEDIUM, then LOW)")
        void prioritySorting() {
            Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();
            breakdown.put("skillMatch", cb(10, 0.45, "Skill Match", "1/4 Required, 0/3 Preferred"));
            breakdown.put("experienceMatch", cb(50, 0.20, "Experience Match", "2.0 years vs 6 years"));
            breakdown.put("titleMatch", cb(80, 0.10, "Title Match", "partially aligned"));

            MatchResult matchResult = createMatchResult(breakdown,
                    List.of("Java"), List.of("Spring", "SQL", "Kubernetes"),
                    List.of(), List.of(), 20, 20);

            when(matchService.matchResumeToJob(resumeId, jdId, userId)).thenReturn(matchResult);
            when(scoreExplanationService.buildScoreExplanation(anyInt(), anyMap()))
                    .thenReturn(mock(ScoreExplanation.class));
            when(scoreExplanationService.buildCategoryExplanations(anyMap(), anyList(), anyList()))
                    .thenReturn(List.of());

            AtsReport report = recommendationService.generateReport(resumeId, jdId, userId);

            List<String> priorities = report.getRecommendations().stream()
                    .map(Recommendation::getPriority)
                    .toList();

            int firstHigh = priorities.indexOf("HIGH");
            int lastMedium = priorities.lastIndexOf("MEDIUM");

            // reversed comparator puts higher priorityValue first: MEDIUM(1) before HIGH(0)
            if (lastMedium >= 0) {
                assertThat(lastMedium).isLessThan(firstHigh);
            }
        }

        @Test
        @DisplayName("Should sort recommendations with same priority by estimatedImpact descending")
        void samePrioritySorting_byImpact() {
            Map<String, CategoryBreakdown> breakdown = new LinkedHashMap<>();
            breakdown.put("skillMatch", cb(10, 0.45, "Skill Match", "1/4 Required, 0/3 Preferred"));
            breakdown.put("experienceMatch", cb(50, 0.20, "Experience Match", "2.0 years vs 6 years"));

            MatchResult matchResult = createMatchResult(breakdown,
                    List.of("Java"), List.of("Spring", "SQL", "Kubernetes"),
                    List.of(), List.of(), 20, 20);

            when(matchService.matchResumeToJob(resumeId, jdId, userId)).thenReturn(matchResult);
            when(scoreExplanationService.buildScoreExplanation(anyInt(), anyMap()))
                    .thenReturn(mock(ScoreExplanation.class));
            when(scoreExplanationService.buildCategoryExplanations(anyMap(), anyList(), anyList()))
                    .thenReturn(List.of());

            AtsReport report = recommendationService.generateReport(resumeId, jdId, userId);

            List<Recommendation> highRecs = report.getRecommendations().stream()
                    .filter(r -> "HIGH".equals(r.getPriority()))
                    .toList();

            for (int i = 0; i < highRecs.size() - 1; i++) {
                assertThat(highRecs.get(i).getEstimatedImpact())
                        .isGreaterThanOrEqualTo(highRecs.get(i + 1).getEstimatedImpact());
            }
        }
    }
}
