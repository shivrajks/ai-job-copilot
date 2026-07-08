'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/feedback/error-state';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RegisterError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Register error:', error);
  }, [error]);

  return (
    <div role="alert">
      <ErrorState
        title="Something went wrong"
        message="An unexpected error occurred. Please try again."
        onRetry={reset}
      />
    </div>
  );
}
