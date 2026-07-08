package com.aicopilot.match;

import java.util.HashMap;
import java.util.Map;

public final class SkillSynonymMap {

    private static final Map<String, String> SYNONYMS = new HashMap<>();

    static {
        SYNONYMS.put("react.js", "react");
        SYNONYMS.put("reactjs", "react");
        SYNONYMS.put("node.js", "nodejs");
        SYNONYMS.put("node", "nodejs");
        SYNONYMS.put("typescript", "ts");
        SYNONYMS.put("javascript", "js");
        SYNONYMS.put("express.js", "express");
        SYNONYMS.put("expressjs", "express");
        SYNONYMS.put("gcp", "google cloud");
        SYNONYMS.put("google cloud platform", "google cloud");
        SYNONYMS.put("aws", "amazon web services");
        SYNONYMS.put("azure", "microsoft azure");
        SYNONYMS.put("k8s", "kubernetes");
        SYNONYMS.put("k3s", "kubernetes");
        SYNONYMS.put("docker", "docker");
        SYNONYMS.put("postgresql", "postgres");
        SYNONYMS.put("postgres", "postgresql");
        SYNONYMS.put("sql", "sql");
        SYNONYMS.put("nosql", "nosql");
        SYNONYMS.put("redis", "redis");
        SYNONYMS.put("mongodb", "mongo");
        SYNONYMS.put("mongo", "mongodb");
        SYNONYMS.put("graphql", "graphql");
        SYNONYMS.put("rest", "rest api");
        SYNONYMS.put("rest api", "rest api");
        SYNONYMS.put("restful", "rest api");
        SYNONYMS.put("ci/cd", "cicd");
        SYNONYMS.put("ci cd", "cicd");
        SYNONYMS.put("cicd", "cicd");
        SYNONYMS.put("microservices", "microservice");
        SYNONYMS.put("microservice", "microservice");
        SYNONYMS.put("oop", "object oriented");
        SYNONYMS.put("object oriented", "object oriented");
        SYNONYMS.put("agile", "agile");
        SYNONYMS.put("scrum", "scrum");
        SYNONYMS.put("jira", "jira");
        SYNONYMS.put("git", "git");
        SYNONYMS.put("github", "git");
        SYNONYMS.put("gitlab", "git");
        SYNONYMS.put("python", "python");
        SYNONYMS.put("java", "java");
        SYNONYMS.put("spring", "spring boot");
        SYNONYMS.put("spring boot", "spring boot");
        SYNONYMS.put("spring framework", "spring boot");
        SYNONYMS.put("hibernate", "hibernate");
        SYNONYMS.put("jpa", "jpa");
        SYNONYMS.put("html", "html");
        SYNONYMS.put("css", "css");
        SYNONYMS.put("tailwind", "tailwind css");
        SYNONYMS.put("tailwindcss", "tailwind css");
        SYNONYMS.put("next.js", "nextjs");
        SYNONYMS.put("nextjs", "nextjs");
        SYNONYMS.put("vue.js", "vue");
        SYNONYMS.put("vuejs", "vue");
        SYNONYMS.put("angular", "angular");
        SYNONYMS.put("svelte", "svelte");
        SYNONYMS.put("terraform", "terraform");
        SYNONYMS.put("ansible", "ansible");
        SYNONYMS.put("jenkins", "jenkins");
        SYNONYMS.put("kafka", "kafka");
        SYNONYMS.put("rabbitmq", "rabbitmq");
    }

    public static String normalize(String skill) {
        if (skill == null) return null;
        String trimmed = skill.trim().toLowerCase();
        return SYNONYMS.getOrDefault(trimmed, trimmed);
    }

    private SkillSynonymMap() {}
}
