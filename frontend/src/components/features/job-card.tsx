'use client';

import { useState } from 'react';
import { Briefcase, MapPin, Heart, Archive, ChevronDown, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import type { JobListItem, JobStatus } from '@/types/jobs';
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, WORK_MODE_LABELS, JOB_STATUSES } from '@/types/jobs';
import { formatRelativeDate } from '@/lib/dates';
import { fadeUp } from '@/lib/animations/variants';
import { cn } from '@/lib/utils';

interface JobCardProps {
  job: JobListItem;
  onSelect: (job: JobListItem) => void;
  onEdit: (job: JobListItem) => void;
  onDelete: (job: JobListItem) => void;
  onStatusChange: (id: string, status: JobStatus) => void;
  onFavoriteToggle: (id: string, favorite: boolean) => void;
}

export function JobCard({
  job,
  onSelect,
  onEdit,
  onDelete,
  onStatusChange,
  onFavoriteToggle,
}: JobCardProps) {
  const [stageOpen, setStageOpen] = useState(false);

  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        'glass rounded-xl p-4 md:p-5 transition-shadow hover:shadow-md cursor-pointer relative',
        job.isArchived && 'opacity-60'
      )}
      onClick={() => onSelect(job)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(job); } }}
      role="button"
      tabIndex={0}
      aria-label={`${job.title} at ${job.company}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
          <Briefcase className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-sm truncate">{job.title}</h3>
                {job.isFavorite && <Star className="w-3 h-3 fill-amber-400 text-amber-400" aria-hidden="true" />}
              </div>
              <p className="text-xs text-muted-foreground truncate">{job.company}</p>
            </div>

            <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setStageOpen(!stageOpen); }}
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors',
                  STATUS_COLORS[job.status]
                )}
                aria-expanded={stageOpen}
                aria-haspopup="listbox"
              >
                {STATUS_LABELS[job.status]}
                <ChevronDown className="w-3 h-3" aria-hidden="true" />
              </button>

              {stageOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setStageOpen(false)} aria-hidden="true" />
                  <div
                    role="listbox"
                    className="absolute right-0 top-full mt-1 z-20 w-44 py-1 rounded-lg border border-border bg-popover shadow-lg"
                  >
                    {JOB_STATUSES.map((status) => (
                      <button
                        key={status}
                        type="button"
                        role="option"
                        aria-selected={status === job.status}
                        onClick={(e) => { e.stopPropagation(); setStageOpen(false); if (status !== job.status) onStatusChange(job.id, status); }}
                        className={cn(
                          'flex items-center gap-2 w-full px-3 py-1.5 text-xs transition-colors hover:bg-accent',
                          status === job.status && 'bg-accent font-medium'
                        )}
                      >
                        {STATUS_LABELS[status]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
            {job.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3 h-3" aria-hidden="true" />
                {job.location}
              </span>
            )}
            {job.workMode && <span>{WORK_MODE_LABELS[job.workMode as keyof typeof WORK_MODE_LABELS] || job.workMode}</span>}
            {job.salaryMin && <span>${job.salaryMin.toLocaleString()}{job.salaryMax ? ` - $${job.salaryMax.toLocaleString()}` : ''}</span>}
            <span>{formatRelativeDate(job.createdAt)}</span>
          </div>

          {(job.priority !== 'MEDIUM' || job.deadline) && (
            <div className="flex items-center gap-2 mt-1.5">
              {job.priority !== 'MEDIUM' && (
                <span className={cn(
                  'text-[10px] font-medium px-1.5 py-0.5 rounded',
                  job.priority === 'HIGH' ? 'bg-red-500/10 text-red-500' : 'bg-zinc-500/10 text-zinc-500'
                )}>
                  {PRIORITY_LABELS[job.priority as keyof typeof PRIORITY_LABELS]}
                </span>
              )}
              {job.deadline && (
                <span className="text-[10px] text-muted-foreground">
                  Due: {new Date(job.deadline).toLocaleDateString()}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onFavoriteToggle(job.id, !job.isFavorite); }}
          className={cn(
            'text-xs transition-colors px-2 py-1 rounded hover:bg-accent',
            job.isFavorite ? 'text-amber-500' : 'text-muted-foreground hover:text-foreground'
          )}
          aria-label={job.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={cn('w-3.5 h-3.5', job.isFavorite && 'fill-amber-500')} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEdit(job); }}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-accent"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(job); }}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded hover:bg-destructive/10 ml-auto"
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
}
