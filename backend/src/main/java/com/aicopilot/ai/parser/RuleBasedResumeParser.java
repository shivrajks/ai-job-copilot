package com.aicopilot.ai.parser;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Component
public class RuleBasedResumeParser {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");

    private static final Pattern PHONE_PATTERN =
            Pattern.compile("(?:\\+\\d{1,3}[\\s.-]?)?(?:\\(\\d{3}\\)[\\s.-]?|\\d{3}[\\s.-]?)\\d{3}[\\s.-]?\\d{4}");

    private static final Pattern LINKEDIN_PATTERN =
            Pattern.compile("linkedin\\.com/in/[a-zA-Z0-9_-]+", Pattern.CASE_INSENSITIVE);

    private static final Pattern GITHUB_PATTERN =
            Pattern.compile("github\\.com/[a-zA-Z0-9_-]+", Pattern.CASE_INSENSITIVE);

    private static final Pattern PORTFOLIO_PATTERN =
            Pattern.compile("(?:https?://)?(?:www\\.)?[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z]{2,})+(?:/[^\\s]*)?",
                    Pattern.CASE_INSENSITIVE);

    private static final Pattern DATE_RANGE_PATTERN =
            Pattern.compile("(?:(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)|(\\d{4}))\\s*(?:-|–|to)\\s*(?:(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)|(\\d{4})|(Present|Current|Now))",
                    Pattern.CASE_INSENSITIVE);

    private static final Pattern YEAR_PATTERN = Pattern.compile("\\b(19|20)\\d{2}\\b");

    private static final Pattern GPA_PATTERN =
            Pattern.compile("\\b(?:GPA|gpa)\\s*:?\\s*(\\d\\.?\\d?)", Pattern.CASE_INSENSITIVE);

    private static final Set<String> DEGREE_KEYWORDS = Set.of(
            "bachelor", "master", "phd", "doctorate", "associate",
            "b.s.", "b.a.", "m.s.", "m.a.", "ph.d.", "bs", "ba", "ms", "ma", "mba",
            "bachelor's", "master's", "bachelors", "masters",
            "bachelor of", "master of", "doctor of"
    );

    private static final Set<String> CERTIFICATION_KEYWORDS = Set.of(
            "certified", "certification", "aws certified", "google cloud certified",
            "azure", "pmp", "cissp", "comptia", "scrum", "itil", "ccna",
            "oracle certified", "red hat certified", "kubernetes",
            "cka", "ckad", "terraform", "hashicorp"
    );

    private static final Set<String> SECTION_HEADERS = Set.of(
            "experience", "work experience", "professional experience", "employment",
            "education", "academic", "academic background",
            "skills", "technical skills", "core competencies", "expertise",
            "projects", "project experience",
            "certifications", "certificates", "professional certifications",
            "summary", "professional summary", "profile", "objective", "career objective",
            "publications", "awards", "honors", "leadership",
            "languages", "language", "interests", "volunteer",
            "references"
    );

    private static final Map<String, List<String>> SKILL_ALIASES = new LinkedHashMap<>();

    static {
        SKILL_ALIASES.put("Java", List.of("java", "java 8", "java 11", "java 17", "java 21", "j2ee"));
        SKILL_ALIASES.put("Spring Boot", List.of("spring boot", "spring framework", "spring", "spring mvc", "spring cloud"));
        SKILL_ALIASES.put("TypeScript", List.of("typescript", "ts"));
        SKILL_ALIASES.put("JavaScript", List.of("javascript", "js", "ecmascript", "es6", "es2015"));
        SKILL_ALIASES.put("React", List.of("react", "react.js", "reactjs", "react native"));
        SKILL_ALIASES.put("Node.js", List.of("node.js", "nodejs", "node"));
        SKILL_ALIASES.put("Python", List.of("python", "python3"));
        SKILL_ALIASES.put("PostgreSQL", List.of("postgresql", "postgres", "psql"));
        SKILL_ALIASES.put("MySQL", List.of("mysql", "my sql"));
        SKILL_ALIASES.put("MongoDB", List.of("mongodb", "mongo", "mongo db"));
        SKILL_ALIASES.put("Docker", List.of("docker", "docker compose", "docker-compose"));
        SKILL_ALIASES.put("Kubernetes", List.of("kubernetes", "k8s", "kube"));
        SKILL_ALIASES.put("AWS", List.of("aws", "amazon web services", "ec2", "s3", "lambda", "ecs", "eks"));
        SKILL_ALIASES.put("Azure", List.of("azure", "microsoft azure"));
        SKILL_ALIASES.put("GCP", List.of("gcp", "google cloud", "google cloud platform"));
        SKILL_ALIASES.put("Go", List.of("go", "golang"));
        SKILL_ALIASES.put("GraphQL", List.of("graphql", "gql"));
        SKILL_ALIASES.put("REST APIs", List.of("rest", "rest api", "restful", "rest apis"));
        SKILL_ALIASES.put("Git", List.of("git", "github", "gitlab", "bitbucket"));
        SKILL_ALIASES.put("CI/CD", List.of("ci/cd", "cicd", "jenkins", "github actions", "gitlab ci"));
        SKILL_ALIASES.put("Redis", List.of("redis"));
        SKILL_ALIASES.put("Kafka", List.of("kafka", "apache kafka"));
        SKILL_ALIASES.put("HTML", List.of("html", "html5"));
        SKILL_ALIASES.put("CSS", List.of("css", "css3", "tailwind", "tailwind css", "bootstrap", "sass", "scss"));
        SKILL_ALIASES.put("Vue.js", List.of("vue", "vue.js", "vuejs"));
        SKILL_ALIASES.put("Angular", List.of("angular", "angular.js", "angularjs"));
        SKILL_ALIASES.put("C++", List.of("c++", "cplusplus", "cpp"));
        SKILL_ALIASES.put("C#", List.of("c#", "csharp", "c sharp"));
        SKILL_ALIASES.put("SQL", List.of("sql", "pl/sql", "tsql", "nosql"));
        SKILL_ALIASES.put("Rust", List.of("rust"));
        SKILL_ALIASES.put("Ruby", List.of("ruby", "ruby on rails", "rails"));
        SKILL_ALIASES.put("PHP", List.of("php"));
        SKILL_ALIASES.put("Swift", List.of("swift"));
        SKILL_ALIASES.put("Kotlin", List.of("kotlin"));
        SKILL_ALIASES.put("Dart", List.of("dart", "flutter"));
        SKILL_ALIASES.put("Scala", List.of("scala"));
        SKILL_ALIASES.put("Haskell", List.of("haskell"));
        SKILL_ALIASES.put("Terraform", List.of("terraform", "iac", "infrastructure as code"));
        SKILL_ALIASES.put("Ansible", List.of("ansible"));
        SKILL_ALIASES.put("Nginx", List.of("nginx"));
        SKILL_ALIASES.put("Apache", List.of("apache", "httpd", "tomcat"));
        SKILL_ALIASES.put("Microservices", List.of("microservices", "micro-service", "micro service"));
        SKILL_ALIASES.put("Agile", List.of("agile", "scrum", "kanban", "jira"));
        SKILL_ALIASES.put("Machine Learning", List.of("machine learning", "ml", "deep learning", "ai"));
        SKILL_ALIASES.put("Data Science", List.of("data science", "data analysis", "data mining"));
        SKILL_ALIASES.put("TensorFlow", List.of("tensorflow", "tf"));
        SKILL_ALIASES.put("PyTorch", List.of("pytorch"));
        SKILL_ALIASES.put("Django", List.of("django", "python django"));
        SKILL_ALIASES.put("Flask", List.of("flask"));
        SKILL_ALIASES.put("Next.js", List.of("next.js", "nextjs", "next"));
        SKILL_ALIASES.put("Express.js", List.of("express", "express.js", "expressjs"));
        SKILL_ALIASES.put("JPA", List.of("jpa", "hibernate", "jpa/hibernate"));
        SKILL_ALIASES.put(".NET", List.of(".net", "dotnet", "asp.net", "c# .net"));
        SKILL_ALIASES.put("RabbitMQ", List.of("rabbitmq", "rabbit mq"));
        SKILL_ALIASES.put("Elasticsearch", List.of("elasticsearch", "elastic search", "elk"));
        SKILL_ALIASES.put("Prometheus", List.of("prometheus"));
        SKILL_ALIASES.put("Grafana", List.of("grafana"));
    }

    public ParseResult parse(String rawText) {
        log.debug("Running rule-based parser on {} chars", rawText != null ? rawText.length() : 0);

        if (rawText == null || rawText.isBlank()) {
            return ParseResult.failure("Raw text is empty");
        }

        try {
            String normalizedText = normalizeText(rawText);
            List<String> lines = Arrays.asList(normalizedText.split("\n"));
            Map<String, List<String>> sections = splitIntoSections(lines);

            String personalInfo = sections.getOrDefault("__HEADER__", List.of())
                    .stream().collect(Collectors.joining("\n"));

            ObjectNode root = MAPPER.createObjectNode();

            root.set("personalInfo", extractPersonalInfo(personalInfo, rawText));
            root.set("summary", extractSummary(sections));
            root.set("skills", extractSkills(sections));
            root.set("experience", extractExperience(sections));
            root.set("education", extractEducation(sections));
            root.set("projects", extractProjects(sections));
            root.set("certifications", extractCertifications(sections));
            root.set("languages", extractLanguages(sections));

            String json = MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(root);
            return ParseResult.success(json, rawText);

        } catch (Exception e) {
            log.error("Rule-based parsing failed", e);
            return ParseResult.failure("Parsing error: " + e.getMessage());
        }
    }

    private String normalizeText(String text) {
        return text
                .replaceAll("\\r\\n?", "\n")
                .replaceAll("\\t", " ")
                .replaceAll("[\\u2022\\u2023\\u25E6\\u2043\\u2219]", "-")
                .replaceAll("\\u00A0", " ")
                .replaceAll("[\\u2013\\u2014]", "-")
                .replaceAll("[\\u2018\\u2019]", "'")
                .replaceAll("[\\u201C\\u201D]", "\"")
                .replaceAll(" +", " ")
                .replaceAll("(?m)^[\\s]*$", "")
                .trim();
    }

    private Map<String, List<String>> splitIntoSections(List<String> lines) {
        Map<String, List<String>> sections = new LinkedHashMap<>();
        String currentSection = "__HEADER__";
        sections.put(currentSection, new ArrayList<>());

        for (String line : lines) {
            String trimmed = line.trim().toLowerCase();
            String sectionKey = matchSectionHeader(trimmed);
            if (sectionKey != null) {
                currentSection = sectionKey;
                sections.putIfAbsent(currentSection, new ArrayList<>());
            } else {
                sections.get(currentSection).add(line.trim());
            }
        }

        return sections;
    }

    private String matchSectionHeader(String trimmedLine) {
        String stripped = trimmedLine.replaceAll("[^a-zA-Z0-9 /]", "").trim().toLowerCase();
        for (String header : SECTION_HEADERS) {
            if (stripped.equals(header) || stripped.startsWith(header + " ") || stripped.startsWith(header + "/")) {
                return header;
            }
        }
        return null;
    }

    private ObjectNode extractPersonalInfo(String headerText, String fullText) {
        ObjectNode info = MAPPER.createObjectNode();

        String email = findFirst(EMAIL_PATTERN, headerText, fullText);
        info.put("email", email);

        String phone = findFirst(PHONE_PATTERN, headerText, fullText);
        info.put("phone", phone);

        String linkedin = findFirst(LINKEDIN_PATTERN, headerText, fullText);
        info.put("linkedin", linkedin != null ? "https://www." + linkedin : null);

        String github = findFirst(GITHUB_PATTERN, headerText, fullText);
        info.put("github", github != null ? "https://" + github : null);

        String portfolio = extractPortfolioUrl(headerText, fullText);
        info.put("portfolio", portfolio);

        String name = extractName(headerText, email, phone);
        info.put("fullName", name);

        String location = extractLocation(headerText);
        info.put("location", location);

        return info;
    }

    private String extractName(String headerText, String email, String phone) {
        String[] lines = headerText.split("\n");
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty() || trimmed.length() < 2 || trimmed.length() > 60) continue;
            if (email != null && trimmed.contains(email)) continue;
            if (phone != null && trimmed.contains(phone)) continue;
            if (trimmed.contains("@") || trimmed.contains("http")) continue;
            if (trimmed.matches(".*\\d{4}.*")) continue;
            if (trimmed.equalsIgnoreCase(trimmed.toUpperCase()) && trimmed.length() > 3) continue;
            String[] parts = trimmed.split("\\s+");
            if (parts.length >= 2) {
                boolean allAlpha = Arrays.stream(parts).allMatch(p -> p.matches("[a-zA-Z.\\-']+"));
                if (allAlpha) {
                    return trimmed;
                }
            }
        }
        return null;
    }

    private String extractLocation(String headerText) {
        Pattern locationPattern = Pattern.compile(
                "([A-Z][a-z]+(?:\\s[A-Z][a-z]+)*,\\s*[A-Z]{2})");
        Matcher m = locationPattern.matcher(headerText);
        if (m.find()) return m.group(1);

        Pattern locationPattern2 = Pattern.compile(
                "([A-Z][a-z]+(?:\\s[A-Z][a-z]+)*,\\s*[A-Z][a-z]+(?:\\s[A-Z][a-z]+)*)");
        m = locationPattern2.matcher(headerText);
        if (m.find()) {
            String match = m.group(1);
            if (!match.contains("http") && !match.contains("@")) return match;
        }
        return null;
    }

    private String extractPortfolioUrl(String headerText, String fullText) {
        Matcher m = PORTFOLIO_PATTERN.matcher(fullText);
        Set<String> found = new LinkedHashSet<>();
        while (m.find()) {
            String url = m.group().toLowerCase();
            if (url.contains("linkedin") || url.contains("github")) continue;
            if (emailEnding(url)) continue;
            found.add(m.group());
        }
        for (String url : found) {
            if (!url.contains(" ") && !url.contains("\t") && url.contains(".")) {
                return url;
            }
        }
        return null;
    }

    private boolean emailEnding(String url) {
        return url.matches(".*\\.[a-z]{2,3}$") && !url.contains("/");
    }

    private ObjectNode extractSummary(Map<String, List<String>> sections) {
        for (Map.Entry<String, List<String>> entry : sections.entrySet()) {
            String key = entry.getKey();
            if (key.equals("summary") || key.equals("professional summary") ||
                    key.equals("profile") || key.equals("objective") || key.equals("career objective")) {
                String text = entry.getValue().stream()
                        .filter(l -> !l.isEmpty())
                        .collect(Collectors.joining(" "));
                if (!text.isBlank()) {
                    return MAPPER.createObjectNode().put("text", text);
                }
            }
        }
        return MAPPER.createObjectNode().putNull("text");
    }

    private ArrayNode extractSkills(Map<String, List<String>> sections) {
        Set<String> foundSkills = new LinkedHashSet<>();

        for (Map.Entry<String, List<String>> entry : sections.entrySet()) {
            String key = entry.getKey();
            if (key.equals("skills") || key.equals("technical skills") ||
                    key.equals("core competencies") || key.equals("expertise")) {
                for (String line : entry.getValue()) {
                    String[] parts = line.split("[,|\\-•·\\n]+");
                    for (String part : parts) {
                        String skill = part.trim().toLowerCase();
                        if (skill.length() >= 2) {
                            foundSkills.add(skill);
                        }
                    }
                }
            }
        }

        String fullText = sections.values().stream()
                .flatMap(Collection::stream)
                .collect(Collectors.joining("\n"))
                .toLowerCase();

        for (String line : fullText.split("\n")) {
            String trimmed = line.trim();
            if (trimmed.length() > 2 && trimmed.length() < 50 &&
                    !trimmed.startsWith("http") && !trimmed.contains("@")) {
                foundSkills.add(trimmed);
            }
        }

        Set<String> normalized = new LinkedHashSet<>();
        for (String raw : foundSkills) {
            String matched = matchKnownSkill(raw);
            if (matched != null) {
                normalized.add(matched);
            } else {
                normalized.add(cleanSkillName(raw));
            }
        }

        normalized.removeIf(s -> s.length() > 35 || s.length() < 2 ||
                s.matches(".*\\d{4}.*") || s.matches("^[\\d\\s\\-.,;:/\\\\()\\[\\]{}]+$"));

        ArrayNode skills = MAPPER.createArrayNode();
        for (String s : normalized) {
            if (skills.size() >= 50) break;
            skills.add(s);
        }
        return skills;
    }

    private String matchKnownSkill(String raw) {
        String lower = raw.toLowerCase().trim();
        for (Map.Entry<String, List<String>> entry : SKILL_ALIASES.entrySet()) {
            for (String alias : entry.getValue()) {
                if (lower.equals(alias) || lower.startsWith(alias + " ") || lower.endsWith(" " + alias)) {
                    return entry.getKey();
                }
            }
        }
        return null;
    }

    private String cleanSkillName(String raw) {
        return raw.trim()
                .replaceAll("^[,|\\-•·\\s]+", "")
                .replaceAll("[,|\\-•·\\s]+$", "")
                .trim();
    }

    private ArrayNode extractExperience(Map<String, List<String>> sections) {
        String sectionKey = null;
        for (String key : List.of("experience", "work experience", "professional experience", "employment")) {
            if (sections.containsKey(key)) {
                sectionKey = key;
                break;
            }
        }

        if (sectionKey == null) {
            return MAPPER.createArrayNode();
        }

        List<String> lines = sections.get(sectionKey);
        return parseExperienceBlocks(lines);
    }

    private ArrayNode parseExperienceBlocks(List<String> lines) {
        ArrayNode experiences = MAPPER.createArrayNode();
        List<String> currentBlock = new ArrayList<>();

        for (String line : lines) {
            if (line.isBlank()) {
                if (!currentBlock.isEmpty()) {
                    ObjectNode exp = buildExperienceEntry(currentBlock);
                    if (exp != null) experiences.add(exp);
                    currentBlock.clear();
                }
                continue;
            }
            currentBlock.add(line);
        }

        if (!currentBlock.isEmpty()) {
            ObjectNode exp = buildExperienceEntry(currentBlock);
            if (exp != null) experiences.add(exp);
        }

        return experiences;
    }

    private ObjectNode buildExperienceEntry(List<String> block) {
        if (block.isEmpty()) return null;

        ObjectNode exp = MAPPER.createObjectNode();
        String joined = String.join("\n", block);

        List<String> remaining = new ArrayList<>(block);

        String dateRange = extractDateRange(joined);
        exp.put("startDate", extractStartDate(dateRange));
        exp.put("endDate", extractEndDate(dateRange));

        if (dateRange != null) {
            remaining.removeIf(l -> l.contains(dateRange) || l.contains(dateRange.replace("-", "–")));
        }

        String company = extractCompany(remaining);
        String title = extractTitle(remaining, company);

        exp.put("company", company);
        exp.put("title", title);

        String descText = remaining.stream()
                .filter(l -> !l.equalsIgnoreCase(company) && !l.equalsIgnoreCase(title))
                .collect(Collectors.joining("\n"));
        exp.put("description", descText.isBlank() ? null : descText);

        ArrayNode highlights = MAPPER.createArrayNode();
        for (String line : block) {
            String trimmed = line.trim();
            if (trimmed.startsWith("-") || trimmed.startsWith("•") || trimmed.startsWith("*") ||
                    trimmed.matches("^\\d+\\.\\s.*")) {
                String clean = trimmed.replaceAll("^[-•*\\d.]+\\s*", "").trim();
                if (!clean.isEmpty()) highlights.add(clean);
            }
        }
        exp.set("highlights", highlights);

        return exp;
    }

    private String extractCompany(List<String> lines) {
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty()) continue;
            if (trimmed.equalsIgnoreCase(trimmed.toUpperCase()) && trimmed.length() > 3) {
                return titleCase(trimmed);
            }
            if (trimmed.endsWith(",") || trimmed.endsWith(".")) {
                String candidate = trimmed.replaceAll("[.,]$", "").trim();
                if (candidate.split("\\s+").length <= 4 &&
                        candidate.chars().filter(Character::isUpperCase).count() >= 2) {
                    return candidate;
                }
            }
        }
        return lines.isEmpty() ? null : lines.get(0).trim();
    }

    private String extractTitle(List<String> lines, String company) {
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty()) continue;
            if (company != null && trimmed.contains(company)) continue;
            if (trimmed.equalsIgnoreCase(trimmed.toUpperCase())) continue;
            if (trimmed.length() > 3 && trimmed.length() < 80) {
                return trimmed;
            }
        }
        return null;
    }

    private String extractDateRange(String text) {
        Matcher m = DATE_RANGE_PATTERN.matcher(text);
        if (m.find()) {
            return m.group();
        }
        return null;
    }

    private String extractStartDate(String dateRange) {
        if (dateRange == null) return null;
        String[] parts = dateRange.split("\\s*(?:-|–|to)\\s*");
        return parts.length > 0 ? normalizeDate(parts[0].trim()) : null;
    }

    private String extractEndDate(String dateRange) {
        if (dateRange == null) return null;
        String[] parts = dateRange.split("\\s*(?:-|–|to)\\s*");
        if (parts.length > 1) {
            String end = parts[1].trim();
            if (end.equalsIgnoreCase("present") || end.equalsIgnoreCase("current") || end.equalsIgnoreCase("now")) {
                return "Present";
            }
            return normalizeDate(end);
        }
        return null;
    }

    private String normalizeDate(String dateStr) {
        if (dateStr == null) return null;
        dateStr = dateStr.trim().replaceAll("\\.", "");

        if (dateStr.matches("\\d{4}")) {
            return dateStr;
        }

        Map<String, String> months = Map.ofEntries(
                Map.entry("jan", "01"), Map.entry("january", "01"),
                Map.entry("feb", "02"), Map.entry("february", "02"),
                Map.entry("mar", "03"), Map.entry("march", "03"),
                Map.entry("apr", "04"), Map.entry("april", "04"),
                Map.entry("may", "05"),
                Map.entry("jun", "06"), Map.entry("june", "06"),
                Map.entry("jul", "07"), Map.entry("july", "07"),
                Map.entry("aug", "08"), Map.entry("august", "08"),
                Map.entry("sep", "09"), Map.entry("september", "09"),
                Map.entry("oct", "10"), Map.entry("october", "10"),
                Map.entry("nov", "11"), Map.entry("november", "11"),
                Map.entry("dec", "12"), Map.entry("december", "12")
        );

        String lower = dateStr.toLowerCase();
        for (Map.Entry<String, String> entry : months.entrySet()) {
            if (lower.startsWith(entry.getKey())) {
                String afterMonth = lower.substring(entry.getKey().length()).trim();
                Matcher yearMatcher = YEAR_PATTERN.matcher(afterMonth);
                if (yearMatcher.find()) {
                    return yearMatcher.group() + "-" + entry.getValue();
                }
                return entry.getValue();
            }
        }

        Matcher yearMatcher = YEAR_PATTERN.matcher(dateStr);
        if (yearMatcher.find()) {
            return yearMatcher.group();
        }

        return null;
    }

    private String titleCase(String text) {
        return Arrays.stream(text.split("\\s+"))
                .map(w -> w.isEmpty() ? w :
                        Character.toUpperCase(w.charAt(0)) + w.substring(1).toLowerCase())
                .collect(Collectors.joining(" "));
    }

    private ArrayNode extractEducation(Map<String, List<String>> sections) {
        String sectionKey = null;
        for (String key : List.of("education", "academic", "academic background")) {
            if (sections.containsKey(key)) {
                sectionKey = key;
                break;
            }
        }

        if (sectionKey == null) return MAPPER.createArrayNode();

        List<String> lines = sections.get(sectionKey);
        return parseEducationBlocks(lines);
    }

    private ArrayNode parseEducationBlocks(List<String> lines) {
        ArrayNode education = MAPPER.createArrayNode();
        List<String> currentBlock = new ArrayList<>();

        for (String line : lines) {
            if (line.isBlank()) {
                if (!currentBlock.isEmpty()) {
                    ObjectNode edu = buildEducationEntry(currentBlock);
                    if (edu != null) education.add(edu);
                    currentBlock.clear();
                }
                continue;
            }
            currentBlock.add(line);
        }

        if (!currentBlock.isEmpty()) {
            ObjectNode edu = buildEducationEntry(currentBlock);
            if (edu != null) education.add(edu);
        }

        return education;
    }

    private ObjectNode buildEducationEntry(List<String> block) {
        if (block.isEmpty()) return null;

        ObjectNode edu = MAPPER.createObjectNode();
        String joined = String.join("\n", block);

        String institution = extractInstitution(block);
        edu.put("institution", institution);

        String degree = extractDegree(joined);
        edu.put("degree", degree);

        String field = extractField(joined, degree);
        edu.put("field", field);

        Integer startYear = extractStartYear(joined);
        Integer endYear = extractEndYear(joined);
        if (startYear != null) { edu.put("startYear", startYear); } else { edu.putNull("startYear"); }
        if (endYear != null) { edu.put("endYear", endYear); } else { edu.putNull("endYear"); }

        String gpa = extractGpa(joined);
        edu.put("gpa", gpa);

        return edu;
    }

    private String extractInstitution(List<String> lines) {
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty()) continue;
            if (trimmed.toLowerCase().contains("university") ||
                    trimmed.toLowerCase().contains("college") ||
                    trimmed.toLowerCase().contains("institute") ||
                    trimmed.toLowerCase().contains("school") ||
                    trimmed.toLowerCase().contains("academy")) {
                return trimmed.replaceAll("[,\\d]{4,}.*", "").trim();
            }
        }
        return lines.isEmpty() ? null : lines.get(0).trim();
    }

    private String extractDegree(String text) {
        String lower = text.toLowerCase();
        for (String keyword : DEGREE_KEYWORDS) {
            if (lower.contains(keyword)) {
                int start = lower.indexOf(keyword);
                int end = Math.min(start + 60, lower.length());
                String snippet = text.substring(start, end);
                return snippet.replaceAll(",\\s*\\d{4}.*", "").trim();
            }
        }
        return null;
    }

    private String extractField(String text, String degree) {
        if (degree == null) return null;
        String lower = text.toLowerCase();
        String degreeLower = degree.toLowerCase();

        int degreeEnd = lower.indexOf(degreeLower) + degreeLower.length();
        String afterDegree = text.substring(Math.min(degreeEnd, text.length())).trim();

        if (afterDegree.startsWith(" in ")) {
            String field = afterDegree.substring(4);
            int comma = field.indexOf(',');
            int year = field.indexOf("20");
            int end = field.length();
            if (comma > 0 && comma < 50) end = Math.min(end, comma);
            if (year > 0 && year < 50) end = Math.min(end, year);
            return field.substring(0, end).trim();
        }

        return null;
    }

    private Integer extractStartYear(String text) {
        String lower = text.toLowerCase();
        String datePrefixes[] = {"20", "19"};
        for (String prefix : datePrefixes) {
            int idx = lower.indexOf(prefix);
            if (idx >= 0) {
                String snippet = lower.substring(Math.max(0, idx - 10), Math.min(lower.length(), idx + 10));
                Pattern yearsPattern = Pattern.compile("(19|20)\\d{2}");
                Matcher m = yearsPattern.matcher(snippet);
                List<String> years = new ArrayList<>();
                while (m.find()) years.add(m.group());
                if (years.size() >= 2) {
                    return Integer.parseInt(years.get(0));
                }
                if (years.size() == 1) {
                    return Integer.parseInt(years.get(0));
                }
            }
        }
        return null;
    }

    private Integer extractEndYear(String text) {
        Pattern yearsPattern = Pattern.compile("(19|20)\\d{2}");
        Matcher m = yearsPattern.matcher(text);
        List<String> years = new ArrayList<>();
        while (m.find()) years.add(m.group());
        if (years.size() >= 2) {
            return Integer.parseInt(years.get(years.size() - 1));
        }
        return null;
    }

    private String extractGpa(String text) {
        Matcher m = GPA_PATTERN.matcher(text);
        if (m.find()) {
            return m.group(1);
        }
        return null;
    }

    private ArrayNode extractProjects(Map<String, List<String>> sections) {
        String sectionKey = null;
        for (String key : List.of("projects", "project experience")) {
            if (sections.containsKey(key)) {
                sectionKey = key;
                break;
            }
        }

        if (sectionKey == null) return MAPPER.createArrayNode();

        List<String> lines = sections.get(sectionKey);
        ArrayNode projects = MAPPER.createArrayNode();
        List<String> currentBlock = new ArrayList<>();

        for (String line : lines) {
            if (line.isBlank()) {
                if (!currentBlock.isEmpty()) {
                    ObjectNode proj = buildProjectEntry(currentBlock);
                    if (proj != null) projects.add(proj);
                    currentBlock.clear();
                }
                continue;
            }
            currentBlock.add(line);
        }

        if (!currentBlock.isEmpty()) {
            ObjectNode proj = buildProjectEntry(currentBlock);
            if (proj != null) projects.add(proj);
        }

        return projects;
    }

    private ObjectNode buildProjectEntry(List<String> block) {
        if (block.isEmpty()) return null;
        ObjectNode proj = MAPPER.createObjectNode();
        String joined = String.join("\n", block);

        proj.put("name", block.get(0).trim());
        proj.put("description", block.size() > 1 ?
                block.subList(1, block.size()).stream().collect(Collectors.joining(" ")) : null);

        ArrayNode highlights = MAPPER.createArrayNode();
        for (String line : block) {
            String trimmed = line.trim();
            if (trimmed.startsWith("-") || trimmed.startsWith("•")) {
                highlights.add(trimmed.replaceAll("^[-•*]\\s*", "").trim());
            }
        }
        proj.set("highlights", highlights);

        String url = findFirst(PORTFOLIO_PATTERN, joined, null);
        proj.put("url", url);
        proj.put("startDate", extractStartDate(extractDateRange(joined)));
        proj.put("endDate", extractEndDate(extractDateRange(joined)));

        return proj;
    }

    private ArrayNode extractCertifications(Map<String, List<String>> sections) {
        Set<String> certs = new LinkedHashSet<>();

        for (Map.Entry<String, List<String>> entry : sections.entrySet()) {
            String key = entry.getKey();
            if (key.equals("certifications") || key.equals("certificates") || key.equals("professional certifications")) {
                for (String line : entry.getValue()) {
                    String trimmed = line.trim().replaceAll("^[-•*\\d.]+\\s*", "").trim();
                    if (!trimmed.isEmpty()) certs.add(trimmed);
                }
            }
        }

        if (certs.isEmpty()) {
            String fullText = sections.values().stream()
                    .flatMap(Collection::stream)
                    .collect(Collectors.joining("\n"))
                    .toLowerCase();

            for (String keyword : CERTIFICATION_KEYWORDS) {
                int idx = fullText.indexOf(keyword);
                if (idx >= 0) {
                    int start = Math.max(0, idx);
                    int end = Math.min(fullText.length(), idx + 60);
                    String snippet = fullText.substring(start, end);
                    int newlineIdx = snippet.indexOf('\n');
                    if (newlineIdx > 0) snippet = snippet.substring(0, newlineIdx);
                    certs.add(snippet.trim().replaceAll("^[-•*\\s]+", ""));
                }
            }
        }

        ArrayNode result = MAPPER.createArrayNode();
        for (String cert : certs) {
            if (result.size() >= 20) break;
            result.add(cert);
        }
        return result;
    }

    private ArrayNode extractLanguages(Map<String, List<String>> sections) {
        Set<String> languages = new LinkedHashSet<>();

        for (Map.Entry<String, List<String>> entry : sections.entrySet()) {
            if (entry.getKey().equals("languages") || entry.getKey().equals("language")) {
                for (String line : entry.getValue()) {
                    String trimmed = line.trim().replaceAll("^[-•*\\d.]+\\s*", "").trim();
                    if (!trimmed.isEmpty()) {
                        languages.add(trimmed.replaceAll("\\s*\\(.*?\\)", "").trim());
                    }
                }
            }
        }

        if (languages.isEmpty()) {
            String fullText = sections.values().stream()
                    .flatMap(Collection::stream)
                    .collect(Collectors.joining("\n"))
                    .toLowerCase();

            Set<String> knownLanguages = Set.of(
                    "english", "spanish", "french", "german", "mandarin", "chinese",
                    "japanese", "korean", "russian", "arabic", "portuguese", "italian",
                    "dutch", "hindi", "bengali", "turkish", "vietnamese", "thai",
                    "swedish", "norwegian", "danish", "finnish", "polish", "hebrew"
            );

            for (String lang : knownLanguages) {
                if (fullText.contains(lang)) {
                    languages.add(lang.substring(0, 1).toUpperCase() + lang.substring(1));
                }
            }
        }

        ArrayNode result = MAPPER.createArrayNode();
        for (String lang : languages) {
            if (result.size() >= 10) break;
            result.add(lang);
        }
        return result;
    }

    private String findFirst(Pattern pattern, String primary, String fallback) {
        if (primary != null) {
            Matcher m = pattern.matcher(primary);
            if (m.find()) return m.group();
        }
        if (fallback != null) {
            Matcher m = pattern.matcher(fallback);
            if (m.find()) return m.group();
        }
        return null;
    }

    public record ParseResult(
            boolean success,
            String structuredData,
            String parsedContent,
            String errorMessage
    ) {
        public static ParseResult success(String structuredData, String parsedContent) {
            return new ParseResult(true, structuredData, parsedContent, null);
        }

        public static ParseResult failure(String errorMessage) {
            return new ParseResult(false, null, null, errorMessage);
        }
    }
}
