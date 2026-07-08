'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, Sparkles, Loader2 } from 'lucide-react';
import type { ResumeListItem, ResumeDetail } from '@/types/resume';
import { getResume } from '@/lib/api/resumes';
import { useResumeStore } from '@/store/resumes';
import { ResumeDetailSkeleton } from './resume-detail-skeleton';
import { ResumeDetailMetadata } from './resume-detail-metadata';
import { ResumeDetailContent } from './resume-detail-content';
import { ErrorState } from '@/components/feedback/error-state';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ResumeDetailPanelProps {
  resume: ResumeListItem | null;
  onClose: () => void;
  onActivate: (id: string) => void;
  onRename: (resume: ResumeListItem) => void;
  onDelete: (resume: ResumeListItem) => void;
}

export function ResumeDetailPanel({
  resume,
  onClose,
  onActivate,
  onRename,
  onDelete,
}: ResumeDetailPanelProps) {
  const [detail, setDetail] = useState<ResumeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const isParsing = useResumeStore((s) => s.isParsing);
  const parseResumeAction = useResumeStore((s) => s.parseResume);
  const shouldReduceMotion = useReducedMotion();
  const [ariaMessage, setAriaMessage] = useState('');

  const fetchDetail = useCallback(async (id: string) => {
    setIsLoading(true);
    setFetchError(null);
    setDetail(null);
    try {
      const result = await getResume(id);
      setDetail(result);
    } catch (err) {
      setFetchError(
        err instanceof Error ? err.message : 'Failed to load resume details'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (resume) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      fetchDetail(resume.id);
      requestAnimationFrame(() => closeBtnRef.current?.focus());
    }
  }, [resume, fetchDetail]);

  const handleClose = useCallback(() => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
    onClose();
  }, [onClose]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && resume) handleClose();
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [resume, handleClose]);

  useEffect(() => {
    if (!resume) return;
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
  }, [resume]);

  const handleRetry = useCallback(() => {
    if (resume) fetchDetail(resume.id);
  }, [resume, fetchDetail]);

  const handleActivate = useCallback(() => {
    if (resume) onActivate(resume.id);
  }, [resume, onActivate]);

  const handleRename = useCallback(() => {
    if (resume) onRename(resume);
  }, [resume, onRename]);

  const handleDelete = useCallback(() => {
    if (resume) onDelete(resume);
  }, [resume, onDelete]);

  const handleParse = useCallback(async () => {
    if (!resume) return;
    setAriaMessage('Parsing started');
    try {
      const parsedDetail = await parseResumeAction(resume.id);
      setDetail(parsedDetail);
      const status = parsedDetail.parsingStatus;
      setAriaMessage(status === 'PARSED' ? 'Resume parsed successfully' : 'Parsing failed');
    } catch {
      setAriaMessage('Parsing failed');
    }
  }, [resume, parseResumeAction]);

  return (
    <AnimatePresence>
      {resume && (
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
            initial={shouldReduceMotion ? { x: 0 } : { x: '100%' }}
            animate={{ x: 0 }}
            exit={shouldReduceMotion ? { x: 0 } : { x: '100%' }}
            transition={shouldReduceMotion ? { duration: 0.1 } : { type: 'spring', stiffness: 300, damping: 30 }}
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
              <h2
                id="detail-panel-title"
                className="text-lg font-semibold truncate"
              >
                {detail?.name || resume.name}
              </h2>
              <button
                ref={closeBtnRef}
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground transition-colors p-2 -mr-2"
                aria-label="Close resume details"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="sr-only"
            >
              {ariaMessage}
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading && <ResumeDetailSkeleton />}

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
                  <ResumeDetailMetadata detail={detail} />

                  <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border">
                    {!detail.isActive && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleActivate}
                      >
                        Set Active
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRename}
                    >
                      Rename
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDelete}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/30"
                    >
                      Delete
                    </Button>
                    {detail.parsingStatus !== 'PROCESSING' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleParse}
                        disabled={isParsing}
                        className="ml-auto"
                        aria-busy={isParsing}
                      >
                        {isParsing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" aria-hidden="true" />
                            Parsing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-1.5" aria-hidden="true" />
                            {detail.parsingStatus === 'PARSED' ? 'Re-parse' : 'Parse Resume'}
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  <div className="pt-2">
                    <ResumeDetailContent detail={detail} />
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
