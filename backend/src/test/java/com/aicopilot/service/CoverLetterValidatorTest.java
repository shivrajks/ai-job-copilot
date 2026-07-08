package com.aicopilot.service;

import com.aicopilot.exception.AppException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

class CoverLetterValidatorTest {

    private final CoverLetterValidator validator = new CoverLetterValidator();

    private final String resumeJson = """
            {"skills": ["Java", "Spring Boot", "SQL", "Docker"]}
            """;

    private final String validCoverLetterJson = """
            {
                "subject": "Application for Engineer",
                "salutation": "Dear Hiring Manager",
                "body": ["I am writing to apply...", "I have experience with Java..."],
                "closing": "Sincerely",
                "signature": "John Doe",
                "fullText": "Dear Hiring Manager\\n\\nI am writing to apply for the Engineer position. I have experience with Java and Spring Boot.\\n\\nSincerely\\nJohn Doe"
            }
            """;

    @Test
    @DisplayName("Should pass validation for valid cover letter")
    void shouldPassForValidCoverLetter() {
        assertThatNoException().isThrownBy(() -> validator.validate(resumeJson, validCoverLetterJson));
    }

    @Test
    @DisplayName("Should throw when resumeJson is null")
    void shouldThrowWhenResumeNull() {
        assertThatThrownBy(() -> validator.validate(null, validCoverLetterJson))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("required");
    }

    @Test
    @DisplayName("Should throw when coverLetterJson is null")
    void shouldThrowWhenCoverLetterNull() {
        assertThatThrownBy(() -> validator.validate(resumeJson, null))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("required");
    }

    @Nested
    @DisplayName("Structure validation")
    class StructureValidation {

        @Test
        @DisplayName("Should throw when subject is missing")
        void shouldRejectMissingSubject() {
            String missing = validCoverLetterJson.replace("\"subject\": \"Application for Engineer\",", "");
            assertThatThrownBy(() -> validator.validate(resumeJson, missing))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("subject");
        }

        @Test
        @DisplayName("Should throw when salutation is missing")
        void shouldRejectMissingSalutation() {
            String missing = validCoverLetterJson.replace("\"salutation\": \"Dear Hiring Manager\",", "");
            assertThatThrownBy(() -> validator.validate(resumeJson, missing))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("salutation");
        }

        @Test
        @DisplayName("Should throw when body is missing")
        void shouldRejectMissingBody() {
            String missing = validCoverLetterJson.replace("\"body\": [\"I am writing to apply...\", \"I have experience with Java...\"],", "");
            assertThatThrownBy(() -> validator.validate(resumeJson, missing))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("body");
        }

        @Test
        @DisplayName("Should throw when body is empty array")
        void shouldRejectEmptyBody() {
            String emptyBody = validCoverLetterJson.replace(
                    "\"body\": [\"I am writing to apply...\", \"I have experience with Java...\"],",
                    "\"body\": [],");
            assertThatThrownBy(() -> validator.validate(resumeJson, emptyBody))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("body");
        }

        @Test
        @DisplayName("Should throw when closing is missing")
        void shouldRejectMissingClosing() {
            String missing = validCoverLetterJson.replace("\"closing\": \"Sincerely\",", "");
            assertThatThrownBy(() -> validator.validate(resumeJson, missing))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("closing");
        }

        @Test
        @DisplayName("Should throw when signature is missing")
        void shouldRejectMissingSignature() {
            String missing = validCoverLetterJson.replace("\"signature\": \"John Doe\",", "");
            assertThatThrownBy(() -> validator.validate(resumeJson, missing))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("signature");
        }

        @Test
        @DisplayName("Should throw when fullText is missing")
        void shouldRejectMissingFullText() {
            String missing = """
                    {
                        "subject": "Application for Engineer",
                        "salutation": "Dear Hiring Manager",
                        "body": ["I am writing to apply...", "I have experience with Java..."],
                        "closing": "Sincerely",
                        "signature": "John Doe"
                    }
                    """;
            assertThatThrownBy(() -> validator.validate(resumeJson, missing))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("fullText");
        }
    }

    @Nested
    @DisplayName("Skills validation")
    class SkillsValidation {

        @Test
        @DisplayName("Should pass when all resume skills appear in cover letter")
        void shouldPassWhenSkillsMentioned() {
            String cl = validCoverLetterJson.replace(
                    "\"fullText\": \"Dear Hiring Manager\\n\\nI am writing to apply for the Engineer position. I have experience with Java and Spring Boot.\\n\\nSincerely\\nJohn Doe\"",
                    "\"fullText\": \"I know Java, Spring Boot, SQL, and Docker well.\"");
            assertThatNoException().isThrownBy(() -> validator.validate(resumeJson, cl));
        }

        @Test
        @DisplayName("Should pass when resume has no skills")
        void shouldPassWhenNoResumeSkills() {
            String noSkillsResume = "{\"skills\": []}";
            assertThatNoException().isThrownBy(() -> validator.validate(noSkillsResume, validCoverLetterJson));
        }

        @Test
        @DisplayName("Should pass when single-word resume skill is mentioned")
        void shouldPassForSingleWordSkill() {
            String cl = validCoverLetterJson.replace(
                    "\"fullText\": \"Dear Hiring Manager\\n\\nI am writing to apply for the Engineer position. I have experience with Java and Spring Boot.\\n\\nSincerely\\nJohn Doe\"",
                    "\"fullText\": \"Java, SQL, Docker\"");
            assertThatNoException().isThrownBy(() -> validator.validate(resumeJson, cl));
        }

        @Test
        @DisplayName("Should not throw for skills not mentioned (validation is advisory only)")
        void shouldNotThrowForUnmentionedSkills() {
            String cl = validCoverLetterJson.replace(
                    "\"fullText\": \"Dear Hiring Manager\\n\\nI am writing to apply for the Engineer position. I have experience with Java and Spring Boot.\\n\\nSincerely\\nJohn Doe\"",
                    "\"fullText\": \"I have experience.\"");
            assertThatNoException().isThrownBy(() -> validator.validate(resumeJson, cl));
        }
    }

    @Nested
    @DisplayName("Malformed JSON handling")
    class MalformedJson {

    @Test
    @DisplayName("Should throw AppException for invalid cover letter JSON")
    void shouldThrowForInvalidJson() {
        assertThatThrownBy(() -> validator.validate(resumeJson, "not json"))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Failed to validate");
    }

    @Test
    @DisplayName("Should throw AppException for invalid resume JSON")
    void shouldThrowForInvalidResumeJson() {
        assertThatThrownBy(() -> validator.validate("not json", validCoverLetterJson))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Failed to validate");
    }
    }
}
