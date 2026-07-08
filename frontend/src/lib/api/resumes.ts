import { api, apiUpload } from './client';
import type { ResumeListItem, ResumeDetail, UploadResponse } from '@/types/resume';

export async function fetchResumes(page = 0, size = 20): Promise<import('@/types/resume').ResumeListItem[]> {
  const res = await api.get<{ content: ResumeListItem[] }>(`/api/resumes?page=${page}&size=${size}`);
  return res.content;
}

export async function uploadResume(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return apiUpload<UploadResponse>('/api/resumes/upload', formData);
}

export async function getResume(id: string): Promise<ResumeDetail> {
  return api.get<ResumeDetail>(`/api/resumes/${id}`);
}

export async function renameResume(id: string, name: string): Promise<ResumeDetail> {
  return api.put<ResumeDetail>(`/api/resumes/${id}`, { name });
}

export async function deleteResume(id: string): Promise<void> {
  return api.delete<void>(`/api/resumes/${id}`);
}

export async function setActiveResume(id: string): Promise<ResumeDetail> {
  return api.post<ResumeDetail>(`/api/resumes/${id}/activate`);
}

export async function parseResume(id: string): Promise<ResumeDetail> {
  return api.post<ResumeDetail>(`/api/resumes/${id}/parse`);
}
