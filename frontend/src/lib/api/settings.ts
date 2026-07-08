import { api } from './client';
import type {
  ProfileResponse,
  UserSettingsResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UpdateSettingsRequest,
  SessionInfo,
} from '@/types/settings';

export async function getProfile(): Promise<ProfileResponse> {
  return api.get<ProfileResponse>('/api/users/me');
}

export async function updateProfile(data: UpdateProfileRequest): Promise<ProfileResponse> {
  return api.put<ProfileResponse>('/api/users/me', data);
}

export async function changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
  return api.put<{ message: string }>('/api/users/me/password', data);
}

export async function getSettings(): Promise<UserSettingsResponse> {
  return api.get<UserSettingsResponse>('/api/users/me/settings');
}

export async function updateSettings(data: UpdateSettingsRequest): Promise<UserSettingsResponse> {
  return api.put<UserSettingsResponse>('/api/users/me/settings', data);
}

export async function getSessions(): Promise<SessionInfo> {
  return api.get<SessionInfo>('/api/users/me/sessions');
}
