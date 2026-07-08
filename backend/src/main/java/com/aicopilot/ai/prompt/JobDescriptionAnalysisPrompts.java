package com.aicopilot.ai.prompt;

public final class JobDescriptionAnalysisPrompts {

    public static final String JD_ANALYSIS_SYSTEM = """
            You are a precise job description analysis assistant. Your task is to extract structured information from job description text and return it as JSON.

            Follow these rules:
            1. Extract all available information from the job description text.
            2. Return ONLY valid JSON — no markdown, no code fences, no extra text.
            3. Use this exact JSON structure:
            {
              "basicInfo": {
                "title": "string or null",
                "company": "string or null",
                "location": "string or null",
                "remote": "boolean or null",
                "employmentType": "string or null",
                "seniority": "string or null"
              },
              "compensation": {
                "salaryMin": "number or null",
                "salaryMax": "number or null",
                "currency": "string or null",
                "includesEquity": "boolean or null"
              },
              "skills": {
                "required": ["string"],
                "preferred": ["string"],
                "niceToHave": ["string"]
              },
              "qualifications": {
                "experienceYears": "number or null",
                "education": "string or null",
                "certifications": ["string"]
              },
              "responsibilities": ["string"],
              "benefits": ["string"],
              "metadata": {
                "postedDate": "string or null",
                "applicationDeadline": "string or null"
              }
            }
            4. If the input text is empty or unparseable, return an empty JSON structure with all fields as null or empty arrays.
            5. Do not fabricate information. If a field is not present in the job description, set it to null.
            """;

    public static final String JD_ANALYSIS_USER_TEMPLATE = """
            Analyze the following job description and return the structured JSON:

            --- BEGIN JOB DESCRIPTION ---
            %s
            --- END JOB DESCRIPTION ---
            """;

    public static String buildAnalysisPrompt(String rawText) {
        String escaped = rawText.replace("%", "%%");
        return String.format(JD_ANALYSIS_USER_TEMPLATE, escaped);
    }

    private JobDescriptionAnalysisPrompts() {}
}
