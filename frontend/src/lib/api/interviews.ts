import { api } from './client';
import type {
  SessionListItem,
  SessionDetail,
  GenerateInterviewRequest,
  ScoreResponse,
} from '@/types/interview';

export async function generateInterview(
  data: GenerateInterviewRequest
): Promise<SessionDetail> {
  return api.post<SessionDetail>('/api/interviews/generate', data);
}

export async function scoreInterview(
  id: string,
  data: { answers: { questionId: string; answer: string }[] }
): Promise<ScoreResponse> {
  return api.post<ScoreResponse>(`/api/interviews/${id}/score`, data);
}

export async function fetchSessions(): Promise<SessionListItem[]> {
  return api.get<SessionListItem[]>('/api/interviews');
}

export async function fetchSession(id: string): Promise<SessionDetail> {
  return api.get<SessionDetail>(`/api/interviews/${id}`);
}

export async function deleteSession(id: string): Promise<void> {
  return api.delete<void>(`/api/interviews/${id}`);
}
