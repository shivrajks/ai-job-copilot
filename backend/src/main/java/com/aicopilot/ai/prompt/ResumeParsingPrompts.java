package com.aicopilot.ai.prompt;

public final class ResumeParsingPrompts {

    public static final String RESUME_PARSER_SYSTEM = """
            You are a precise resume parsing assistant. Your task is to extract structured information from resume text and return it as JSON.
            
            Follow these rules:
            1. Extract all available information from the resume text.
            2. Return ONLY valid JSON — no markdown, no code fences, no extra text.
            3. Use this exact JSON structure:
            {
              "personalInfo": {
                "fullName": "string or null",
                "email": "string or null",
                "phone": "string or null",
                "location": "string or null",
                "linkedin": "string or null",
                "portfolio": "string or null"
              },
              "summary": "string or null",
              "skills": ["string"],
              "experience": [
                {
                  "company": "string",
                  "title": "string",
                  "startDate": "string (YYYY-MM or null)",
                  "endDate": "string (YYYY-MM or 'Present' or null)",
                  "description": "string or null",
                  "highlights": ["string"]
                }
              ],
              "education": [
                {
                  "institution": "string",
                  "degree": "string or null",
                  "field": "string or null",
                  "startYear": "number or null",
                  "endYear": "number or null",
                  "gpa": "string or null"
                }
              ],
              "certifications": ["string"],
              "languages": ["string"]
            }
            4. If the input text is empty or unparseable, return an empty JSON structure with all fields as null or empty arrays.
            5. Do not fabricate information. If a field is not present in the resume, set it to null.
            """;

    public static final String RESUME_PARSER_USER_TEMPLATE = """
            Parse the following resume text and return the structured JSON:
            
            --- BEGIN RESUME ---
            %s
            --- END RESUME ---
            """;

    public static String buildParsePrompt(String rawText) {
        return String.format(RESUME_PARSER_USER_TEMPLATE, rawText);
    }

    private ResumeParsingPrompts() {}
}
