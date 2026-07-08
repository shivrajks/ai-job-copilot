'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Building2, MapPin, DollarSign, Calendar, FileText, StickyNote } from 'lucide-react';
import type { ApplicationListItem, ApplicationStage } from '@/types/application';
import { STAGE_LABELS, STAGE_COLORS } from '@/types/application';
import { useApplicationStore } from '@/store/applications';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ApplicationDetailDrawerProps {
  application: ApplicationListItem | null;
  onClose: () => void;
  onEdit: (application: ApplicationListItem) => void;
  onDelete: (application: ApplicationListItem) => void;
  onStageChange: (id: string, stage: ApplicationStage) => Promise<void>;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatSalary(min: number | null, max: number | null): string {
  if (min === null && max === null) return '—';
  const fmt = (n: number) => `$${n.toLocaleString()}`;
  if (min !== null && max !== null) return `${fmt(min)} - ${fmt(max)}`;
  if (min !== null) return `${fmt(min)}+`;
  return `Up to ${fmt(max!)}`;
}

const stageOptions: ApplicationStage[] = [
  'SAVED', 'APPLIED', 'PHONE_SCREEN', 'TECHNICAL_INTERVIEW',
  'ONSITE', 'OFFER', 'ACCEPTED', 'REJECTED', 'WITHDRAWN',
];

export function ApplicationDetailDrawer({
  application,
  onClose,
  onEdit,
  onDelete,
  onStageChange,
}: ApplicationDetailDrawerProps) {
  const detail = useApplicationStore((s) => s.selectedApplication);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!application) return;
    useApplicationStore.getState().getApplication(application.id);
  }, [application]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    if (!application) return;
    const drawer = drawerRef.current;
    if (!drawer) return;
    const focusable = drawer.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    function trap(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, [application]);

  return (
    <AnimatePresence>
      {application && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40 lg:bg-transparent"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-card border-l border-border z-50 shadow-2xl overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Application details"
          >
            <div className="sticky top-0 bg-card border-b border-border z-10 flex items-center justify-between p-4">
              <h2 className="text-lg font-semibold">Application Details</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Header */}
              <div>
                <h3 className="text-xl font-bold">{detail?.role || application.role}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{application.company}</span>
                </div>
              </div>

              {/* Stage badge */}
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'text-xs px-2.5 py-1 rounded-full border font-medium',
                    STAGE_COLORS[application.stage as ApplicationStage]
                  )}
                >
                  {STAGE_LABELS[application.stage as ApplicationStage] || application.stage}
                </span>
              </div>

              {/* Stage changer */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Move to stage</label>
                <div className="flex flex-wrap gap-1.5">
                  {stageOptions.map((s) => (
                    <button
                      key={s}
                      onClick={() => onStageChange(application.id, s)}
                      className={cn(
                        'text-xs px-2.5 py-1 rounded-full border transition-colors',
                        application.stage === s
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border hover:border-primary hover:text-primary'
                      )}
                    >
                      {STAGE_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4">
                {detail?.location && (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Location
                    </span>
                    <p className="text-sm">{detail.location}</p>
                  </div>
                )}
                {(detail?.salaryMin || detail?.salaryMax) && (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-3 w-3" /> Salary
                    </span>
                    <p className="text-sm">{formatSalary(detail.salaryMin, detail.salaryMax)}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Applied
                  </span>
                  <p className="text-sm">{formatDate(application.appliedAt)}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Created
                  </span>
                  <p className="text-sm">{formatDate(application.createdAt)}</p>
                </div>
              </div>

              {/* Resume */}
              {detail?.resumeName && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <FileText className="h-3 w-3" /> Resume
                  </span>
                  <p className="text-sm">{detail.resumeName}</p>
                </div>
              )}

              {/* Job URL */}
              {detail?.jobUrl && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Job Posting</span>
                  <a
                    href={detail.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Open job posting
                  </a>
                </div>
              )}

              {/* Notes */}
              {detail?.notes && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <StickyNote className="h-3 w-3" /> Notes
                  </span>
                  <p className="text-sm whitespace-pre-wrap bg-muted rounded-lg p-3">
                    {detail.notes}
                  </p>
                </div>
              )}

              {/* Timeline */}
              <div className="space-y-2">
                <span className="text-xs text-muted-foreground">Timeline</span>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    <span>Created {formatDate(application.createdAt)}</span>
                  </div>
                  {detail?.updatedAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground shrink-0" />
                      <span>Updated {formatDate(detail.updatedAt)}</span>
                    </div>
                  )}
                  {application.appliedAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      <span>Applied {formatDate(application.appliedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onEdit(application)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={() => onDelete(application)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
