'use client';

import { FileText, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ResumeListItem } from '@/types/resume';
import { FileSize } from '@/components/shared/file-size';
import { fadeUp } from '@/lib/animations/variants';
import { cn } from '@/lib/utils';
import { parsingStatusConfig } from '@/lib/constants/parsing-status';

interface ResumeCardProps {
  resume: ResumeListItem;
  onActivate: (id: string) => void;
  onRename: (resume: ResumeListItem) => void;
  onDelete: (resume: ResumeListItem) => void;
  onSelect?: (resume: ResumeListItem) => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ResumeCard({ resume, onActivate, onRename, onDelete, onSelect }: ResumeCardProps) {
  const status = parsingStatusConfig[resume.parsingStatus] || parsingStatusConfig.PENDING;
  const StatusIcon = status.icon;

  const handleSelect = () => onSelect?.(resume);

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (onSelect && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onSelect(resume);
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <motion.div
      variants={fadeUp}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect ? handleSelect : undefined}
      onKeyDown={onSelect ? handleCardKeyDown : undefined}
      aria-label={onSelect ? `View details for ${resume.name}` : undefined}
      className={cn(
        'glass rounded-xl p-4 md:p-5 transition-shadow hover:shadow-md',
        resume.isActive && 'ring-2 ring-primary',
        onSelect && 'cursor-pointer'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
          resume.isActive ? 'bg-primary/10' : 'bg-accent'
        )}>
          <FileText className={cn(
            'w-5 h-5',
            resume.isActive ? 'text-primary' : 'text-muted-foreground'
          )} aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-sm truncate">{resume.name}</h3>
            {resume.isActive && (
              <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                <Star className="w-2.5 h-2.5" aria-hidden="true" />
                Active
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>v{resume.versionNum}</span>
            <span className="inline-flex items-center gap-1">
              <StatusIcon className={cn('w-3 h-3', status.color, resume.parsingStatus === 'PENDING' && 'animate-spin')} />
              <span className={status.color}>{status.label}</span>
            </span>
            <FileSize bytes={resume.fileSize} />
            <span>{formatDate(resume.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
        {!resume.isActive && (
          <button
            type="button"
            onClick={(e) => handleActionClick(e, () => onActivate(resume.id))}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-accent"
            aria-label={`Set ${resume.name} as active`}
          >
            Set Active
          </button>
        )}
        <button
          type="button"
          onClick={(e) => handleActionClick(e, () => onRename(resume))}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-accent"
          aria-label={`Rename ${resume.name}`}
        >
          Rename
        </button>
        <button
          type="button"
          onClick={(e) => handleActionClick(e, () => onDelete(resume))}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded hover:bg-destructive/10 ml-auto"
          aria-label={`Delete ${resume.name}`}
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
}
