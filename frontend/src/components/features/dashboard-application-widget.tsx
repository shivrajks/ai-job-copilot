'use client';

import { useEffect, useRef } from 'react';
import { Target, ArrowRight } from 'lucide-react';
import type { ApplicationStage } from '@/types/application';
import { useApplicationStore } from '@/store/applications';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { Skeleton } from '@/components/feedback/skeleton';
import { cn } from '@/lib/utils';

const stageLabels: Record<string, string> = {
  SAVED: 'Saved',
  APPLIED: 'Applied',
  PHONE_SCREEN: 'Phone',
  TECHNICAL_INTERVIEW: 'Technical',
  ONSITE: 'Onsite',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
};

const stageStyles: Record<string, string> = {
  SAVED: 'bg-muted text-muted-foreground',
  APPLIED: 'bg-blue-500/10 text-blue-600',
  PHONE_SCREEN: 'bg-indigo-500/10 text-indigo-600',
  TECHNICAL_INTERVIEW: 'bg-purple-500/10 text-purple-600',
  ONSITE: 'bg-amber-500/10 text-amber-600',
  OFFER: 'bg-emerald-500/10 text-emerald-600',
  REJECTED: 'bg-destructive/10 text-destructive',
  WITHDRAWN: 'bg-muted text-muted-foreground',
};

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

export function DashboardApplicationWidget() {
  const hasFetched = useRef(false);
  const applications = useApplicationStore((s) => s.applications);
  const isLoading = useApplicationStore((s) => s.isLoading);
  const error = useApplicationStore((s) => s.error);
  const fetchApplications = useApplicationStore((s) => s.fetchApplications);
  const clearError = useApplicationStore((s) => s.clearError);

  useEffect(() => {
    if (!hasFetched.current && applications.length === 0 && !isLoading) {
      hasFetched.current = true;
      fetchApplications();
    }
  }, [fetchApplications, applications.length, isLoading]);

  if (error) {
    return (
      <ErrorState
        title="Failed to load applications"
        message={error}
        onRetry={clearError}
      />
    );
  }

  if (isLoading && applications.length === 0) {
    return <WidgetSkeleton />;
  }

  if (applications.length === 0) {
    return (
      <EmptyState
        icon={<Target className="w-8 h-8 text-muted-foreground" />}
        title="No applications tracked"
        description="Start tracking your job applications to see progress here."
        action={{ label: 'Add Application', href: '/tracker' }}
      />
    );
  }

  const totalApplied = applications.filter(
    (a) => a.stage !== 'SAVED' && a.stage !== 'WITHDRAWN'
  ).length;

  const responded = applications.filter(
    (a) =>
      a.stage === 'PHONE_SCREEN' ||
      a.stage === 'TECHNICAL_INTERVIEW' ||
      a.stage === 'ONSITE' ||
      a.stage === 'OFFER' ||
      a.stage === 'REJECTED'
  ).length;

  const responseRate = totalApplied > 0 ? Math.round((responded / totalApplied) * 100) : 0;

  const activeStages: { stage: ApplicationStage }[] = [
    { stage: 'APPLIED' },
    { stage: 'PHONE_SCREEN' },
    { stage: 'TECHNICAL_INTERVIEW' },
    { stage: 'ONSITE' },
    { stage: 'OFFER' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
          <Target className="w-5 h-5 text-sky-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">
            {applications.length} {applications.length === 1 ? 'application' : 'applications'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {responseRate}% response rate
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {activeStages.map(({ stage }) => {
          const count = applications.filter((a) => a.stage === stage).length;
          if (count === 0) return null;
          return (
            <span
              key={stage}
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium',
                stageStyles[stage]
              )}
            >
              {stageLabels[stage]} {count}
            </span>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-xs text-muted-foreground">
          {responded} of {totalApplied} applications received responses
        </span>
        <a
          href="/tracker"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          View all <ArrowRight className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
