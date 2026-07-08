export interface ScoreContribution {
  category: string;
  label: string;
  score: number;
  weight: number;
  weightedPoints: number;
  detail: string;
}

export interface ScoreExplanation {
  overallScore: number;
  summary: string;
  contributions: ScoreContribution[];
}

export interface CategoryExplanation {
  category: string;
  label: string;
  score: number;
  weight: number;
  explanation: string;
  detail: string;
  strengths: string[];
  weaknesses: string[];
}

export interface Recommendation {
  category: string;
  label: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedImpact: number;
  type: string;
}

export interface AtsReport {
  resumeId: string;
  jobDescriptionId: string;
  atsScore: number;
  matchPercentage: number;
  scoreExplanation: ScoreExplanation;
  categoryExplanations: CategoryExplanation[];
  recommendations: Recommendation[];
  missingSkills: string[];
  analyzedAt: string;
}
