'use client';

import { Target, Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import type { JobDescriptionListItem } from '@/types/job-description';
import { formatRelativeDate } from '@/lib/dates';
import { analysisStatusConfig } from '@/lib/constants/analysis-status';
import { fadeUp } from '@/lib/animations/variants';
import { cn } from '@/lib/utils';

interface JobDescriptionCardProps {
  jd: JobDescriptionListItem;
  onSelect: (jd: JobDescriptionListItem) => void;
  onEdit: (jd: JobDescriptionListItem) => void;
  onDelete: (jd: JobDescriptionListItem) => void;
}

function getSourceDomain(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  }
}

export function JobDescriptionCard({
  jd,
  onSelect,
  onEdit,
  onDelete,
}: JobDescriptionCardProps) {
  const handleSelect = () => onSelect(jd);

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(jd);
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const sourceDomain = getSourceDomain(jd.sourceUrl);
  const status = analysisStatusConfig[jd.analysisStatus] || analysisStatusConfig.PENDING;
  const StatusIcon = status.icon;

  return (
    <motion.div
      variants={fadeUp}
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={handleCardKeyDown}
      aria-label={`View details for ${jd.title}${jd.company ? ` at ${jd.company}` : ''}`}
      className={cn(
        'glass rounded-xl p-4 md:p-5 transition-shadow hover:shadow-md cursor-pointer'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
          <Target className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <div className="min-w-0">
              <h3 className="font-semibold text-sm truncate">{jd.title}</h3>
              {jd.company && (
                <p className="text-xs text-muted-foreground truncate">
                  {jd.company}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {jd.analysisStatus && (
                <span className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium',
                  jd.analysisStatus === 'ANALYZED' && 'bg-emerald-500/10 text-emerald-600',
                  jd.analysisStatus === 'PENDING' && 'bg-accent text-muted-foreground',
                  jd.analysisStatus === 'PROCESSING' && 'bg-blue-500/10 text-blue-600',
                  jd.analysisStatus === 'FAILED' && 'bg-destructive/10 text-destructive'
                )}>
                  <StatusIcon className={cn('w-3 h-3', jd.analysisStatus === 'PROCESSING' && 'animate-spin')} />
                  {status.label}
                </span>
              )}
              {jd.matchScore != null && (
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium',
                    jd.matchScore >= 70
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : jd.matchScore >= 40
                        ? 'bg-amber-500/10 text-amber-600'
                        : 'bg-destructive/10 text-destructive'
                  )}
                >
                  {jd.matchScore}/100
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
            {sourceDomain && (
              <span className="inline-flex items-center gap-1">
                <LinkIcon className="w-3 h-3" aria-hidden="true" />
                {sourceDomain}
              </span>
            )}
            <span>{formatRelativeDate(jd.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
        <button
          type="button"
          onClick={(e) => handleActionClick(e, () => onEdit(jd))}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-accent"
          aria-label={`Edit ${jd.title}`}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={(e) => handleActionClick(e, () => onDelete(jd))}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded hover:bg-destructive/10 ml-auto"
          aria-label={`Delete ${jd.title}`}
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
}
