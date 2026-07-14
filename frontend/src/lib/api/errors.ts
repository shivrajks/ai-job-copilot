const DEFAULT_MESSAGE = 'An unexpected error occurred';

export function normalizeError(err: unknown, fallback = DEFAULT_MESSAGE): string {
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message || fallback;
  if (err && typeof err === 'object') {
    const obj = err as Record<string, unknown>;
    if (typeof obj.message === 'string') return obj.message;
    if (typeof obj.text === 'string') return obj.text;
    if (typeof obj.error === 'string') return obj.error;
    if (obj.response && typeof obj.response === 'object') {
      const resp = obj.response as Record<string, unknown>;
      if (typeof resp.data === 'object' && resp.data !== null) {
        const data = resp.data as Record<string, unknown>;
        if (typeof data.message === 'string') return data.message;
        if (typeof data.text === 'string') return data.text;
      }
      if (typeof resp.statusText === 'string') return resp.statusText;
    }
  }
  return fallback;
}
