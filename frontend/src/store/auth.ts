import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { env } from '@/lib/config/env';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    planTier: string;
  } | null;
  setAuth: (accessToken: string, refreshToken: string, user: AuthState['user']) => void;
  clearAuth: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setAuth: (accessToken, refreshToken, user) => set({ accessToken, refreshToken, user }),
      clearAuth: () => set({ accessToken: null, refreshToken: null, user: null }),
      logout: async () => {
        const { refreshToken } = get();
        if (refreshToken) {
          try {
            await fetch(`${env.apiUrl}/api/auth/logout`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });
          } catch {
            // Logout API failure is non-critical — proceed with local cleanup
          }
        }
        set({ accessToken: null, refreshToken: null, user: null });
      },
    }),
    {
      name: 'aicopilot-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
