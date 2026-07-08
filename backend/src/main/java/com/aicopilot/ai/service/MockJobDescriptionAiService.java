package com.aicopilot.ai.service;

import com.aicopilot.ai.dto.AiDtos.ParseResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@ConditionalOnProperty(name = "ai.provider", havingValue = "mock", matchIfMissing = true)
public class MockJobDescriptionAiService implements JobDescriptionAiService {

    @Override
    public ParseResponse analyzeJobDescription(UUID jdId, String rawText) {
        log.info("Mock analyzing job description: {} ({} chars)", jdId, rawText != null ? rawText.length() : 0);

        String title = rawText != null && !rawText.isBlank()
                ? extractTitle(rawText)
                : "Software Engineer";

        String structuredJson = generateMockJson(title);

        return ParseResponse.builder()
                .parsedContent(rawText)
                .structuredData(structuredJson)
                .success(true)
                .errorMessage(null)
                .build();
    }

    private String extractTitle(String rawText) {
        String[] lines = rawText.split("\n");
        for (String line : lines) {
            String trimmed = line.trim().toLowerCase();
            if (trimmed.contains("engineer") || trimmed.contains("developer")
                    || trimmed.contains("architect") || trimmed.contains("manager")
                    || trimmed.contains("designer") || trimmed.contains("analyst")) {
                return line.trim().length() > 60 ? line.trim().substring(0, 60).trim() : line.trim();
            }
        }
        String firstLine = lines[0].trim();
        return firstLine.length() > 60 ? firstLine.substring(0, 60).trim() : firstLine;
    }

    private String generateMockJson(String title) {
        int hash = Math.abs(title.hashCode());
        String[][] skillSets = {
                {"Java", "Spring Boot", "TypeScript", "React", "PostgreSQL", "Docker", "AWS", "Microservices", "Kubernetes", "REST APIs"},
                {"Python", "Django", "JavaScript", "Vue.js", "MySQL", "Kubernetes", "GCP", "CI/CD", "Terraform", "Redis"},
                {"Go", "gRPC", "React", "GraphQL", "MongoDB", "Terraform", "Azure", "Kafka", "Prometheus", "Envoy"},
                {"Ruby on Rails", "React Native", "PostgreSQL", "Redis", "Docker", "GCP", "Sidekiq", "Stimulus", "Turbo"},
                {"Rust", "Actix", "WebAssembly", "TypeScript", "Svelte", "SQLite", "AWS", "Nix", "Linux"},
                {"React", "Next.js", "TypeScript", "Tailwind CSS", "Node.js", "Vercel", "GraphQL", "Prisma", "Jest", "Cypress"}
        };

        String[] companies = {"Google", "Stripe", "Vercel", "Netflix", "Spotify", "GitHub", "Linear", "Figma"};
        String[] locations = {"San Francisco, CA", "New York, NY", "Remote", "Austin, TX", "Seattle, WA", "London, UK"};
        String[] types = {"Full-time", "Contract", "Full-time", "Full-time"};
        String[] seniorities = {"Senior", "Mid-Level", "Senior", "Staff", "Lead"};

        int si = hash % skillSets.length;
        int ci = hash % companies.length;
        int li = hash % locations.length;
        int ti = hash % types.length;
        int sei = hash % seniorities.length;

        String[] skills = skillSets[si];
        String skillsRequired = String.join("\", \"", java.util.Arrays.copyOfRange(skills, 0, 5));
        String skillsPreferred = String.join("\", \"", java.util.Arrays.copyOfRange(skills, 5, 8));
        String skillsNice = String.join("\", \"", java.util.Arrays.copyOfRange(skills, 8, Math.min(10, skills.length)));

        String company = companies[ci];
        String location = locations[li];

        return """
                {
                  "basicInfo": {
                    "title": "%s",
                    "company": "%s",
                    "location": "%s",
                    "remote": %b,
                    "employmentType": "%s",
                    "seniority": "%s"
                  },
                  "compensation": {
                    "salaryMin": %d,
                    "salaryMax": %d,
                    "currency": "USD",
                    "includesEquity": %b
                  },
                  "skills": {
                    "required": ["%s"],
                    "preferred": ["%s"],
                    "niceToHave": ["%s"]
                  },
                  "qualifications": {
                    "experienceYears": %d,
                    "education": "Bachelor's degree in Computer Science or equivalent",
                    "certifications": ["AWS Certified Solutions Architect"]
                  },
                  "responsibilities": [
                    "Design and implement scalable microservices",
                    "Collaborate with cross-functional teams to define technical requirements",
                    "Write clean, maintainable, and well-tested code",
                    "Participate in code reviews and mentor junior engineers",
                    "Contribute to system architecture decisions"
                  ],
                  "benefits": [
                    "Competitive salary and equity package",
                    "Health, dental, and vision insurance",
                    "401(k) with company match",
                    "Unlimited PTO",
                    "Remote-friendly work environment"
                  ],
                  "metadata": {
                    "postedDate": "2026-06-01",
                    "applicationDeadline": null
                  }
                }
                """.formatted(title, company, location, hash % 3 == 0, types[ti], seniorities[sei],
                        100000 + (hash % 100) * 1000, 150000 + (hash % 100) * 1000, hash % 2 == 0,
                        skillsRequired, skillsPreferred, skillsNice, 3 + (hash % 5));
    }

    @Override
    public boolean isAvailable() {
        return true;
    }
}
