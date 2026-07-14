import { create } from 'zustand';
import { toast } from 'sonner';
import type {
  ProfileResponse,
  UserSettingsResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UpdateSettingsRequest,
  SessionInfo,
} from '@/types/settings';
import * as settingsApi from '@/lib/api/settings';

interface FetchOptions {
  force?: boolean;
}

let fetchProfileGeneration = 0;
let fetchProfilePromise: Promise<void> | null = null;
let fetchSessionsGeneration = 0;
let fetchSessionsPromise: Promise<void> | null = null;

interface SettingsState {
  profile: ProfileResponse | null;
  settings: UserSettingsResponse | null;
  sessions: SessionInfo | null;
  isLoading: boolean;
  isSessionsLoading: boolean;
  hasFetched: boolean;
  hasFetchedSessions: boolean;
  isSaving: boolean;
  error: string | null;

  fetchProfile: (options?: FetchOptions) => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  updateSettings: (data: UpdateSettingsRequest) => Promise<void>;
  fetchSessions: (options?: FetchOptions) => Promise<void>;
  clearError: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  profile: null,
  settings: null,
  sessions: null,
  isLoading: false,
  isSessionsLoading: false,
  hasFetched: false,
  hasFetchedSessions: false,
  isSaving: false,
  error: null,

  fetchProfile: async (options) => {
    const { force = false } = options ?? {};
    const state = get();
    if (state.isLoading) return fetchProfilePromise ?? undefined;
    if (state.hasFetched && !force) return;

    const myGeneration = ++fetchProfileGeneration;

    fetchProfilePromise = (async () => {
      set({ isLoading: true, error: null });
      try {
        const profile = await settingsApi.getProfile();
        if (fetchProfileGeneration !== myGeneration) return;
        set({
          profile,
          settings: profile.settings,
          isLoading: false,
          hasFetched: true,
        });
      } catch (err) {
        if (fetchProfileGeneration !== myGeneration) return;
        set({
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to load profile',
        });
      } finally {
        if (fetchProfileGeneration === myGeneration) {
          fetchProfilePromise = null;
        }
      }
    })();

    return fetchProfilePromise;
  },

  updateProfile: async (data: UpdateProfileRequest) => {
    set({ isSaving: true, error: null });
    try {
      const profile = await settingsApi.updateProfile(data);
      set({ profile, settings: profile.settings, isSaving: false, hasFetched: true });
      toast.success('Profile updated successfully');
    } catch (err) {
      set({ isSaving: false });
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    }
  },

  changePassword: async (data: ChangePasswordRequest) => {
    set({ isSaving: true, error: null });
    try {
      const result = await settingsApi.changePassword(data);
      set({ isSaving: false });
      toast.success(result.message);
    } catch (err) {
      set({ isSaving: false });
      toast.error(err instanceof Error ? err.message : 'Failed to change password');
      throw err;
    }
  },

  updateSettings: async (data: UpdateSettingsRequest) => {
    set({ isSaving: true, error: null });
    try {
      const settings = await settingsApi.updateSettings(data);
      set((state) => ({
        settings,
        profile: state.profile ? { ...state.profile, settings } : null,
        isSaving: false,
        hasFetched: true,
      }));
      toast.success('Settings updated successfully');
    } catch (err) {
      set({ isSaving: false });
      toast.error(err instanceof Error ? err.message : 'Failed to update settings');
      throw err;
    }
  },

  fetchSessions: async (options) => {
    const { force = false } = options ?? {};
    const state = get();
    if (state.isSessionsLoading) return fetchSessionsPromise ?? undefined;
    if (state.hasFetchedSessions && !force) return;

    const myGeneration = ++fetchSessionsGeneration;

    fetchSessionsPromise = (async () => {
      set({ isSessionsLoading: true });
      try {
        const sessions = await settingsApi.getSessions();
        if (fetchSessionsGeneration !== myGeneration) return;
        set({ sessions, isSessionsLoading: false, hasFetchedSessions: true });
      } catch (err) {
        if (fetchSessionsGeneration !== myGeneration) return;
        set({ isSessionsLoading: false });
        console.warn('Failed to fetch sessions:', err);
      } finally {
        if (fetchSessionsGeneration === myGeneration) {
          fetchSessionsPromise = null;
        }
      }
    })();

    return fetchSessionsPromise;
  },

  clearError: () => set({ error: null }),
}));

export function resetSettingsStore() {
  fetchProfileGeneration++;
  fetchSessionsGeneration++;
  fetchProfilePromise = null;
  fetchSessionsPromise = null;
  useSettingsStore.setState({
    profile: null,
    settings: null,
    sessions: null,
    isLoading: false,
    isSessionsLoading: false,
    hasFetched: false,
    hasFetchedSessions: false,
    isSaving: false,
    error: null,
  });
}
