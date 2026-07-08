package com.aicopilot.ai.service;

import com.aicopilot.ai.dto.AiDtos.ParseResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@ConditionalOnProperty(name = "ai.provider", havingValue = "mock", matchIfMissing = true)
public class MockAiService implements AiService {

    @Override
    public ParseResponse parseResume(UUID resumeId, String rawText) {
        log.info("Mock parsing resume: {} ({} chars)", resumeId, rawText != null ? rawText.length() : 0);

        String name = rawText != null && !rawText.isBlank()
                ? extractName(rawText)
                : "John Doe";

        String structuredJson = generateMockJson(name);

        return ParseResponse.builder()
                .parsedContent(rawText)
                .structuredData(structuredJson)
                .success(true)
                .errorMessage(null)
                .build();
    }

    private String extractName(String rawText) {
        String[] lines = rawText.split("\n");
        for (String line : lines) {
            String trimmed = line.trim();
            if (!trimmed.isEmpty() && !trimmed.toLowerCase().contains("resume")
                    && !trimmed.toLowerCase().contains("curriculum")) {
                return trimmed.length() > 40 ? trimmed.substring(0, 40).trim() : trimmed;
            }
        }
        return "Unknown Candidate";
    }

    private String generateMockJson(String name) {
        int hash = Math.abs(name.hashCode());
        String[] companies = {"Tech Corp", "InnoSoft", "DataFlow", "CloudBase", "NexGen", "OpenSource Labs", "Quantum Systems", "Pixel Perfect"};
        String[] titles = {"Senior Software Engineer", "Full Stack Developer", "Frontend Engineer", "Backend Architect", "DevOps Lead", "Data Engineer", "Mobile Developer", "Product Engineer"};
        String[] skillsets = {
                "Java,Spring Boot,TypeScript,React,PostgreSQL,Docker,AWS",
                "Python,Django,JavaScript,Vue.js,MySQL,Kubernetes,GCP",
                "Go,Microservices,React,GraphQL,MongoDB,Terraform,Azure",
                "Ruby on Rails,React Native,PostgreSQL,Redis,Docker,GCP",
                "Rust,Actix,WebAssembly,TypeScript,Svelte,SQLite,AWS"
        };
        String[] summaries = {
                "Experienced software engineer with deep expertise in building scalable distributed systems.",
                "Full-stack developer passionate about crafting delightful user experiences.",
                "Backend specialist focused on clean architecture and high-performance APIs.",
                "Versatile engineer with full product lifecycle experience from concept to deployment.",
                "Problem solver who thrives at the intersection of product and engineering."
        };

        int ci = hash % companies.length;
        int ti = hash % titles.length;
        int si = hash % skillsets.length;
        int sumi = hash % summaries.length;

        String email = name.toLowerCase().replaceAll("[^a-z0-9]", ".") + "@example.com";
        String[] nameParts = name.split(" ");
        String firstName = nameParts.length > 0 ? nameParts[0] : "Jane";
        String lastName = nameParts.length > 1 ? nameParts[1] : "Smith";
        String linkedin = "linkedin.com/in/" + firstName.toLowerCase() + lastName.toLowerCase();

        String[] skills = skillsets[si].split(",");
        String skillsJson = String.join("\", \"", skills);

        return """
                {
                  "personalInfo": {
                    "fullName": "%s",
                    "email": "%s",
                    "phone": "+1-555-%03d-%04d",
                    "location": "%s",
                    "linkedin": "%s"
                  },
                  "summary": "%s",
                  "skills": ["%s"],
                  "experience": [
                    {
                      "company": "%s",
                      "title": "%s",
                      "startDate": "2022-01",
                      "endDate": "Present",
                      "description": "Leading development of microservices architecture.",
                      "highlights": ["Scaled system to 1M+ users", "Reduced latency by 40%%"]
                    },
                    {
                      "company": "Startup Inc",
                      "title": "Software Engineer",
                      "startDate": "2019-03",
                      "endDate": "2021-12",
                      "description": "Built core product features using modern web technologies."
                    }
                  ],
                  "education": [
                    {
                      "institution": "University of California",
                      "degree": "B.S. Computer Science",
                      "startYear": 2015,
                      "endYear": 2019
                    }
                  ],
                  "certifications": ["AWS Solutions Architect Associate"],
                  "languages": ["English (Native)", "Spanish (Conversational)"]
                }
                """.formatted(name, email, hash % 900 + 100, hash % 9000 + 1000,
                        hash % 2 == 0 ? "San Francisco, CA" : "New York, NY",
                        linkedin, summaries[sumi], skillsJson, companies[ci], titles[ti]);
    }

    @Override
    public boolean isAvailable() {
        return true;
    }
}
