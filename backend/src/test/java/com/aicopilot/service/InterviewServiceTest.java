package com.aicopilot.service;

import com.aicopilot.ai.service.InterviewAiService;
import com.aicopilot.ai.service.InterviewAiService.InterviewResponse;
import com.aicopilot.dto.InterviewDtos.*;
import com.aicopilot.dto.MatchDtos.MatchResult;
import com.aicopilot.entity.*;
import com.aicopilot.entity.JobDescription.AnalysisStatus;
import com.aicopilot.entity.Resume.ParsingStatus;
import com.aicopilot.exception.AppException;
import com.aicopilot.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InterviewServiceTest {

    @Mock private InterviewRepository interviewRepository;
    @Mock private ResumeRepository resumeRepository;
    @Mock private JobDescriptionRepository jobDescriptionRepository;
    @Mock private UserRepository userRepository;
    @Mock private MatchService matchService;
    @Mock private RecommendationService recommendationService;
    @Mock private InterviewAiService interviewAiService;
    @Mock private InterviewValidator interviewValidator;

    @InjectMocks
    private InterviewService interviewService;

    private UUID userId;
    private UUID resumeId;
    private UUID jdId;
    private UUID sessionId;
    private User testUser;
    private Resume testResume;
    private JobDescription testJd;
    private InterviewSession testSession;

    private String resumeJson;
    private String jdJson;
    private String questionsJson;
    private String scoreJson;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        resumeId = UUID.randomUUID();
        jdId = UUID.randomUUID();
        sessionId = UUID.randomUUID();

        testUser = User.builder()
                .id(userId)
                .email("test@example.com")
                .fullName("Test User")
                .build();

        testResume = Resume.builder()
                .id(resumeId)
                .user(testUser)
                .name("Test Resume")
                .parsingStatus(ParsingStatus.PARSED)
                .build();

        testJd = JobDescription.builder()
                .id(jdId)
                .user(testUser)
                .title("Software Engineer")
                .company("Acme Corp")
                .analysisStatus(AnalysisStatus.ANALYZED)
                .build();

        testSession = InterviewSession.builder()
                .id(sessionId)
                .user(testUser)
                .resume(testResume)
                .jobDescription(testJd)
                .title("Test Session")
                .sessionType("MOCK")
                .difficulty("medium")
                .status("IN_PROGRESS")
                .questionCount(2)
                .answeredCount(0)
                .build();

        resumeJson = """
                {"skills": ["Java", "Spring"], "experience": [{"title":"Dev","company":"C"}],
                 "education": [{"degree":"BS","field":"CS"}], "certifications":[]}
                """;

        jdJson = """
                {"basicInfo": {"title":"Engineer","seniority":"mid","company":"Acme Corp"},
                 "skills": {"required":["Java"],"preferred":[],"niceToHave":[]},
                 "qualifications": {"experienceYears":2,"education":"BS"}}
                """;

        questionsJson = """
                {"questions": [
                    {"id":"q1","category":"TECHNICAL","difficulty":"MEDIUM","question":"What is Java?",
                     "suggestedAnswer":"Java is a language","keyPoints":["OOP"],"estimatedTime":"5 min"},
                    {"id":"q2","category":"BEHAVIORAL","difficulty":"MEDIUM","question":"Tell me about yourself",
                     "suggestedAnswer":"I am a developer","keyPoints":["Experience"],"estimatedTime":"3 min"}
                ]}
                """;

        scoreJson = """
                {"overallScore":80,"relevanceScore":75,"clarityScore":85,"completenessScore":80,
                 "strengths":["Good"],"improvements":["More detail"]}
                """;
    }

    @Nested
    @DisplayName("Generate and Save")
    class GenerateAndSave {

        @Test
        @DisplayName("should generate interview session successfully")
        void shouldGenerateSuccessfully() {
            testResume.setStructuredData(resumeJson);
            testJd.setStructuredData(jdJson);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(jobDescriptionRepository.findById(jdId)).thenReturn(Optional.of(testJd));
            when(matchService.matchResumeToJob(resumeId, jdId, userId))
                    .thenReturn(MatchResult.builder().atsScore(75).matchedSkills(List.of("Java")).missingSkills(List.of()).build());
            when(recommendationService.generateReport(resumeId, jdId, userId)).thenReturn(null);
            when(interviewAiService.generate(any(), any(), any(), any(), anyInt(), anyString(), anyString(),
                    anyInt(), anyString(), anyString(), anyString(), anyString(), any(), any())).thenReturn(InterviewResponse.success(questionsJson));
            when(interviewRepository.save(any(InterviewSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

            SessionDetail detail = interviewService.generateAndSave(resumeId, jdId, userId, "medium", 2, "My Session");

            assertThat(detail).isNotNull();
            assertThat(detail.getTitle()).isEqualTo("My Session");
            verify(interviewRepository).save(any(InterviewSession.class));
        }

        @Test
        @DisplayName("should generate session without JD")
        void shouldGenerateWithoutJd() {
            testResume.setStructuredData(resumeJson);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(interviewAiService.generate(any(), any(), any(), any(), anyInt(), anyString(), anyString(),
                    anyInt(), anyString(), anyString(), anyString(), anyString(), any(), any())).thenReturn(InterviewResponse.success(questionsJson));
            when(interviewRepository.save(any(InterviewSession.class))).thenReturn(testSession);

            SessionDetail detail = interviewService.generateAndSave(resumeId, null, userId, "easy", 2, null);

            assertThat(detail).isNotNull();
            verify(jobDescriptionRepository, never()).findById(any());
        }

        @Test
        @DisplayName("should use default title when title is null and no JD")
        void shouldUseDefaultTitleWhenNoTitleAndNoJd() {
            testResume.setStructuredData(resumeJson);
            testSession.setTitle("Interview for Position");

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(interviewAiService.generate(any(), any(), any(), any(), anyInt(), anyString(), anyString(),
                    anyInt(), anyString(), anyString(), anyString(), anyString(), any(), any())).thenReturn(InterviewResponse.success(questionsJson));
            when(interviewRepository.save(any(InterviewSession.class))).thenReturn(testSession);

            SessionDetail detail = interviewService.generateAndSave(resumeId, null, userId, "medium", 3, null);

            assertThat(detail).isNotNull();
        }

        @Test
        @DisplayName("should throw when AI generation fails")
        void shouldThrowWhenAiFails() {
            testResume.setStructuredData(resumeJson);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(interviewAiService.generate(any(), any(), any(), any(), anyInt(), anyString(), anyString(),
                    anyInt(), anyString(), anyString(), anyString(), anyString(), any(), any()))
                    .thenReturn(InterviewResponse.failure("AI error"));

            assertThatThrownBy(() -> interviewService.generateAndSave(resumeId, null, userId, "medium", 2, null))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Interview generation failed");
        }

        @Test
        @DisplayName("should throw when resume not parsed")
        void shouldThrowWhenResumeNotParsed() {
            testResume.setParsingStatus(ParsingStatus.PENDING);
            testResume.setStructuredData(resumeJson);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));

            assertThatThrownBy(() -> interviewService.generateAndSave(resumeId, null, userId, "medium", 2, null))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Resume must be parsed");
        }

        @Test
        @DisplayName("should throw when resume structured data is null")
        void shouldThrowWhenResumeDataNull() {
            testResume.setStructuredData(null);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));

            assertThatThrownBy(() -> interviewService.generateAndSave(resumeId, null, userId, "medium", 2, null))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Resume structured data is missing");
        }

        @Test
        @DisplayName("should enforce resume ownership")
        void shouldEnforceResumeOwnership() {
            UUID otherUserId = UUID.randomUUID();
            Resume otherResume = Resume.builder()
                    .id(UUID.randomUUID())
                    .user(User.builder().id(otherUserId).build())
                    .parsingStatus(ParsingStatus.PARSED)
                    .structuredData(resumeJson)
                    .build();

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(otherResume));

            assertThatThrownBy(() -> interviewService.generateAndSave(resumeId, null, userId, "medium", 2, null))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Access denied");
        }

        @Test
        @DisplayName("should enforce JD ownership")
        void shouldEnforceJdOwnership() {
            UUID otherUserId = UUID.randomUUID();
            JobDescription otherJd = JobDescription.builder()
                    .id(UUID.randomUUID())
                    .user(User.builder().id(otherUserId).build())
                    .structuredData(jdJson)
                    .build();

            testResume.setStructuredData(resumeJson);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(jobDescriptionRepository.findById(jdId)).thenReturn(Optional.of(otherJd));

            assertThatThrownBy(() -> interviewService.generateAndSave(resumeId, jdId, userId, "medium", 2, null))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Access denied");
        }

        @Test
        @DisplayName("should throw when resume not found")
        void shouldThrowWhenResumeNotFound() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> interviewService.generateAndSave(resumeId, null, userId, "medium", 2, null))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Resume not found");
        }

        @Test
        @DisplayName("should throw when user not found")
        void shouldThrowWhenUserNotFound() {
            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> interviewService.generateAndSave(resumeId, null, userId, "medium", 2, null))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("User not found");
        }

        @Test
        @DisplayName("should handle hard difficulty category mix")
        void shouldHandleHardDifficulty() {
            testResume.setStructuredData(resumeJson);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(interviewAiService.generate(any(), any(), any(), any(), anyInt(), anyString(), anyString(),
                    anyInt(), eq("hard"), anyString(), anyString(), anyString(), any(), any())).thenReturn(InterviewResponse.success(questionsJson));
            when(interviewRepository.save(any(InterviewSession.class))).thenReturn(testSession);

            interviewService.generateAndSave(resumeId, null, userId, "hard", 3, null);

            verify(interviewAiService).generate(any(), any(), any(), any(), anyInt(), anyString(), anyString(),
                    anyInt(), eq("hard"), anyString(), anyString(), anyString(), contains("70% TECHNICAL"), any());
        }
    }

    @Nested
    @DisplayName("Submit Answers")
    class SubmitAnswers {

        @Test
        @DisplayName("should score answers successfully")
        void shouldScoreAnswers() {
            testSession.setQuestions(questionsJson);

            when(interviewRepository.findByIdAndUserId(sessionId, userId)).thenReturn(Optional.of(testSession));
            when(interviewAiService.score(anyString(), anyString(), anyString(), anyString()))
                    .thenReturn(InterviewAiService.ScoreResponse.success(scoreJson));
            when(interviewRepository.save(any(InterviewSession.class))).thenReturn(testSession);

            ScoreRequest request = ScoreRequest.builder()
                    .answers(List.of(
                            UserAnswer.builder().questionId("q1").answer("My Java answer").build(),
                            UserAnswer.builder().questionId("q2").answer("My behavioral answer").build()
                    ))
                    .build();

            ScoreResponse response = interviewService.submitAnswers(sessionId, userId, request);

            assertThat(response).isNotNull();
            assertThat(response.getFeedback()).hasSize(2);
            assertThat(response.getOverallScore()).isEqualTo(80);
            assertThat(response.getFeedback().get(0).getQuestionId()).isEqualTo("q1");

            ArgumentCaptor<InterviewSession> captor = ArgumentCaptor.forClass(InterviewSession.class);
            verify(interviewRepository).save(captor.capture());
            InterviewSession saved = captor.getValue();
            assertThat(saved.getStatus()).isEqualTo("COMPLETED");
            assertThat(saved.getAnsweredCount()).isEqualTo(2);
        }

        @Test
        @DisplayName("should compute average across all feedback")
        void shouldComputeAverageScore() {
            testSession.setQuestions(questionsJson);

            when(interviewRepository.findByIdAndUserId(sessionId, userId)).thenReturn(Optional.of(testSession));
            String scoreJsonHigh = """
                    {"overallScore":100,"relevanceScore":90,"clarityScore":95,"completenessScore":95,"strengths":[],"improvements":[]}
                    """;
            String scoreJsonLow = """
                    {"overallScore":60,"relevanceScore":50,"clarityScore":55,"completenessScore":50,"strengths":[],"improvements":[]}
                    """;
            when(interviewAiService.score(anyString(), anyString(), anyString(), anyString()))
                    .thenReturn(InterviewAiService.ScoreResponse.success(scoreJsonHigh))
                    .thenReturn(InterviewAiService.ScoreResponse.success(scoreJsonLow));
            when(interviewRepository.save(any(InterviewSession.class))).thenReturn(testSession);

            ScoreRequest request = ScoreRequest.builder()
                    .answers(List.of(
                            UserAnswer.builder().questionId("q1").answer("A1").build(),
                            UserAnswer.builder().questionId("q2").answer("A2").build()
                    ))
                    .build();

            ScoreResponse response = interviewService.submitAnswers(sessionId, userId, request);

            assertThat(response.getOverallScore()).isEqualTo(80);
        }

        @Test
        @DisplayName("should skip unknown question IDs")
        void shouldSkipUnknownQuestions() {
            testSession.setQuestions(questionsJson);

            when(interviewRepository.findByIdAndUserId(sessionId, userId)).thenReturn(Optional.of(testSession));
            when(interviewAiService.score(anyString(), anyString(), anyString(), anyString()))
                    .thenReturn(InterviewAiService.ScoreResponse.success(scoreJson));
            when(interviewRepository.save(any(InterviewSession.class))).thenReturn(testSession);

            ScoreRequest request = ScoreRequest.builder()
                    .answers(List.of(
                            UserAnswer.builder().questionId("q1").answer("A1").build(),
                            UserAnswer.builder().questionId("unknown_q").answer("A2").build()
                    ))
                    .build();

            ScoreResponse response = interviewService.submitAnswers(sessionId, userId, request);

            assertThat(response.getFeedback()).hasSize(1);
        }

        @Test
        @DisplayName("should throw when session not found")
        void shouldThrowWhenSessionNotFound() {
            when(interviewRepository.findByIdAndUserId(sessionId, userId)).thenReturn(Optional.empty());

            ScoreRequest request = ScoreRequest.builder()
                    .answers(List.of(UserAnswer.builder().questionId("q1").answer("A1").build()))
                    .build();

            assertThatThrownBy(() -> interviewService.submitAnswers(sessionId, userId, request))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Interview session not found");
        }

        @Test
        @DisplayName("should throw when session not in progress")
        void shouldThrowWhenNotInProgress() {
            testSession.setStatus("COMPLETED");

            when(interviewRepository.findByIdAndUserId(sessionId, userId)).thenReturn(Optional.of(testSession));

            ScoreRequest request = ScoreRequest.builder()
                    .answers(List.of(UserAnswer.builder().questionId("q1").answer("A1").build()))
                    .build();

            assertThatThrownBy(() -> interviewService.submitAnswers(sessionId, userId, request))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("not in progress");
        }

        @Test
        @DisplayName("should throw when questions are null")
        void shouldThrowWhenQuestionsNull() {
            testSession.setQuestions(null);

            when(interviewRepository.findByIdAndUserId(sessionId, userId)).thenReturn(Optional.of(testSession));

            ScoreRequest request = ScoreRequest.builder()
                    .answers(List.of(UserAnswer.builder().questionId("q1").answer("A1").build()))
                    .build();

            assertThatThrownBy(() -> interviewService.submitAnswers(sessionId, userId, request))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("has no questions");
        }
    }

    @Nested
    @DisplayName("List Sessions")
    class ListSessions {

        @Test
        @DisplayName("should return list of sessions")
        void shouldReturnSessions() {
            when(interviewRepository.findByUserIdOrderByCreatedAtDesc(userId))
                    .thenReturn(List.of(testSession));

            List<SessionListItem> items = interviewService.listSessions(userId);

            assertThat(items).hasSize(1);
            assertThat(items.get(0).getTitle()).isEqualTo("Test Session");
        }

        @Test
        @DisplayName("should return empty list when no sessions")
        void shouldReturnEmptyWhenNone() {
            when(interviewRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of());

            List<SessionListItem> items = interviewService.listSessions(userId);

            assertThat(items).isEmpty();
        }
    }

    @Nested
    @DisplayName("Get Session")
    class GetSession {

        @Test
        @DisplayName("should return session for owner")
        void shouldReturnForOwner() {
            when(interviewRepository.findByIdAndUserId(sessionId, userId)).thenReturn(Optional.of(testSession));

            SessionDetail detail = interviewService.getSession(sessionId, userId);

            assertThat(detail).isNotNull();
            assertThat(detail.getId()).isEqualTo(sessionId);
        }

        @Test
        @DisplayName("should throw when session not found")
        void shouldThrowWhenNotFound() {
            when(interviewRepository.findByIdAndUserId(sessionId, userId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> interviewService.getSession(sessionId, userId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Interview session not found");
        }
    }

    @Nested
    @DisplayName("Delete Session")
    class DeleteSession {

        @Test
        @DisplayName("should delete session successfully")
        void shouldDeleteSession() {
            when(interviewRepository.findByIdAndUserId(sessionId, userId)).thenReturn(Optional.of(testSession));

            interviewService.deleteSession(sessionId, userId);

            verify(interviewRepository).delete(testSession);
        }

        @Test
        @DisplayName("should throw when session not found")
        void shouldThrowWhenNotFound() {
            when(interviewRepository.findByIdAndUserId(sessionId, userId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> interviewService.deleteSession(sessionId, userId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Interview session not found");
        }
    }
}
