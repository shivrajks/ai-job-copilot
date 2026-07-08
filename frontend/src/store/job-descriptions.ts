import { create } from 'zustand';
import { toast } from 'sonner';
import type {
  JobDescriptionListItem,
  JobDescriptionDetail,
  CreateJobDescriptionRequest,
  UpdateJobDescriptionRequest,
} from '@/types/job-description';
import * as jobDescriptionApi from '@/lib/api/job-descriptions';

interface JobDescriptionState {
  jobDescriptions: JobDescriptionListItem[];
  selectedJobDescription: JobDescriptionDetail | null;
  isLoading: boolean;
  isAnalyzing: boolean;
  error: string | null;

  fetchJobDescriptions: () => Promise<void>;
  getJobDescription: (id: string) => Promise<JobDescriptionDetail>;
  createJobDescription: (data: CreateJobDescriptionRequest) => Promise<JobDescriptionDetail>;
  updateJobDescription: (id: string, data: UpdateJobDescriptionRequest) => Promise<JobDescriptionDetail>;
  deleteJobDescription: (id: string) => Promise<void>;
  analyzeJobDescription: (id: string) => Promise<JobDescriptionDetail>;
  clearError: () => void;
}

export const useJobDescriptionStore = create<JobDescriptionState>((set, get) => ({
  jobDescriptions: [],
  selectedJobDescription: null,
  isLoading: false,
  isAnalyzing: false,
  error: null,

  fetchJobDescriptions: async () => {
    set({ isLoading: true, error: null });
    try {
      const jobDescriptions = await jobDescriptionApi.fetchJobDescriptions();
      set({ jobDescriptions, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load job descriptions',
      });
    }
  },

  getJobDescription: async (id: string) => {
    set({ error: null });
    try {
      const jd = await jobDescriptionApi.getJobDescription(id);
      set({ selectedJobDescription: jd });
      return jd;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load job description',
      });
      throw err;
    }
  },

  createJobDescription: async (data: CreateJobDescriptionRequest) => {
    set({ isLoading: true, error: null });
    try {
      const jd = await jobDescriptionApi.createJobDescription(data);
      await get().fetchJobDescriptions();
      set({ isLoading: false });
      toast.success('Job description added');
      return jd;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to create job description',
      });
      throw err;
    }
  },

  updateJobDescription: async (id: string, data: UpdateJobDescriptionRequest) => {
    set({ error: null });
    try {
      const jd = await jobDescriptionApi.updateJobDescription(id, data);
      set((state) => ({
        jobDescriptions: state.jobDescriptions.map((j) =>
          j.id === id ? { ...j, ...jd } : j
        ),
        selectedJobDescription:
          state.selectedJobDescription?.id === id ? jd : state.selectedJobDescription,
      }));
      toast.success('Job description updated');
      return jd;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
      set({
        error: err instanceof Error ? err.message : 'Failed to update job description',
      });
      throw err;
    }
  },

  deleteJobDescription: async (id: string) => {
    set({ error: null });
    try {
      await jobDescriptionApi.deleteJobDescription(id);
      set((state) => ({
        jobDescriptions: state.jobDescriptions.filter((j) => j.id !== id),
        selectedJobDescription:
          state.selectedJobDescription?.id === id ? null : state.selectedJobDescription,
      }));
      toast.success('Job description deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
      set({
        error: err instanceof Error ? err.message : 'Failed to delete job description',
      });
      throw err;
    }
  },

  analyzeJobDescription: async (id: string) => {
    set({ isAnalyzing: true, error: null });
    try {
      const jd = await jobDescriptionApi.analyzeJobDescription(id);
      set((state) => ({
        jobDescriptions: state.jobDescriptions.map((j) =>
          j.id === id ? { ...j, analysisStatus: jd.analysisStatus } : j
        ),
        selectedJobDescription:
          state.selectedJobDescription?.id === id ? jd : state.selectedJobDescription,
        isAnalyzing: false,
      }));
      return jd;
    } catch (err) {
      set({
        isAnalyzing: false,
        error: err instanceof Error ? err.message : 'Failed to analyze job description',
      });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
