'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/feedback/error-state';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div role="alert">
      <ErrorState
        title="Failed to load dashboard"
        message="An unexpected error occurred. Please try again."
        onRetry={reset}
      />
    </div>
  );
}
