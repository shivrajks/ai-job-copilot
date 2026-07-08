'use client';

import { useEffect, useRef } from 'react';
import { Target, ArrowRight } from 'lucide-react';
import { useApplicationStore } from '@/store/applications';
import { formatRelativeDate } from '@/lib/dates';
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

export function DashboardRecentApplications() {
  const hasFetched = useRef(false);
  const applications = useApplicationStore((s) => s.applications);
  const isLoading = useApplicationStore((s) => s.isLoading);
  const error = useApplicationStore((s) => s.error);
  const fetchApplications = useApplicationStore((s) => s.fetchApplications);

  useEffect(() => {
    if (!hasFetched.current && applications.length === 0 && !isLoading) {
      hasFetched.current = true;
      fetchApplications();
    }
  }, [fetchApplications, applications.length, isLoading]);

  const recent = applications.slice(0, 5);

  if (error && applications.length === 0) {
    return (
      <ErrorState
        title="Failed to load applications"
        message={error}
        onRetry={fetchApplications}
      />
    );
  }

  if (isLoading && applications.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <RowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <EmptyState
        icon={<Target className="w-8 h-8 text-muted-foreground" aria-hidden="true" />}
        title="No applications yet"
        description="Start tracking to see recent activity here."
        action={{ label: 'Go to Tracker', href: '/tracker' }}
      />
    );
  }

  return (
    <div className="space-y-3">
      {recent.map((app) => (
        <a
          key={app.id}
          href="/tracker"
          className="flex items-center gap-3 py-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
            <Target className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate group-hover:text-foreground transition-colors">
              <span className="font-medium">{app.company}</span>
              {' '}{app.role}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatRelativeDate(app.createdAt)}
            </p>
          </div>
          <span
            className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0',
              stageStyles[app.stage]
            )}
          >
            {stageLabels[app.stage]}
          </span>
        </a>
      ))}

      {applications.length > 5 && (
        <div className="pt-2 border-t border-border">
          <a
            href="/tracker"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View all {applications.length} applications             <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </a>
        </div>
      )}
    </div>
  );
}
