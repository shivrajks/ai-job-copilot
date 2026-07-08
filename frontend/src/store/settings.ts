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

interface SettingsState {
  profile: ProfileResponse | null;
  settings: UserSettingsResponse | null;
  sessions: SessionInfo | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  fetchProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  updateSettings: (data: UpdateSettingsRequest) => Promise<void>;
  fetchSessions: () => Promise<void>;
  clearError: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  profile: null,
  settings: null,
  sessions: null,
  isLoading: false,
  isSaving: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const profile = await settingsApi.getProfile();
      set({
        profile,
        settings: profile.settings,
        isLoading: false,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load profile',
      });
    }
  },

  updateProfile: async (data: UpdateProfileRequest) => {
    set({ isSaving: true, error: null });
    try {
      const profile = await settingsApi.updateProfile(data);
      set({ profile, settings: profile.settings, isSaving: false });
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
      }));
      toast.success('Settings updated successfully');
    } catch (err) {
      set({ isSaving: false });
      toast.error(err instanceof Error ? err.message : 'Failed to update settings');
      throw err;
    }
  },

  fetchSessions: async () => {
    try {
      const sessions = await settingsApi.getSessions();
      set({ sessions });
    } catch (err) {
      console.warn('Failed to fetch sessions:', err);
    }
  },

  clearError: () => set({ error: null }),
}));
