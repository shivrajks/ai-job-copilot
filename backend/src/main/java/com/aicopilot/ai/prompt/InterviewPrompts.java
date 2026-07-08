package com.aicopilot.ai.prompt;

public final class InterviewPrompts {

    public static final String SYSTEM_PROMPT = """
            You are an expert technical interviewer preparation assistant.
            Your task is to generate realistic interview questions and suggested answers.

            CRITICAL RULES:
            1. NEVER invent work experience, companies, job titles, or dates.
            2. NEVER invent education, degrees, institutions, or GPAs.
            3. NEVER invent certifications, skills, or projects.
            4. Every suggested answer must be grounded in the candidate's actual resume data.
            5. If the resume does not contain relevant data for a question area,
               the answer should acknowledge the gap honestly.

            QUESTION CATEGORIES:
            - HR: Role alignment, motivation, culture fit, career goals
            - TECHNICAL: Skills-based, problem-solving, architecture, coding concepts
            - BEHAVIORAL: STAR format (Situation, Task, Action, Result), soft skills

            DIFFICULTY LEVELS:
            - EASY: Fundamental concepts, direct experience questions
            - MEDIUM: Applied knowledge, scenario-based
            - HARD: Complex problem-solving, trade-offs, architecture decisions

            Return ONLY valid JSON — no markdown, no code fences, no extra text.
            Use this JSON structure:
            {
              "questions": [
                {
                  "id": "q-1",
                  "category": "HR" | "TECHNICAL" | "BEHAVIORAL",
                  "difficulty": "EASY" | "MEDIUM" | "HARD",
                  "question": "string",
                  "suggestedAnswer": "string — grounded in resume data",
                  "keyPoints": ["string — 3-5 talking points"],
                  "estimatedTime": "string — e.g., '2-3 minutes'",
                  "followUpQuestions": ["string — 1-2 optional follow-ups"]
                }
              ]
            }
            """;

    public static final String USER_TEMPLATE = """
            Generate {{count}} interview questions for a {{difficulty}} difficulty interview
            for the {{seniority}} {{role}} position at {{company}}.

            The questions should cover a mix of {{categoryMix}} categories.

            === RESUME ===
            %s

            === JOB DESCRIPTION ===
            %s

            === ATS ANALYSIS ===
            Score: %d/100
            Matched Skills: %s
            Missing Skills: %s

            %s
            %s

            Return the questions as a JSON array under a "questions" key.
            Do not invent any facts, companies, experience, education, certifications, or skills.
            """;

    public static final String SCORE_SYSTEM_PROMPT = """
            You are an expert interview coach evaluating a candidate's answer.
            Assess the answer based on the question, the suggested model answer, and the job context.

            Evaluate:
            - relevanceScore: How well does the answer address the question? (0-10)
            - clarityScore: How well-structured and clear is the answer? (0-10)
            - completenessScore: Does it cover the key points expected? (0-10)
            - strengths: What the candidate did well
            - improvements: What could be better

            Return ONLY valid JSON — no markdown, no code fences, no extra text.
            Use this exact structure:
            {
              "overallScore": 0-10,
              "relevanceScore": 0-10,
              "clarityScore": 0-10,
              "completenessScore": 0-10,
              "strengths": ["string"],
              "improvements": ["string"],
              "suggestedAnswer": "string — the model answer for comparison"
            }
            """;

    public static final String SCORE_USER_TEMPLATE = """
            Evaluate the following interview answer.

            === QUESTION ===
            %s

            === SUGGESTED ANSWER ===
            %s

            === CANDIDATE'S ANSWER ===
            %s

            === KEY POINTS ===
            %s

            Return the evaluation JSON.
            """;

    public static String buildSystemPrompt() {
        return SYSTEM_PROMPT;
    }

    public static String buildScoreSystemPrompt() {
        return SCORE_SYSTEM_PROMPT;
    }

    public static String buildPrompt(
            String resumeJson,
            String jdJson,
            int count,
            String difficulty,
            String seniority,
            String role,
            String company,
            String categoryMix,
            int atsScore,
            String matchedSkills,
            String missingSkills,
            String tailoredResumeSection,
            String coverLetterSection) {
        String prompt = USER_TEMPLATE
                .replace("{{count}}", String.valueOf(count))
                .replace("{{difficulty}}", difficulty)
                .replace("{{seniority}}", seniority != null ? seniority : "")
                .replace("{{role}}", role != null ? role : "the role")
                .replace("{{company}}", company != null ? company : "the company")
                .replace("{{categoryMix}}", categoryMix);
        return String.format(prompt,
                resumeJson != null ? resumeJson : "{}",
                jdJson != null ? jdJson : "{}",
                atsScore,
                matchedSkills != null ? matchedSkills : "",
                missingSkills != null ? missingSkills : "",
                tailoredResumeSection != null ? tailoredResumeSection : "",
                coverLetterSection != null ? coverLetterSection : "");
    }

    public static String buildScorePrompt(
            String question,
            String suggestedAnswer,
            String candidateAnswer,
            String keyPoints) {
        return String.format(SCORE_USER_TEMPLATE,
                question != null ? question : "",
                suggestedAnswer != null ? suggestedAnswer : "",
                candidateAnswer != null ? candidateAnswer : "",
                keyPoints != null ? keyPoints : "");
    }

    private InterviewPrompts() {}
}
