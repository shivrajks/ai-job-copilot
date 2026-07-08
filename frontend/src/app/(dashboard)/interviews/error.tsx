'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/feedback/error-state';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function InterviewsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="p-6" role="alert">
      <ErrorState
        title="Failed to load interview sessions"
        message="An unexpected error occurred while loading interview sessions. Please try again."
        onRetry={reset}
      />
    </div>
  );
}
