'use client';

import { Skeleton } from '@/components/feedback/skeleton';

export default function JobsLoading() {
  return (
    <div aria-busy="true" aria-label="Jobs loading">
      <div className="mb-8">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-56 mt-2" />
      </div>
      <div className="glass rounded-xl p-4 mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-48 rounded-lg" />
          <Skeleton className="h-9 w-36 rounded-lg" />
          <div className="flex-1" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass rounded-xl p-5 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-8 w-full rounded-lg mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
