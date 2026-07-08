import { env } from '@/lib/config/env';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let getAccessToken: (() => string | null) | null = null;
let getRefreshToken: (() => string | null) | null = null;
let onTokenRefreshed: ((accessToken: string, refreshToken: string) => void) | null = null;
let onAuthError: (() => void) | null = null;

let refreshPromise: Promise<boolean> | null = null;

export function setTokenGetter(fn: () => string | null) {
  getAccessToken = fn;
}

export function setRefreshTokenGetter(fn: () => string | null) {
  getRefreshToken = fn;
}

export function setOnTokenRefreshed(fn: (accessToken: string, refreshToken: string) => void) {
  onTokenRefreshed = fn;
}

export function setOnAuthError(fn: () => void) {
  onAuthError = fn;
}

async function attemptTokenRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken?.();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${env.apiUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    onTokenRefreshed?.(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = attemptTokenRefresh().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

interface UploadOptions {
  skipAuth?: boolean;
}

function buildAuthHeaders(skipAuth?: boolean): Record<string, string> {
  const headers: Record<string, string> = {};
  if (!skipAuth && getAccessToken) {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

async function handleResponse<T>(res: Response, skipAuth?: boolean): Promise<T> {
  if (!res.ok) {
    if ((res.status === 401 || res.status === 403) && !skipAuth) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        const err = new ApiError(res.status, 'Token expired');
        (err as any)._retryable = true;
        throw err;
      }
      onAuthError?.();
      throw new ApiError(res.status, 'Session expired. Please login again.');
    }
    const error = await res.json().catch(() => ({ message: 'An error occurred' }));
    throw new ApiError(res.status, error.message || 'An error occurred');
  }

  if (res.status === 204) {
    return null as unknown as T;
  }

  const text = await res.text();
  if (!text) {
    return null as unknown as T;
  }
  return JSON.parse(text);
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { skipAuth, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...buildAuthHeaders(skipAuth),
    ...(fetchOptions.headers as Record<string, string>),
  };

  const doFetch = () =>
    fetch(`${env.apiUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

  let res = await doFetch();

  try {
    return await handleResponse<T>(res, skipAuth);
  } catch (err) {
    if (err instanceof ApiError && (err as any)._retryable && !skipAuth) {
      const newToken = getAccessToken?.();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
      }
      res = await doFetch();
      return await handleResponse<T>(res, skipAuth);
    }
    throw err;
  }
}

export async function apiUpload<T>(
  endpoint: string,
  formData: FormData,
  options: UploadOptions = {}
): Promise<T> {
  const { skipAuth } = options;

  const headers: Record<string, string> = buildAuthHeaders(skipAuth);

  const doFetch = () =>
    fetch(`${env.apiUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

  let res = await doFetch();

  try {
    return await handleResponse<T>(res, skipAuth);
  } catch (err) {
    if (err instanceof ApiError && (err as any)._retryable && !skipAuth) {
      const newToken = getAccessToken?.();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
      }
      res = await doFetch();
      return await handleResponse<T>(res, skipAuth);
    }
    throw err;
  }
}

export const api = {
  get: <T>(endpoint: string, options?: ApiOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: ApiOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: ApiOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: ApiOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: ApiOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};
