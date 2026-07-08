import { create } from 'zustand';
import type { AtsReport } from '@/types/ats-report';
import * as atsReportApi from '@/lib/api/ats-reports';

interface AtsReportState {
  report: AtsReport | null;
  isLoading: boolean;
  error: string | null;

  fetchReport: (resumeId: string, jobId: string) => Promise<AtsReport>;
  clearReport: () => void;
  clearError: () => void;
}

export const useAtsReportStore = create<AtsReportState>((set) => ({
  report: null,
  isLoading: false,
  error: null,

  fetchReport: async (resumeId: string, jobId: string) => {
    set({ isLoading: true, error: null, report: null });
    try {
      const report = await atsReportApi.fetchAtsReport(resumeId, jobId);
      set({ report, isLoading: false });
      return report;
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load ATS report',
      });
      throw err;
    }
  },

  clearReport: () => set({ report: null, error: null }),

  clearError: () => set({ error: null }),
}));
