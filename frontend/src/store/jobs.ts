import { create } from 'zustand';
import { toast } from 'sonner';
import type {
  JobListItem,
  JobDetail,
  CreateJobRequest,
  UpdateJobRequest,
  StatusUpdateRequest,
  JobStatus,
  JobStats,
  PageResponse,
} from '@/types/jobs';
import * as jobsApi from '@/lib/api/jobs';
import type { JobListParams } from '@/lib/api/jobs';

interface JobState {
  jobs: JobListItem[];
  selectedJob: JobDetail | null;
  stats: JobStats | null;
  isLoading: boolean;
  isStatsLoading: boolean;
  error: string | null;

  page: number;
  size: number;
  totalPages: number;
  totalElements: number;

  fetchJobs: (params?: JobListParams) => Promise<void>;
  getJob: (id: string) => Promise<JobDetail>;
  createJob: (data: CreateJobRequest) => Promise<JobDetail>;
  updateJob: (id: string, data: UpdateJobRequest) => Promise<JobDetail>;
  updateJobStatus: (id: string, data: StatusUpdateRequest) => Promise<JobDetail>;
  toggleFavorite: (id: string, favorite: boolean) => Promise<void>;
  toggleArchive: (id: string, archived: boolean) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  clearError: () => void;
}

export const useJobStore = create<JobState>((set, get) => ({
  jobs: [],
  selectedJob: null,
  stats: null,
  isLoading: false,
  isStatsLoading: false,
  error: null,
  page: 0,
  size: 20,
  totalPages: 0,
  totalElements: 0,

  fetchJobs: async (params?: JobListParams) => {
    set({ isLoading: true, error: null });
    try {
      const result: PageResponse<JobListItem> = await jobsApi.fetchJobs(params);
      set({
        jobs: result.content,
        page: result.number,
        size: result.size,
        totalPages: result.totalPages,
        totalElements: result.totalElements,
        isLoading: false,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load jobs',
      });
    }
  },

  getJob: async (id: string) => {
    set({ error: null });
    try {
      const job = await jobsApi.getJob(id);
      set({ selectedJob: job });
      return job;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load job',
      });
      throw err;
    }
  },

  createJob: async (data: CreateJobRequest) => {
    set({ isLoading: true, error: null });
    try {
      const job = await jobsApi.createJob(data);
      await get().fetchJobs({ page: 0, size: get().size });
      set({ isLoading: false });
      toast.success('Job saved successfully');
      return job;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to create job',
      });
      throw err;
    }
  },

  updateJob: async (id: string, data: UpdateJobRequest) => {
    set({ error: null });
    try {
      const job = await jobsApi.updateJob(id, data);
      set((state) => ({
        jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...job } : j)),
        selectedJob: state.selectedJob?.id === id ? job : state.selectedJob,
      }));
      toast.success('Job updated successfully');
      return job;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
      set({
        error: err instanceof Error ? err.message : 'Failed to update job',
      });
      throw err;
    }
  },

  updateJobStatus: async (id: string, data: StatusUpdateRequest) => {
    const previousJobs = get().jobs;
    const previousSelected = get().selectedJob;

    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === id ? { ...j, status: data.status } : j)),
    }));

    try {
      const job = await jobsApi.updateJobStatus(id, data);
      set((state) => ({
        jobs: state.jobs.map((j) =>
          j.id === id
            ? { ...j, status: job.status, appliedDate: job.appliedDate, rejectionReason: job.rejectionReason }
            : j
        ),
        selectedJob:
          state.selectedJob?.id === id ? job : state.selectedJob,
      }));
      toast.success(`Status updated to ${data.status.replace(/_/g, ' ').toLowerCase()}`);
      return job;
    } catch (err) {
      set({ jobs: previousJobs, selectedJob: previousSelected });
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
      set({
        error: err instanceof Error ? err.message : 'Failed to update status',
      });
      throw err;
    }
  },

  toggleFavorite: async (id: string, favorite: boolean) => {
    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === id ? { ...j, isFavorite: favorite } : j)),
    }));

    try {
      const job = await jobsApi.toggleFavorite(id, favorite);
      set((state) => ({
        selectedJob: state.selectedJob?.id === id ? job : state.selectedJob,
      }));
    } catch (err) {
      set((state) => ({
        jobs: state.jobs.map((j) => (j.id === id ? { ...j, isFavorite: !favorite } : j)),
      }));
      toast.error(err instanceof Error ? err.message : 'Failed to update favorite');
    }
  },

  toggleArchive: async (id: string, archived: boolean) => {
    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === id ? { ...j, isArchived: archived } : j)),
    }));

    try {
      const job = await jobsApi.toggleArchive(id, archived);
      set((state) => ({
        selectedJob: state.selectedJob?.id === id ? job : state.selectedJob,
      }));
      toast.success(archived ? 'Job archived' : 'Job unarchived');
    } catch (err) {
      set((state) => ({
        jobs: state.jobs.map((j) => (j.id === id ? { ...j, isArchived: !archived } : j)),
      }));
      toast.error(err instanceof Error ? err.message : 'Failed to update archive');
    }
  },

  deleteJob: async (id: string) => {
    const previousJobs = get().jobs;
    const previousSelected = get().selectedJob;

    set((state) => ({
      jobs: state.jobs.filter((j) => j.id !== id),
      selectedJob: state.selectedJob?.id === id ? null : state.selectedJob,
    }));

    try {
      await jobsApi.deleteJob(id);
      toast.success('Job deleted');
    } catch (err) {
      set({ jobs: previousJobs, selectedJob: previousSelected });
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
      set({
        error: err instanceof Error ? err.message : 'Failed to delete job',
      });
      throw err;
    }
  },

  fetchStats: async () => {
    set({ isStatsLoading: true });
    try {
      const stats = await jobsApi.getJobStats();
      set({ stats, isStatsLoading: false });
    } catch (err) {
      set({ isStatsLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
