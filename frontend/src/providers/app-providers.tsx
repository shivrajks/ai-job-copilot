'use client';

import { type ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'sonner';
import { ThemeProvider } from './theme-provider';
import { useAuthStore } from '@/store/auth';
import {
  setTokenGetter,
  setRefreshTokenGetter,
  setOnTokenRefreshed,
  setOnAuthError,
} from '@/lib/api/client';

function setAuthCookie(token: string | null) {
  if (typeof document === 'undefined') return;
  const isSecure = typeof location !== 'undefined' && location.protocol === 'https:';
  const secureFlag = isSecure ? '; Secure' : '';
  if (token) {
    document.cookie = `auth_token=${token}; path=/; max-age=604800; SameSite=Lax${secureFlag}`;
  } else {
    document.cookie = `auth_token=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
  }
}

function ApiTokenSync() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    setTokenGetter(() => accessToken);
    setAuthCookie(accessToken);
  }, [accessToken]);

  useEffect(() => {
    setRefreshTokenGetter(() => refreshToken);
  }, [refreshToken]);

  useEffect(() => {
    setOnTokenRefreshed((newAccessToken: string, newRefreshToken: string) => {
      const user = useAuthStore.getState().user;
      if (user) {
        setAuth(newAccessToken, newRefreshToken, user);
      }
    });
  }, [setAuth]);

  useEffect(() => {
    setOnAuthError(() => {
      clearAuth();
      setAuthCookie(null);
      router.replace('/auth/login');
    });
  }, [clearAuth, router]);

  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ApiTokenSync />
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          className: 'text-sm',
        }}
      />
    </ThemeProvider>
  );
}
