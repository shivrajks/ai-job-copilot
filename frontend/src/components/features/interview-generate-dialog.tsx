'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DIFFICULTIES, DIFFICULTY_LABELS } from '@/types/interview';
import type { Difficulty } from '@/types/interview';

interface InterviewGenerateDialogProps {
  isOpen: boolean;
  isGenerating: boolean;
  resumeName: string;
  onGenerate: (params: {
    difficulty: string;
    questionCount: number;
    title: string;
  }) => void;
  onClose: () => void;
}

export function InterviewGenerateDialog({
  isOpen,
  isGenerating,
  resumeName,
  onGenerate,
  onClose,
}: InterviewGenerateDialogProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [questionCount, setQuestionCount] = useState(8);
  const [title, setTitle] = useState('');
  const firstInputRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setDifficulty('medium');
      setQuestionCount(8);
      setTitle('');
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen && !isGenerating) onClose();
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isGenerating, onClose]);

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
    if (!isGenerating) {
      onGenerate({ difficulty, questionCount, title: title.trim() });
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
            aria-labelledby="int-generate-title"
            className={cn(
              'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
              'w-full max-w-md bg-background border border-border rounded-xl shadow-2xl',
              'p-6'
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id="int-generate-title" className="text-lg font-semibold">
                New Interview Session
              </h2>
              <button
                type="button"
                onClick={handleClose}
                disabled={isGenerating}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 -mr-1"
                aria-label="Cancel"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="px-3 py-2 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                Using resume: <span className="font-medium text-foreground">{resumeName}</span>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="int-title" className="text-sm font-medium text-foreground">
                  Title <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <input
                  id="int-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isGenerating}
                  className={cn(
                    'w-full px-3 py-2 rounded-lg border border-border',
                    'bg-background text-foreground text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'placeholder:text-muted-foreground'
                  )}
                  placeholder="e.g., Frontend Interview Prep"
                  maxLength={255}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="int-difficulty" className="text-sm font-medium text-foreground">
                  Difficulty
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      disabled={isGenerating}
                      className={cn(
                        'px-3 py-2 rounded-lg border text-sm transition-colors',
                        'focus:outline-none focus:ring-2 focus:ring-primary/30',
                        difficulty === d
                          ? 'border-primary bg-primary/5 text-primary font-medium'
                          : 'border-border text-muted-foreground hover:text-foreground hover:bg-accent',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                      )}
                    >
                      {DIFFICULTY_LABELS[d]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="int-count" className="text-sm font-medium text-foreground">
                  Number of Questions
                </label>
                <input
                  id="int-count"
                  type="range"
                  min={3}
                  max={15}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  disabled={isGenerating}
                  className="w-full accent-primary"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>3</span>
                  <span className="font-medium text-foreground">{questionCount} questions</span>
                  <span>15</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isGenerating}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-accent disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  ref={firstInputRef}
                  type="submit"
                  disabled={isGenerating}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" aria-hidden="true" />
                      Generate
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
