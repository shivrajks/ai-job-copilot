'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface JobDeleteDialogProps {
  open: boolean;
  title: string;
  company: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending?: boolean;
}

export function JobDeleteDialog({ open, title, company, onConfirm, onCancel, isPending }: JobDeleteDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) { if (e.key === 'Escape' && open) onCancel(); }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onCancel]);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = dialog.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
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

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50" onClick={onCancel} aria-hidden="true" />
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            role="alertdialog"
            aria-labelledby="job-delete-title"
            aria-describedby="job-delete-desc"
            aria-modal="true"
            className={cn('fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-6 rounded-xl glass-elevated')}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h2 id="job-delete-title" className="text-lg font-semibold">Delete Job</h2>
                  <button type="button" onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Close">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p id="job-delete-desc" className="text-sm text-muted-foreground">
                  Are you sure you want to delete <strong>{title}</strong> at <strong>{company}</strong>? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
              <Button type="button" variant="destructive" size="sm" onClick={onConfirm} disabled={isPending}>
                {isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
