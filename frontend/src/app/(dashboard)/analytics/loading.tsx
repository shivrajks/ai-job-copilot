'use client';

import { Skeleton } from '@/components/feedback/skeleton';

export default function AnalyticsLoading() {
  return (
    <div aria-busy="true" aria-label="Analytics loading">
      <div className="mb-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-56 mt-2" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass rounded-xl p-5 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}
