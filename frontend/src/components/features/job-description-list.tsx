'use client';

import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import type { JobDescriptionListItem } from '@/types/job-description';
import { JobDescriptionCard } from './job-description-card';
import { staggerContainer } from '@/lib/animations/variants';
import { EmptyState } from '@/components/feedback/empty-state';
import { SkeletonCard } from '@/components/feedback/skeleton';

interface JobDescriptionListProps {
  items: JobDescriptionListItem[];
  isLoading: boolean;
  onSelect: (jd: JobDescriptionListItem) => void;
  onEdit: (jd: JobDescriptionListItem) => void;
  onDelete: (jd: JobDescriptionListItem) => void;
  onAdd?: () => void;
}

export function JobDescriptionList({
  items,
  isLoading,
  onSelect,
  onEdit,
  onDelete,
  onAdd,
}: JobDescriptionListProps) {
  if (isLoading && items.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <EmptyState
        icon={<Target className="w-8 h-8 text-muted-foreground" aria-hidden="true" />}
        title="No job descriptions yet"
        description="Save your first job description to unlock AI-powered matching and ATS analysis."
        action={onAdd ? { label: 'Add Job Description', onClick: onAdd } : undefined}
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
      {items.map((jd) => (
        <JobDescriptionCard
          key={jd.id}
          jd={jd}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </motion.div>
  );
}
