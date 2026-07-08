'use client';

import { SkeletonStatCard, SkeletonCard } from '@/components/feedback/skeleton';

export default function DashboardLoading() {
  return (
    <div aria-busy="true" aria-label="Dashboard loading">
      <div className="mb-8">
        <div className="h-8 w-48 bg-muted rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-64 bg-muted rounded-lg animate-pulse" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      <div className="glass rounded-xl p-4 md:p-6 mb-6 md:mb-8">
        <div className="h-5 w-28 bg-muted rounded-lg animate-pulse mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
