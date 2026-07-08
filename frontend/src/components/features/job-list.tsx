'use client';

import { motion } from 'framer-motion';
import { Briefcase, Loader2 } from 'lucide-react';
import type { JobListItem, JobStatus } from '@/types/jobs';
import { JobCard } from './job-card';
import { staggerContainer } from '@/lib/animations/variants';
import { EmptyState } from '@/components/feedback/empty-state';

interface JobListProps {
  jobs: JobListItem[];
  isLoading: boolean;
  onSelect: (job: JobListItem) => void;
  onEdit: (job: JobListItem) => void;
  onDelete: (job: JobListItem) => void;
  onStatusChange: (id: string, status: JobStatus) => void;
  onFavoriteToggle: (id: string, favorite: boolean) => void;
  onAdd?: () => void;
}

export function JobList({
  jobs,
  isLoading,
  onSelect,
  onEdit,
  onDelete,
  onStatusChange,
  onFavoriteToggle,
  onAdd,
}: JobListProps) {
  if (isLoading && jobs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" aria-hidden="true" />
        <span className="sr-only">Loading jobs...</span>
      </div>
    );
  }

  if (!isLoading && jobs.length === 0) {
    return (
      <EmptyState
        icon={<Briefcase className="w-8 h-8 text-muted-foreground" aria-hidden="true" />}
        title="No jobs yet"
        description="Start tracking your job applications by saving your first job."
        action={onAdd ? { label: 'Add Job', onClick: onAdd } : undefined}
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
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          onFavoriteToggle={onFavoriteToggle}
        />
      ))}
    </motion.div>
  );
}
