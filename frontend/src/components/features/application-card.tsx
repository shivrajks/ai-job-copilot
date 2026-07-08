'use client';

import { useState } from 'react';
import { Target, MapPin, FileText, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ApplicationListItem, ApplicationStage } from '@/types/application';
import { formatRelativeDate } from '@/lib/dates';
import { fadeUp } from '@/lib/animations/variants';
import { cn } from '@/lib/utils';

interface ApplicationCardProps {
  application: ApplicationListItem;
  onSelect: (application: ApplicationListItem) => void;
  onEdit: (application: ApplicationListItem) => void;
  onDelete: (application: ApplicationListItem) => void;
  onStageChange: (id: string, stage: ApplicationStage) => void;
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

const stageStyles: Record<ApplicationStage, string> = {
  SAVED: 'bg-muted text-muted-foreground',
  APPLIED: 'bg-blue-500/10 text-blue-600',
  PHONE_SCREEN: 'bg-indigo-500/10 text-indigo-600',
  TECHNICAL_INTERVIEW: 'bg-purple-500/10 text-purple-600',
  ONSITE: 'bg-amber-500/10 text-amber-600',
  OFFER: 'bg-emerald-500/10 text-emerald-600',
  ACCEPTED: 'bg-emerald-500/10 text-emerald-600',
  REJECTED: 'bg-destructive/10 text-destructive',
  WITHDRAWN: 'bg-muted text-muted-foreground',
};

const allStages: ApplicationStage[] = [
  'SAVED',
  'APPLIED',
  'PHONE_SCREEN',
  'TECHNICAL_INTERVIEW',
  'ONSITE',
  'OFFER',
  'REJECTED',
  'WITHDRAWN',
];

export function ApplicationCard({
  application,
  onSelect,
  onEdit,
  onDelete,
  onStageChange,
}: ApplicationCardProps) {
  const [stageOpen, setStageOpen] = useState(false);

  const handleSelect = () => onSelect(application);

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(application);
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const handleStageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStageOpen(!stageOpen);
  };

  const handleStageKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.stopPropagation();
      e.preventDefault();
      setStageOpen(!stageOpen);
    }
  };

  const handleStageSelectKeyDown = (e: React.KeyboardEvent, stage: ApplicationStage) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.stopPropagation();
      e.preventDefault();
      handleStageSelect(e as unknown as React.MouseEvent, stage);
    }
  };

  const handleStageSelect = (e: React.MouseEvent, stage: ApplicationStage) => {
    e.stopPropagation();
    setStageOpen(false);
    if (stage !== application.stage) {
      onStageChange(application.id, stage);
    }
  };

  return (
    <motion.div
      variants={fadeUp}
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={handleCardKeyDown}
      aria-label={`View details for ${application.role} at ${application.company}`}
      className={cn(
        'glass rounded-xl p-4 md:p-5 transition-shadow hover:shadow-md cursor-pointer'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
          <Target className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <div className="min-w-0">
              <h3 className="font-semibold text-sm truncate">{application.company}</h3>
              <p className="text-xs text-muted-foreground truncate">{application.role}</p>
            </div>

            {/* Stage badge with dropdown */}
            <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={handleStageClick}
                onKeyDown={handleStageKeyDown}
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors',
                  stageStyles[application.stage]
                )}
                aria-expanded={stageOpen}
                aria-haspopup="listbox"
                aria-label={`Stage: ${stageLabels[application.stage]}`}
              >
                {stageLabels[application.stage]}
                <ChevronDown className="w-3 h-3" aria-hidden="true" />
              </button>

              {stageOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setStageOpen(false)}
                    aria-hidden="true"
                  />
                  <div
                    role="listbox"
                    aria-label="Select stage"
                    className={cn(
                      'absolute right-0 top-full mt-1 z-20',
                      'w-44 py-1 rounded-lg border border-border bg-popover shadow-lg'
                    )}
                  >
                    {allStages.map((stage) => (
                      <button
                        key={stage}
                        type="button"
                        role="option"
                        aria-selected={stage === application.stage}
                        onClick={(e) => handleStageSelect(e, stage)}
                        onKeyDown={(e) => handleStageSelectKeyDown(e, stage)}
                        className={cn(
                          'flex items-center gap-2 w-full px-3 py-1.5 text-xs transition-colors',
                          'hover:bg-accent',
                          stage === application.stage && 'bg-accent font-medium'
                        )}
                      >
                        <span className={cn(
                          'w-1.5 h-1.5 rounded-full shrink-0',
                          stage === 'SAVED' && 'bg-muted-foreground',
                          stage === 'APPLIED' && 'bg-blue-500',
                          stage === 'PHONE_SCREEN' && 'bg-indigo-500',
                          stage === 'TECHNICAL_INTERVIEW' && 'bg-purple-500',
                          stage === 'ONSITE' && 'bg-amber-500',
                          stage === 'OFFER' && 'bg-emerald-500',
                          stage === 'REJECTED' && 'bg-destructive',
                          stage === 'WITHDRAWN' && 'bg-muted-foreground',
                        )} />
                        {stageLabels[stage]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
            {application.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3 h-3" aria-hidden="true" />
                {application.location}
              </span>
            )}
            {application.resumeName && (
              <span className="inline-flex items-center gap-1">
                <FileText className="w-3 h-3" aria-hidden="true" />
                {application.resumeName}
              </span>
            )}
            <span>{formatRelativeDate(application.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
        <button
          type="button"
          onClick={(e) => handleActionClick(e, () => onEdit(application))}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-accent"
          aria-label={`Edit ${application.company} application`}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={(e) => handleActionClick(e, () => onDelete(application))}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded hover:bg-destructive/10 ml-auto"
          aria-label={`Delete ${application.company} application`}
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
}
