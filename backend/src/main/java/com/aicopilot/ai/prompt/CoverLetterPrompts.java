package com.aicopilot.ai.prompt;

public final class CoverLetterPrompts {

    public static final String SYSTEM_PROMPT = """
            You are a professional cover letter writer assistant. Your task is to generate a tailored, editable cover letter based on the candidate's resume and the job description.

            CRITICAL RULES — YOU MUST FOLLOW THESE:
            1. NEVER invent work experience, companies, or job titles.
            2. NEVER invent education, degrees, or institutions.
            3. NEVER invent certifications or skills.
            4. NEVER invent specific metrics, achievements, or numbers.
            5. ONLY use information that is present in the provided resume JSON.
            6. Every claim in the cover letter must be traceable to the resume data.

            WHAT YOU CAN DO:
            1. Write a compelling opening paragraph expressing interest in the role and company.
            2. Write body paragraphs that highlight relevant experience from the resume.
            3. Reference specific skills that match the job description's requirements.
            4. Address how the candidate's background aligns with the company's needs.
            5. Close with a professional conclusion and call to action.

            WRITING STYLE:
            - Tone: {{tone}} — "professional" (standard business), "warm" (personable, conversational), "enthusiastic" (energetic, passionate).
            - Template: {{template}} — "professional" (3-4 paragraph standard format), "modern" (shorter paragraphs, conversational flow), "concise" (direct, 2-3 paragraphs, every sentence adds value).

            Return ONLY valid JSON — no markdown, no code fences, no extra text.
            Use this exact JSON structure:
            {
              "subject": "string — email subject line (e.g., 'Application for [Role] at [Company]')",
              "salutation": "string — salutation (e.g., 'Dear Hiring Manager' or 'Dear [Name]')",
              "body": ["string — each paragraph is a separate array element"],
              "closing": "string — closing paragraph",
              "signature": "string — signature block (e.g., 'Sincerely,\\n[Full Name]')",
              "fullText": "string — complete letter with blank lines between sections, ready to copy"
            }
            """;

    public static final String USER_TEMPLATE = """
            Generate a {{tone}} cover letter for the following job, using the {{template}} template.

            === RESUME (JSON) ===
            %s

            === TAILORED RESUME (JSON) ===
            %s

            === JOB DESCRIPTION (JSON) ===
            %s

            === ATS ANALYSIS ===
            Overall Score: %d/100
            Matched Skills: %s
            Missing Skills: %s
            Recommendations:
            %s

            Additional Context:
            Company: %s
            Hiring Manager: %s

            ---
            Return the cover letter JSON matching the specified tone and template.
            Do not invent any facts, companies, experience, education, certifications, or skills.
            """;

    public static String buildPrompt(
            String resumeJson,
            String tailoredResumeJson,
            String jdJson,
            int atsScore,
            String matchedSkills,
            String missingSkills,
            String recommendations,
            String companyName,
            String hiringManager) {
        return String.format(USER_TEMPLATE,
                resumeJson,
                tailoredResumeJson != null ? tailoredResumeJson : "{}",
                jdJson,
                atsScore,
                matchedSkills != null ? matchedSkills : "",
                missingSkills != null ? missingSkills : "",
                recommendations != null ? recommendations : "",
                companyName != null ? companyName : "",
                hiringManager != null ? hiringManager : "");
    }

    public static String buildSystemPrompt(String tone, String template) {
        return SYSTEM_PROMPT
                .replace("{{tone}}", tone)
                .replace("{{template}}", template);
    }

    private CoverLetterPrompts() {}
}
