import { api } from './client';
import type {
  CoverLetterProposal,
  CoverLetterListItem,
  CoverLetterDetail,
  GenerateCoverLetterRequest,
  SaveCoverLetterRequest,
  UpdateCoverLetterRequest,
} from '@/types/cover-letter';

export async function generateCoverLetter(
  data: GenerateCoverLetterRequest
): Promise<CoverLetterProposal> {
  return api.post<CoverLetterProposal>('/api/cover-letters/generate', data);
}

export async function saveCoverLetter(
  data: SaveCoverLetterRequest
): Promise<CoverLetterDetail> {
  return api.post<CoverLetterDetail>('/api/cover-letters', data);
}

export async function updateCoverLetter(
  id: string,
  data: UpdateCoverLetterRequest
): Promise<CoverLetterDetail> {
  return api.put<CoverLetterDetail>(`/api/cover-letters/${id}`, data);
}

export async function fetchCoverLetters(): Promise<CoverLetterListItem[]> {
  return api.get<CoverLetterListItem[]>('/api/cover-letters');
}

export async function fetchCoverLetter(id: string): Promise<CoverLetterDetail> {
  return api.get<CoverLetterDetail>(`/api/cover-letters/${id}`);
}

export async function deleteCoverLetter(id: string): Promise<void> {
  return api.delete<void>(`/api/cover-letters/${id}`);
}
