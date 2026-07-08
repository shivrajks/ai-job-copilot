import { create } from 'zustand';
import {
  fetchDashboardAnalytics,
  type AnalyticsResponse,
} from '@/lib/api/analytics';

interface AnalyticsState {
  data: AnalyticsResponse | null;
  isLoading: boolean;
  error: string | null;

  fetchData: () => Promise<void>;
  clearError: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  data: null,
  isLoading: false,
  error: null,

  fetchData: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchDashboardAnalytics();
      set({ data, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load analytics',
      });
    }
  },

  clearError: () => set({ error: null }),
}));
