package com.aicopilot.service;

import com.aicopilot.dto.AnalyticsDtos.*;
import com.aicopilot.entity.Application;
import com.aicopilot.entity.CoverLetter;
import com.aicopilot.entity.InterviewSession;
import com.aicopilot.entity.JobDescription;
import com.aicopilot.entity.Resume;
import com.aicopilot.entity.User;
import com.aicopilot.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock private ApplicationRepository applicationRepository;
    @Mock private ResumeRepository resumeRepository;
    @Mock private JobDescriptionRepository jobDescriptionRepository;
    @Mock private InterviewRepository interviewRepository;
    @Mock private CoverLetterRepository coverLetterRepository;
    @Mock private ObjectMapper objectMapper;

    @InjectMocks
    private AnalyticsService analyticsService;

    private UUID userId;
    private Application testApp;
    private Resume testResume;
    private JobDescription testJd;
    private InterviewSession testSession;
    private CoverLetter testCl;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        User user = User.builder().id(userId).build();

        testApp = Application.builder()
                .id(UUID.randomUUID())
                .user(user)
                .company("Acme Corp")
                .role("Engineer")
                .stage(Application.Stage.APPLIED)
                .createdAt(LocalDateTime.now().minusDays(1))
                .build();

        testResume = Resume.builder()
                .id(UUID.randomUUID())
                .user(user)
                .name("My Resume")
                .createdAt(LocalDateTime.now().minusDays(2))
                .build();

        testJd = JobDescription.builder()
                .id(UUID.randomUUID())
                .user(user)
                .title("Engineer")
                .company("Acme Corp")
                .extractedSkills("[\"Java\",\"Spring\"]")
                .createdAt(LocalDateTime.now().minusDays(3))
                .build();

        testSession = InterviewSession.builder()
                .id(UUID.randomUUID())
                .user(user)
                .title("Test Interview")
                .overallScore(80)
                .createdAt(LocalDateTime.now().minusDays(4))
                .build();

        testCl = CoverLetter.builder()
                .id(UUID.randomUUID())
                .user(user)
                .companyName("Acme Corp")
                .createdAt(LocalDateTime.now().minusDays(5))
                .build();
    }

    @Nested
    @DisplayName("getDashboardAnalytics")
    class GetDashboardAnalytics {

        @Test
        @DisplayName("Should return full analytics response with all sections")
        void shouldReturnFullAnalytics() throws Exception {
            when(applicationRepository.countByUserId(userId)).thenReturn(10L);
            when(applicationRepository.countByUserIdAndCreatedAtBetween(any(), any(), any())).thenReturn(2L);
            when(applicationRepository.countByStage(userId)).thenReturn(
                    List.<Object[]>of(new Object[]{Application.Stage.APPLIED, 5L}, new Object[]{Application.Stage.OFFER, 1L}));
            when(applicationRepository.countByCompany(userId)).thenReturn(
                    List.<Object[]>of(new Object[]{"Acme Corp", 3L}));
            when(applicationRepository.countByUserIdAndStage(eq(userId), any(Application.Stage.class))).thenReturn(1L);
            when(applicationRepository.findRecentByUserId(userId)).thenReturn(List.of(testApp));

            when(resumeRepository.countByUserId(userId)).thenReturn(3L);
            when(resumeRepository.countByUserIdAndIsActiveTrue(userId)).thenReturn(1L);
            when(resumeRepository.averageAtsScoreByUserId(userId)).thenReturn(72.5);
            when(resumeRepository.maxAtsScoreByUserId(userId)).thenReturn(85);
            when(resumeRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of(testResume));

            when(jobDescriptionRepository.countByUserId(userId)).thenReturn(5L);
            when(jobDescriptionRepository.averageMatchScoreByUserId(userId)).thenReturn(68.0);
            when(jobDescriptionRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of(testJd));
            when(objectMapper.readValue(eq("[\"Java\",\"Spring\"]"), any(com.fasterxml.jackson.core.type.TypeReference.class)))
                    .thenReturn(List.of("Java", "Spring"));

            when(interviewRepository.countByUserId(userId)).thenReturn(2L);
            when(interviewRepository.averageScoreByUserId(userId)).thenReturn(75.5);
            when(interviewRepository.findScoresWithDatesByUserId(userId)).thenReturn(
                    List.<Object[]>of(new Object[]{80, LocalDateTime.now().minusDays(4)}));
            when(interviewRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of(testSession));

            when(coverLetterRepository.countByUserId(userId)).thenReturn(4L);
            when(coverLetterRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of(testCl));

            AnalyticsResponse response = analyticsService.getDashboardAnalytics(userId);

            assertThat(response).isNotNull();

            assertThat(response.getApplications().getTotal()).isEqualTo(10);
            assertThat(response.getApplications().getAppliedThisWeek()).isEqualTo(2);
            assertThat(response.getApplications().getAppliedThisMonth()).isEqualTo(2);
            assertThat(response.getApplications().getByStage()).hasSize(2);
            assertThat(response.getApplications().getByCompany()).hasSize(1);
            assertThat(response.getApplications().getSuccessRate()).isGreaterThan(0);

            assertThat(response.getResumes().getTotal()).isEqualTo(3);
            assertThat(response.getResumes().getActive()).isEqualTo(1);
            assertThat(response.getResumes().getAverageAtsScore()).isEqualTo(72.5);
            assertThat(response.getResumes().getHighestAtsScore()).isEqualTo(85);

            assertThat(response.getJobDescriptions().getTotal()).isEqualTo(5);
            assertThat(response.getJobDescriptions().getAverageMatchScore()).isEqualTo(68.0);
            assertThat(response.getJobDescriptions().getTopSkills()).containsExactly("Java", "Spring");

            assertThat(response.getInterviews().getTotalSessions()).isEqualTo(2);
            assertThat(response.getInterviews().getAverageScore()).isEqualTo(75.5);
            assertThat(response.getInterviews().getScoreTrend()).hasSize(1);

            assertThat(response.getCoverLetters().getGeneratedCount()).isEqualTo(4);

            assertThat(response.getRecentActivity()).isNotEmpty();
            assertThat(response.getRecentActivity()).hasSizeLessThanOrEqualTo(10);
        }

        @Test
        @DisplayName("Should handle empty data gracefully")
        void shouldHandleEmptyData() {
            when(applicationRepository.countByUserId(userId)).thenReturn(0L);
            when(applicationRepository.countByUserIdAndCreatedAtBetween(any(), any(), any())).thenReturn(0L);
            when(applicationRepository.countByStage(userId)).thenReturn(List.of());
            when(applicationRepository.countByCompany(userId)).thenReturn(List.of());
            when(applicationRepository.countByUserIdAndStage(any(), any())).thenReturn(0L);
            when(applicationRepository.findRecentByUserId(userId)).thenReturn(List.of());

            when(resumeRepository.countByUserId(userId)).thenReturn(0L);
            when(resumeRepository.countByUserIdAndIsActiveTrue(userId)).thenReturn(0L);
            when(resumeRepository.averageAtsScoreByUserId(userId)).thenReturn(null);
            when(resumeRepository.maxAtsScoreByUserId(userId)).thenReturn(null);
            when(resumeRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of());

            when(jobDescriptionRepository.countByUserId(userId)).thenReturn(0L);
            when(jobDescriptionRepository.averageMatchScoreByUserId(userId)).thenReturn(null);
            when(jobDescriptionRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of());

            when(interviewRepository.countByUserId(userId)).thenReturn(0L);
            when(interviewRepository.averageScoreByUserId(userId)).thenReturn(null);
            when(interviewRepository.findScoresWithDatesByUserId(userId)).thenReturn(List.of());
            when(interviewRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of());

            when(coverLetterRepository.countByUserId(userId)).thenReturn(0L);
            when(coverLetterRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of());

            AnalyticsResponse response = analyticsService.getDashboardAnalytics(userId);

            assertThat(response.getApplications().getTotal()).isEqualTo(0);
            assertThat(response.getApplications().getSuccessRate()).isEqualTo(0.0);
            assertThat(response.getResumes().getAverageAtsScore()).isNull();
            assertThat(response.getResumes().getHighestAtsScore()).isNull();
            assertThat(response.getJobDescriptions().getAverageMatchScore()).isNull();
            assertThat(response.getJobDescriptions().getTopSkills()).isEmpty();
            assertThat(response.getInterviews().getAverageScore()).isNull();
            assertThat(response.getCoverLetters().getGeneratedCount()).isEqualTo(0);
            assertThat(response.getRecentActivity()).isEmpty();
        }

        @Test
        @DisplayName("Should calculate success rate correctly")
        void shouldCalculateSuccessRate() {
            when(applicationRepository.countByUserId(userId)).thenReturn(10L);
            when(applicationRepository.countByUserIdAndCreatedAtBetween(any(), any(), any())).thenReturn(0L);
            when(applicationRepository.countByStage(userId)).thenReturn(List.of());
            when(applicationRepository.countByCompany(userId)).thenReturn(List.of());
            when(applicationRepository.countByUserIdAndStage(eq(userId), eq(Application.Stage.OFFER))).thenReturn(2L);
            when(applicationRepository.countByUserIdAndStage(eq(userId), eq(Application.Stage.SAVED))).thenReturn(3L);
            when(applicationRepository.findRecentByUserId(userId)).thenReturn(List.of());

            when(resumeRepository.countByUserId(userId)).thenReturn(0L);
            when(resumeRepository.countByUserIdAndIsActiveTrue(userId)).thenReturn(0L);
            when(resumeRepository.averageAtsScoreByUserId(userId)).thenReturn(null);
            when(resumeRepository.maxAtsScoreByUserId(userId)).thenReturn(null);
            when(resumeRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of());

            when(jobDescriptionRepository.countByUserId(userId)).thenReturn(0L);
            when(jobDescriptionRepository.averageMatchScoreByUserId(userId)).thenReturn(null);
            when(jobDescriptionRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of());

            when(interviewRepository.countByUserId(userId)).thenReturn(0L);
            when(interviewRepository.averageScoreByUserId(userId)).thenReturn(null);
            when(interviewRepository.findScoresWithDatesByUserId(userId)).thenReturn(List.of());
            when(interviewRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of());

            when(coverLetterRepository.countByUserId(userId)).thenReturn(0L);
            when(coverLetterRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of());

            AnalyticsResponse response = analyticsService.getDashboardAnalytics(userId);

            double expected = (double) 2 / (10 - 3) * 100;
            assertThat(response.getApplications().getSuccessRate())
                    .isEqualTo(Math.round(expected * 10.0) / 10.0);
        }

        @Test
        @DisplayName("Should aggregate recent activity from all entity types sorted by timestamp")
        void shouldAggregateRecentActivity() {
            when(applicationRepository.countByUserId(userId)).thenReturn(0L);
            when(applicationRepository.countByUserIdAndCreatedAtBetween(any(), any(), any())).thenReturn(0L);
            when(applicationRepository.countByStage(userId)).thenReturn(List.of());
            when(applicationRepository.countByCompany(userId)).thenReturn(List.of());
            when(applicationRepository.countByUserIdAndStage(any(), any())).thenReturn(0L);
            when(applicationRepository.findRecentByUserId(userId)).thenReturn(List.of(testApp));

            when(resumeRepository.countByUserId(userId)).thenReturn(0L);
            when(resumeRepository.countByUserIdAndIsActiveTrue(userId)).thenReturn(0L);
            when(resumeRepository.averageAtsScoreByUserId(userId)).thenReturn(null);
            when(resumeRepository.maxAtsScoreByUserId(userId)).thenReturn(null);
            when(resumeRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of(testResume));

            when(jobDescriptionRepository.countByUserId(userId)).thenReturn(0L);
            when(jobDescriptionRepository.averageMatchScoreByUserId(userId)).thenReturn(null);
            when(jobDescriptionRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of(testJd));

            when(interviewRepository.countByUserId(userId)).thenReturn(0L);
            when(interviewRepository.averageScoreByUserId(userId)).thenReturn(null);
            when(interviewRepository.findScoresWithDatesByUserId(userId)).thenReturn(List.of());
            when(interviewRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of(testSession));

            when(coverLetterRepository.countByUserId(userId)).thenReturn(0L);
            when(coverLetterRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of(testCl));

            AnalyticsResponse response = analyticsService.getDashboardAnalytics(userId);

            assertThat(response.getRecentActivity()).isNotEmpty();
            assertThat(response.getRecentActivity()).allMatch(a -> a.getType() != null);
            assertThat(response.getRecentActivity()).allMatch(a -> a.getTimestamp() != null);

            for (int i = 0; i < response.getRecentActivity().size() - 1; i++) {
                assertThat(response.getRecentActivity().get(i).getTimestamp())
                        .isAfterOrEqualTo(response.getRecentActivity().get(i + 1).getTimestamp());
            }
        }

        @Test
        @DisplayName("Should handle unparseable extracted skills gracefully")
        void shouldHandleUnparseableSkills() throws Exception {
            testJd.setExtractedSkills("invalid json");

            when(applicationRepository.countByUserId(userId)).thenReturn(0L);
            when(applicationRepository.countByUserIdAndCreatedAtBetween(any(), any(), any())).thenReturn(0L);
            when(applicationRepository.countByStage(userId)).thenReturn(List.of());
            when(applicationRepository.countByCompany(userId)).thenReturn(List.of());
            when(applicationRepository.countByUserIdAndStage(any(), any())).thenReturn(0L);
            when(applicationRepository.findRecentByUserId(userId)).thenReturn(List.of());

            when(resumeRepository.countByUserId(userId)).thenReturn(0L);
            when(resumeRepository.countByUserIdAndIsActiveTrue(userId)).thenReturn(0L);
            when(resumeRepository.averageAtsScoreByUserId(userId)).thenReturn(null);
            when(resumeRepository.maxAtsScoreByUserId(userId)).thenReturn(null);
            when(resumeRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of());

            when(jobDescriptionRepository.countByUserId(userId)).thenReturn(1L);
            when(jobDescriptionRepository.averageMatchScoreByUserId(userId)).thenReturn(null);
            when(jobDescriptionRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of(testJd));
            when(objectMapper.readValue(eq("invalid json"), any(com.fasterxml.jackson.core.type.TypeReference.class)))
                    .thenThrow(new RuntimeException("Parse error"));

            when(interviewRepository.countByUserId(userId)).thenReturn(0L);
            when(interviewRepository.averageScoreByUserId(userId)).thenReturn(null);
            when(interviewRepository.findScoresWithDatesByUserId(userId)).thenReturn(List.of());
            when(interviewRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of());

            when(coverLetterRepository.countByUserId(userId)).thenReturn(0L);
            when(coverLetterRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of());

            AnalyticsResponse response = analyticsService.getDashboardAnalytics(userId);

            assertThat(response.getJobDescriptions().getTopSkills()).isEmpty();
        }
    }
}
