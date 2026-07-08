import { create } from 'zustand';
import type { MatchResult } from '@/types/match';
import * as matchApi from '@/lib/api/matches';

interface MatchState {
  matchResult: MatchResult | null;
  isMatching: boolean;
  error: string | null;

  matchResumeToJob: (resumeId: string, jobId: string) => Promise<MatchResult>;
  clearMatchResult: () => void;
  clearError: () => void;
}

export const useMatchStore = create<MatchState>((set) => ({
  matchResult: null,
  isMatching: false,
  error: null,

  matchResumeToJob: async (resumeId: string, jobId: string) => {
    set({ isMatching: true, error: null, matchResult: null });
    try {
      const result = await matchApi.matchResumeToJob(resumeId, jobId);
      set({ matchResult: result, isMatching: false });
      return result;
    } catch (err) {
      set({
        isMatching: false,
        error: err instanceof Error ? err.message : 'Failed to compute match',
      });
      throw err;
    }
  },

  clearMatchResult: () => set({ matchResult: null, error: null }),

  clearError: () => set({ error: null }),
}));
