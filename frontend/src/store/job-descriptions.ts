import { create } from 'zustand';
import { toast } from 'sonner';
import type {
  JobDescriptionListItem,
  JobDescriptionDetail,
  CreateJobDescriptionRequest,
  UpdateJobDescriptionRequest,
} from '@/types/job-description';
import * as jobDescriptionApi from '@/lib/api/job-descriptions';

interface FetchOptions {
  force?: boolean;
}

let fetchGeneration = 0;
let fetchJobDescriptionsPromise: Promise<void> | null = null;

interface JobDescriptionState {
  jobDescriptions: JobDescriptionListItem[];
  selectedJobDescription: JobDescriptionDetail | null;
  isLoading: boolean;
  hasFetched: boolean;
  isAnalyzing: boolean;
  error: string | null;

  fetchJobDescriptions: (options?: FetchOptions) => Promise<void>;
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
  hasFetched: false,
  isAnalyzing: false,
  error: null,

  fetchJobDescriptions: async (options) => {
    const { force = false } = options ?? {};
    const state = get();
    if (state.isLoading) return fetchJobDescriptionsPromise ?? undefined;
    if (state.hasFetched && !force) return;

    const myGeneration = ++fetchGeneration;

    fetchJobDescriptionsPromise = (async () => {
      set({ isLoading: true, error: null });
      try {
        const jobDescriptions = await jobDescriptionApi.fetchJobDescriptions();
        if (fetchGeneration !== myGeneration) return;
        set({ jobDescriptions, isLoading: false, hasFetched: true });
      } catch (err) {
        if (fetchGeneration !== myGeneration) return;
        set({
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to load job descriptions',
        });
      } finally {
        if (fetchGeneration === myGeneration) {
          fetchJobDescriptionsPromise = null;
        }
      }
    })();

    return fetchJobDescriptionsPromise;
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
      set((state) => ({
        isLoading: false,
        jobDescriptions: state.hasFetched
          ? [
              {
                id: jd.id,
                title: jd.title,
                company: jd.company,
                sourceUrl: jd.sourceUrl,
                matchScore: jd.matchScore,
                analysisStatus: jd.analysisStatus,
                createdAt: jd.createdAt,
              },
              ...state.jobDescriptions,
            ]
          : state.jobDescriptions,
      }));
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

export function resetJobDescriptionStore() {
  fetchGeneration++;
  fetchJobDescriptionsPromise = null;
  useJobDescriptionStore.setState({
    jobDescriptions: [],
    selectedJobDescription: null,
    isLoading: false,
    hasFetched: false,
    isAnalyzing: false,
    error: null,
  });
}
