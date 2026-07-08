'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/feedback/error-state';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CoverLettersError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Cover letters error:', error);
  }, [error]);

  return (
    <div role="alert">
      <ErrorState
        title="Failed to load cover letters"
        message="An unexpected error occurred. Please try again."
        onRetry={reset}
      />
    </div>
  );
}
