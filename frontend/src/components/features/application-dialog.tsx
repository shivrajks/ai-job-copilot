'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { ApplicationDetail, ApplicationStage } from '@/types/application';
import { useResumeStore } from '@/store/resumes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ApplicationDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  application?: ApplicationDetail | null;
  onConfirm: (data: ApplicationFormData) => Promise<void>;
  onCancel: () => void;
  isPending?: boolean;
}

export interface ApplicationFormData {
  company: string;
  role: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  jobUrl?: string;
  resumeId?: string;
  stage?: ApplicationStage;
  notes?: string;
  appliedAt?: string;
}

const stageLabels: Record<ApplicationStage, string> = {
  SAVED: 'Saved',
  APPLIED: 'Applied',
  PHONE_SCREEN: 'Phone Screen',
  TECHNICAL_INTERVIEW: 'Technical Interview',
  ONSITE: 'Onsite',
  OFFER: 'Offer',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
};

export function ApplicationDialog({
  open,
  mode,
  application,
  onConfirm,
  onCancel,
  isPending,
}: ApplicationDialogProps) {
  const resumes = useResumeStore((s) => s.resumes);

  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [resumeId, setResumeId] = useState('');
  const [stage, setStage] = useState<ApplicationStage>('SAVED');
  const [appliedAt, setAppliedAt] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const nameInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && application) {
        setCompany(application.company);
        setRole(application.role);
        setLocation(application.location || '');
        setSalaryMin(application.salaryMin?.toString() ?? '');
        setSalaryMax(application.salaryMax?.toString() ?? '');
        setJobUrl(application.jobUrl ?? '');
        setResumeId(application.resumeId ?? '');
        setStage(application.stage as ApplicationStage);
        setAppliedAt(application.appliedAt?.split('T')[0] ?? '');
        setNotes(application.notes ?? '');
      } else {
        setCompany('');
        setRole('');
        setLocation('');
        setSalaryMin('');
        setSalaryMax('');
        setJobUrl('');
        setResumeId('');
        setStage('SAVED');
        setAppliedAt('');
        setNotes('');
      }
      setErrors({});
      setTimeout(() => nameInputRef.current?.focus(), 50);
    }
  }, [open, mode, application]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) onCancel();
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onCancel]);

  useEffect(() => {
    if (!open) return;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [open]);

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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!company.trim()) newErrors.company = 'Company is required';
    if (!role.trim()) newErrors.role = 'Role is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data: ApplicationFormData = {
      company: company.trim(),
      role: role.trim(),
    };

    if (location.trim()) data.location = location.trim();
    if (salaryMin) {
      const parsed = parseInt(salaryMin, 10);
      if (!isNaN(parsed)) data.salaryMin = parsed;
    }
    if (salaryMax) {
      const parsed = parseInt(salaryMax, 10);
      if (!isNaN(parsed)) data.salaryMax = parsed;
    }
    if (jobUrl.trim()) data.jobUrl = jobUrl.trim();
    if (resumeId) data.resumeId = resumeId;
    if (mode === 'create') data.stage = stage;
    if (appliedAt) data.appliedAt = new Date(appliedAt).toISOString();
    if (notes.trim()) data.notes = notes.trim();

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
            ref={dialogRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            role="dialog"
            aria-labelledby="app-dialog-title"
            aria-modal="true"
            className={cn(
              'fixed inset-x-4 top-4 bottom-4 z-50 mx-auto',
              'w-[calc(100vw-2rem)] max-w-xl rounded-xl glass-elevated overflow-hidden',
              'flex flex-col'
            )}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.10] shrink-0">
              <h2 id="app-dialog-title" className="text-lg font-semibold">
                {mode === 'create' ? 'Add Application' : 'Edit Application'}
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

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="app-company">Company *</Label>
                  <Input
                    ref={nameInputRef}
                    id="app-company"
                    type="text"
                    value={company}
                    onChange={(e) => { setCompany(e.target.value); setErrors((prev) => ({ ...prev, company: '' })); }}
                    className={errors.company ? 'border-destructive focus-visible:ring-destructive' : ''}
                    placeholder="e.g. Vercel"
                    aria-describedby={errors.company ? 'app-company-error' : undefined}
                  />
                  {errors.company && (
                    <p id="app-company-error" className="text-xs text-destructive" role="alert">{errors.company}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="app-role">Role *</Label>
                  <Input
                    id="app-role"
                    type="text"
                    value={role}
                    onChange={(e) => { setRole(e.target.value); setErrors((prev) => ({ ...prev, role: '' })); }}
                    className={errors.role ? 'border-destructive focus-visible:ring-destructive' : ''}
                    placeholder="e.g. Frontend Engineer"
                    aria-describedby={errors.role ? 'app-role-error' : undefined}
                  />
                  {errors.role && (
                    <p id="app-role-error" className="text-xs text-destructive" role="alert">{errors.role}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="app-location">Location</Label>
                <Input
                  id="app-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="app-salary-min">Salary Min</Label>
                  <Input
                    id="app-salary-min"
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    placeholder="80000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="app-salary-max">Salary Max</Label>
                  <Input
                    id="app-salary-max"
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    placeholder="120000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="app-url">Job URL</Label>
                <Input
                  id="app-url"
                  type="url"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  placeholder="https://example.com/jobs/..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="app-resume">Resume</Label>
                  <select
                    id="app-resume"
                    value={resumeId}
                    onChange={(e) => setResumeId(e.target.value)}
                    className={cn(
                      'w-full h-9 px-3 rounded-lg border border-border bg-background text-sm',
                      'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                      'transition-colors cursor-pointer'
                    )}
                    aria-label="Select resume"
                  >
                    <option value="">None</option>
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} (v{r.versionNum})
                      </option>
                    ))}
                  </select>
                </div>

                {mode === 'create' && (
                  <div className="space-y-2">
                    <Label htmlFor="app-stage">Stage</Label>
                    <select
                      id="app-stage"
                      value={stage}
                      onChange={(e) => setStage(e.target.value as ApplicationStage)}
                      className={cn(
                        'w-full h-9 px-3 rounded-lg border border-border bg-background text-sm',
                        'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                        'transition-colors cursor-pointer'
                      )}
                      aria-label="Select stage"
                    >
                      {(Object.keys(stageLabels) as ApplicationStage[]).map((s) => (
                        <option key={s} value={s}>
                          {stageLabels[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="app-date">Applied Date</Label>
                <Input
                  id="app-date"
                  type="date"
                  value={appliedAt}
                  onChange={(e) => setAppliedAt(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="app-notes">Notes</Label>
                <textarea
                  id="app-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any notes about this application..."
                  rows={3}
                  className={cn(
                    'w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none',
                    'placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                    'transition-colors'
                  )}
                />
              </div>

              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/[0.10] shrink-0">
                <Button type="button" variant="outline" size="sm" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isPending}>
                  {isPending
                    ? 'Saving...'
                    : mode === 'create'
                      ? 'Add Application'
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
