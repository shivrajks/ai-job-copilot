package com.aicopilot.service;

import com.aicopilot.ai.service.TailoringAiService;
import com.aicopilot.ai.service.TailoringAiService.TailorResponse;
import com.aicopilot.dto.AtsDtos.AtsReport;
import com.aicopilot.dto.MatchDtos.MatchResult;
import com.aicopilot.dto.ResumeDtos;
import com.aicopilot.dto.ResumeDtos.ResumeDetail;
import com.aicopilot.dto.TailorDtos.SaveTailoredRequest;
import com.aicopilot.dto.TailorDtos.SectionChange;
import com.aicopilot.dto.TailorDtos.TailorProposal;
import com.aicopilot.entity.JobDescription;
import com.aicopilot.entity.Resume;
import com.aicopilot.entity.User;
import com.aicopilot.exception.AppException;
import com.aicopilot.repository.JobDescriptionRepository;
import com.aicopilot.repository.ResumeRepository;
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
public class TailoringService {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final ResumeRepository resumeRepository;
    private final JobDescriptionRepository jobDescriptionRepository;
    private final UserRepository userRepository;
    private final MatchService matchService;
    private final RecommendationService recommendationService;
    private final TailoringAiService tailoringAiService;
    private final TailorValidator tailorValidator;

    @Transactional(readOnly = true)
    public TailorProposal generateTailorProposal(UUID resumeId, UUID jdId, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new AppException("Resume not found", HttpStatus.NOT_FOUND));

        JobDescription jd = jobDescriptionRepository.findById(jdId)
                .orElseThrow(() -> new AppException("Job description not found", HttpStatus.NOT_FOUND));

        if (!resume.getUser().getId().equals(user.getId()) || !jd.getUser().getId().equals(user.getId())) {
            throw new AppException("Access denied", HttpStatus.FORBIDDEN);
        }

        if (resume.getParsingStatus() != Resume.ParsingStatus.PARSED) {
            throw new AppException("Resume must be parsed before tailoring", HttpStatus.BAD_REQUEST);
        }

        if (jd.getAnalysisStatus() != JobDescription.AnalysisStatus.ANALYZED) {
            throw new AppException("Job description must be analyzed before tailoring", HttpStatus.BAD_REQUEST);
        }

        String originalData = resume.getStructuredData();
        String jdData = jd.getStructuredData();
        if (originalData == null || jdData == null) {
            throw new AppException("Structured data is missing", HttpStatus.BAD_REQUEST);
        }

        MatchResult matchResult = matchService.matchResumeToJob(resumeId, jdId, userId);
        AtsReport atsReport = recommendationService.generateReport(resumeId, jdId, userId);

        String missingSkillsStr = String.join(", ", matchResult.getMissingSkills());
        String recommendationsStr = buildRecommendationsText(atsReport.getRecommendations());

        TailorResponse aiResponse = tailoringAiService.tailor(
                resumeId, originalData, jdData,
                matchResult.getAtsScore(), missingSkillsStr, recommendationsStr);

        if (!aiResponse.isSuccess()) {
            throw new AppException("Tailoring failed: " + aiResponse.getErrorMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }

        String aiJson = aiResponse.getTailoredStructuredData();

        String tailoredData;
        try {
            JsonNode aiRoot = MAPPER.readTree(aiJson);
            tailoredData = MAPPER.writerWithDefaultPrettyPrinter()
                    .writeValueAsString(aiRoot.get("tailoredResume"));
        } catch (Exception e) {
            log.error("Failed to extract tailored resume from AI response", e);
            throw new AppException("AI response was malformed", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        tailorValidator.validate(originalData, tailoredData);

        int estimatedScore = matchService.computeScore(tailoredData, jdData);

        List<SectionChange> changes = buildChanges(originalData, aiJson);

        return TailorProposal.builder()
                .resumeId(resumeId)
                .jobDescriptionId(jdId)
                .originalAtsScore(matchResult.getAtsScore())
                .estimatedNewAtsScore(estimatedScore)
                .originalStructuredData(originalData)
                .tailoredStructuredData(tailoredData)
                .changes(changes)
                .build();
    }

    @Transactional
    public ResumeDetail saveTailoredResume(UUID resumeId, UUID userId, SaveTailoredRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        Resume original = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new AppException("Resume not found", HttpStatus.NOT_FOUND));

        if (!original.getUser().getId().equals(user.getId())) {
            throw new AppException("Access denied", HttpStatus.FORBIDDEN);
        }

        List<Resume> userResumes = resumeRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        int nextVersion = userResumes.isEmpty() ? 1 : userResumes.get(0).getVersionNum() + 1;

        Resume tailored = Resume.builder()
                .user(user)
                .name(request.getName())
                .parsedContent(original.getParsedContent())
                .structuredData(request.getTailoredStructuredData())
                .parsingStatus(Resume.ParsingStatus.PARSED)
                .isActive(false)
                .versionNum(nextVersion)
                .fileSize(original.getFileSize())
                .mimeType(original.getMimeType())
                .parsedAt(LocalDateTime.now())
                .build();

        tailored = resumeRepository.save(tailored);

        log.info("Created tailored resume version {} for user {} (from resume {})",
                nextVersion, userId, resumeId);

        return ResumeDtos.toDetail(tailored);
    }

    private List<SectionChange> buildChanges(String originalData, String aiJson) {
        List<SectionChange> changes = new ArrayList<>();

        try {
            JsonNode aiRoot = MAPPER.readTree(aiJson);
            JsonNode changesNode = aiRoot.get("changes");

            if (changesNode != null && changesNode.isArray()) {
                for (JsonNode changeNode : changesNode) {
                    String section = changeNode.has("section") ? changeNode.get("section").asText() : "";
                    String changeType = changeNode.has("changeType") ? changeNode.get("changeType").asText() : "";
                    String originalText = changeNode.has("originalText") ? changeNode.get("originalText").asText() : "";
                    String suggestedText = changeNode.has("suggestedText") ? changeNode.get("suggestedText").asText() : "";
                    String reason = changeNode.has("reason") ? changeNode.get("reason").asText() : "";

                    changes.add(SectionChange.builder()
                            .section(section)
                            .changeType(changeType)
                            .originalText(originalText)
                            .suggestedText(suggestedText)
                            .reason(reason)
                            .recommendationType(null)
                            .build());
                }
            }
        } catch (Exception e) {
            log.warn("Failed to parse AI changes, returning empty changes list", e);
        }

        return changes;
    }

    private String buildRecommendationsText(List<com.aicopilot.dto.AtsDtos.Recommendation> recommendations) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < Math.min(recommendations.size(), 10); i++) {
            var rec = recommendations.get(i);
            sb.append("- [").append(rec.getPriority()).append("] ")
                    .append(rec.getLabel()).append(": ")
                    .append(rec.getDescription()).append("\n");
        }
        return sb.toString();
    }
}
