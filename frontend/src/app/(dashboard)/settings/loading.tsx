'use client';

import { Skeleton } from '@/components/feedback/skeleton';

export default function SettingsLoading() {
  return (
    <div aria-busy="true" aria-label="Settings loading">
      <div className="mb-8">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-48 mt-2" />
      </div>
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-28 rounded-lg" />
        ))}
      </div>
      <div className="glass rounded-xl p-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
        <Skeleton className="h-10 w-32 rounded-lg mt-4" />
      </div>
    </div>
  );
}
