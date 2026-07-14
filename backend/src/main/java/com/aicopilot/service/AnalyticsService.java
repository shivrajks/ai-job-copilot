package com.aicopilot.service;

import com.aicopilot.dto.AnalyticsDtos.*;
import com.aicopilot.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final ApplicationRepository applicationRepository;
    private final ResumeRepository resumeRepository;
    private final JobDescriptionRepository jobDescriptionRepository;
    private final InterviewRepository interviewRepository;
    private final CoverLetterRepository coverLetterRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public AnalyticsResponse getDashboardAnalytics(UUID userId) {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atStartOfDay();
        LocalDateTime startOfMonth = today.withDayOfMonth(1).atStartOfDay();

        ApplicationAnalytics appAnalytics = buildApplicationAnalytics(userId, startOfWeek, startOfMonth);
        ResumeAnalytics resumeAnalytics = buildResumeAnalytics(userId);
        JobDescriptionAnalytics jdAnalytics = buildJobDescriptionAnalytics(userId);
        InterviewAnalytics interviewAnalytics = buildInterviewAnalytics(userId);
        CoverLetterAnalytics clAnalytics = buildCoverLetterAnalytics(userId);
        List<RecentActivity> recentActivity = buildRecentActivity(userId);

        return AnalyticsResponse.builder()
                .applications(appAnalytics)
                .resumes(resumeAnalytics)
                .jobDescriptions(jdAnalytics)
                .interviews(interviewAnalytics)
                .coverLetters(clAnalytics)
                .recentActivity(recentActivity)
                .build();
    }

    private ApplicationAnalytics buildApplicationAnalytics(UUID userId, LocalDateTime startOfWeek, LocalDateTime startOfMonth) {
        long total = applicationRepository.countByUserId(userId);
        long appliedThisWeek = applicationRepository.countByUserIdAndCreatedAtBetween(userId, startOfWeek, LocalDateTime.now());
        long appliedThisMonth = applicationRepository.countByUserIdAndCreatedAtBetween(userId, startOfMonth, LocalDateTime.now());

        List<Object[]> stageRaw = applicationRepository.countByStage(userId);
        List<StageCount> byStage = stageRaw.stream()
                .map(row -> StageCount.builder()
                        .stage(row[0] instanceof com.aicopilot.entity.Application.Stage stage ? stage.name() : String.valueOf(row[0]))
                        .count((Long) row[1])
                        .build())
                .collect(Collectors.toList());

        List<Object[]> companyRaw = applicationRepository.countByCompany(userId);
        List<CompanyCount> byCompany = companyRaw.stream()
                .map(row -> CompanyCount.builder()
                        .company((String) row[0])
                        .count((Long) row[1])
                        .build())
                .collect(Collectors.toList());

        long offers = applicationRepository.countByUserIdAndStage(userId, com.aicopilot.entity.Application.Stage.OFFER);
        long nonSaved = total - applicationRepository.countByUserIdAndStage(userId, com.aicopilot.entity.Application.Stage.SAVED);
        double successRate = nonSaved > 0 ? (double) offers / nonSaved * 100.0 : 0.0;

        return ApplicationAnalytics.builder()
                .total(total)
                .appliedThisWeek(appliedThisWeek)
                .appliedThisMonth(appliedThisMonth)
                .byStage(byStage)
                .byCompany(byCompany)
                .successRate(Math.round(successRate * 10.0) / 10.0)
                .build();
    }

    private ResumeAnalytics buildResumeAnalytics(UUID userId) {
        long total = resumeRepository.countByUserId(userId);
        long active = resumeRepository.countByUserIdAndIsActiveTrue(userId);
        Double avgAts = resumeRepository.averageAtsScoreByUserId(userId);
        Integer maxAts = resumeRepository.maxAtsScoreByUserId(userId);

        return ResumeAnalytics.builder()
                .total(total)
                .active(active)
                .averageAtsScore(avgAts != null ? Math.round(avgAts * 10.0) / 10.0 : null)
                .highestAtsScore(maxAts)
                .build();
    }

    private JobDescriptionAnalytics buildJobDescriptionAnalytics(UUID userId) {
        long total = jobDescriptionRepository.countByUserId(userId);
        Double avgMatch = jobDescriptionRepository.averageMatchScoreByUserId(userId);

        List<com.aicopilot.entity.JobDescription> jds = jobDescriptionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        Map<String, Long> skillCounts = new HashMap<>();
        for (com.aicopilot.entity.JobDescription jd : jds) {
            if (jd.getExtractedSkills() != null && !jd.getExtractedSkills().isBlank()) {
                try {
                    List<String> skills = objectMapper.readValue(jd.getExtractedSkills(), new TypeReference<List<String>>() {});
                    for (String skill : skills) {
                        skillCounts.merge(skill, 1L, Long::sum);
                    }
                } catch (Exception e) {
                    log.debug("Failed to parse extractedSkills for JD {}: {}", jd.getId(), e.getMessage());
                }
            }
        }

        List<String> topSkills = skillCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        return JobDescriptionAnalytics.builder()
                .total(total)
                .averageMatchScore(avgMatch != null ? Math.round(avgMatch * 10.0) / 10.0 : null)
                .topSkills(topSkills)
                .build();
    }

    private InterviewAnalytics buildInterviewAnalytics(UUID userId) {
        long total = interviewRepository.countByUserId(userId);
        Double avgScore = interviewRepository.averageScoreByUserId(userId);

        List<Object[]> scoreRaw = interviewRepository.findScoresWithDatesByUserId(userId);
        List<ScoreTrend> scoreTrend = scoreRaw.stream()
                .map(row -> ScoreTrend.builder()
                        .score((Integer) row[0])
                        .date((LocalDateTime) row[1])
                        .build())
                .collect(Collectors.toList());

        return InterviewAnalytics.builder()
                .totalSessions(total)
                .averageScore(avgScore != null ? Math.round(avgScore * 10.0) / 10.0 : null)
                .scoreTrend(scoreTrend)
                .build();
    }

    private CoverLetterAnalytics buildCoverLetterAnalytics(UUID userId) {
        long total = coverLetterRepository.countByUserId(userId);
        return CoverLetterAnalytics.builder()
                .generatedCount(total)
                .build();
    }

    private List<RecentActivity> buildRecentActivity(UUID userId) {
        List<RecentActivity> activities = new ArrayList<>();

        applicationRepository.findRecentByUserId(userId).stream()
                .limit(5)
                .forEach(app -> activities.add(RecentActivity.builder()
                        .type("application")
                        .description("Applied to " + app.getRole() + " at " + app.getCompany())
                        .timestamp(app.getCreatedAt())
                        .entityId(app.getId())
                        .build()));

        resumeRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .limit(5)
                .forEach(r -> activities.add(RecentActivity.builder()
                        .type("resume")
                        .description("Uploaded resume: " + r.getName())
                        .timestamp(r.getCreatedAt())
                        .entityId(r.getId())
                        .build()));

        jobDescriptionRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .limit(5)
                .forEach(jd -> activities.add(RecentActivity.builder()
                        .type("job_description")
                        .description("Added job: " + jd.getTitle() + " at " + jd.getCompany())
                        .timestamp(jd.getCreatedAt())
                        .entityId(jd.getId())
                        .build()));

        interviewRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .limit(5)
                .forEach(i -> activities.add(RecentActivity.builder()
                        .type("interview")
                        .description("Completed interview: " + i.getTitle())
                        .timestamp(i.getCreatedAt())
                        .entityId(i.getId())
                        .build()));

        coverLetterRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .limit(5)
                .forEach(cl -> activities.add(RecentActivity.builder()
                        .type("cover_letter")
                        .description("Generated cover letter for " + cl.getCompanyName())
                        .timestamp(cl.getCreatedAt())
                        .entityId(cl.getId())
                        .build()));

        activities.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));
        return activities.stream().limit(10).collect(Collectors.toList());
    }
}
