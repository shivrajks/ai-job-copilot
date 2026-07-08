'use client';

import { SkeletonCard } from '@/components/feedback/skeleton';

export default function ResumesLoading() {
  return (
    <div aria-busy="true" aria-label="Resumes loading">
      <div className="mb-8">
        <div className="h-8 w-32 bg-muted rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-56 bg-muted rounded-lg animate-pulse" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
  }
