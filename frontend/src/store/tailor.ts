import { create } from 'zustand';
import type { TailorProposal, SectionChange } from '@/types/tailor';
import * as tailorApi from '@/lib/api/tailor';

interface TailorState {
  proposal: TailorProposal | null;
  acceptedChanges: Set<number>;
  isTailoring: boolean;
  isSaving: boolean;
  error: string | null;

  tailor: (resumeId: string, jobId: string) => Promise<TailorProposal>;
  acceptChange: (index: number) => void;
  rejectChange: (index: number) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  save: (resumeId: string, name: string) => Promise<void>;
  clear: () => void;
  clearError: () => void;
}

export const useTailorStore = create<TailorState>((set, get) => ({
  proposal: null,
  acceptedChanges: new Set(),
  isTailoring: false,
  isSaving: false,
  error: null,

  tailor: async (resumeId: string, jobId: string) => {
    set({ isTailoring: true, error: null, proposal: null, acceptedChanges: new Set() });
    try {
      const proposal = await tailorApi.tailorResume(resumeId, jobId);
      const allIndices = new Set(proposal.changes.map((_, i) => i));
      set({ proposal, isTailoring: false, acceptedChanges: allIndices });
      return proposal;
    } catch (err) {
      set({
        isTailoring: false,
        error: err instanceof Error ? err.message : 'Failed to generate tailoring proposal',
      });
      throw err;
    }
  },

  acceptChange: (index: number) => {
    set((state) => {
      const next = new Set(state.acceptedChanges);
      next.add(index);
      return { acceptedChanges: next };
    });
  },

  rejectChange: (index: number) => {
    set((state) => {
      const next = new Set(state.acceptedChanges);
      next.delete(index);
      return { acceptedChanges: next };
    });
  },

  acceptAll: () => {
    const { proposal } = get();
    if (!proposal) return;
    set({ acceptedChanges: new Set(proposal.changes.map((_, i) => i)) });
  },

  rejectAll: () => {
    set({ acceptedChanges: new Set() });
  },

  save: async (resumeId: string, name: string) => {
    const { proposal, acceptedChanges } = get();
    if (!proposal) throw new Error('No proposal to save');

    set({ isSaving: true, error: null });
    try {
      await tailorApi.saveTailoredResume(resumeId, {
        tailoredStructuredData: proposal.tailoredStructuredData,
        name,
      });
      set({ isSaving: false, proposal: null, acceptedChanges: new Set() });
    } catch (err) {
      set({
        isSaving: false,
        error: err instanceof Error ? err.message : 'Failed to save tailored resume',
      });
      throw err;
    }
  },

  clear: () => set({ proposal: null, acceptedChanges: new Set(), error: null }),

  clearError: () => set({ error: null }),
}));
