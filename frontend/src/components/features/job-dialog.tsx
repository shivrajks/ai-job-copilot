'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { JobDetail, JobStatus, EmploymentType, WorkMode, JobSource, Priority, OfferStatus } from '@/types/jobs';
import { JOB_STATUSES, STATUS_LABELS, EMPLOYMENT_TYPES, EMPLOYMENT_LABELS, WORK_MODES, WORK_MODE_LABELS, SOURCE_LABELS, PRIORITIES, PRIORITY_LABELS } from '@/types/jobs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface JobFormData {
  title: string;
  company: string;
  location?: string;
  employmentType?: EmploymentType;
  workMode?: WorkMode;
  salaryMin?: number;
  salaryMax?: number;
  description?: string;
  skillsRequired?: string[];
  experienceRequired?: string;
  source?: JobSource;
  sourceUrl?: string;
  notes?: string;
  dateSaved?: string;
  deadline?: string;
  priority?: Priority;
  status?: JobStatus;
  appliedDate?: string;
  interviewDates?: string[];
  offerStatus?: OfferStatus;
  rejectionReason?: string;
  followUpDate?: string;
}

interface JobDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  job?: JobDetail | null;
  onConfirm: (data: JobFormData) => Promise<void>;
  onCancel: () => void;
  isPending?: boolean;
}

export function JobDialog({ open, mode, job, onConfirm, onCancel, isPending }: JobDialogProps) {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [description, setDescription] = useState('');
  const [skillsRequired, setSkillsRequired] = useState('');
  const [experienceRequired, setExperienceRequired] = useState('');
  const [source, setSource] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [dateSaved, setDateSaved] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState<JobStatus>('SAVED');
  const [appliedDate, setAppliedDate] = useState('');
  const [interviewDates, setInterviewDates] = useState('');
  const [offerStatus, setOfferStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const nameInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && job) {
        setTitle(job.title);
        setCompany(job.company);
        setLocation(job.location || '');
        setEmploymentType(job.employmentType || '');
        setWorkMode(job.workMode || '');
        setSalaryMin(job.salaryMin?.toString() ?? '');
        setSalaryMax(job.salaryMax?.toString() ?? '');
        setDescription(job.description || '');
        setSkillsRequired(job.skillsRequired?.join(', ') || '');
        setExperienceRequired(job.experienceRequired || '');
        setSource(job.source || '');
        setSourceUrl(job.sourceUrl || '');
        setNotes(job.notes || '');
        setDateSaved(job.dateSaved || '');
        setDeadline(job.deadline || '');
        setPriority(job.priority);
        setStatus(job.status);
        setAppliedDate(job.appliedDate || '');
        setInterviewDates(job.interviewDates?.join(', ') || '');
        setOfferStatus(job.offerStatus || '');
        setRejectionReason(job.rejectionReason || '');
        setFollowUpDate(job.followUpDate || '');
      } else {
        setTitle('');
        setCompany('');
        setLocation('');
        setEmploymentType('');
        setWorkMode('');
        setSalaryMin('');
        setSalaryMax('');
        setDescription('');
        setSkillsRequired('');
        setExperienceRequired('');
        setSource('');
        setSourceUrl('');
        setNotes('');
        setDateSaved(new Date().toISOString().split('T')[0]);
        setDeadline('');
        setPriority('MEDIUM');
        setStatus('SAVED');
        setAppliedDate('');
        setInterviewDates('');
        setOfferStatus('');
        setRejectionReason('');
        setFollowUpDate('');
      }
      setErrors({});
      setTimeout(() => nameInputRef.current?.focus(), 50);
    }
  }, [open, mode, job]);

  useEffect(() => {
    if (!open) return;
    function handleEscape(e: KeyboardEvent) { if (e.key === 'Escape') onCancel(); }
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

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!company.trim()) newErrors.company = 'Company is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onConfirm({
      title: title.trim(),
      company: company.trim(),
      location: location.trim() || undefined,
      employmentType: (employmentType as EmploymentType) || undefined,
      workMode: (workMode as WorkMode) || undefined,
      salaryMin: salaryMin ? parseInt(salaryMin, 10) : undefined,
      salaryMax: salaryMax ? parseInt(salaryMax, 10) : undefined,
      description: description || undefined,
      skillsRequired: skillsRequired ? skillsRequired.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      experienceRequired: experienceRequired || undefined,
      source: (source as JobSource) || undefined,
      sourceUrl: sourceUrl || undefined,
      notes: notes || undefined,
      dateSaved: dateSaved || undefined,
      deadline: deadline || undefined,
      priority: (priority as Priority) || undefined,
      status: status || undefined,
      appliedDate: appliedDate || undefined,
      interviewDates: interviewDates ? interviewDates.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      offerStatus: (offerStatus as OfferStatus) || undefined,
      rejectionReason: rejectionReason || undefined,
      followUpDate: followUpDate || undefined,
    });
  }

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
            aria-labelledby="job-dialog-title"
            aria-modal="true"
            className={cn(
              'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
              'w-full max-w-lg rounded-xl glass-elevated',
              'max-h-[90vh] flex flex-col'
            )}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.10] shrink-0">
              <h2 id="job-dialog-title" className="text-lg font-semibold">
                {mode === 'create' ? 'Add Job' : 'Edit Job'}
              </h2>
              <button type="button" onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4" noValidate>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="job-title">Title *</Label>
                  <Input ref={nameInputRef} id="job-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Software Engineer" />
                  {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="job-company">Company *</Label>
                  <Input id="job-company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Acme Corp" />
                  {errors.company && <p className="text-xs text-destructive">{errors.company}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="job-location">Location</Label>
                  <Input id="job-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. New York, NY" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="job-type">Type</Label>
                  <select id="job-type" value={employmentType} onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="">Select</option>
                    {EMPLOYMENT_TYPES.map((t) => (
                      <option key={t} value={t}>{EMPLOYMENT_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="job-work-mode">Work Mode</Label>
                  <select id="job-work-mode" value={workMode} onChange={(e) => setWorkMode(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="">Select</option>
                    {WORK_MODES.map((m) => (
                      <option key={m} value={m}>{WORK_MODE_LABELS[m]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="job-salary-min">Salary Min</Label>
                  <Input id="job-salary-min" type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="e.g. 80000" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="job-salary-max">Salary Max</Label>
                  <Input id="job-salary-max" type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="e.g. 120000" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="job-source-url">Source URL</Label>
                <Input id="job-source-url" type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://linkedin.com/jobs/..." />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="job-source">Source</Label>
                  <select id="job-source" value={source} onChange={(e) => setSource(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="">Select</option>
                    {Object.entries(SOURCE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="job-priority">Priority</Label>
                  <select id="job-priority" value={priority} onChange={(e) => setPriority(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="job-status">Status</Label>
                  <select id="job-status" value={status} onChange={(e) => setStatus(e.target.value as JobStatus)}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    {JOB_STATUSES.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="job-date-saved">Date Saved</Label>
                  <Input id="job-date-saved" type="date" value={dateSaved} onChange={(e) => setDateSaved(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="job-deadline">Deadline</Label>
                  <Input id="job-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="job-applied-date">Applied Date</Label>
                  <Input id="job-applied-date" type="date" value={appliedDate} onChange={(e) => setAppliedDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="job-follow-up">Follow-up Date</Label>
                  <Input id="job-follow-up" type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="job-skills">Skills Required (comma separated)</Label>
                <Input id="job-skills" value={skillsRequired} onChange={(e) => setSkillsRequired(e.target.value)} placeholder="Java, React, PostgreSQL" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="job-experience">Experience Required</Label>
                <Input id="job-experience" value={experienceRequired} onChange={(e) => setExperienceRequired(e.target.value)} placeholder="e.g. 3-5 years" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="job-interview-dates">Interview Dates (comma separated)</Label>
                <Input id="job-interview-dates" value={interviewDates} onChange={(e) => setInterviewDates(e.target.value)} placeholder="2026-07-15, 2026-07-22" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="job-description">Description</Label>
                <textarea id="job-description" value={description} onChange={(e) => setDescription(e.target.value)}
                  rows={3} placeholder="Job description..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="job-notes">Notes</Label>
                <textarea id="job-notes" value={notes} onChange={(e) => setNotes(e.target.value)}
                  rows={2} placeholder="Personal notes..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-white/[0.10] shrink-0">
                <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
                <Button type="submit" size="sm" disabled={isPending}>
                  {isPending ? 'Saving...' : mode === 'create' ? 'Add Job' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
