'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface RenameDialogProps {
  open: boolean;
  currentName: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
  isPending?: boolean;
}

export function RenameDialog({ open, currentName, onConfirm, onCancel, isPending }: RenameDialogProps) {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setName(currentName);
      setError('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, currentName]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) onCancel();
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onCancel]);

  useEffect(() => {
    if (!open) return;
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
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Name is required');
      return;
    }
    onConfirm(trimmed);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onCancel}
            aria-hidden="true"
          />
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            role="dialog"
            aria-labelledby="rename-dialog-title"
            aria-modal="true"
            className={cn(
              'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
              'w-full max-w-md p-6 rounded-xl glass-elevated'
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id="rename-dialog-title" className="text-lg font-semibold">
                Rename Resume
              </h2>
              <button
                type="button"
                onClick={onCancel}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rename-input">Name</Label>
                <Input
                  ref={inputRef}
                  id="rename-input"
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(''); }}
                  className={error ? 'border-destructive focus-visible:ring-destructive' : ''}
                  placeholder="My Resume"
                  aria-describedby={error ? 'rename-error' : undefined}
                />
                {error && (
                  <p id="rename-error" className="text-xs text-destructive" role="alert">{error}</p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" size="sm" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isPending}>
                  {isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
