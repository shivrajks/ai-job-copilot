import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { env } from '@/lib/config/env';
import { resetUserStores } from './reset-user-stores';

function clearAuthCookie() {
  if (typeof document === 'undefined') return;
  const isSecure = typeof location !== 'undefined' && location.protocol === 'https:';
  const secureFlag = isSecure ? '; Secure' : '';
  document.cookie = `auth_token=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
}

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
      setAuth: (accessToken, refreshToken, user) => {
        const prevUser = get().user;
        // ponytail: clear stale stores if a different user logs in without explicit logout
        if (prevUser && user && prevUser.id !== user.id) {
          resetUserStores();
        }
        set({ accessToken, refreshToken, user });
      },
      clearAuth: () => {
        set({ accessToken: null, refreshToken: null, user: null });
        resetUserStores();
        clearAuthCookie();
      },
      logout: async () => {
        const { refreshToken } = get();
        // Clear local state and cookie immediately so navigation sees unauthenticated state
        set({ accessToken: null, refreshToken: null, user: null });
        resetUserStores();
        clearAuthCookie();
        // Invalidate refresh token server-side (fire-and-forget)
        if (refreshToken) {
          fetch(`${env.apiUrl}/api/auth/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          }).catch(() => {});
        }
      },
    }),
    {
      name: 'aicopilot-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
