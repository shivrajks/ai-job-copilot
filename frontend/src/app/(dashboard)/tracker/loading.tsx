'use client';

import { Skeleton } from '@/components/feedback/skeleton';

export default function TrackerLoading() {
  return (
    <div aria-busy="true" aria-label="Tracker loading">
      <div className="mb-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass rounded-xl p-4 mb-3 flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}
