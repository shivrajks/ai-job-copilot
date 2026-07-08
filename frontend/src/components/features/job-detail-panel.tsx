'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Calendar, MapPin, Heart, Archive, Briefcase, Star, DollarSign } from 'lucide-react';
import type { JobDetail, JobStatus } from '@/types/jobs';
import { STATUS_LABELS, STATUS_COLORS, EMPLOYMENT_LABELS, WORK_MODE_LABELS, PRIORITY_LABELS, SOURCE_LABELS, JOB_STATUSES } from '@/types/jobs';
import { formatRelativeDate } from '@/lib/dates';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface JobDetailPanelProps {
  open: boolean;
  job: JobDetail | null;
  onClose: () => void;
  onEdit: (job: JobDetail) => void;
  onDelete: (job: JobDetail) => void;
  onStatusChange: (id: string, status: JobStatus) => void;
  onFavoriteToggle: (id: string, favorite: boolean) => void;
  onArchiveToggle: (id: string, archived: boolean) => void;
}

export function JobDetailPanel({ open, job, onClose, onEdit, onDelete, onStatusChange, onFavoriteToggle, onArchiveToggle }: JobDetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) { if (e.key === 'Escape' && open) onClose(); }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = panel.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    function trap(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
      else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
    }
    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, [open]);

  if (!job) return null;

  const statusColor = STATUS_COLORS[job.status as JobStatus] || 'bg-zinc-500/10 text-zinc-500';

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} aria-hidden="true" />
          <motion.div
            ref={panelRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'fixed right-0 top-0 h-full w-full max-w-lg z-50',
              'bg-background border-l border-border shadow-2xl',
              'flex flex-col'
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Job details"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Close panel">
                  <X className="w-5 h-5" />
                </button>
                <h2 className="font-semibold text-sm truncate max-w-[200px]">{job.title}</h2>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => onFavoriteToggle(job.id, !job.isFavorite)}
                  className={cn('p-1.5 rounded-lg transition-colors hover:bg-accent', job.isFavorite && 'text-amber-500')}
                  aria-label={job.isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
                  <Heart className={cn('w-4 h-4', job.isFavorite && 'fill-amber-500')} />
                </button>
                <button type="button" onClick={() => onArchiveToggle(job.id, !job.isArchived)}
                  className="p-1.5 rounded-lg transition-colors hover:bg-accent text-muted-foreground" aria-label={job.isArchived ? 'Unarchive' : 'Archive'}>
                  <Archive className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shrink-0">
                  <Briefcase className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="font-semibold text-base">{job.title}</h1>
                  <p className="text-sm text-muted-foreground">{job.company}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium', statusColor)}>
                      {STATUS_LABELS[job.status as JobStatus]}
                    </span>
                    {job.isFavorite && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
                    {job.isArchived && <span className="text-[11px] text-muted-foreground bg-accent px-2 py-0.5 rounded-full">Archived</span>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {job.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>{job.location}</span>
                  </div>
                )}
                {job.workMode && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="w-4 h-4 shrink-0" />
                    <span>{WORK_MODE_LABELS[job.workMode as keyof typeof WORK_MODE_LABELS] || job.workMode}</span>
                  </div>
                )}
                {job.employmentType && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>{EMPLOYMENT_LABELS[job.employmentType as keyof typeof EMPLOYMENT_LABELS] || job.employmentType}</span>
                  </div>
                )}
                {(job.salaryMin || job.salaryMax) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="w-4 h-4 shrink-0" />
                    <span>${(job.salaryMin || 0).toLocaleString()}{job.salaryMax ? ` - $${job.salaryMax.toLocaleString()}` : ''}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                <span className={cn(
                  'text-xs font-medium px-2 py-0.5 rounded-full border',
                  job.priority === 'HIGH' ? 'border-red-500/20 bg-red-500/10 text-red-500' :
                  job.priority === 'LOW' ? 'border-zinc-500/20 bg-zinc-500/10 text-zinc-500' :
                  'border-amber-500/20 bg-amber-500/10 text-amber-500'
                )}>
                  {PRIORITY_LABELS[job.priority as keyof typeof PRIORITY_LABELS]} Priority
                </span>
                {job.source && (
                  <span className="text-xs bg-accent text-muted-foreground px-2 py-0.5 rounded-full">
                    {SOURCE_LABELS[job.source as keyof typeof SOURCE_LABELS] || job.source}
                  </span>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Status</label>
                <select
                  value={job.status}
                  onChange={(e) => onStatusChange(job.id, e.target.value as JobStatus)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {JOB_STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>

              {job.description && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Description</label>
                  <p className="text-sm whitespace-pre-wrap">{job.description}</p>
                </div>
              )}

              {job.skillsRequired && job.skillsRequired.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Skills Required</label>
                  <div className="flex flex-wrap gap-1.5">
                    {job.skillsRequired.map((skill, i) => (
                      <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {job.notes && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Notes</label>
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">{job.notes}</p>
                </div>
              )}

              {job.interviewDates && job.interviewDates.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Interview Dates</label>
                  <div className="flex flex-wrap gap-1.5">
                    {job.interviewDates.map((date, i) => (
                      <span key={i} className="text-xs bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded-full">
                        {new Date(date).toLocaleDateString()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {job.rejectionReason && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Rejection Reason</label>
                  <p className="text-sm text-destructive/80">{job.rejectionReason}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                {job.dateSaved && (
                  <div>
                    <span className="text-muted-foreground">Date Saved:</span>
                    <p>{new Date(job.dateSaved).toLocaleDateString()}</p>
                  </div>
                )}
                {job.appliedDate && (
                  <div>
                    <span className="text-muted-foreground">Applied Date:</span>
                    <p>{new Date(job.appliedDate).toLocaleDateString()}</p>
                  </div>
                )}
                {job.deadline && (
                  <div>
                    <span className="text-muted-foreground">Deadline:</span>
                    <p className={cn(new Date(job.deadline) < new Date() ? 'text-destructive' : '')}>
                      {new Date(job.deadline).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {job.followUpDate && (
                  <div>
                    <span className="text-muted-foreground">Follow-up:</span>
                    <p>{new Date(job.followUpDate).toLocaleDateString()}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <p>{formatRelativeDate(job.createdAt)}</p>
                </div>
              </div>

              {job.sourceUrl && (
                <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                  <ExternalLink className="w-4 h-4" />
                  View Job Posting
                </a>
              )}
            </div>

            <div className="flex items-center gap-2 p-4 border-t border-border">
              <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => { onEdit(job); onClose(); }}>
                Edit
              </Button>
              <Button type="button" variant="destructive" size="sm" className="flex-1" onClick={() => { onDelete(job); onClose(); }}>
                Delete
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
