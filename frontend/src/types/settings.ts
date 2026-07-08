export interface ProfileResponse {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  planTier: string;
  createdAt: string;
  settings: UserSettingsResponse;
}

export interface UserSettingsResponse {
  theme: string;
  defaultDashboardPage: string;
  defaultResumeId: string | null;
  defaultResumeName: string | null;
  defaultSortField: string;
  defaultSortDirection: string;
  notifyPasswordReset: boolean;
  notifyResumeParsed: boolean;
  notifyAtsComplete: boolean;
  notifyInterviewReady: boolean;
}

export interface UpdateProfileRequest {
  fullName: string;
  avatarUrl?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateSettingsRequest {
  theme?: string;
  defaultDashboardPage?: string;
  defaultResumeId?: string | null;
  defaultSortField?: string;
  defaultSortDirection?: string;
  notifyPasswordReset?: boolean;
  notifyResumeParsed?: boolean;
  notifyAtsComplete?: boolean;
  notifyInterviewReady?: boolean;
}

export interface SessionInfo {
  activeSessions: number;
}

export const DASHBOARD_PAGES = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'tracker', label: 'Application Tracker' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'resumes', label: 'Resumes' },
  { value: 'jobs', label: 'Job Match' },
] as const;

export const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
] as const;

export const SORT_OPTIONS = [
  { field: 'createdAt', direction: 'desc', label: 'Newest First' },
  { field: 'createdAt', direction: 'asc', label: 'Oldest First' },
  { field: 'company', direction: 'asc', label: 'Company A-Z' },
  { field: 'company', direction: 'desc', label: 'Company Z-A' },
] as const;
