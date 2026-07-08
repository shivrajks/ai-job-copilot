export interface CategoryBreakdown {
  score: number;
  weight: number;
  label: string;
  detail: string;
}

export interface MatchResult {
  resumeId: string;
  jobDescriptionId: string;
  atsScore: number;
  matchPercentage: number;
  categoryBreakdown: Record<string, CategoryBreakdown>;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  analyzedAt: string;
}
