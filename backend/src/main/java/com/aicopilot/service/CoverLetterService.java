package com.aicopilot.service;

import com.aicopilot.ai.service.CoverLetterAiService;
import com.aicopilot.dto.AtsDtos;
import com.aicopilot.dto.CoverLetterDtos;
import com.aicopilot.dto.CoverLetterDtos.*;
import com.aicopilot.dto.MatchDtos;
import com.aicopilot.entity.*;
import com.aicopilot.exception.AppException;
import com.aicopilot.repository.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CoverLetterService {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final CoverLetterRepository coverLetterRepository;
    private final ResumeRepository resumeRepository;
    private final JobDescriptionRepository jobDescriptionRepository;
    private final UserRepository userRepository;
    private final MatchService matchService;
    private final RecommendationService recommendationService;
    private final CoverLetterAiService coverLetterAiService;
    private final CoverLetterValidator coverLetterValidator;

    @Transactional(readOnly = true)
    public CoverLetterProposal generateProposal(UUID resumeId, UUID jdId, UUID userId,
                                                 String tone, String template,
                                                 String companyName, String hiringManager) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new AppException("Resume not found", HttpStatus.NOT_FOUND));

        if (!resume.getUser().getId().equals(user.getId())) {
            throw new AppException("Access denied", HttpStatus.FORBIDDEN);
        }

        if (resume.getParsingStatus() != Resume.ParsingStatus.PARSED) {
            throw new AppException("Resume must be parsed before generating a cover letter",
                    HttpStatus.BAD_REQUEST);
        }

        String resumeData = resume.getStructuredData();
        if (resumeData == null) {
            throw new AppException("Resume structured data is missing", HttpStatus.BAD_REQUEST);
        }

        String jdData = null;
        String matchedSkills = "";
        String missingSkills = "";
        String recommendations = "";
        int atsScore = 0;
        String tailoredData = null;

        if (jdId != null) {
            JobDescription jd = jobDescriptionRepository.findById(jdId)
                    .orElseThrow(() -> new AppException("Job description not found", HttpStatus.NOT_FOUND));

            if (!jd.getUser().getId().equals(user.getId())) {
                throw new AppException("Access denied", HttpStatus.FORBIDDEN);
            }

            jdData = jd.getStructuredData();
            if (jdData == null) {
                throw new AppException("Job description structured data is missing", HttpStatus.BAD_REQUEST);
            }

            try {
                MatchDtos.MatchResult matchResult = matchService.matchResumeToJob(resumeId, jdId, userId);
                atsScore = matchResult.getAtsScore();
                matchedSkills = String.join(", ", matchResult.getMatchedSkills());
                missingSkills = String.join(", ", matchResult.getMissingSkills());

                AtsDtos.AtsReport atsReport = recommendationService.generateReport(resumeId, jdId, userId);
                recommendations = buildRecommendationsText(atsReport.getRecommendations());
            } catch (Exception e) {
                log.warn("Failed to get match/report data for cover letter generation", e);
            }
        }

        String resolvedCompany = companyName;
        if (resolvedCompany == null && jdData != null) {
            try {
                JsonNode jdNode = MAPPER.readTree(jdData);
                if (jdNode.has("basicInfo") && jdNode.get("basicInfo").has("company")
                        && !jdNode.get("basicInfo").get("company").isNull()) {
                    resolvedCompany = jdNode.get("basicInfo").get("company").asText();
                }
            } catch (Exception e) {
                log.warn("Failed to parse JD structured data for company name", e);
            }
        }

        CoverLetterAiService.CoverLetterResponse aiResponse = coverLetterAiService.generate(
                resumeId, resumeData, tailoredData, jdData,
                atsScore, matchedSkills, missingSkills, recommendations,
                resolvedCompany, hiringManager, tone, template);

        if (!aiResponse.isSuccess()) {
            throw new AppException("Cover letter generation failed: " + aiResponse.getErrorMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }

        coverLetterValidator.validate(resumeData, aiResponse.getCoverLetterJson());

        CoverLetterContent content;
        try {
            JsonNode aiRoot = MAPPER.readTree(aiResponse.getCoverLetterJson());
            content = CoverLetterContent.builder()
                    .subject(aiRoot.has("subject") ? aiRoot.get("subject").asText() : "")
                    .salutation(aiRoot.has("salutation") ? aiRoot.get("salutation").asText() : "")
                    .body(extractStringArray(aiRoot, "body"))
                    .closing(aiRoot.has("closing") ? aiRoot.get("closing").asText() : "")
                    .signature(aiRoot.has("signature") ? aiRoot.get("signature").asText() : "")
                    .fullText(aiRoot.has("fullText") ? aiRoot.get("fullText").asText() : "")
                    .build();
        } catch (Exception e) {
            log.error("Failed to parse AI cover letter response", e);
            throw new AppException("AI response was malformed", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return CoverLetterProposal.builder()
                .resumeId(resumeId)
                .jobDescriptionId(jdId)
                .content(content)
                .tone(tone)
                .template(template)
                .build();
    }

    @Transactional
    public CoverLetterDetail saveCoverLetter(UUID userId, SaveRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        Resume resume = null;
        if (request.getResumeId() != null) {
            resume = resumeRepository.findById(request.getResumeId())
                    .orElseThrow(() -> new AppException("Resume not found", HttpStatus.NOT_FOUND));
            if (!resume.getUser().getId().equals(user.getId())) {
                throw new AppException("Access denied", HttpStatus.FORBIDDEN);
            }
        }

        JobDescription jd = null;
        if (request.getJobDescriptionId() != null) {
            jd = jobDescriptionRepository.findById(request.getJobDescriptionId())
                    .orElseThrow(() -> new AppException("Job description not found", HttpStatus.NOT_FOUND));
            if (!jd.getUser().getId().equals(user.getId())) {
                throw new AppException("Access denied", HttpStatus.FORBIDDEN);
            }
        }

        CoverLetter coverLetter = CoverLetter.builder()
                .user(user)
                .resume(resume)
                .jobDescription(jd)
                .title(request.getTitle())
                .content(request.getContent())
                .tone(request.getTone() != null ? request.getTone() : "professional")
                .template(request.getTemplate() != null ? request.getTemplate() : "professional")
                .companyName(request.getCompanyName())
                .hiringManager(request.getHiringManager())
                .recipientTitle(request.getRecipientTitle())
                .isActive(true)
                .build();

        coverLetter = coverLetterRepository.save(coverLetter);

        log.info("Saved cover letter: {} for user: {}", coverLetter.getId(), userId);

        return toDetail(coverLetter);
    }

    @Transactional
    public CoverLetterDetail updateCoverLetter(UUID coverLetterId, UUID userId, UpdateRequest request) {
        CoverLetter cl = coverLetterRepository.findByIdAndUserId(coverLetterId, userId)
                .orElseThrow(() -> new AppException("Cover letter not found", HttpStatus.NOT_FOUND));

        cl.setTitle(request.getTitle());
        cl.setContent(request.getContent());
        if (request.getTone() != null) cl.setTone(request.getTone());
        if (request.getTemplate() != null) cl.setTemplate(request.getTemplate());
        if (request.getCompanyName() != null) cl.setCompanyName(request.getCompanyName());
        if (request.getHiringManager() != null) cl.setHiringManager(request.getHiringManager());
        if (request.getRecipientTitle() != null) cl.setRecipientTitle(request.getRecipientTitle());

        cl = coverLetterRepository.save(cl);

        log.info("Updated cover letter: {}", coverLetterId);

        return toDetail(cl);
    }

    @Transactional(readOnly = true)
    public List<CoverLetterListItem> listCoverLetters(UUID userId) {
        List<CoverLetter> letters = coverLetterRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return letters.stream()
                .map(CoverLetterDtos::toListItem)
                .toList();
    }

    @Transactional(readOnly = true)
    public CoverLetterDetail getCoverLetter(UUID coverLetterId, UUID userId) {
        CoverLetter cl = coverLetterRepository.findByIdAndUserId(coverLetterId, userId)
                .orElseThrow(() -> new AppException("Cover letter not found", HttpStatus.NOT_FOUND));
        return toDetail(cl);
    }

    @Transactional
    public void deleteCoverLetter(UUID coverLetterId, UUID userId) {
        CoverLetter cl = coverLetterRepository.findByIdAndUserId(coverLetterId, userId)
                .orElseThrow(() -> new AppException("Cover letter not found", HttpStatus.NOT_FOUND));
        coverLetterRepository.delete(cl);
        log.info("Deleted cover letter: {}", coverLetterId);
    }

    private CoverLetterDetail toDetail(CoverLetter cl) {
        return CoverLetterDtos.toDetail(cl);
    }

    private String buildRecommendationsText(List<AtsDtos.Recommendation> recommendations) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < Math.min(recommendations.size(), 10); i++) {
            var rec = recommendations.get(i);
            sb.append("- [").append(rec.getPriority()).append("] ")
                    .append(rec.getLabel()).append(": ")
                    .append(rec.getDescription()).append("\n");
        }
        return sb.toString();
    }

    private List<String> extractStringArray(JsonNode parent, String field) {
        if (parent == null || !parent.has(field)) return List.of();
        JsonNode node = parent.get(field);
        if (!node.isArray()) return List.of();
        List<String> result = new java.util.ArrayList<>();
        for (JsonNode element : node) {
            if (!element.isNull()) result.add(element.asText());
        }
        return result;
    }
}
