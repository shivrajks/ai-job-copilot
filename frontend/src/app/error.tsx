'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/feedback/error-state';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6">
      <div role="alert">
        <ErrorState
          title="Something went wrong"
          message="An unexpected error occurred. Please try again."
          onRetry={reset}
        />
      </div>
    </main>
  );
}
