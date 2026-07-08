'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { ApplicationListItem, ApplicationDetail, ApplicationStage } from '@/types/application';
import { getApplication } from '@/lib/api/applications';
import { ApplicationDetailSkeleton } from './application-detail-skeleton';
import { ApplicationDetailContent } from './application-detail-content';
import { ErrorState } from '@/components/feedback/error-state';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ApplicationDetailPanelProps {
  application: ApplicationListItem | null;
  onClose: () => void;
  onEdit: (application: ApplicationListItem) => void;
  onDelete: (application: ApplicationListItem) => void;
  onStageChange: (id: string, stage: ApplicationStage) => Promise<void>;
}

export function ApplicationDetailPanel({
  application,
  onClose,
  onEdit,
  onDelete,
  onStageChange,
}: ApplicationDetailPanelProps) {
  const [detail, setDetail] = useState<ApplicationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const fetchDetail = useCallback(async (id: string) => {
    setIsLoading(true);
    setFetchError(null);
    setDetail(null);
    try {
      const result = await getApplication(id);
      setDetail(result);
    } catch (err) {
      setFetchError(
        err instanceof Error ? err.message : 'Failed to load application details'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (application) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      fetchDetail(application.id);
      requestAnimationFrame(() => closeBtnRef.current?.focus());
    }
  }, [application, fetchDetail]);

  const handleClose = useCallback(() => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
    onClose();
  }, [onClose]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && application) handleClose();
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [application, handleClose]);

  useEffect(() => {
    if (!application) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = dialog.querySelectorAll<HTMLElement>(
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

  const handleRetry = useCallback(() => {
    if (application) fetchDetail(application.id);
  }, [application, fetchDetail]);

  const handleStageChange = useCallback(async (stage: ApplicationStage) => {
    if (!application) return;
    await onStageChange(application.id, stage);
    if (application) fetchDetail(application.id);
  }, [application, onStageChange, fetchDetail]);

  const handleEdit = useCallback(() => {
    if (application) onEdit(application);
  }, [application, onEdit]);

  const handleDelete = useCallback(() => {
    if (application) onDelete(application);
  }, [application, onDelete]);

  return (
    <AnimatePresence>
      {application && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={handleClose}
            aria-hidden="true"
          />
          <motion.div
            ref={dialogRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-panel-title"
            className={cn(
              'fixed right-0 top-0 bottom-0 z-40',
              'w-full sm:max-w-md lg:max-w-lg',
              'bg-background border-l border-border shadow-xl',
              'flex flex-col'
            )}
          >
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-border shrink-0">
              <div className="min-w-0 flex-1">
                <h2
                  id="detail-panel-title"
                  className="text-lg font-semibold truncate"
                >
                  {detail?.company || application.company}
                </h2>
                <p className="text-sm text-muted-foreground truncate">
                  {detail?.role || application.role}
                </p>
              </div>
              <button
                ref={closeBtnRef}
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground transition-colors p-2 -mr-2 shrink-0"
                aria-label="Close application details"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto" role="region" aria-label="Application details">
              {isLoading && <ApplicationDetailSkeleton />}

              {fetchError && !isLoading && (
                <div className="p-6">
                  <ErrorState
                    title="Failed to load details"
                    message={fetchError}
                    onRetry={handleRetry}
                  />
                </div>
              )}

              {detail && !isLoading && !fetchError && (
                <div className="p-4 md:p-6 space-y-6">
                  <ApplicationDetailContent
                    detail={detail}
                    onStageChange={handleStageChange}
                  />

                  <div className="flex items-center gap-2 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEdit}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDelete}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/30"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
