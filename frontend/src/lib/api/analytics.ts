import { api } from './client';

export interface StageCount {
  stage: string;
  count: number;
}

export interface CompanyCount {
  company: string;
  count: number;
}

export interface ApplicationAnalytics {
  total: number;
  appliedThisWeek: number;
  appliedThisMonth: number;
  byStage: StageCount[];
  byCompany: CompanyCount[];
  successRate: number;
}

export interface ResumeAnalytics {
  total: number;
  active: number;
  averageAtsScore: number | null;
  highestAtsScore: number | null;
}

export interface JobDescriptionAnalytics {
  total: number;
  averageMatchScore: number | null;
  topSkills: string[];
}

export interface ScoreTrend {
  score: number;
  date: string;
}

export interface InterviewAnalytics {
  totalSessions: number;
  averageScore: number | null;
  scoreTrend: ScoreTrend[];
}

export interface CoverLetterAnalytics {
  generatedCount: number;
}

export interface RecentActivity {
  type: string;
  description: string;
  timestamp: string;
  entityId: string;
}

export interface AnalyticsResponse {
  applications: ApplicationAnalytics;
  resumes: ResumeAnalytics;
  jobDescriptions: JobDescriptionAnalytics;
  interviews: InterviewAnalytics;
  coverLetters: CoverLetterAnalytics;
  recentActivity: RecentActivity[];
}

export async function fetchDashboardAnalytics(): Promise<AnalyticsResponse> {
  return api.get<AnalyticsResponse>('/api/analytics/dashboard');
}
