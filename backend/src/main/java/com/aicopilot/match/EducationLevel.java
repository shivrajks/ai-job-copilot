package com.aicopilot.match;

public enum EducationLevel {
    NONE(0),
    ASSOCIATE(1),
    BACHELOR(2),
    MASTER(3),
    PHD(4);

    private final int level;

    EducationLevel(int level) {
        this.level = level;
    }

    public int getLevel() {
        return level;
    }

    public static EducationLevel fromString(String text) {
        if (text == null || text.isBlank()) return NONE;

        String lower = text.toLowerCase().trim();

        if (containsAny(lower, "phd", "doctorate", "doctor")) return PHD;
        if (containsAny(lower, "master", "ms ", "mba", "ma ", "m.s.", "m.a.")) return MASTER;
        if (containsAny(lower, "bachelor", "bs ", "ba ", "btech", "be ", "b.e.", "b.s.", "b.tech", "bachelors")) return BACHELOR;
        if (containsAny(lower, "associate", "aa ", "as ", "a.a.", "a.s.")) return ASSOCIATE;

        return NONE;
    }

    private static boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword)) return true;
        }
        return false;
    }
}
