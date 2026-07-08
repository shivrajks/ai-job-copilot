'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/feedback/error-state';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function JobsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Jobs error:', error);
  }, [error]);

  return (
    <div role="alert">
      <ErrorState
        title="Failed to load jobs"
        message="An unexpected error occurred. Please try again."
        onRetry={reset}
      />
    </div>
  );
}
