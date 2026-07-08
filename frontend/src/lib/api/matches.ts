import { api } from './client';
import type { MatchResult } from '@/types/match';

export async function matchResumeToJob(resumeId: string, jobId: string): Promise<MatchResult> {
  return api.post<MatchResult>(`/api/match/resume/${resumeId}/job/${jobId}`);
}
