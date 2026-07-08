import { api } from './client';
import type { AtsReport } from '@/types/ats-report';

export async function fetchAtsReport(resumeId: string, jobId: string): Promise<AtsReport> {
  return api.get<AtsReport>(`/api/match/resume/${resumeId}/job/${jobId}/report`);
}
