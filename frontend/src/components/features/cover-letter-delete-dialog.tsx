'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoverLetterDeleteDialogProps {
  isOpen: boolean;
  isDeleting: boolean;
  title: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function CoverLetterDeleteDialog({
  isOpen,
  isDeleting,
  title,
  onConfirm,
  onClose,
}: CoverLetterDeleteDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setTimeout(() => cancelRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen && !isDeleting) onClose();
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isDeleting, onClose]);

  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen]);

  const handleClose = () => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleClose}
            aria-hidden="true"
          />
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cl-delete-title"
            className={cn(
              'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
              'w-full max-w-sm bg-background border border-border rounded-xl shadow-2xl',
              'p-6'
            )}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 id="cl-delete-title" className="text-base font-semibold">
                  Delete Cover Letter
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Are you sure you want to delete &quot;{title}&quot;? This action cannot be undone.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={isDeleting}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 -mr-1 shrink-0"
                aria-label="Cancel"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                ref={cancelRef}
                type="button"
                onClick={handleClose}
                disabled={isDeleting}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-accent disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-destructive hover:bg-destructive/90 transition-colors px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
