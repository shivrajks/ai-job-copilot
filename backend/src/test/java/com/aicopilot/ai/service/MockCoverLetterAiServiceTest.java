package com.aicopilot.ai.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

class MockCoverLetterAiServiceTest {

    private final MockCoverLetterAiService service = new MockCoverLetterAiService();

    private final String resumeJson = """
            {
              "personalInfo": {"fullName": "Jane Smith", "email": "jane@example.com", "phone": "+1-555-123-4567"},
              "summary": "Experienced software engineer",
              "skills": ["Java", "Spring Boot", "React"],
              "experience": [{"title": "Senior Engineer", "company": "Acme Corp"}]
            }
            """;

    private final String jdJson = """
            {
              "basicInfo": {"title": "Backend Developer", "company": "TechCo", "location": "Remote"}
            }
            """;

    @Test
    @DisplayName("Generates cover letter with valid inputs")
    void generatesWithValidInputs() {
        var response = service.generate(
                UUID.randomUUID(), resumeJson, null, jdJson,
                75, "Java, Spring Boot", "", "",
                "TechCo", "John Manager", "professional", "professional");

        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getCoverLetterJson()).isNotBlank();
        assertThat(response.getErrorMessage()).isNull();
    }

    @Test
    @DisplayName("Generates cover letter when jdJson is null")
    void generatesWithNullJdJson() {
        var response = service.generate(
                UUID.randomUUID(), resumeJson, null, null,
                0, "", "", "",
                null, null, "professional", "professional");

        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getCoverLetterJson()).isNotBlank();
    }

    @Test
    @DisplayName("Generates cover letter when hiringManager is null")
    void generatesWithNullHiringManager() {
        var response = service.generate(
                UUID.randomUUID(), resumeJson, null, jdJson,
                75, "", "", "",
                "TechCo", null, "warm", "modern");

        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getCoverLetterJson()).contains("Dear Hiring Manager");
    }

    @Test
    @DisplayName("Generated content contains no fabricated person/company facts")
    void noFabricatedFacts() {
        var response = service.generate(
                UUID.randomUUID(), resumeJson, null, jdJson,
                75, "Java", "", "",
                "TechCo", "John Manager", "professional", "professional");

        assertThat(response.isSuccess()).isTrue();
        String json = response.getCoverLetterJson();
        assertThat(json).contains("Jane Smith");
        assertThat(json).contains("TechCo");
        assertThat(json).doesNotContain("Acme Solutions International");
        assertThat(json).doesNotContain("Robert Johnson");
    }

    @Test
    @DisplayName("isAvailable returns true")
    void isAvailable() {
        assertThat(service.isAvailable()).isTrue();
    }
}
