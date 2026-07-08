'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SaveTailoredResumeDialogProps {
  isOpen: boolean;
  isSaving: boolean;
  defaultName: string;
  hasAcceptedChanges: boolean;
  onSave: (name: string) => void;
  onClose: () => void;
}

export function SaveTailoredResumeDialog({
  isOpen,
  isSaving,
  defaultName,
  hasAcceptedChanges,
  onSave,
  onClose,
}: SaveTailoredResumeDialogProps) {
  const [name, setName] = useState(defaultName);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setName(defaultName);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, defaultName]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen && !isSaving) onClose();
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isSaving, onClose]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && !isSaving) {
      onSave(name.trim());
    }
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
            aria-labelledby="save-dialog-title"
            className={cn(
              'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
              'w-full max-w-md bg-background border border-border rounded-xl shadow-2xl',
              'p-6'
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id="save-dialog-title" className="text-lg font-semibold">
                Save Tailored Resume
              </h2>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSaving}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 -mr-1"
                aria-label="Cancel"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="resume-name" className="text-sm font-medium text-foreground">
                  Resume Name
                </label>
                <input
                  ref={inputRef}
                  id="resume-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSaving}
                  className={cn(
                    'w-full px-3 py-2 rounded-lg border border-border',
                    'bg-background text-foreground text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'placeholder:text-muted-foreground'
                  )}
                  placeholder="e.g., Resume v2 — Tailored for Google"
                  maxLength={100}
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  This will be saved as a new resume version.
                </p>
              </div>

              {!hasAcceptedChanges && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-xs text-amber-700">
                    No changes are currently accepted. The saved resume will match the original version.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSaving}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-accent disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !name.trim()}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" aria-hidden="true" />
                      Save as New Version
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
