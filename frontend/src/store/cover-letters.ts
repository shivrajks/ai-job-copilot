import { create } from 'zustand';
import { toast } from 'sonner';
import type {
  CoverLetterProposal,
  CoverLetterListItem,
  CoverLetterDetail,
  GenerateCoverLetterRequest,
  SaveCoverLetterRequest,
  UpdateCoverLetterRequest,
} from '@/types/cover-letter';
import * as coverLetterApi from '@/lib/api/cover-letters';

interface CoverLetterState {
  coverLetters: CoverLetterListItem[];
  currentLetter: CoverLetterDetail | null;
  proposal: CoverLetterProposal | null;
  isLoading: boolean;
  isGenerating: boolean;
  isSaving: boolean;
  error: string | null;

  fetchCoverLetters: () => Promise<void>;
  fetchCoverLetter: (id: string) => Promise<void>;
  generateProposal: (params: GenerateCoverLetterRequest) => Promise<CoverLetterProposal>;
  saveCoverLetter: (data: SaveCoverLetterRequest) => Promise<CoverLetterDetail>;
  updateCoverLetter: (id: string, data: UpdateCoverLetterRequest) => Promise<void>;
  deleteCoverLetter: (id: string) => Promise<void>;
  clearProposal: () => void;
  clearError: () => void;
}

export const useCoverLetterStore = create<CoverLetterState>((set, get) => ({
  coverLetters: [],
  currentLetter: null,
  proposal: null,
  isLoading: false,
  isGenerating: false,
  isSaving: false,
  error: null,

  fetchCoverLetters: async () => {
    set({ isLoading: true, error: null });
    try {
      const coverLetters = await coverLetterApi.fetchCoverLetters();
      set({ coverLetters, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load cover letters',
      });
    }
  },

  fetchCoverLetter: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const letter = await coverLetterApi.fetchCoverLetter(id);
      set({ currentLetter: letter, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load cover letter',
      });
    }
  },

  generateProposal: async (params: GenerateCoverLetterRequest) => {
    set({ isGenerating: true, error: null, proposal: null });
    try {
      const proposal = await coverLetterApi.generateCoverLetter(params);
      set({ proposal, isGenerating: false });
      return proposal;
    } catch (err) {
      set({
        isGenerating: false,
        error: err instanceof Error ? err.message : 'Failed to generate cover letter',
      });
      throw err;
    }
  },

  saveCoverLetter: async (data: SaveCoverLetterRequest) => {
    set({ isSaving: true, error: null });
    try {
      const detail = await coverLetterApi.saveCoverLetter(data);
      await get().fetchCoverLetters();
      set({ isSaving: false });
      toast.success('Cover letter saved');
      return detail;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
      set({
        isSaving: false,
        error: err instanceof Error ? err.message : 'Failed to save cover letter',
      });
      throw err;
    }
  },

  updateCoverLetter: async (id: string, data: UpdateCoverLetterRequest) => {
    set({ isSaving: true, error: null });
    try {
      const updated = await coverLetterApi.updateCoverLetter(id, data);
      set((state) => ({
        isSaving: false,
        currentLetter: updated,
        coverLetters: state.coverLetters.map((cl) =>
          cl.id === id ? { ...cl, title: updated.title, updatedAt: updated.updatedAt } : cl
        ),
      }));
      toast.success('Cover letter updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
      set({
        isSaving: false,
        error: err instanceof Error ? err.message : 'Failed to update cover letter',
      });
      throw err;
    }
  },

  deleteCoverLetter: async (id: string) => {
    set({ error: null });
    try {
      await coverLetterApi.deleteCoverLetter(id);
      set((state) => ({
        coverLetters: state.coverLetters.filter((cl) => cl.id !== id),
        currentLetter:
          state.currentLetter?.id === id ? null : state.currentLetter,
      }));
      toast.success('Cover letter deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
      set({
        error: err instanceof Error ? err.message : 'Failed to delete cover letter',
      });
      throw err;
    }
  },

  clearProposal: () => set({ proposal: null }),

  clearError: () => set({ error: null }),
}));
