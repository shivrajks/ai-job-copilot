import { api } from './client';
import type {
  JobListItem,
  JobDetail,
  CreateJobRequest,
  UpdateJobRequest,
  StatusUpdateRequest,
  JobStats,
  PageResponse,
} from '@/types/jobs';

export interface JobListParams {
  search?: string;
  status?: string;
  company?: string;
  location?: string;
  work_mode?: string;
  favorite?: boolean;
  archived?: boolean;
  priority?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  size?: number;
  sort_field?: string;
  sort_direction?: string;
}

export async function fetchJobs(params?: JobListParams): Promise<PageResponse<JobListItem>> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, String(value));
      }
    });
  }
  const query = searchParams.toString();
  return api.get<PageResponse<JobListItem>>(`/api/jobs${query ? `?${query}` : ''}`);
}

export async function getJob(id: string): Promise<JobDetail> {
  return api.get<JobDetail>(`/api/jobs/${id}`);
}

export async function getJobStats(): Promise<JobStats> {
  return api.get<JobStats>('/api/jobs/stats');
}

export async function createJob(data: CreateJobRequest): Promise<JobDetail> {
  return api.post<JobDetail>('/api/jobs', data);
}

export async function updateJob(id: string, data: UpdateJobRequest): Promise<JobDetail> {
  return api.put<JobDetail>(`/api/jobs/${id}`, data);
}

export async function updateJobStatus(id: string, data: StatusUpdateRequest): Promise<JobDetail> {
  return api.patch<JobDetail>(`/api/jobs/${id}/status`, data);
}

export async function toggleFavorite(id: string, favorite: boolean): Promise<JobDetail> {
  return api.patch<JobDetail>(`/api/jobs/${id}/favorite`, { favorite });
}

export async function toggleArchive(id: string, archived: boolean): Promise<JobDetail> {
  return api.patch<JobDetail>(`/api/jobs/${id}/archive`, { archived });
}

export async function deleteJob(id: string): Promise<void> {
  return api.delete<void>(`/api/jobs/${id}`);
}
