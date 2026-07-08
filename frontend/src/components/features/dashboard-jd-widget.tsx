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

function WidgetSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-20 rounded" />
      </div>
    </div>
  );
}

export function DashboardJobDescriptionWidget() {
  const hasFetched = useRef(false);
  const jobDescriptions = useJobDescriptionStore((s) => s.jobDescriptions);
  const isLoading = useJobDescriptionStore((s) => s.isLoading);
  const error = useJobDescriptionStore((s) => s.error);
  const fetchJobDescriptions = useJobDescriptionStore((s) => s.fetchJobDescriptions);
  const clearError = useJobDescriptionStore((s) => s.clearError);

  useEffect(() => {
    if (!hasFetched.current && jobDescriptions.length === 0 && !isLoading) {
      hasFetched.current = true;
      fetchJobDescriptions();
    }
  }, [fetchJobDescriptions, jobDescriptions.length, isLoading]);

  if (error) {
    return (
      <ErrorState
        title="Failed to load job descriptions"
        message={error}
        onRetry={() => { clearError(); fetchJobDescriptions(); }}
      />
    );
  }

  if (isLoading && jobDescriptions.length === 0) {
    return <WidgetSkeleton />;
  }

  if (jobDescriptions.length === 0) {
    return (
      <EmptyState
        icon={<Target className="w-8 h-8 text-muted-foreground" />}
        title="No job descriptions yet"
        description="Save your first job description to see insights here."
        action={{ label: 'Add Job Description', href: '/jobs' }}
      />
    );
  }

  const mostRecent = jobDescriptions[0];

  return (
    <div className="space-y-3" aria-live="polite">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
          <Target className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">
            {jobDescriptions.length} {jobDescriptions.length === 1 ? 'job description' : 'job descriptions'}
          </p>
          {mostRecent && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              Latest: {mostRecent.title}
            </p>
          )}
        </div>
      </div>

      {mostRecent && (
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center justify-between">
            <span>Company</span>
            <span className="text-foreground font-medium truncate ml-2">
              {mostRecent.company || '—'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Analysis</span>
            <span className={cn(
              'font-medium',
              mostRecent.analysisStatus === 'ANALYZED' ? 'text-emerald-500' :
              mostRecent.analysisStatus === 'FAILED' ? 'text-destructive' :
              'text-muted-foreground'
            )}>
              {analysisStatusConfig[mostRecent.analysisStatus]?.label || 'Pending'}
            </span>
          </div>
          {mostRecent.matchScore != null && (
            <div className="flex items-center justify-between">
              <span>Match Score</span>
              <span className={cn(
                'font-medium',
                mostRecent.matchScore >= 70 ? 'text-emerald-500' :
                mostRecent.matchScore >= 40 ? 'text-amber-500' :
                'text-destructive'
              )}>
                {mostRecent.matchScore}/100
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span>Added</span>
            <span className="text-foreground">{formatRelativeDate(mostRecent.createdAt)}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-xs text-muted-foreground">
          {jobDescriptions.length} {jobDescriptions.length === 1 ? 'entry' : 'entries'} total
        </span>
        <a
          href="/jobs"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          View all <ArrowRight className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
