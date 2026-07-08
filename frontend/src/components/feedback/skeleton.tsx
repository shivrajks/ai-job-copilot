import { cn } from '@/lib/utils';
import { motion, useReducedMotion } from 'framer-motion';
import { skeletonPulse } from '@/lib/animations/variants';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={cn('rounded-lg bg-muted animate-pulse', className)} />;
  }

  return (
    <motion.div
      variants={skeletonPulse}
      animate="animate"
      className={cn('rounded-lg bg-muted', className)}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="glass rounded-xl p-5 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function SkeletonTable({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="glass rounded-xl p-5 space-y-2">
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  );
}
