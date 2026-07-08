export type ApplicationStage =
  | 'SAVED'
  | 'APPLIED'
  | 'PHONE_SCREEN'
  | 'TECHNICAL_INTERVIEW'
  | 'ONSITE'
  | 'OFFER'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface ApplicationListItem {
  id: string;
  company: string;
  role: string;
  location: string | null;
  stage: ApplicationStage;
  resumeId: string | null;
  resumeName: string | null;
  appliedAt: string | null;
  createdAt: string;
}

export interface ApplicationDetail {
  id: string;
  company: string;
  role: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  jobUrl: string | null;
  resumeId: string | null;
  resumeName: string | null;
  jobDescriptionId: string | null;
  jobDescriptionTitle: string | null;
  stage: ApplicationStage;
  notes: string | null;
  appliedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicationRequest {
  company: string;
  role: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  jobUrl?: string;
  resumeId?: string;
  stage?: ApplicationStage;
  notes?: string;
  appliedAt?: string;
}

export interface UpdateApplicationRequest {
  company: string;
  role: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  jobUrl?: string;
  resumeId?: string;
  stage?: ApplicationStage;
  notes?: string;
  appliedAt?: string;
}

export interface StageUpdateRequest {
  stage: ApplicationStage;
}

export interface BatchIdsRequest {
  ids: string[];
}

export const APPLICATION_STAGES: ApplicationStage[] = [
  'SAVED',
  'APPLIED',
  'PHONE_SCREEN',
  'TECHNICAL_INTERVIEW',
  'ONSITE',
  'OFFER',
  'ACCEPTED',
  'REJECTED',
  'WITHDRAWN',
];

export const STAGE_LABELS: Record<ApplicationStage, string> = {
  SAVED: 'Saved',
  APPLIED: 'Applied',
  PHONE_SCREEN: 'Assessment',
  TECHNICAL_INTERVIEW: 'Interview',
  ONSITE: 'Onsite',
  OFFER: 'Offer',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
};

export const STAGE_COLORS: Record<ApplicationStage, string> = {
  SAVED: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
  APPLIED: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  PHONE_SCREEN: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  TECHNICAL_INTERVIEW: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  ONSITE: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  OFFER: 'bg-green-500/10 text-green-500 border-green-500/20',
  ACCEPTED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  REJECTED: 'bg-red-500/10 text-red-500 border-red-500/20',
  WITHDRAWN: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};
