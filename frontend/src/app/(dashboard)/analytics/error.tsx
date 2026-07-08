'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/feedback/error-state';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AnalyticsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Analytics error:', error);
  }, [error]);

  return (
    <div role="alert">
      <ErrorState
        title="Failed to load analytics"
        message="An unexpected error occurred. Please try again."
        onRetry={reset}
      />
    </div>
  );
}
