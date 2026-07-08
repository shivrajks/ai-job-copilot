import { Skeleton } from '@/components/feedback/skeleton';

export function ApplicationDetailSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>

      <Skeleton className="h-px w-full" />

      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      </div>

      <Skeleton className="h-px w-full" />

      <div className="space-y-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>

      <Skeleton className="h-px w-full" />

      <div className="flex gap-2">
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-20 rounded-lg" />
      </div>
    </div>
  );
}
