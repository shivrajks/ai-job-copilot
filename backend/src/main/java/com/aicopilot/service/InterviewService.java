package com.aicopilot.service;

import com.aicopilot.ai.service.InterviewAiService;
import com.aicopilot.dto.AtsDtos;
import com.aicopilot.dto.InterviewDtos;
import com.aicopilot.dto.InterviewDtos.*;
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

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class InterviewService {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final InterviewRepository interviewRepository;
    private final ResumeRepository resumeRepository;
    private final JobDescriptionRepository jobDescriptionRepository;
    private final UserRepository userRepository;
    private final MatchService matchService;
    private final RecommendationService recommendationService;
    private final InterviewAiService interviewAiService;
    private final InterviewValidator interviewValidator;

    @Transactional
    public SessionDetail generateAndSave(UUID resumeId, UUID jdId, UUID userId,
                                          String difficulty, int questionCount, String title) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new AppException("Resume not found", HttpStatus.NOT_FOUND));

        if (!resume.getUser().getId().equals(user.getId())) {
            throw new AppException("Access denied", HttpStatus.FORBIDDEN);
        }

        if (resume.getParsingStatus() != Resume.ParsingStatus.PARSED) {
            throw new AppException("Resume must be parsed before generating interview questions",
                    HttpStatus.BAD_REQUEST);
        }

        String resumeData = resume.getStructuredData();
        if (resumeData == null) {
            throw new AppException("Resume structured data is missing", HttpStatus.BAD_REQUEST);
        }

        String jdData = null;
        String matchedSkills = "";
        String missingSkills = "";
        int atsScore = 0;
        String seniority = "";
        String role = "";
        String company = "";
        String tailoredData = null;

        if (jdId != null) {
            JobDescription jd = jobDescriptionRepository.findById(jdId)
                    .orElseThrow(() -> new AppException("Job description not found", HttpStatus.NOT_FOUND));

            if (!jd.getUser().getId().equals(user.getId())) {
                throw new AppException("Access denied", HttpStatus.FORBIDDEN);
            }

            jdData = jd.getStructuredData();
            if (jdData != null) {
                try {
                    JsonNode jdNode = MAPPER.readTree(jdData);
                    if (jdNode.has("basicInfo")) {
                        var info = jdNode.get("basicInfo");
                        seniority = info.has("seniority") && !info.get("seniority").isNull()
                                ? info.get("seniority").asText() : "";
                        role = info.has("title") && !info.get("title").isNull()
                                ? info.get("title").asText() : "";
                        company = info.has("company") && !info.get("company").isNull()
                                ? info.get("company").asText() : "";
                    }
                } catch (Exception e) {
                    log.warn("Failed to parse JD structured data for interview session", e);
                }
            }

            try {
                MatchDtos.MatchResult matchResult = matchService.matchResumeToJob(resumeId, jdId, userId);
                atsScore = matchResult.getAtsScore();
                matchedSkills = String.join(", ", matchResult.getMatchedSkills());
                missingSkills = String.join(", ", matchResult.getMissingSkills());

                AtsDtos.AtsReport atsReport = recommendationService.generateReport(resumeId, jdId, userId);
            } catch (Exception e) {
                log.warn("Failed to get match/report data for interview generation", e);
            }
        }

        String categoryMix = getCategoryMix(difficulty);

        InterviewAiService.InterviewResponse aiResponse = interviewAiService.generate(
                resumeId, resumeData, tailoredData, jdData,
                atsScore, matchedSkills, missingSkills,
                questionCount, difficulty, seniority, role, company,
                categoryMix, null);

        if (!aiResponse.isSuccess()) {
            throw new AppException("Interview generation failed: " + aiResponse.getErrorMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }

        interviewValidator.validate(resumeData, aiResponse.getQuestionsJson());

        int actualCount = countQuestions(aiResponse.getQuestionsJson());

        String sessionTitle = title != null ? title
                : "Interview for " + (role.isEmpty() ? "Position" : role)
                + ("".equals(company) ? "" : " at " + company);

        InterviewSession session = InterviewSession.builder()
                .user(user)
                .resume(resume)
                .jobDescription(jdId != null ? jobDescriptionRepository.getReferenceById(jdId) : null)
                .title(sessionTitle)
                .sessionType("MOCK")
                .difficulty(difficulty)
                .status("IN_PROGRESS")
                .questions(aiResponse.getQuestionsJson())
                .questionCount(actualCount)
                .answeredCount(0)
                .build();

        session = interviewRepository.save(session);

        log.info("Created interview session: {} for user: {} with {} questions",
                session.getId(), userId, actualCount);

        return InterviewDtos.toDetail(session);
    }

    @Transactional
    public ScoreResponse submitAnswers(UUID sessionId, UUID userId, ScoreRequest request) {
        InterviewSession session = interviewRepository.findByIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new AppException("Interview session not found", HttpStatus.NOT_FOUND));

        if (!"IN_PROGRESS".equals(session.getStatus())) {
            throw new AppException("Interview session is not in progress", HttpStatus.BAD_REQUEST);
        }

        if (session.getQuestions() == null) {
            throw new AppException("Interview session has no questions", HttpStatus.BAD_REQUEST);
        }

        try {
            JsonNode questionsNode = MAPPER.readTree(session.getQuestions());
            List<InterviewFeedback> feedbackList = new ArrayList<>();
            int totalScore = 0;

            Map<String, JsonNode> questionMap = new LinkedHashMap<>();
            if (questionsNode.has("questions") && questionsNode.get("questions").isArray()) {
                for (JsonNode q : questionsNode.get("questions")) {
                    if (q.has("id")) {
                        questionMap.put(q.get("id").asText(), q);
                    }
                }
            }

            for (UserAnswer answer : request.getAnswers()) {
                JsonNode questionNode = questionMap.get(answer.getQuestionId());
                if (questionNode == null) {
                    log.warn("Question {} not found in session {}", answer.getQuestionId(), sessionId);
                    continue;
                }

                String question = questionNode.has("question") ? questionNode.get("question").asText() : "";
                String suggestedAnswer = questionNode.has("suggestedAnswer")
                        ? questionNode.get("suggestedAnswer").asText() : "";
                String keyPoints = "";
                if (questionNode.has("keyPoints") && questionNode.get("keyPoints").isArray()) {
                    List<String> kps = new ArrayList<>();
                    for (JsonNode kp : questionNode.get("keyPoints")) {
                        kps.add(kp.asText());
                    }
                    keyPoints = String.join("; ", kps);
                }

                InterviewAiService.ScoreResponse scoreResponse = interviewAiService.score(
                        question, suggestedAnswer, answer.getAnswer(), keyPoints);

                if (!scoreResponse.isSuccess()) {
                    log.warn("Scoring failed for question {}", answer.getQuestionId());
                    continue;
                }

                interviewValidator.validateScoreResponse(scoreResponse.getScoreJson());

                JsonNode scoreNode = MAPPER.readTree(scoreResponse.getScoreJson());
                int qScore = scoreNode.has("overallScore") ? scoreNode.get("overallScore").asInt() : 0;
                totalScore += qScore;

                List<String> strengths = new ArrayList<>();
                if (scoreNode.has("strengths") && scoreNode.get("strengths").isArray()) {
                    for (JsonNode s : scoreNode.get("strengths")) strengths.add(s.asText());
                }
                List<String> improvements = new ArrayList<>();
                if (scoreNode.has("improvements") && scoreNode.get("improvements").isArray()) {
                    for (JsonNode i : scoreNode.get("improvements")) improvements.add(i.asText());
                }

                feedbackList.add(InterviewFeedback.builder()
                        .questionId(answer.getQuestionId())
                        .overallScore(scoreNode.has("overallScore") ? scoreNode.get("overallScore").asInt() : 0)
                        .relevanceScore(scoreNode.has("relevanceScore") ? scoreNode.get("relevanceScore").asInt() : 0)
                        .clarityScore(scoreNode.has("clarityScore") ? scoreNode.get("clarityScore").asInt() : 0)
                        .completenessScore(scoreNode.has("completenessScore") ? scoreNode.get("completenessScore").asInt() : 0)
                        .strengths(strengths)
                        .improvements(improvements)
                        .suggestedAnswer(suggestedAnswer)
                        .build());
            }

            int averageScore = feedbackList.isEmpty() ? 0 : totalScore / feedbackList.size();

            try {
                String responsesJson = MAPPER.writerWithDefaultPrettyPrinter()
                        .writeValueAsString(request.getAnswers());
                session.setResponses(responsesJson);
            } catch (Exception e) {
                log.warn("Failed to serialize responses", e);
            }

            session.setStatus("COMPLETED");
            session.setOverallScore(averageScore);
            session.setAnsweredCount(request.getAnswers().size());

            try {
                String feedbackJson = MAPPER.writerWithDefaultPrettyPrinter()
                        .writeValueAsString(feedbackList);
                session.setFeedback(feedbackJson);
            } catch (Exception e) {
                log.warn("Failed to serialize feedback", e);
            }

            interviewRepository.save(session);

            log.info("Scored interview session {}: {} answers, avg score {}",
                    sessionId, request.getAnswers().size(), averageScore);

            return ScoreResponse.builder()
                    .feedback(feedbackList)
                    .overallScore(averageScore)
                    .build();
        } catch (Exception e) {
            log.error("Failed to score interview session {}", sessionId, e);
            throw new AppException("Failed to score interview: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(readOnly = true)
    public List<SessionListItem> listSessions(UUID userId) {
        List<InterviewSession> sessions = interviewRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return sessions.stream()
                .map(InterviewDtos::toListItem)
                .toList();
    }

    @Transactional(readOnly = true)
    public SessionDetail getSession(UUID sessionId, UUID userId) {
        InterviewSession session = interviewRepository.findByIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new AppException("Interview session not found", HttpStatus.NOT_FOUND));
        return InterviewDtos.toDetail(session);
    }

    @Transactional
    public void deleteSession(UUID sessionId, UUID userId) {
        InterviewSession session = interviewRepository.findByIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new AppException("Interview session not found", HttpStatus.NOT_FOUND));
        interviewRepository.delete(session);
        log.info("Deleted interview session: {}", sessionId);
    }

    private String getCategoryMix(String difficulty) {
        return switch (difficulty.toLowerCase()) {
            case "easy" -> "40% HR, 40% BEHAVIORAL, 20% TECHNICAL";
            case "hard" -> "10% HR, 20% BEHAVIORAL, 70% TECHNICAL";
            default -> "20% HR, 30% BEHAVIORAL, 50% TECHNICAL";
        };
    }

    private int countQuestions(String questionsJson) {
        try {
            JsonNode root = MAPPER.readTree(questionsJson);
            if (root.has("questions") && root.get("questions").isArray()) {
                return root.get("questions").size();
            }
        } catch (Exception ignored) {}
        return 0;
    }
}
