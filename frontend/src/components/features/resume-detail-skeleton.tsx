import { Skeleton } from '@/components/feedback/skeleton';

export function ResumeDetailSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-4 border-t border-border">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>

      <div className="space-y-3 pt-4 border-t border-border">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </div>
  );
}
