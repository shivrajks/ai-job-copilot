import { api } from './client';
import type {
  ApplicationListItem,
  ApplicationDetail,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  StageUpdateRequest,
  BatchIdsRequest,
} from '@/types/application';

export async function fetchApplications(): Promise<ApplicationListItem[]> {
  return api.get<ApplicationListItem[]>('/api/applications');
}

export async function getApplication(id: string): Promise<ApplicationDetail> {
  return api.get<ApplicationDetail>(`/api/applications/${id}`);
}

export async function createApplication(
  data: CreateApplicationRequest
): Promise<ApplicationDetail> {
  return api.post<ApplicationDetail>('/api/applications', data);
}

export async function updateApplication(
  id: string,
  data: UpdateApplicationRequest
): Promise<ApplicationDetail> {
  return api.put<ApplicationDetail>(`/api/applications/${id}`, data);
}

export async function updateApplicationStage(
  id: string,
  data: StageUpdateRequest
): Promise<ApplicationDetail> {
  return api.put<ApplicationDetail>(`/api/applications/${id}/stage`, data);
}

export async function deleteApplication(id: string): Promise<void> {
  return api.delete<void>(`/api/applications/${id}`);
}

export async function batchUpdateStage(
  ids: string[],
  stage: string
): Promise<ApplicationDetail[]> {
  return api.put<ApplicationDetail[]>(
    `/api/applications/batch/stage?stage=${encodeURIComponent(stage)}`,
    { ids } as BatchIdsRequest
  );
}

export async function batchDeleteApplications(
  ids: string[]
): Promise<void> {
  return api.delete<void>('/api/applications/batch', {
    body: JSON.stringify({ ids } as BatchIdsRequest),
    method: 'DELETE',
  } as any);
}
