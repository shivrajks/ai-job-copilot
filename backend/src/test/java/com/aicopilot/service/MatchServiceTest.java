package com.aicopilot.service;

import com.aicopilot.dto.MatchDtos.CategoryBreakdown;
import com.aicopilot.dto.MatchDtos.MatchResult;
import com.aicopilot.entity.JobDescription;
import com.aicopilot.entity.JobDescription.AnalysisStatus;
import com.aicopilot.entity.Resume;
import com.aicopilot.entity.Resume.ParsingStatus;
import com.aicopilot.entity.User;
import com.aicopilot.exception.AppException;
import com.aicopilot.repository.JobDescriptionRepository;
import com.aicopilot.repository.ResumeRepository;
import com.aicopilot.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MatchServiceTest {

    @Mock private ResumeRepository resumeRepository;
    @Mock private JobDescriptionRepository jobDescriptionRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private MatchService matchService;

    private UUID userId;
    private UUID resumeId;
    private UUID jdId;
    private User testUser;
    private Resume testResume;
    private JobDescription testJd;

    private String resumeJson;
    private String jdJson;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        resumeId = UUID.randomUUID();
        jdId = UUID.randomUUID();

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

        resumeJson = """
                {
                    "skills": ["Java", "Spring", "SQL", "Docker", "AWS"],
                    "experience": [
                        {"title": "Senior Developer", "company": "TechCorp", "startDate": "2020-01", "endDate": "2024-01"},
                        {"title": "Junior Developer", "company": "Startup Inc", "startDate": "2017-03", "endDate": "2019-12"}
                    ],
                    "education": [
                        {"degree": "Bachelor of Science", "field": "Computer Science"}
                    ],
                    "certifications": ["AWS Certified Solutions Architect", "Oracle Certified Professional"]
                }
                """;

        jdJson = """
                {
                    "basicInfo": {"title": "Senior Software Engineer", "seniority": "senior", "company": "Acme Corp"},
                    "skills": {
                        "required": ["Java", "Spring", "SQL", "Kubernetes"],
                        "preferred": ["Docker", "AWS", "Microservices"],
                        "niceToHave": ["GraphQL", "Kafka"]
                    },
                    "qualifications": {
                        "experienceYears": 5,
                        "education": "Bachelor of Science",
                        "certifications": ["AWS Certified Solutions Architect"]
                    }
                }
                """;
    }

    @Nested
    @DisplayName("Match Resume to Job")
    class MatchResumeToJob {

        @Test
        @DisplayName("should compute full match successfully")
        void shouldComputeFullMatch() {
            testResume.setStructuredData(resumeJson);
            testJd.setStructuredData(jdJson);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(jobDescriptionRepository.findById(jdId)).thenReturn(Optional.of(testJd));

            MatchResult result = matchService.matchResumeToJob(resumeId, jdId, userId);

            assertThat(result).isNotNull();
            assertThat(result.getAtsScore()).isBetween(0, 100);
            assertThat(result.getMatchPercentage()).isBetween(0, 100);
            assertThat(result.getCategoryBreakdown()).hasSize(5);
            assertThat(result.getCategoryBreakdown()).containsKeys(
                    "skillMatch", "experienceMatch", "educationMatch", "certificationMatch", "titleMatch");
            assertThat(result.getMatchedSkills()).contains("Java", "Spring", "SQL", "Docker", "AWS");
            assertThat(result.getMissingSkills()).contains("Kubernetes", "Microservices");
            assertThat(result.getStrengths()).isNotEmpty();
        }

        @Test
        @DisplayName("should compute score when no skills match")
        void shouldComputeWhenNoSkillsMatch() {
            testResume.setStructuredData("""
                    {"skills": ["Python", "Rust"], "experience": [], "education": [], "certifications": []}
                    """);
            testJd.setStructuredData(jdJson);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(jobDescriptionRepository.findById(jdId)).thenReturn(Optional.of(testJd));

            MatchResult result = matchService.matchResumeToJob(resumeId, jdId, userId);

            assertThat(result.getMatchedSkills()).isEmpty();
            assertThat(result.getMissingSkills()).contains("Java", "Spring", "SQL", "Kubernetes");
        }

        @Test
        @DisplayName("should handle all skills matched")
        void shouldHandleAllSkillsMatched() {
            testResume.setStructuredData("""
                    {"skills": ["Java", "Spring", "SQL", "Kubernetes", "Docker", "AWS", "Microservices", "GraphQL", "Kafka"],
                     "experience": [{"title": "Senior Dev", "company": "C", "startDate": "2020-01", "endDate": "2024-01"}],
                     "education": [{"degree": "Bachelor", "field": "CS"}],
                     "certifications": ["AWS Certified Solutions Architect"]}
                    """);
            testJd.setStructuredData(jdJson);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(jobDescriptionRepository.findById(jdId)).thenReturn(Optional.of(testJd));

            MatchResult result = matchService.matchResumeToJob(resumeId, jdId, userId);

            assertThat(result.getMatchedSkills()).hasSizeGreaterThanOrEqualTo(4);
            assertThat(result.getMissingSkills()).isEmpty();
        }

        @Test
        @DisplayName("should throw when resume not parsed")
        void shouldThrowWhenResumeNotParsed() {
            testResume.setParsingStatus(ParsingStatus.PENDING);
            testResume.setStructuredData(resumeJson);
            testJd.setStructuredData(jdJson);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(jobDescriptionRepository.findById(jdId)).thenReturn(Optional.of(testJd));

            assertThatThrownBy(() -> matchService.matchResumeToJob(resumeId, jdId, userId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Resume must be parsed");
        }

        @Test
        @DisplayName("should throw when JD not analyzed")
        void shouldThrowWhenJdNotAnalyzed() {
            testResume.setStructuredData(resumeJson);
            testJd.setStructuredData(jdJson);
            testJd.setAnalysisStatus(AnalysisStatus.PENDING);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(jobDescriptionRepository.findById(jdId)).thenReturn(Optional.of(testJd));

            assertThatThrownBy(() -> matchService.matchResumeToJob(resumeId, jdId, userId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Job description must be analyzed");
        }

        @Test
        @DisplayName("should throw when structured data is missing")
        void shouldThrowWhenStructuredDataMissing() {
            testResume.setStructuredData(null);
            testJd.setStructuredData(jdJson);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(jobDescriptionRepository.findById(jdId)).thenReturn(Optional.of(testJd));

            assertThatThrownBy(() -> matchService.matchResumeToJob(resumeId, jdId, userId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Structured data is missing");
        }

        @Test
        @DisplayName("should throw when structured data is unparseable")
        void shouldThrowWhenStructuredDataUnparseable() {
            testResume.setStructuredData("not valid json");
            testJd.setStructuredData(jdJson);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(jobDescriptionRepository.findById(jdId)).thenReturn(Optional.of(testJd));

            assertThatThrownBy(() -> matchService.matchResumeToJob(resumeId, jdId, userId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Structured data is missing");
        }

        @Test
        @DisplayName("should enforce resume ownership")
        void shouldEnforceResumeOwnership() {
            UUID otherUserId = UUID.randomUUID();
            User otherUser = User.builder().id(otherUserId).email("other@example.com").build();
            Resume otherResume = Resume.builder()
                    .id(UUID.randomUUID())
                    .user(otherUser)
                    .parsingStatus(ParsingStatus.PARSED)
                    .structuredData(resumeJson)
                    .build();

            testJd.setStructuredData(jdJson);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(otherResume));
            when(jobDescriptionRepository.findById(jdId)).thenReturn(Optional.of(testJd));

            assertThatThrownBy(() -> matchService.matchResumeToJob(resumeId, jdId, userId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Access denied");
        }

        @Test
        @DisplayName("should enforce JD ownership")
        void shouldEnforceJdOwnership() {
            UUID otherUserId = UUID.randomUUID();
            User otherUser = User.builder().id(otherUserId).email("other@example.com").build();
            JobDescription otherJd = JobDescription.builder()
                    .id(UUID.randomUUID())
                    .user(otherUser)
                    .analysisStatus(AnalysisStatus.ANALYZED)
                    .structuredData(jdJson)
                    .build();

            testResume.setStructuredData(resumeJson);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(jobDescriptionRepository.findById(jdId)).thenReturn(Optional.of(otherJd));

            assertThatThrownBy(() -> matchService.matchResumeToJob(resumeId, jdId, userId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Access denied");
        }

        @Test
        @DisplayName("should throw when resume not found")
        void shouldThrowWhenResumeNotFound() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> matchService.matchResumeToJob(resumeId, jdId, userId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Resume not found");
        }

        @Test
        @DisplayName("should throw when JD not found")
        void shouldThrowWhenJdNotFound() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(jobDescriptionRepository.findById(jdId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> matchService.matchResumeToJob(resumeId, jdId, userId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Job description not found");
        }

        @Test
        @DisplayName("should throw when user not found")
        void shouldThrowWhenUserNotFound() {
            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> matchService.matchResumeToJob(resumeId, jdId, userId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("User not found");
        }
    }

    @Nested
    @DisplayName("Education Matching")
    class EducationMatching {

        @Test
        @DisplayName("should give 100% when resume meets education requirement")
        void shouldScore100WhenMeetsRequirement() {
            testResume.setStructuredData("""
                    {"skills": [], "experience": [], "education": [{"degree": "Master of Science", "field": "CS"}],
                     "certifications": []}
                    """);
            testJd.setStructuredData("""
                    {"skills": {"required": [], "preferred": [], "niceToHave": []},
                     "qualifications": {"education": "Bachelor of Science", "experienceYears": 0},
                     "basicInfo": {"seniority": "entry"}}
                    """);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(jobDescriptionRepository.findById(jdId)).thenReturn(Optional.of(testJd));

            MatchResult result = matchService.matchResumeToJob(resumeId, jdId, userId);

            CategoryBreakdown edu = result.getCategoryBreakdown().get("educationMatch");
            assertThat(edu.getScore()).isEqualTo(100);
        }

        @Test
        @DisplayName("should give 60% when one level below requirement")
        void shouldScore60WhenOneLevelBelow() {
            testResume.setStructuredData("""
                    {"skills": [], "experience": [],
                     "education": [{"degree": "Bachelor", "field": "Arts"}],
                     "certifications": []}
                    """);
            testJd.setStructuredData("""
                    {"skills": {"required": [], "preferred": [], "niceToHave": []},
                     "qualifications": {"education": "Master of Science", "experienceYears": 0},
                     "basicInfo": {"seniority": "entry"}}
                    """);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(jobDescriptionRepository.findById(jdId)).thenReturn(Optional.of(testJd));

            MatchResult result = matchService.matchResumeToJob(resumeId, jdId, userId);

            CategoryBreakdown edu = result.getCategoryBreakdown().get("educationMatch");
            assertThat(edu.getScore()).isEqualTo(60);
        }

        @Test
        @DisplayName("should give 30% when significantly below requirement")
        void shouldScore30WhenBelow() {
            testResume.setStructuredData("""
                    {"skills": [], "experience": [],
                     "education": [{"degree": "Associate", "field": "Arts"}],
                     "certifications": []}
                    """);
            testJd.setStructuredData("""
                    {"skills": {"required": [], "preferred": [], "niceToHave": []},
                     "qualifications": {"education": "PhD", "experienceYears": 0},
                     "basicInfo": {"seniority": "entry"}}
                    """);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(jobDescriptionRepository.findById(jdId)).thenReturn(Optional.of(testJd));

            MatchResult result = matchService.matchResumeToJob(resumeId, jdId, userId);

            CategoryBreakdown edu = result.getCategoryBreakdown().get("educationMatch");
            assertThat(edu.getScore()).isEqualTo(30);
        }

        @Test
        @DisplayName("should give 100% when no education requirement")
        void shouldScore100WhenNoRequirement() {
            testResume.setStructuredData("""
                    {"skills": [], "experience": [], "education": [], "certifications": []}
                    """);
            testJd.setStructuredData("""
                    {"skills": {"required": [], "preferred": [], "niceToHave": []},
                     "qualifications": {"experienceYears": 0},
                     "basicInfo": {"seniority": "entry"}}
                    """);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(jobDescriptionRepository.findById(jdId)).thenReturn(Optional.of(testJd));

            MatchResult result = matchService.matchResumeToJob(resumeId, jdId, userId);

            CategoryBreakdown edu = result.getCategoryBreakdown().get("educationMatch");
            assertThat(edu.getScore()).isEqualTo(100);
        }

        @Test
        @DisplayName("should give 100% when education field is blank")
        void shouldScore100WhenEducationBlank() {
            testResume.setStructuredData("""
                    {"skills": [], "experience": [], "education": [], "certifications": []}
                    """);
            testJd.setStructuredData("""
                    {"skills": {"required": [], "preferred": [], "niceToHave": []},
                     "qualifications": {"education": "", "experienceYears": 0},
                     "basicInfo": {"seniority": "entry"}}
                    """);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(jobDescriptionRepository.findById(jdId)).thenReturn(Optional.of(testJd));

            MatchResult result = matchService.matchResumeToJob(resumeId, jdId, userId);

            CategoryBreakdown edu = result.getCategoryBreakdown().get("educationMatch");
            assertThat(edu.getScore()).isEqualTo(100);
        }
    }

    @Nested
    @DisplayName("Experience Matching")
    class ExperienceMatching {

        @Test
        @DisplayName("should give 100% when experience meets requirement")
        void shouldScore100WhenMeetsRequirement() {
            testResume.setStructuredData("""
                    {"skills": [], "experience": [
                        {"title": "Dev", "company": "C", "startDate": "2019-01", "endDate": "2024-01"}
                    ], "education": [], "certifications": []}
                    """);
            testJd.setStructuredData("""
                    {"skills": {"required": [], "preferred": [], "niceToHave": []},
                     "qualifications": {"experienceYears": 3},
                     "basicInfo": {"seniority": "mid"}}
                    """);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(jobDescriptionRepository.findById(jdId)).thenReturn(Optional.of(testJd));

            MatchResult result = matchService.matchResumeToJob(resumeId, jdId, userId);

            CategoryBreakdown exp = result.getCategoryBreakdown().get("experienceMatch");
            assertThat(exp.getScore()).isGreaterThanOrEqualTo(100);
        }

        @Test
        @DisplayName("should give less than 100% when experience is partial")
        void shouldScorePartialWhenUnderRequirement() {
            testResume.setStructuredData("""
                    {"skills": [], "experience": [
                        {"title": "Dev", "company": "C", "startDate": "2022-01", "endDate": "2024-01"}
                    ], "education": [], "certifications": []}
                    """);
            testJd.setStructuredData("""
                    {"skills": {"required": [], "preferred": [], "niceToHave": []},
                     "qualifications": {"experienceYears": 10},
                     "basicInfo": {"seniority": "senior"}}
                    """);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(jobDescriptionRepository.findById(jdId)).thenReturn(Optional.of(testJd));

            MatchResult result = matchService.matchResumeToJob(resumeId, jdId, userId);

            CategoryBreakdown exp = result.getCategoryBreakdown().get("experienceMatch");
            assertThat(exp.getScore()).isLessThan(100);
        }

        @Test
        @DisplayName("should give 100% when no experience requirement")
        void shouldScore100WhenNoRequirement() {
            testResume.setStructuredData("""
                    {"skills": [], "experience": [], "education": [], "certifications": []}
                    """);
            testJd.setStructuredData("""
                    {"skills": {"required": [], "preferred": [], "niceToHave": []},
                     "qualifications": {},
                     "basicInfo": {"seniority": "entry"}}
                    """);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(jobDescriptionRepository.findById(jdId)).thenReturn(Optional.of(testJd));

            MatchResult result = matchService.matchResumeToJob(resumeId, jdId, userId);

            CategoryBreakdown exp = result.getCategoryBreakdown().get("experienceMatch");
            assertThat(exp.getScore()).isEqualTo(100);
        }

        @Test
        @DisplayName("should handle overlapping date ranges")
        void shouldHandleOverlappingDates() {
            testResume.setStructuredData("""
                    {"skills": [], "experience": [
                        {"title": "Dev", "company": "A", "startDate": "2020-01", "endDate": "2023-06"},
                        {"title": "Senior Dev", "company": "B", "startDate": "2022-06", "endDate": "2024-01"}
                    ], "education": [], "certifications": []}
                    """);
            testJd.setStructuredData("""
                    {"skills": {"required": [], "preferred": [], "niceToHave": []},
                     "qualifications": {"experienceYears": 3},
                     "basicInfo": {"seniority": "mid"}}
                    """);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(jobDescriptionRepository.findById(jdId)).thenReturn(Optional.of(testJd));

            MatchResult result = matchService.matchResumeToJob(resumeId, jdId, userId);

            CategoryBreakdown exp = result.getCategoryBreakdown().get("experienceMatch");
            assertThat(exp.getScore()).isGreaterThanOrEqualTo(100);
        }

        @Test
        @DisplayName("should handle experience with present end date")
        void shouldHandlePresentEndDate() {
            testResume.setStructuredData("""
                    {"skills": [], "experience": [
                        {"title": "Dev", "company": "C", "startDate": "2018-01", "endDate": null}
                    ], "education": [], "certifications": []}
                    """);
            testJd.setStructuredData("""
                    {"skills": {"required": [], "preferred": [], "niceToHave": []},
                     "qualifications": {"experienceYears": 5},
                     "basicInfo": {"seniority": "senior"}}
                    """);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(jobDescriptionRepository.findById(jdId)).thenReturn(Optional.of(testJd));

            MatchResult result = matchService.matchResumeToJob(resumeId, jdId, userId);

            CategoryBreakdown exp = result.getCategoryBreakdown().get("experienceMatch");
            assertThat(exp.getScore()).isGreaterThanOrEqualTo(100);
        }
    }

    @Nested
    @DisplayName("Certification Matching")
    class CertificationMatching {

        @Test
        @DisplayName("should give 100% when all certifications matched")
        void shouldScore100WhenAllMatched() {
            testResume.setStructuredData("""
                    {"skills": [], "experience": [], "education": [],
                     "certifications": ["AWS Certified Solutions Architect", "PMP"]}
                    """);
            testJd.setStructuredData("""
                    {"skills": {"required": [], "preferred": [], "niceToHave": []},
                     "qualifications": {"certifications": ["AWS Certified Solutions Architect", "PMP"], "experienceYears": 0},
                     "basicInfo": {"seniority": "entry"}}
                    """);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(jobDescriptionRepository.findById(jdId)).thenReturn(Optional.of(testJd));

            MatchResult result = matchService.matchResumeToJob(resumeId, jdId, userId);

            CategoryBreakdown cert = result.getCategoryBreakdown().get("certificationMatch");
            assertThat(cert.getScore()).isEqualTo(100);
        }

        @Test
        @DisplayName("should give 100% when no certifications required")
        void shouldScore100WhenNoneRequired() {
            testResume.setStructuredData("""
                    {"skills": [], "experience": [], "education": [],
                     "certifications": []}
                    """);
            testJd.setStructuredData("""
                    {"skills": {"required": [], "preferred": [], "niceToHave": []},
                     "qualifications": {"experienceYears": 0},
                     "basicInfo": {"seniority": "entry"}}
                    """);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(jobDescriptionRepository.findById(jdId)).thenReturn(Optional.of(testJd));

            MatchResult result = matchService.matchResumeToJob(resumeId, jdId, userId);

            CategoryBreakdown cert = result.getCategoryBreakdown().get("certificationMatch");
            assertThat(cert.getScore()).isEqualTo(100);
        }

        @Test
        @DisplayName("should give 0% when no certifications matched")
        void shouldScore0WhenNoneMatched() {
            testResume.setStructuredData("""
                    {"skills": [], "experience": [], "education": [],
                     "certifications": ["Some Random Cert"]}
                    """);
            testJd.setStructuredData("""
                    {"skills": {"required": [], "preferred": [], "niceToHave": []},
                     "qualifications": {"certifications": ["PMP", "AWS Certified"], "experienceYears": 0},
                     "basicInfo": {"seniority": "entry"}}
                    """);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(jobDescriptionRepository.findById(jdId)).thenReturn(Optional.of(testJd));

            MatchResult result = matchService.matchResumeToJob(resumeId, jdId, userId);

            CategoryBreakdown cert = result.getCategoryBreakdown().get("certificationMatch");
            assertThat(cert.getScore()).isEqualTo(0);
        }
    }

    @Nested
    @DisplayName("Title/Seniority Matching")
    class TitleMatching {

        @Test
        @DisplayName("should give 100% when seniority meets requirement")
        void shouldScore100WhenMeets() {
            testResume.setStructuredData("""
                    {"skills": [], "experience": [
                        {"title": "Senior Developer", "company": "C", "startDate": "2020-01", "endDate": "2024-01"}
                    ], "education": [], "certifications": []}
                    """);
            testJd.setStructuredData("""
                    {"skills": {"required": [], "preferred": [], "niceToHave": []},
                     "qualifications": {"experienceYears": 0},
                     "basicInfo": {"seniority": "senior"}}
                    """);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(jobDescriptionRepository.findById(jdId)).thenReturn(Optional.of(testJd));

            MatchResult result = matchService.matchResumeToJob(resumeId, jdId, userId);

            CategoryBreakdown title = result.getCategoryBreakdown().get("titleMatch");
            assertThat(title.getScore()).isEqualTo(100);
        }

        @Test
        @DisplayName("should give 60% when close to requirement")
        void shouldScore60WhenClose() {
            testResume.setStructuredData("""
                    {"skills": [], "experience": [
                        {"title": "Mid-level Developer", "company": "C", "startDate": "2020-01", "endDate": "2024-01"}
                    ], "education": [], "certifications": []}
                    """);
            testJd.setStructuredData("""
                    {"skills": {"required": [], "preferred": [], "niceToHave": []},
                     "qualifications": {"experienceYears": 0},
                     "basicInfo": {"seniority": "senior"}}
                    """);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(jobDescriptionRepository.findById(jdId)).thenReturn(Optional.of(testJd));

            MatchResult result = matchService.matchResumeToJob(resumeId, jdId, userId);

            CategoryBreakdown title = result.getCategoryBreakdown().get("titleMatch");
            assertThat(title.getScore()).isEqualTo(60);
        }

        @Test
        @DisplayName("should give 20% when far below requirement")
        void shouldScore20WhenFarBelow() {
            testResume.setStructuredData("""
                    {"skills": [], "experience": [
                        {"title": "Intern", "company": "C", "startDate": "2020-01", "endDate": "2024-01"}
                    ], "education": [], "certifications": []}
                    """);
            testJd.setStructuredData("""
                    {"skills": {"required": [], "preferred": [], "niceToHave": []},
                     "qualifications": {"experienceYears": 0},
                     "basicInfo": {"seniority": "director"}}
                    """);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(jobDescriptionRepository.findById(jdId)).thenReturn(Optional.of(testJd));

            MatchResult result = matchService.matchResumeToJob(resumeId, jdId, userId);

            CategoryBreakdown title = result.getCategoryBreakdown().get("titleMatch");
            assertThat(title.getScore()).isEqualTo(20);
        }

        @Test
        @DisplayName("should give 50% when no experience entries")
        void shouldScore50WhenNoExperience() {
            testResume.setStructuredData("""
                    {"skills": [], "experience": [], "education": [], "certifications": []}
                    """);
            testJd.setStructuredData("""
                    {"skills": {"required": [], "preferred": [], "niceToHave": []},
                     "qualifications": {"experienceYears": 0},
                     "basicInfo": {"seniority": "senior"}}
                    """);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(jobDescriptionRepository.findById(jdId)).thenReturn(Optional.of(testJd));

            MatchResult result = matchService.matchResumeToJob(resumeId, jdId, userId);

            CategoryBreakdown title = result.getCategoryBreakdown().get("titleMatch");
            assertThat(title.getScore()).isEqualTo(50);
        }

        @Test
        @DisplayName("should give 100% when no seniority requirement")
        void shouldScore100WhenNoSeniority() {
            testResume.setStructuredData("""
                    {"skills": [], "experience": [
                        {"title": "Dev", "company": "C", "startDate": "2020-01", "endDate": "2024-01"}
                    ], "education": [], "certifications": []}
                    """);
            testJd.setStructuredData("""
                    {"skills": {"required": [], "preferred": [], "niceToHave": []},
                     "qualifications": {"experienceYears": 0},
                     "basicInfo": {"seniority": ""}}
                    """);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(jobDescriptionRepository.findById(jdId)).thenReturn(Optional.of(testJd));

            MatchResult result = matchService.matchResumeToJob(resumeId, jdId, userId);

            CategoryBreakdown title = result.getCategoryBreakdown().get("titleMatch");
            assertThat(title.getScore()).isEqualTo(100);
        }
    }

    @Nested
    @DisplayName("Strengths and Weaknesses")
    class StrengthsAndWeaknesses {

        @Test
        @DisplayName("should generate strength for strong skill alignment")
        void shouldGenerateSkillStrength() {
            testResume.setStructuredData("""
                    {"skills": ["Java", "Spring", "SQL", "Kubernetes", "Docker", "AWS", "Microservices"],
                     "experience": [{"title": "Senior Dev", "company": "C", "startDate": "2020-01", "endDate": "2024-01"}],
                     "education": [{"degree": "Master", "field": "CS"}],
                     "certifications": ["AWS Certified Solutions Architect"]}
                    """);
            testJd.setStructuredData(jdJson);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(jobDescriptionRepository.findById(jdId)).thenReturn(Optional.of(testJd));

            MatchResult result = matchService.matchResumeToJob(resumeId, jdId, userId);

            assertThat(result.getStrengths()).anyMatch(s -> s.contains("skill alignment"));
        }

        @Test
        @DisplayName("should generate weakness for significant skill gap")
        void shouldGenerateSkillWeakness() {
            testResume.setStructuredData("""
                    {"skills": ["Python"], "experience": [], "education": [], "certifications": []}
                    """);
            testJd.setStructuredData(jdJson);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(jobDescriptionRepository.findById(jdId)).thenReturn(Optional.of(testJd));

            MatchResult result = matchService.matchResumeToJob(resumeId, jdId, userId);

            assertThat(result.getWeaknesses()).anyMatch(w -> w.contains("skill gap"));
        }

        @Test
        @DisplayName("should generate multiple strengths when all categories excel")
        void shouldGenerateMultipleStrengths() {
            testResume.setStructuredData("""
                    {"skills": ["Java", "Spring", "SQL", "Kubernetes", "Docker", "AWS", "Microservices", "GraphQL"],
                     "experience": [{"title": "Senior Dev", "company": "C", "startDate": "2018-01", "endDate": "2024-01"}],
                     "education": [{"degree": "Master of Science", "field": "Computer Science"}],
                     "certifications": ["AWS Certified Solutions Architect", "PMP"]}
                    """);
            testJd.setStructuredData("""
                    {"basicInfo": {"seniority": "senior"},
                     "skills": {"required": ["Java", "Spring", "SQL", "Kubernetes"],
                                "preferred": ["Docker", "AWS"],
                                "niceToHave": ["GraphQL"]},
                     "qualifications": {"experienceYears": 5, "education": "Bachelor of Science",
                                        "certifications": ["AWS Certified Solutions Architect"]}}
                    """);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(jobDescriptionRepository.findById(jdId)).thenReturn(Optional.of(testJd));

            MatchResult result = matchService.matchResumeToJob(resumeId, jdId, userId);

            assertThat(result.getStrengths()).hasSizeGreaterThanOrEqualTo(2);
        }
    }

    @Nested
    @DisplayName("Compute Score (overloaded)")
    class ComputeScore {

        @Test
        @DisplayName("should compute score from JSON strings")
        void shouldComputeFromStrings() {
            int score = matchService.computeScore(resumeJson, jdJson);
            assertThat(score).isBetween(0, 100);
        }

        @Test
        @DisplayName("should return 0 for null resume data")
        void shouldReturn0ForNullResume() {
            int score = matchService.computeScore(null, jdJson);
            assertThat(score).isEqualTo(0);
        }

        @Test
        @DisplayName("should return 0 for unparseable data")
        void shouldReturn0ForUnparseableData() {
            int score = matchService.computeScore("not json", jdJson);
            assertThat(score).isEqualTo(0);
        }

        @Test
        @DisplayName("should return 0 for null JD data")
        void shouldReturn0ForNullJd() {
            int score = matchService.computeScore(resumeJson, null);
            assertThat(score).isEqualTo(0);
        }
    }
}
