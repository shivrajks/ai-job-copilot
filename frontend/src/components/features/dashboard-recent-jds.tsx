'use client';

import { useEffect, useRef } from 'react';
import { Target, ArrowRight } from 'lucide-react';
import { useJobDescriptionStore } from '@/store/job-descriptions';
import { formatRelativeDate } from '@/lib/dates';
import { analysisStatusConfig } from '@/lib/constants/analysis-status';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { Skeleton } from '@/components/feedback/skeleton';
import { cn } from '@/lib/utils';

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-2">
      <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-5 w-14 rounded-full shrink-0" />
    </div>
  );
}

export function DashboardRecentJobDescriptions() {
  const hasFetched = useRef(false);
  const jobDescriptions = useJobDescriptionStore((s) => s.jobDescriptions);
  const isLoading = useJobDescriptionStore((s) => s.isLoading);
  const error = useJobDescriptionStore((s) => s.error);
  const fetchJobDescriptions = useJobDescriptionStore((s) => s.fetchJobDescriptions);

  useEffect(() => {
    if (!hasFetched.current && jobDescriptions.length === 0 && !isLoading) {
      hasFetched.current = true;
      fetchJobDescriptions();
    }
  }, [fetchJobDescriptions, jobDescriptions.length, isLoading]);

  const recent = jobDescriptions.slice(0, 5);

  if (error && jobDescriptions.length === 0) {
    return (
      <ErrorState
        title="Failed to load job descriptions"
        message={error}
        onRetry={fetchJobDescriptions}
      />
    );
  }

  if (isLoading && jobDescriptions.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <RowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (jobDescriptions.length === 0) {
    return (
      <EmptyState
        icon={<Target className="w-8 h-8 text-muted-foreground" aria-hidden="true" />}
        title="No job descriptions yet"
        description="Add job descriptions to see recent entries here."
        action={{ label: 'Go to Job Match', href: '/jobs' }}
      />
    );
  }

  return (
    <div className="space-y-3" aria-live="polite">
      {recent.map((jd) => (
        <a
          key={jd.id}
          href="/jobs"
          className="flex items-center gap-3 py-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
            <Target className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate group-hover:text-foreground transition-colors">
              <span className="font-medium">{jd.title}</span>
              {jd.company && <span className="text-muted-foreground"> &middot; {jd.company}</span>}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatRelativeDate(jd.createdAt)}
            </p>
          </div>
          <span className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0',
            jd.analysisStatus === 'ANALYZED' ? 'bg-emerald-500/10 text-emerald-600' :
            jd.analysisStatus === 'FAILED' ? 'bg-destructive/10 text-destructive' :
            'bg-accent text-muted-foreground'
          )}>
            {(() => {
              const cfg = analysisStatusConfig[jd.analysisStatus];
              if (!cfg) return 'Pending';
              const Icon = cfg.icon;
              return <><Icon className="w-3 h-3" aria-hidden="true" />{cfg.label}</>;
            })()}
          </span>
        </a>
      ))}

      {jobDescriptions.length > 5 && (
        <div className="pt-2 border-t border-border">
          <a
            href="/jobs"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View all {jobDescriptions.length} job descriptions <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}
