'use client';

import { useEffect, useRef } from 'react';
import {
  FileText,
  Upload,
} from 'lucide-react';
import { useResumeStore } from '@/store/resumes';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { FileSize } from '@/components/shared/file-size';
import { Skeleton } from '@/components/feedback/skeleton';
import { cn } from '@/lib/utils';
import { parsingStatusConfig } from '@/lib/constants/parsing-status';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

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

export function DashboardResumeWidget() {
  const hasFetched = useRef(false);
  const resumes = useResumeStore((s) => s.resumes);
  const isLoading = useResumeStore((s) => s.isLoading);
  const error = useResumeStore((s) => s.error);
  const fetchResumes = useResumeStore((s) => s.fetchResumes);
  const clearError = useResumeStore((s) => s.clearError);

  useEffect(() => {
    if (!hasFetched.current && resumes.length === 0 && !isLoading) {
      hasFetched.current = true;
      fetchResumes();
    }
  }, [fetchResumes, resumes.length, isLoading]);

  if (error) {
    return (
      <ErrorState
        title="Failed to load resumes"
        message={error}
        onRetry={clearError}
      />
    );
  }

  if (isLoading && resumes.length === 0) {
    return <WidgetSkeleton />;
  }

  if (resumes.length === 0) {
    return (
      <EmptyState
        icon={<Upload className="w-8 h-8 text-muted-foreground" />}
        title="No resume yet"
        description="Upload your first resume to get started with ATS analysis."
        action={{ label: 'Upload Resume', href: '/resumes' }}
      />
    );
  }

  const activeResume = resumes.find((r) => r.isActive) || resumes[0];
  const status = parsingStatusConfig[activeResume.parsingStatus] || parsingStatusConfig.PENDING;
  const StatusIcon = status.icon;

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
          activeResume.isActive ? 'bg-primary/10' : 'bg-accent'
        )}>
          <FileText className={cn(
            'w-5 h-5',
            activeResume.isActive ? 'text-primary' : 'text-muted-foreground'
          )} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">
            {activeResume.name}
            <span className="text-muted-foreground font-normal">
              {' '}(v{activeResume.versionNum})
            </span>
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <StatusIcon className={cn('w-3.5 h-3.5', status.color, activeResume.parsingStatus === 'PENDING' && 'animate-spin')} />
            <span className={cn('text-xs font-medium', status.color)}>{status.label}</span>
            {activeResume.isActive && (
              <span className="text-[10px] text-muted-foreground ml-1">• Active</span>
            )}
          </div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <div className="flex items-center justify-between">
          <span>ATS Score</span>
          <span className={cn(
            'font-medium',
            activeResume.atsScore !== null ? 'text-foreground' : 'text-muted-foreground'
          )}>
            {activeResume.atsScore !== null ? `${activeResume.atsScore}/100` : 'Not analyzed'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Size</span>
          <FileSize bytes={activeResume.fileSize} className="text-foreground font-medium" />
        </div>
        <div className="flex items-center justify-between">
          <span>Updated</span>
          <span className="text-foreground">{formatDate(activeResume.createdAt)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-xs text-muted-foreground">
          {resumes.length} {resumes.length === 1 ? 'resume' : 'resumes'} total
        </span>
        <a
          href="/resumes"
          className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          View all &rarr;
        </a>
      </div>
    </div>
  );
}
