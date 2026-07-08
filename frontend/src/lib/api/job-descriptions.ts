import { api } from './client';
import type {
  JobDescriptionListItem,
  JobDescriptionDetail,
  CreateJobDescriptionRequest,
  UpdateJobDescriptionRequest,
} from '@/types/job-description';

export async function fetchJobDescriptions(): Promise<JobDescriptionListItem[]> {
  return api.get<JobDescriptionListItem[]>('/api/job-descriptions');
}

export async function getJobDescription(id: string): Promise<JobDescriptionDetail> {
  return api.get<JobDescriptionDetail>(`/api/job-descriptions/${id}`);
}

export async function createJobDescription(
  data: CreateJobDescriptionRequest
): Promise<JobDescriptionDetail> {
  return api.post<JobDescriptionDetail>('/api/job-descriptions', data);
}

export async function updateJobDescription(
  id: string,
  data: UpdateJobDescriptionRequest
): Promise<JobDescriptionDetail> {
  return api.put<JobDescriptionDetail>(`/api/job-descriptions/${id}`, data);
}

export async function deleteJobDescription(id: string): Promise<void> {
  return api.delete<void>(`/api/job-descriptions/${id}`);
}

export async function analyzeJobDescription(id: string): Promise<JobDescriptionDetail> {
  return api.post<JobDescriptionDetail>(`/api/job-descriptions/${id}/analyze`);
}
