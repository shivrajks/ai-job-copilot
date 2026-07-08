package com.aicopilot.service;

import com.aicopilot.ai.dto.AiDtos.ParseResponse;
import com.aicopilot.ai.service.JobDescriptionAiService;
import com.aicopilot.dto.JobDescriptionDtos;
import com.aicopilot.dto.JobDescriptionDtos.*;
import com.aicopilot.entity.JobDescription;
import com.aicopilot.entity.JobDescription.AnalysisStatus;
import com.aicopilot.entity.User;
import com.aicopilot.exception.AppException;
import com.aicopilot.repository.JobDescriptionRepository;
import com.aicopilot.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobDescriptionService {

    private final JobDescriptionRepository jobDescriptionRepository;
    private final UserRepository userRepository;
    private final JobDescriptionAiService jdAiService;

    @Transactional
    public JobDescriptionDetail createJobDescription(CreateRequest request, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        JobDescription jd = JobDescription.builder()
                .user(user)
                .title(request.getTitle())
                .company(request.getCompany() != null ? request.getCompany() : "")
                .rawText(request.getRawText())
                .sourceUrl(request.getSourceUrl())
                .build();

        jd = jobDescriptionRepository.save(jd);

        log.info("Created job description: {} for user: {}", jd.getId(), userId);

        return JobDescriptionDtos.toDetail(jd);
    }

    @Transactional(readOnly = true)
    public List<JobDescriptionListItem> listUserJobDescriptions(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        List<JobDescription> descriptions = jobDescriptionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        return descriptions.stream()
                .map(JobDescriptionDtos::toListItem)
                .toList();
    }

    @Transactional(readOnly = true)
    public JobDescriptionDetail getJobDescription(UUID userId, UUID jdId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        JobDescription jd = jobDescriptionRepository.findById(jdId)
                .orElseThrow(() -> new AppException("Job description not found", HttpStatus.NOT_FOUND));

        if (!jd.getUser().getId().equals(user.getId())) {
            throw new AppException("Access denied", HttpStatus.FORBIDDEN);
        }

        return JobDescriptionDtos.toDetail(jd);
    }

    @Transactional
    public JobDescriptionDetail updateJobDescription(UUID userId, UUID jdId, UpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        JobDescription jd = jobDescriptionRepository.findById(jdId)
                .orElseThrow(() -> new AppException("Job description not found", HttpStatus.NOT_FOUND));

        if (!jd.getUser().getId().equals(user.getId())) {
            throw new AppException("Access denied", HttpStatus.FORBIDDEN);
        }

        jd.setTitle(request.getTitle());
        jd.setCompany(request.getCompany() != null ? request.getCompany() : "");
        jd.setRawText(request.getRawText());
        jd.setSourceUrl(request.getSourceUrl());

        jd = jobDescriptionRepository.save(jd);

        log.info("Updated job description: {} for user: {}", jdId, userId);

        return JobDescriptionDtos.toDetail(jd);
    }

    @Transactional
    public void deleteJobDescription(UUID userId, UUID jdId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        JobDescription jd = jobDescriptionRepository.findById(jdId)
                .orElseThrow(() -> new AppException("Job description not found", HttpStatus.NOT_FOUND));

        if (!jd.getUser().getId().equals(user.getId())) {
            throw new AppException("Access denied", HttpStatus.FORBIDDEN);
        }

        jobDescriptionRepository.delete(jd);

        log.info("Deleted job description: {} for user: {}", jdId, userId);
    }

    @Transactional
    public JobDescriptionDetail analyzeJobDescription(UUID userId, UUID jdId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        JobDescription jd = jobDescriptionRepository.findById(jdId)
                .orElseThrow(() -> new AppException("Job description not found", HttpStatus.NOT_FOUND));

        if (!jd.getUser().getId().equals(user.getId())) {
            throw new AppException("Access denied", HttpStatus.FORBIDDEN);
        }

        if (jd.getAnalysisStatus() == AnalysisStatus.PROCESSING) {
            throw new AppException("Job description is already being analyzed", HttpStatus.CONFLICT);
        }

        if (jd.getRawText() == null || jd.getRawText().isBlank()) {
            jd.setAnalysisStatus(AnalysisStatus.FAILED);
            jd.setErrorMessage("Cannot analyze: job description text is empty");
            jd = jobDescriptionRepository.save(jd);
            return JobDescriptionDtos.toDetail(jd);
        }

        jd.setAnalysisStatus(AnalysisStatus.PROCESSING);
        jd.setAnalysisAttempts(jd.getAnalysisAttempts() + 1);
        jd.setErrorMessage(null);
        jd = jobDescriptionRepository.save(jd);

        try {
            ParseResponse aiResponse = jdAiService.analyzeJobDescription(jdId, jd.getRawText());

            if (aiResponse.isSuccess()) {
                jd.setStructuredData(aiResponse.getStructuredData());
                jd.setExtractedSkills(extractSkillNames(aiResponse.getStructuredData()));
                jd.setAnalysisStatus(AnalysisStatus.ANALYZED);
                jd.setAnalyzedAt(LocalDateTime.now());
                jd.setErrorMessage(null);
            } else {
                jd.setAnalysisStatus(AnalysisStatus.FAILED);
                jd.setErrorMessage(aiResponse.getErrorMessage());
            }
        } catch (Exception e) {
            log.error("Failed to analyze job description: {}", jdId, e);
            jd.setAnalysisStatus(AnalysisStatus.FAILED);
            jd.setErrorMessage("Analysis failed: " + e.getMessage());
        }

        jd = jobDescriptionRepository.save(jd);
        return JobDescriptionDtos.toDetail(jd);
    }

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private String extractSkillNames(String structuredData) {
        try {
            JsonNode root = MAPPER.readTree(structuredData);
            JsonNode skills = root.get("skills");
            if (skills == null) return structuredData;

            List<String> allSkills = new ArrayList<>();
            for (String key : new String[]{"required", "preferred", "niceToHave"}) {
                JsonNode arr = skills.get(key);
                if (arr != null && arr.isArray()) {
                    arr.forEach(n -> {
                        String text = n.asText();
                        if (!text.isBlank()) allSkills.add(text);
                    });
                }
            }

            return allSkills.isEmpty() ? structuredData : MAPPER.writeValueAsString(allSkills);
        } catch (Exception e) {
            log.warn("Failed to parse skill names from structured data, falling back to full JSON", e);
            return structuredData;
        }
    }
}
