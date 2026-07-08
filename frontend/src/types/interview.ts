export interface InterviewQuestion {
  id: string;
  category: 'HR' | 'TECHNICAL' | 'BEHAVIORAL';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  question: string;
  suggestedAnswer: string;
  keyPoints: string[];
  estimatedTime: string;
  followUpQuestions: string[];
}

export interface SessionData {
  title: string;
  difficulty: string;
  questions: InterviewQuestion[];
}

export interface UserAnswer {
  questionId: string;
  answer: string;
}

export interface InterviewFeedback {
  questionId: string;
  overallScore: number;
  relevanceScore: number;
  clarityScore: number;
  completenessScore: number;
  strengths: string[];
  improvements: string[];
  suggestedAnswer: string;
}

export interface ScoreResponse {
  feedback: InterviewFeedback[];
  overallScore: number;
}

export interface SessionListItem {
  id: string;
  title: string;
  sessionType: string;
  difficulty: string;
  status: string;
  questionCount: number;
  answeredCount: number;
  overallScore: number | null;
  companyName: string | null;
  roleTitle: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SessionDetail {
  id: string;
  title: string;
  sessionType: string;
  difficulty: string;
  status: string;
  questions: string | null;
  responses: string | null;
  overallScore: number | null;
  feedback: string | null;
  questionCount: number;
  answeredCount: number;
  resumeId: string | null;
  jobDescriptionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateInterviewRequest {
  resumeId: string;
  jobDescriptionId?: string;
  difficulty: string;
  questionCount: number;
  title?: string;
}

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type Difficulty = typeof DIFFICULTIES[number];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: 'text-emerald-500 bg-emerald-500/10',
  medium: 'text-amber-500 bg-amber-500/10',
  hard: 'text-rose-500 bg-rose-500/10',
};

export const CATEGORY_COLORS: Record<string, string> = {
  HR: 'text-blue-500 bg-blue-500/10',
  TECHNICAL: 'text-purple-500 bg-purple-500/10',
  BEHAVIORAL: 'text-orange-500 bg-orange-500/10',
};

export const CATEGORY_LABELS: Record<string, string> = {
  HR: 'HR',
  TECHNICAL: 'Technical',
  BEHAVIORAL: 'Behavioral',
};

export const STATUS_BADGES: Record<string, string> = {
  IN_PROGRESS: 'text-amber-500 bg-amber-500/10',
  COMPLETED: 'text-emerald-500 bg-emerald-500/10',
};
