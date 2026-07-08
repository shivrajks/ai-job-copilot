import { api } from './client';
import type { TailorProposal, SaveTailoredRequest } from '@/types/tailor';
import type { ResumeDetail } from '@/types/resume';

export async function tailorResume(resumeId: string, jobId: string): Promise<TailorProposal> {
  return api.post<TailorProposal>(`/api/resumes/${resumeId}/tailor/${jobId}`);
}

export async function saveTailoredResume(
  resumeId: string,
  data: SaveTailoredRequest
): Promise<ResumeDetail> {
  return api.post<ResumeDetail>(`/api/resumes/${resumeId}/save-tailored`, data);
}
