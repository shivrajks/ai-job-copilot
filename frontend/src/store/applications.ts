import { create } from 'zustand';
import { toast } from 'sonner';
import type {
  ApplicationListItem,
  ApplicationDetail,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  StageUpdateRequest,
  ApplicationStage,
} from '@/types/application';
import * as applicationApi from '@/lib/api/applications';

interface ApplicationState {
  applications: ApplicationListItem[];
  selectedApplication: ApplicationDetail | null;
  isLoading: boolean;
  error: string | null;
  selectedIds: Set<string>;

  fetchApplications: () => Promise<void>;
  getApplication: (id: string) => Promise<ApplicationDetail>;
  createApplication: (data: CreateApplicationRequest) => Promise<ApplicationDetail>;
  updateApplication: (id: string, data: UpdateApplicationRequest) => Promise<ApplicationDetail>;
  updateApplicationStage: (id: string, data: StageUpdateRequest) => Promise<ApplicationDetail>;
  deleteApplication: (id: string) => Promise<void>;
  batchUpdateStage: (ids: string[], stage: ApplicationStage) => Promise<void>;
  batchDelete: (ids: string[]) => Promise<void>;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  clearError: () => void;
}

export const useApplicationStore = create<ApplicationState>((set, get) => ({
  applications: [],
  selectedApplication: null,
  isLoading: false,
  error: null,
  selectedIds: new Set(),

  fetchApplications: async () => {
    set({ isLoading: true, error: null });
    try {
      const applications = await applicationApi.fetchApplications();
      set({ applications, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load applications',
      });
    }
  },

  getApplication: async (id: string) => {
    set({ error: null });
    try {
      const application = await applicationApi.getApplication(id);
      set({ selectedApplication: application });
      return application;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load application',
      });
      throw err;
    }
  },

  createApplication: async (data: CreateApplicationRequest) => {
    set({ isLoading: true, error: null });
    try {
      const application = await applicationApi.createApplication(data);
      await get().fetchApplications();
      set({ isLoading: false });
      toast.success('Application added successfully');
      return application;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to create application',
      });
      throw err;
    }
  },

  updateApplication: async (id: string, data: UpdateApplicationRequest) => {
    set({ error: null });
    try {
      const application = await applicationApi.updateApplication(id, data);
      set((state) => ({
        applications: state.applications.map((a) =>
          a.id === id ? { ...a, ...application } : a
        ),
        selectedApplication:
          state.selectedApplication?.id === id ? application : state.selectedApplication,
      }));
      toast.success('Application updated successfully');
      return application;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
      set({
        error: err instanceof Error ? err.message : 'Failed to update application',
      });
      throw err;
    }
  },

  updateApplicationStage: async (id: string, data: StageUpdateRequest) => {
    const previousApps = get().applications;
    const previousSelected = get().selectedApplication;

    // Optimistic update
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === id ? { ...a, stage: data.stage } : a
      ),
    }));

    try {
      const application = await applicationApi.updateApplicationStage(id, data);
      set((state) => ({
        applications: state.applications.map((a) =>
          a.id === id ? { ...a, stage: application.stage, appliedAt: application.appliedAt } : a
        ),
        selectedApplication:
          state.selectedApplication?.id === id ? application : state.selectedApplication,
      }));
      return application;
    } catch (err) {
      // Rollback on failure
      set({ applications: previousApps, selectedApplication: previousSelected });
      toast.error(err instanceof Error ? err.message : 'Failed to update stage');
      set({
        error: err instanceof Error ? err.message : 'Failed to update stage',
      });
      throw err;
    }
  },

  deleteApplication: async (id: string) => {
    const previousApps = get().applications;
    const previousSelected = get().selectedApplication;

    // Optimistic removal
    set((state) => ({
      applications: state.applications.filter((a) => a.id !== id),
      selectedApplication:
        state.selectedApplication?.id === id ? null : state.selectedApplication,
    }));

    try {
      await applicationApi.deleteApplication(id);
      toast.success('Application deleted');
    } catch (err) {
      // Rollback on failure
      set({ applications: previousApps, selectedApplication: previousSelected });
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
      set({
        error: err instanceof Error ? err.message : 'Failed to delete application',
      });
      throw err;
    }
  },

  batchUpdateStage: async (ids: string[], stage: ApplicationStage) => {
    set({ error: null });
    try {
      await applicationApi.batchUpdateStage(ids, stage);
      set((state) => ({
        applications: state.applications.map((a) =>
          ids.includes(a.id) ? { ...a, stage } : a
        ),
        selectedIds: new Set(),
      }));
      toast.success(`${ids.length} applications moved to ${stage.toLowerCase().replace(/_/g, ' ')}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
      set({
        error: err instanceof Error ? err.message : 'Failed to batch update stage',
      });
      throw err;
    }
  },

  batchDelete: async (ids: string[]) => {
    const previousApps = get().applications;

    // Optimistic removal
    set((state) => ({
      applications: state.applications.filter((a) => !ids.includes(a.id)),
      selectedIds: new Set(),
    }));

    try {
      await applicationApi.batchDeleteApplications(ids);
      toast.success(`${ids.length} applications deleted`);
    } catch (err) {
      // Rollback on failure
      set({ applications: previousApps });
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
      set({
        error: err instanceof Error ? err.message : 'Failed to batch delete',
      });
      throw err;
    }
  },

  toggleSelection: (id: string) => {
    set((state) => {
      const next = new Set(state.selectedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { selectedIds: next };
    });
  },

  selectAll: () => {
    set((state) => ({
      selectedIds: new Set(state.applications.map((a) => a.id)),
    }));
  },

  clearSelection: () => set({ selectedIds: new Set() }),

  clearError: () => set({ error: null }),
}));
