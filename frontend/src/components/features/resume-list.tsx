'use client';

import { motion } from 'framer-motion';
import type { ResumeListItem } from '@/types/resume';
import { ResumeCard } from './resume-card';
import { staggerContainer } from '@/lib/animations/variants';
import { EmptyState } from '@/components/feedback/empty-state';
import { FileText, Loader2 } from 'lucide-react';

interface ResumeListProps {
  resumes: ResumeListItem[];
  isLoading: boolean;
  onActivate: (id: string) => void;
  onRename: (resume: ResumeListItem) => void;
  onDelete: (resume: ResumeListItem) => void;
  onSelect?: (resume: ResumeListItem) => void;
  onAdd?: () => void;
}

export function ResumeList({ resumes, isLoading, onActivate, onRename, onDelete, onSelect, onAdd }: ResumeListProps) {
  if (isLoading && resumes.length === 0) {
    return (
      <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" aria-hidden="true" />
        <span className="sr-only">Loading resumes...</span>
      </div>
    );
  }

  if (!isLoading && resumes.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="w-8 h-8 text-muted-foreground" aria-hidden="true" />}
        title="No resumes yet"
        description="Upload your first resume to get started with ATS analysis."
        action={onAdd ? { label: 'Upload Resume', onClick: onAdd } : undefined}
      />
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
    >
      {resumes.map((resume) => (
        <ResumeCard
          key={resume.id}
          resume={resume}
          onActivate={onActivate}
          onRename={onRename}
          onDelete={onDelete}
          onSelect={onSelect}
        />
      ))}
    </motion.div>
  );
}
