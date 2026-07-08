export type JobStatus =
  | 'SAVED'
  | 'APPLIED'
  | 'PHONE_SCREEN'
  | 'TECHNICAL_INTERVIEW'
  | 'ONSITE_INTERVIEW'
  | 'OFFER'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN';

export type EmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'INTERNSHIP'
  | 'FREELANCE'
  | 'TEMPORARY';

export type WorkMode = 'REMOTE' | 'HYBRID' | 'ONSITE';

export type JobSource = 'LINKEDIN' | 'INDEED' | 'COMPANY' | 'MANUAL' | 'REFERRAL' | 'OTHER';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export type OfferStatus = 'PENDING' | 'NEGOTIATING' | 'ACCEPTED' | 'DECLINED';

export interface JobListItem {
  id: string;
  title: string;
  company: string;
  location: string | null;
  employmentType: string | null;
  workMode: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  source: string | null;
  sourceUrl: string | null;
  status: JobStatus;
  priority: string;
  isFavorite: boolean;
  isArchived: boolean;
  dateSaved: string | null;
  deadline: string | null;
  appliedDate: string | null;
  followUpDate: string | null;
  offerStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobDetail {
  id: string;
  title: string;
  company: string;
  location: string | null;
  employmentType: string | null;
  workMode: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  description: string | null;
  skillsRequired: string[] | null;
  experienceRequired: string | null;
  source: string | null;
  sourceUrl: string | null;
  notes: string | null;
  dateSaved: string | null;
  deadline: string | null;
  priority: string;
  isFavorite: boolean;
  isArchived: boolean;
  status: JobStatus;
  appliedDate: string | null;
  interviewDates: string[] | null;
  offerStatus: string | null;
  rejectionReason: string | null;
  followUpDate: string | null;
  resumeId: string | null;
  resumeName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobRequest {
  title: string;
  company: string;
  location?: string;
  employmentType?: EmploymentType;
  workMode?: WorkMode;
  salaryMin?: number;
  salaryMax?: number;
  description?: string;
  skillsRequired?: string[];
  experienceRequired?: string;
  source?: JobSource;
  sourceUrl?: string;
  notes?: string;
  dateSaved?: string;
  deadline?: string;
  priority?: Priority;
  status?: JobStatus;
  appliedDate?: string;
  interviewDates?: string[];
  offerStatus?: OfferStatus;
  rejectionReason?: string;
  followUpDate?: string;
}

export interface UpdateJobRequest {
  title: string;
  company: string;
  location?: string;
  employmentType?: EmploymentType;
  workMode?: WorkMode;
  salaryMin?: number;
  salaryMax?: number;
  description?: string;
  skillsRequired?: string[];
  experienceRequired?: string;
  source?: JobSource;
  sourceUrl?: string;
  notes?: string;
  dateSaved?: string;
  deadline?: string;
  priority?: Priority;
  status?: JobStatus;
  appliedDate?: string;
  interviewDates?: string[];
  offerStatus?: OfferStatus;
  rejectionReason?: string;
  followUpDate?: string;
}

export interface StatusUpdateRequest {
  status: JobStatus;
  rejectionReason?: string;
}

export interface JobStats {
  total: number;
  saved: number;
  applied: number;
  interviewing: number;
  offers: number;
  accepted: number;
  rejected: number;
  withdrawn: number;
  archived: number;
  favorites: number;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export const JOB_STATUSES: JobStatus[] = [
  'SAVED',
  'APPLIED',
  'PHONE_SCREEN',
  'TECHNICAL_INTERVIEW',
  'ONSITE_INTERVIEW',
  'OFFER',
  'ACCEPTED',
  'REJECTED',
  'WITHDRAWN',
];

export const STATUS_LABELS: Record<JobStatus, string> = {
  SAVED: 'Saved',
  APPLIED: 'Applied',
  PHONE_SCREEN: 'Phone Screen',
  TECHNICAL_INTERVIEW: 'Technical',
  ONSITE_INTERVIEW: 'Onsite',
  OFFER: 'Offer',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
};

export const STATUS_COLORS: Record<JobStatus, string> = {
  SAVED: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
  APPLIED: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  PHONE_SCREEN: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  TECHNICAL_INTERVIEW: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  ONSITE_INTERVIEW: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  OFFER: 'bg-green-500/10 text-green-500 border-green-500/20',
  ACCEPTED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  REJECTED: 'bg-red-500/10 text-red-500 border-red-500/20',
  WITHDRAWN: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export const EMPLOYMENT_TYPES: EmploymentType[] = [
  'FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE', 'TEMPORARY',
];

export const EMPLOYMENT_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
  TEMPORARY: 'Temporary',
};

export const WORK_MODES: WorkMode[] = ['REMOTE', 'HYBRID', 'ONSITE'];

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
  ONSITE: 'On-site',
};

export const SOURCE_LABELS: Record<JobSource, string> = {
  LINKEDIN: 'LinkedIn',
  INDEED: 'Indeed',
  COMPANY: 'Company',
  MANUAL: 'Manual',
  REFERRAL: 'Referral',
  OTHER: 'Other',
};

export const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH'];

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};
