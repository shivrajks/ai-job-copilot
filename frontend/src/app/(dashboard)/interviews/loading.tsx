'use client';

import { Skeleton } from '@/components/feedback/skeleton';
import { PageContainer } from '@/components/layout/page-container';

export default function InterviewsLoading() {
  return (
    <div aria-busy="true" aria-label="Interviews loading">
    <PageContainer>
      <div className="mb-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-80 shrink-0 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <div className="flex-1">
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    </PageContainer>
    </div>
  );
}
