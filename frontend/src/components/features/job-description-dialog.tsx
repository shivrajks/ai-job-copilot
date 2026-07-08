'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { JobDescriptionDetail } from '@/types/job-description';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface JobDescriptionFormData {
  title: string;
  company?: string;
  rawText?: string;
  sourceUrl?: string;
}

interface JobDescriptionDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  jd?: JobDescriptionDetail | null;
  onConfirm: (data: JobDescriptionFormData) => Promise<void>;
  onCancel: () => void;
  isPending?: boolean;
}

export function JobDescriptionDialog({
  open,
  mode,
  jd,
  onConfirm,
  onCancel,
  isPending,
}: JobDescriptionDialogProps) {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [rawText, setRawText] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && jd) {
        setTitle(jd.title);
        setCompany(jd.company || '');
        setRawText(jd.rawText ?? '');
        setSourceUrl(jd.sourceUrl || '');
      } else {
        setTitle('');
        setCompany('');
        setRawText('');
        setSourceUrl('');
      }
      setErrors({});
      setTimeout(() => titleInputRef.current?.focus(), 50);
    }
  }, [open, mode, jd]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) onCancel();
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onCancel]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data: JobDescriptionFormData = {
      title: title.trim(),
    };

    if (company.trim()) data.company = company.trim();
    if (rawText.trim()) data.rawText = rawText.trim();
    if (sourceUrl.trim()) data.sourceUrl = sourceUrl.trim();

    await onConfirm(data);
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            role="dialog"
            aria-labelledby="jd-dialog-title"
            aria-modal="true"
            className={cn(
              'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
              'w-full max-w-xl p-6 rounded-xl glass-elevated',
              'max-h-[90vh] overflow-y-auto'
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id="jd-dialog-title" className="text-lg font-semibold">
                {mode === 'create' ? 'Add Job Description' : 'Edit Job Description'}
              </h2>
              <button
                onClick={onCancel}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jd-title">Title *</Label>
                  <Input
                    ref={titleInputRef}
                    id="jd-title"
                    type="text"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); setErrors((prev) => ({ ...prev, title: '' })); }}
                    className={errors.title ? 'border-destructive focus-visible:ring-destructive' : ''}
                    placeholder="e.g. Senior Frontend Engineer"
                    aria-describedby={errors.title ? 'jd-title-error' : undefined}
                  />
                  {errors.title && (
                    <p id="jd-title-error" className="text-xs text-destructive" role="alert">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jd-company">Company</Label>
                  <Input
                    id="jd-company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Vercel"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jd-url">Source URL</Label>
                <Input
                  id="jd-url"
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://example.com/jobs/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jd-raw">Job Description</Label>
                <textarea
                  id="jd-raw"
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste the full job description here..."
                  rows={8}
                  className={cn(
                    'w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-y',
                    'placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                    'transition-colors font-sans'
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isPending}>
                  {isPending
                    ? 'Saving...'
                    : mode === 'create'
                      ? 'Add Job Description'
                      : 'Save Changes'}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
