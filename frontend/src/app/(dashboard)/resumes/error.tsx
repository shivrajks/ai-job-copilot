'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/feedback/error-state';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ResumesError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Resumes page error:', error);
  }, [error]);

  return (
    <ErrorState
      title="Failed to load resumes"
      message="An unexpected error occurred. Please try again."
      onRetry={reset}
    />
  );
}
