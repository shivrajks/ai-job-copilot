package com.aicopilot.service;

import com.aicopilot.exception.AppException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

class TailorValidatorTest {

    private final TailorValidator validator = new TailorValidator();

    private String originalJson;
    private String tailoredJson;

    @BeforeEach
    void setUp() {
        originalJson = """
                {
                    "personalInfo": {
                        "fullName": "John Doe",
                        "email": "john@example.com",
                        "phone": "555-0100",
                        "location": "New York",
                        "linkedin": "linkedin.com/in/johndoe",
                        "portfolio": "johndoe.dev",
                        "summary": "Experienced developer"
                    },
                    "experience": [
                        {"company": "TechCorp", "title": "Developer", "startDate": "2020-01", "endDate": "2023-01", "description": "Built things"}
                    ],
                    "education": [
                        {"institution": "MIT", "degree": "BS", "field": "CS", "startYear": 2015, "endYear": 2019, "gpa": "3.8"}
                    ],
                    "certifications": ["AWS Certified"],
                    "languages": ["English", "Spanish"],
                    "skills": ["Java", "Spring", "SQL"]
                }
                """;
        tailoredJson = originalJson;
    }

    @Test
    @DisplayName("Should pass validation when tailored data matches original")
    void shouldPassWhenIdentical() {
        assertThatNoException().isThrownBy(() -> validator.validate(originalJson, tailoredJson));
    }

    @Test
    @DisplayName("Should throw when original is null")
    void shouldThrowWhenOriginalNull() {
        assertThatThrownBy(() -> validator.validate(null, tailoredJson))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("required");
    }

    @Test
    @DisplayName("Should throw when tailored is null")
    void shouldThrowWhenTailoredNull() {
        assertThatThrownBy(() -> validator.validate(originalJson, null))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("required");
    }

    @Nested
    @DisplayName("Personal info validation")
    class PersonalInfoValidation {

        @Test
        @DisplayName("Should throw when fullName is changed")
        void shouldRejectChangedFullName() {
            tailoredJson = originalJson.replace("\"fullName\": \"John Doe\"", "\"fullName\": \"Jane Doe\"");
            assertThatThrownBy(() -> validator.validate(originalJson, tailoredJson))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("fullName");
        }

        @Test
        @DisplayName("Should throw when email is changed")
        void shouldRejectChangedEmail() {
            tailoredJson = originalJson.replace("john@example.com", "jane@example.com");
            assertThatThrownBy(() -> validator.validate(originalJson, tailoredJson))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("email");
        }

        @Test
        @DisplayName("Should throw when phone is changed")
        void shouldRejectChangedPhone() {
            tailoredJson = originalJson.replace("555-0100", "555-0200");
            assertThatThrownBy(() -> validator.validate(originalJson, tailoredJson))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("phone");
        }

        @Test
        @DisplayName("Should allow changes to non-protected fields like summary")
        void shouldAllowChangedSummary() {
            tailoredJson = originalJson.replace("Experienced developer", "Senior developer with 5 years experience");
            assertThatNoException().isThrownBy(() -> validator.validate(originalJson, tailoredJson));
        }

        @Test
        @DisplayName("Should throw when personalInfo section is missing in tailored")
        void shouldRejectMissingPersonalInfo() {
            tailoredJson = """
                    {"experience": [], "skills": []}
                    """;
            assertThatThrownBy(() -> validator.validate(originalJson, tailoredJson))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("personalInfo");
        }
    }

    @Nested
    @DisplayName("Experience validation")
    class ExperienceValidation {

        @Test
        @DisplayName("Should throw when experience entry count changes")
        void shouldRejectChangedEntryCount() {
            tailoredJson = originalJson.replace(
                    "\"experience\": [",
                    "\"experience\": [{\"company\": \"Extra\", \"title\": \"X\", \"startDate\": \"2023\", \"endDate\": \"2024\", \"description\": \"\"},");
            assertThatThrownBy(() -> validator.validate(originalJson, tailoredJson))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("count");
        }

        @Test
        @DisplayName("Should throw when company name is changed")
        void shouldRejectChangedCompany() {
            tailoredJson = originalJson.replace("TechCorp", "OtherCorp");
            assertThatThrownBy(() -> validator.validate(originalJson, tailoredJson))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("company");
        }

        @Test
        @DisplayName("Should throw when title is changed")
        void shouldRejectChangedTitle() {
            tailoredJson = originalJson.replace("\"title\": \"Developer\"", "\"title\": \"Senior Developer\"");
            assertThatThrownBy(() -> validator.validate(originalJson, tailoredJson))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("title");
        }

        @Test
        @DisplayName("Should throw when startDate is changed")
        void shouldRejectChangedStartDate() {
            tailoredJson = originalJson.replace("\"startDate\": \"2020-01\"", "\"startDate\": \"2019-06\"");
            assertThatThrownBy(() -> validator.validate(originalJson, tailoredJson))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("startDate");
        }

        @Test
        @DisplayName("Should allow changes to description field")
        void shouldAllowChangedDescription() {
            tailoredJson = originalJson.replace("Built things", "Built scalable microservices");
            assertThatNoException().isThrownBy(() -> validator.validate(originalJson, tailoredJson));
        }

        @Test
        @DisplayName("Should pass when both original and tailored have empty sections")
        void shouldPassWhenBothEmpty() {
            String emptyExp = "{\"personalInfo\": {\"fullName\": \"John\"}, \"experience\": [], \"education\": [], \"certifications\": [], \"languages\": [], \"skills\": []}";
            assertThatNoException().isThrownBy(() -> validator.validate(emptyExp, emptyExp));
        }
    }

    @Nested
    @DisplayName("Education validation")
    class EducationValidation {

        @Test
        @DisplayName("Should throw when institution is changed")
        void shouldRejectChangedInstitution() {
            tailoredJson = originalJson.replace("MIT", "Stanford");
            assertThatThrownBy(() -> validator.validate(originalJson, tailoredJson))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("institution");
        }

        @Test
        @DisplayName("Should throw when degree is changed")
        void shouldRejectChangedDegree() {
            tailoredJson = originalJson.replace("\"degree\": \"BS\"", "\"degree\": \"BA\"");
            assertThatThrownBy(() -> validator.validate(originalJson, tailoredJson))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("degree");
        }

        @Test
        @DisplayName("Should throw when entry count changes")
        void shouldRejectChangedEntryCount() {
            tailoredJson = originalJson.replace(
                    "\"education\": [",
                    "\"education\": [{\"institution\": \"X\", \"degree\": \"Y\", \"field\": \"Z\", \"startYear\": 2020, \"endYear\": 2024},");
            assertThatThrownBy(() -> validator.validate(originalJson, tailoredJson))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("count");
        }
    }

    @Nested
    @DisplayName("Certification validation")
    class CertificationValidation {

        @Test
        @DisplayName("Should throw when certification is added")
        void shouldRejectAddedCert() {
            tailoredJson = originalJson.replace("AWS Certified", "AWS Certified\", \"PMP");
            assertThatThrownBy(() -> validator.validate(originalJson, tailoredJson))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Certifications");
        }

        @Test
        @DisplayName("Should throw when certification is removed")
        void shouldRejectRemovedCert() {
            tailoredJson = originalJson.replace("\"certifications\": [\"AWS Certified\"]", "\"certifications\": []");
            assertThatThrownBy(() -> validator.validate(originalJson, tailoredJson))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Certifications");
        }
    }

    @Nested
    @DisplayName("Language validation")
    class LanguageValidation {

        @Test
        @DisplayName("Should throw when language is added")
        void shouldRejectAddedLanguage() {
            tailoredJson = originalJson.replace("\"languages\": [\"English\", \"Spanish\"]", "\"languages\": [\"English\", \"Spanish\", \"French\"]");
            assertThatThrownBy(() -> validator.validate(originalJson, tailoredJson))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Languages");
        }

        @Test
        @DisplayName("Should throw when language order changes")
        void shouldRejectReorderedLanguages() {
            tailoredJson = originalJson.replace("\"languages\": [\"English\", \"Spanish\"]", "\"languages\": [\"Spanish\", \"English\"]");
            assertThatThrownBy(() -> validator.validate(originalJson, tailoredJson))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Languages");
        }
    }

    @Nested
    @DisplayName("Skill validation")
    class SkillValidation {

        @Test
        @DisplayName("Should throw when a skill is removed")
        void shouldRejectRemovedSkill() {
            tailoredJson = originalJson.replace("\"skills\": [\"Java\", \"Spring\", \"SQL\"]", "\"skills\": [\"Java\", \"Spring\"]");
            assertThatThrownBy(() -> validator.validate(originalJson, tailoredJson))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("SQL");
        }

        @Test
        @DisplayName("Should allow adding new skills")
        void shouldAllowAddedSkills() {
            tailoredJson = originalJson.replace("\"skills\": [\"Java\", \"Spring\", \"SQL\"]", "\"skills\": [\"Java\", \"Spring\", \"SQL\", \"Kubernetes\"]");
            assertThatNoException().isThrownBy(() -> validator.validate(originalJson, tailoredJson));
        }

        @Test
        @DisplayName("Should pass when original has no skills")
        void shouldPassWhenNoOriginalSkills() {
            String noSkills = "{\"personalInfo\": {\"fullName\": \"John\"}, \"experience\": [], \"skills\": []}";
            String withSkills = "{\"personalInfo\": {\"fullName\": \"John\"}, \"experience\": [], \"skills\": [\"Java\"]}";
            assertThatNoException().isThrownBy(() -> validator.validate(noSkills, withSkills));
        }
    }

    @Nested
    @DisplayName("Malformed JSON handling")
    class MalformedJson {

        @Test
        @DisplayName("Should throw AppException for invalid JSON")
        void shouldThrowForInvalidJson() {
            assertThatThrownBy(() -> validator.validate("not json", "{}"))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Failed to validate");
        }

        @Test
        @DisplayName("Should throw AppException for null data in fields")
        void shouldHandleNullValuesInPersonalInfo() {
            String orig = """
                    {"personalInfo": {"fullName": "John", "email": null, "phone": null, "location": null, "linkedin": null, "portfolio": null}, "experience": [], "skills": []}
                    """;
            String tail = """
                    {"personalInfo": {"fullName": "John", "email": null, "phone": null, "location": null, "linkedin": null, "portfolio": null}, "experience": [], "skills": []}
                    """;
            assertThatNoException().isThrownBy(() -> validator.validate(orig, tail));
        }
    }
}
