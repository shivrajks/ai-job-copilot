'use client';

import { useState } from 'react';
import {
  MapPin,
  DollarSign,
  Link,
  FileText,
  Calendar,
  Clock,
  ChevronDown,
} from 'lucide-react';
import type { ApplicationDetail, ApplicationStage } from '@/types/application';
import { cn } from '@/lib/utils';

interface ApplicationDetailContentProps {
  detail: ApplicationDetail;
  onStageChange?: (stage: ApplicationStage) => void;
}

const stageLabels: Record<ApplicationStage, string> = {
  SAVED: 'Saved',
  APPLIED: 'Applied',
  PHONE_SCREEN: 'Phone Screen',
  TECHNICAL_INTERVIEW: 'Technical Interview',
  ONSITE: 'Onsite',
  OFFER: 'Offer',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
};

const stageStyles: Record<ApplicationStage, string> = {
  SAVED: 'bg-muted text-muted-foreground',
  APPLIED: 'bg-blue-500/10 text-blue-600',
  PHONE_SCREEN: 'bg-indigo-500/10 text-indigo-600',
  TECHNICAL_INTERVIEW: 'bg-purple-500/10 text-purple-600',
  ONSITE: 'bg-amber-500/10 text-amber-600',
  OFFER: 'bg-emerald-500/10 text-emerald-600',
  ACCEPTED: 'bg-emerald-500/10 text-emerald-600',
  REJECTED: 'bg-destructive/10 text-destructive',
  WITHDRAWN: 'bg-muted text-muted-foreground',
};

const allStages: ApplicationStage[] = [
  'SAVED',
  'APPLIED',
  'PHONE_SCREEN',
  'TECHNICAL_INTERVIEW',
  'ONSITE',
  'OFFER',
  'REJECTED',
  'WITHDRAWN',
];

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ApplicationDetailContent({
  detail,
  onStageChange,
}: ApplicationDetailContentProps) {
  const [stageOpen, setStageOpen] = useState(false);

  const handleStageSelect = (stage: ApplicationStage) => {
    setStageOpen(false);
    if (stage !== detail.stage) {
      onStageChange?.(stage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stage selector */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
          Stage
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setStageOpen(!stageOpen)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              stageStyles[detail.stage]
            )}
            aria-expanded={stageOpen}
            aria-haspopup="listbox"
            aria-label="Current stage"
          >
            {stageLabels[detail.stage]}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {stageOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setStageOpen(false)}
                aria-hidden="true"
              />
              <div
                role="listbox"
                aria-label="Select stage"
                className={cn(
                  'absolute left-0 top-full mt-1 z-20',
                  'w-48 py-1 rounded-lg border border-border bg-popover shadow-lg'
                )}
              >
                {allStages.map((stage) => (
                  <button
                    key={stage}
                    role="option"
                    aria-selected={stage === detail.stage}
                    onClick={() => handleStageSelect(stage)}
                    className={cn(
                      'flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors',
                      'hover:bg-accent',
                      stage === detail.stage && 'bg-accent font-medium'
                    )}
                  >
                    <span className={cn(
                      'w-2 h-2 rounded-full shrink-0',
                      stage === 'SAVED' && 'bg-muted-foreground',
                      stage === 'APPLIED' && 'bg-blue-500',
                      stage === 'PHONE_SCREEN' && 'bg-indigo-500',
                      stage === 'TECHNICAL_INTERVIEW' && 'bg-purple-500',
                      stage === 'ONSITE' && 'bg-amber-500',
                      stage === 'OFFER' && 'bg-emerald-500',
                      stage === 'REJECTED' && 'bg-destructive',
                      stage === 'WITHDRAWN' && 'bg-muted-foreground',
                    )} />
                    {stageLabels[stage]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Metadata grid */}
      <div className="grid grid-cols-2 gap-4">
        {detail.location && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Location
            </p>
            <p className="text-sm font-medium">{detail.location}</p>
          </div>
        )}

        {(detail.salaryMin != null || detail.salaryMax != null) && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              Salary
            </p>
            <p className="text-sm font-medium">
              {(detail.salaryMin != null && detail.salaryMax != null)
                ? `$${detail.salaryMin.toLocaleString()} - $${detail.salaryMax.toLocaleString()}`
                : detail.salaryMin != null
                  ? `From $${detail.salaryMin.toLocaleString()}`
                  : `Up to $${detail.salaryMax!.toLocaleString()}`}
            </p>
          </div>
        )}

        {detail.jobUrl && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Link className="w-3 h-3" />
              Job URL
            </p>
            <a
              href={detail.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline truncate block"
            >
              {detail.jobUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '')}
            </a>
          </div>
        )}

        {detail.resumeName && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Resume
            </p>
            <p className="text-sm font-medium truncate">{detail.resumeName}</p>
          </div>
        )}

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Applied
          </p>
          <p className="text-sm font-medium">
            {formatDate(detail.appliedAt)}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Updated
          </p>
          <p className="text-sm font-medium">{formatDate(detail.updatedAt)}</p>
        </div>
      </div>

      {/* Notes */}
      {detail.notes && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Notes</p>
          <div className="text-sm bg-accent/50 rounded-lg p-3 whitespace-pre-wrap">
            {detail.notes}
          </div>
        </div>
      )}
    </div>
  );
}
