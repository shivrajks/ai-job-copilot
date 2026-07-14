import { create } from 'zustand';
import { toast } from 'sonner';
import type { ResumeListItem, ResumeDetail, UploadResponse } from '@/types/resume';
import { ApiError } from '@/lib/api/client';
import { normalizeError } from '@/lib/api/errors';
import * as resumeApi from '@/lib/api/resumes';

interface FetchOptions {
  force?: boolean;
}

let fetchGeneration = 0;
let fetchResumesPromise: Promise<void> | null = null;

interface ResumeState {
  resumes: ResumeListItem[];
  activeResume: ResumeDetail | null;
  isLoading: boolean;
  hasFetched: boolean;
  isUploading: boolean;
  isParsing: boolean;
  error: string | null;

  fetchResumes: (options?: FetchOptions) => Promise<void>;
  uploadResume: (file: File) => Promise<UploadResponse>;
  deleteResume: (id: string) => Promise<void>;
  renameResume: (id: string, name: string) => Promise<void>;
  setActiveResume: (id: string) => Promise<void>;
  parseResume: (id: string) => Promise<ResumeDetail>;
  clearError: () => void;
}

export const useResumeStore = create<ResumeState>((set, get) => ({
  resumes: [],
  activeResume: null,
  isLoading: false,
  hasFetched: false,
  isUploading: false,
  isParsing: false,
  error: null,

  fetchResumes: async (options) => {
    const { force = false } = options ?? {};
    const state = get();
    if (state.isLoading) return fetchResumesPromise ?? undefined;
    if (state.hasFetched && !force) return;

    const myGeneration = ++fetchGeneration;

    fetchResumesPromise = (async () => {
      set({ isLoading: true, error: null });
      try {
        const resumes = await resumeApi.fetchResumes();
        if (fetchGeneration !== myGeneration) return;
        set({ resumes, isLoading: false, hasFetched: true });
      } catch (err) {
        if (fetchGeneration !== myGeneration) return;
        set({
          isLoading: false,
          error: normalizeError(err, 'Failed to load resumes'),
        });
      } finally {
        if (fetchGeneration === myGeneration) {
          fetchResumesPromise = null;
        }
      }
    })();

    return fetchResumesPromise;
  },

  uploadResume: async (file: File) => {
    set({ isUploading: true, error: null });
    try {
      const response = await resumeApi.uploadResume(file);
      await get().fetchResumes({ force: true });
      set({ isUploading: false });
      toast.success('Resume uploaded successfully');
      return response;
    } catch (err) {
      toast.error(normalizeError(err));
      set({
        isUploading: false,
        error: normalizeError(err, 'Failed to upload resume'),
      });
      throw err;
    }
  },

  deleteResume: async (id: string) => {
    set({ error: null });
    try {
      await resumeApi.deleteResume(id);
      set((state) => ({
        resumes: state.resumes.filter((r) => r.id !== id),
        activeResume: state.activeResume?.id === id ? null : state.activeResume,
      }));
      toast.success('Resume deleted');
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        set((state) => ({
          resumes: state.resumes.filter((r) => r.id !== id),
          activeResume: state.activeResume?.id === id ? null : state.activeResume,
          error: null,
        }));
        toast.error('Resume was not found. The list has been updated.');
        return;
      }

      toast.error(normalizeError(err));
      set({
        error: normalizeError(err, 'Failed to delete resume'),
      });
      throw err;
    }
  },

  renameResume: async (id: string, name: string) => {
    set({ error: null });
    try {
      const updated = await resumeApi.renameResume(id, name);
      set((state) => ({
        resumes: state.resumes.map((r) =>
          r.id === id
            ? { ...r, name: updated.name }
            : r
        ),
      }));
      toast.success('Resume renamed successfully');
    } catch (err) {
      toast.error(normalizeError(err));
      set({
        error: normalizeError(err, 'Failed to rename resume'),
      });
      throw err;
    }
  },

  setActiveResume: async (id: string) => {
    set({ error: null });
    try {
      const updated = await resumeApi.setActiveResume(id);
      set((state) => ({
        resumes: state.resumes.map((r) => ({
          ...r,
          isActive: r.id === id,
        })),
      }));
      toast.success('Active resume updated');
    } catch (err) {
      toast.error(normalizeError(err));
      set({
        error: normalizeError(err, 'Failed to set active resume'),
      });
      throw err;
    }
  },

  parseResume: async (id: string) => {
    set({ isParsing: true, error: null });
    try {
      const parsedDetail = await resumeApi.parseResume(id);
      set((state) => ({
        isParsing: false,
        activeResume: parsedDetail,
        resumes: state.resumes.map((r) =>
          r.id === id
            ? { ...r, parsingStatus: parsedDetail.parsingStatus }
            : r
        ),
      }));
      return parsedDetail;
    } catch (err) {
      set({
        isParsing: false,
        error: normalizeError(err, 'Failed to parse resume'),
      });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));

export function resetResumeStore() {
  fetchGeneration++;
  fetchResumesPromise = null;
  useResumeStore.setState({
    resumes: [],
    activeResume: null,
    isLoading: false,
    hasFetched: false,
    isUploading: false,
    isParsing: false,
    error: null,
  });
}
