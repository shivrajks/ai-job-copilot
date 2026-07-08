'use client';

import { useState } from 'react';
import {
  Link,
  Calendar,
  Clock,
  Target,
  BarChart3,
  FileText,
  ChevronDown,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import type { JobDescriptionDetail } from '@/types/job-description';
import { analysisStatusConfig } from '@/lib/constants/analysis-status';
import { JobDescriptionStructuredView } from './job-description-structured-view';
import { JobDescriptionAnalysisProgress } from './job-description-analysis-progress';
import { cn } from '@/lib/utils';

interface JobDescriptionDetailContentProps {
  detail: JobDescriptionDetail;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getSourceDomain(url: string | null): string {
  if (!url) return '—';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  }
}

export function JobDescriptionDetailContent({
  detail,
}: JobDescriptionDetailContentProps) {
  const [rawOpen, setRawOpen] = useState(false);
  const status = analysisStatusConfig[detail.analysisStatus] || analysisStatusConfig.PENDING;
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      <div
        aria-live="polite"
        aria-atomic="true"
        aria-busy={detail.analysisStatus === 'PROCESSING'}
      >
        {/* Analysis Status Banner */}
        <div className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm',
          detail.analysisStatus === 'ANALYZED' && 'bg-emerald-500/5 border-emerald-500/20',
          detail.analysisStatus === 'PENDING' && 'bg-accent/30 border-border',
          detail.analysisStatus === 'PROCESSING' && 'bg-blue-500/5 border-blue-500/20',
          detail.analysisStatus === 'FAILED' && 'bg-destructive/5 border-destructive/20'
        )}>
          <StatusIcon className={cn('w-4 h-4 shrink-0', status.color, detail.analysisStatus === 'PROCESSING' && 'animate-spin')} />
          <span className="text-sm text-foreground">{status.label}</span>
          {detail.analyzedAt && (
            <span className="text-xs text-muted-foreground ml-auto">
              {formatDate(detail.analyzedAt)}
            </span>
          )}
          {detail.analysisAttempts > 1 && (
            <span className="text-[11px] text-muted-foreground">
              (attempt #{detail.analysisAttempts})
            </span>
          )}
        </div>

        {/* Analysis Progress (PROCESSING state) */}
        {detail.analysisStatus === 'PROCESSING' && (
          <JobDescriptionAnalysisProgress />
        )}

        {/* PENDING state - dedicated guidance view */}
        {detail.analysisStatus === 'PENDING' && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Sparkles className="w-8 h-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Not yet analyzed</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click &ldquo;Analyze&rdquo; to extract structured information from this job description using AI.
              </p>
            </div>
          </div>
        )}

        {/* Structured data */}
        {detail.analysisStatus === 'ANALYZED' && detail.structuredData && (
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="px-4 py-3 bg-accent/30 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Analysis Results</h3>
            </div>
            <div className="p-4">
              <JobDescriptionStructuredView data={detail.structuredData} />
            </div>
          </div>
        )}

        {/* Error message */}
        {detail.analysisStatus === 'FAILED' && detail.errorMessage && (
          <div
            className="p-3 rounded-lg bg-destructive/5 border border-destructive/20"
            role="alert"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-destructive">Analysis failed</p>
                <p className="text-xs text-destructive/80 mt-0.5">{detail.errorMessage}</p>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  Click &ldquo;Analyze&rdquo; to try again
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Metadata grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <FileText className="w-3 h-3" />
            Company
          </p>
          <p className="text-sm font-medium">
            {detail.company || '—'}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            Match Score
          </p>
          <p className="text-sm font-medium">
            {detail.matchScore !== null
              ? `${detail.matchScore}/100`
              : detail.analysisStatus === 'ANALYZED'
                ? 'Pending Resume Match'
                : 'Not analyzed'}
          </p>
        </div>

        {detail.sourceUrl && (
          <div className="space-y-1 col-span-2">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Link className="w-3 h-3" />
              Source URL
            </p>
            <a
              href={detail.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline truncate block"
            >
              {getSourceDomain(detail.sourceUrl)}
            </a>
          </div>
        )}

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Created
          </p>
          <p className="text-sm font-medium">
            {formatDate(detail.createdAt)}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Updated
          </p>
          <p className="text-sm font-medium">
            {formatDateTime(detail.updatedAt)}
          </p>
        </div>
      </div>

      {/* Collapsible Raw text */}
      {detail.rawText && (
        <div className="border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setRawOpen(!rawOpen)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-accent/50 transition-colors"
            aria-expanded={rawOpen}
            aria-controls="jd-raw-content-panel"
          >
            <span className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-muted-foreground" />
              Job Description
            </span>
            {rawOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          </button>
          {rawOpen && (
            <div id="jd-raw-content-panel" className="px-4 pb-4">
              <div className="text-sm bg-accent/50 rounded-lg p-4 max-h-96 overflow-y-auto whitespace-pre-wrap font-sans">
                {detail.rawText}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
