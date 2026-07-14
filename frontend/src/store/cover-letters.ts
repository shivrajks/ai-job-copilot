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

interface FetchOptions {
  force?: boolean;
}

let fetchGeneration = 0;
let fetchCoverLettersPromise: Promise<void> | null = null;

interface CoverLetterState {
  coverLetters: CoverLetterListItem[];
  currentLetter: CoverLetterDetail | null;
  proposal: CoverLetterProposal | null;
  isLoading: boolean;
  hasFetched: boolean;
  isGenerating: boolean;
  isSaving: boolean;
  error: string | null;
  generateError: string | null;

  fetchCoverLetters: (options?: FetchOptions) => Promise<void>;
  fetchCoverLetter: (id: string) => Promise<void>;
  generateProposal: (params: GenerateCoverLetterRequest) => Promise<CoverLetterProposal>;
  saveCoverLetter: (data: SaveCoverLetterRequest) => Promise<CoverLetterDetail>;
  updateCoverLetter: (id: string, data: UpdateCoverLetterRequest) => Promise<void>;
  deleteCoverLetter: (id: string) => Promise<void>;
  clearProposal: () => void;
  clearError: () => void;
  clearGenerateError: () => void;
}

export const useCoverLetterStore = create<CoverLetterState>((set, get) => ({
  coverLetters: [],
  currentLetter: null,
  proposal: null,
  isLoading: false,
  hasFetched: false,
  isGenerating: false,
  isSaving: false,
  error: null,
  generateError: null,

  fetchCoverLetters: async (options) => {
    const { force = false } = options ?? {};
    const state = get();
    if (state.isLoading) return fetchCoverLettersPromise ?? undefined;
    if (state.hasFetched && !force) return;

    const myGeneration = ++fetchGeneration;

    fetchCoverLettersPromise = (async () => {
      set({ isLoading: true, error: null });
      try {
        const coverLetters = await coverLetterApi.fetchCoverLetters();
        if (fetchGeneration !== myGeneration) return;
        set({ coverLetters, isLoading: false, hasFetched: true });
      } catch (err) {
        if (fetchGeneration !== myGeneration) return;
        set({
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to load cover letters',
        });
      } finally {
        if (fetchGeneration === myGeneration) {
          fetchCoverLettersPromise = null;
        }
      }
    })();

    return fetchCoverLettersPromise;
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
    set({ isGenerating: true, generateError: null, proposal: null });
    try {
      const proposal = await coverLetterApi.generateCoverLetter(params);
      set({ proposal, isGenerating: false });
      return proposal;
    } catch (err) {
      set({
        isGenerating: false,
        generateError: err instanceof Error ? err.message : 'Failed to generate cover letter',
      });
      throw err;
    }
  },

  saveCoverLetter: async (data: SaveCoverLetterRequest) => {
    set({ isSaving: true, error: null });
    try {
      const detail = await coverLetterApi.saveCoverLetter(data);
      set((state) => ({
        isSaving: false,
        currentLetter: detail,
        coverLetters: state.hasFetched
          ? [
              {
                id: detail.id,
                title: detail.title,
                companyName: detail.companyName,
                tone: detail.tone,
                template: detail.template,
                preview: detail.content.length > 120 ? `${detail.content.substring(0, 120).trim()}...` : detail.content,
                createdAt: detail.createdAt,
                updatedAt: detail.updatedAt,
              },
              ...state.coverLetters,
            ]
          : state.coverLetters,
      }));
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

  clearProposal: () => set({ proposal: null, generateError: null }),

  clearError: () => set({ error: null }),

  clearGenerateError: () => set({ generateError: null }),
}));

export function resetCoverLetterStore() {
  fetchGeneration++;
  fetchCoverLettersPromise = null;
  useCoverLetterStore.setState({
    coverLetters: [],
    currentLetter: null,
    proposal: null,
    isLoading: false,
    hasFetched: false,
    isGenerating: false,
    isSaving: false,
    error: null,
    generateError: null,
  });
}
