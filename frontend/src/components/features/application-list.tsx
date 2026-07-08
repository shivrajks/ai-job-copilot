'use client';

import { motion } from 'framer-motion';
import { Target, Loader2 } from 'lucide-react';
import type { ApplicationListItem, ApplicationStage } from '@/types/application';
import { ApplicationCard } from './application-card';
import { staggerContainer } from '@/lib/animations/variants';
import { EmptyState } from '@/components/feedback/empty-state';

interface ApplicationListProps {
  applications: ApplicationListItem[];
  isLoading: boolean;
  onSelect: (application: ApplicationListItem) => void;
  onEdit: (application: ApplicationListItem) => void;
  onDelete: (application: ApplicationListItem) => void;
  onStageChange: (id: string, stage: ApplicationStage) => void;
  onAdd?: () => void;
}

export function ApplicationList({
  applications,
  isLoading,
  onSelect,
  onEdit,
  onDelete,
  onStageChange,
  onAdd,
}: ApplicationListProps) {
  if (isLoading && applications.length === 0) {
    return (
      <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" aria-hidden="true" />
        <span className="sr-only">Loading applications...</span>
      </div>
    );
  }

  if (!isLoading && applications.length === 0) {
    return (
      <EmptyState
        icon={<Target className="w-8 h-8 text-muted-foreground" aria-hidden="true" />}
        title="No applications yet"
        description="Start tracking your job applications to replace spreadsheets."
        action={onAdd ? { label: 'Add Application', onClick: onAdd } : undefined}
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
      {applications.map((application) => (
        <ApplicationCard
          key={application.id}
          application={application}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          onStageChange={onStageChange}
        />
      ))}
    </motion.div>
  );
}
