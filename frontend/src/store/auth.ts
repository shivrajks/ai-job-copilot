import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  user: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    planTier: string;
  } | null;
  setAuth: (token: string, user: AuthState['user']) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  setAuth: (token, user) => set({ accessToken: token, user }),
  clearAuth: () => set({ accessToken: null, user: null }),
}));
