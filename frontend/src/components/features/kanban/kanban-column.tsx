'use client';

import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import type { ApplicationListItem, ApplicationStage } from '@/types/application';
import { STAGE_LABELS } from '@/types/application';
import { KanbanCard } from './kanban-card';

interface KanbanColumnProps {
  stage: ApplicationStage;
  applications: ApplicationListItem[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onEdit: (application: ApplicationListItem) => void;
  onDelete: (application: ApplicationListItem) => void;
  onOpenDetail: (application: ApplicationListItem) => void;
}

const columnGradients: Record<string, string> = {
  SAVED: 'from-zinc-500/5 to-transparent',
  APPLIED: 'from-blue-500/5 to-transparent',
  PHONE_SCREEN: 'from-amber-500/5 to-transparent',
  TECHNICAL_INTERVIEW: 'from-purple-500/5 to-transparent',
  ONSITE: 'from-indigo-500/5 to-transparent',
  OFFER: 'from-green-500/5 to-transparent',
  ACCEPTED: 'from-emerald-500/5 to-transparent',
  REJECTED: 'from-red-500/5 to-transparent',
  WITHDRAWN: 'from-gray-500/5 to-transparent',
};

const columnAccents: Record<string, string> = {
  SAVED: 'bg-zinc-500',
  APPLIED: 'bg-blue-500',
  PHONE_SCREEN: 'bg-amber-500',
  TECHNICAL_INTERVIEW: 'bg-purple-500',
  ONSITE: 'bg-indigo-500',
  OFFER: 'bg-green-500',
  ACCEPTED: 'bg-emerald-500',
  REJECTED: 'bg-red-500',
  WITHDRAWN: 'bg-gray-500',
};

export function KanbanColumn({
  stage,
  applications,
  selectedIds,
  onToggleSelect,
  onEdit,
  onDelete,
  onOpenDetail,
}: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: stage,
    data: { stage },
  });

  const label = STAGE_LABELS[stage] || stage;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col rounded-xl border border-border min-w-[280px] w-[280px] max-h-full',
        'bg-gradient-to-b',
        columnGradients[stage] || 'from-transparent to-transparent',
        isOver && 'ring-2 ring-primary bg-primary/5'
      )}
    >
      <div className="flex items-center gap-2 px-4 pt-4 pb-2 shrink-0">
        <div className={cn('w-2 h-2 rounded-full shrink-0', columnAccents[stage] || 'bg-muted')} />
        <h3 className="text-sm font-semibold">{label}</h3>
        <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {applications.length}
        </span>
      </div>

      <div
        className={cn(
          'flex-1 overflow-y-auto px-3 pb-3 space-y-2 min-h-[120px]',
          applications.length === 0 && 'flex items-center justify-center'
        )}
      >
        {applications.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center">
            Drop applications here
          </p>
        ) : (
          applications.map((app) => (
            <KanbanCard
              key={app.id}
              application={app}
              isSelected={selectedIds.has(app.id)}
              onToggleSelect={onToggleSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              onOpenDetail={onOpenDetail}
            />
          ))
        )}
      </div>
    </div>
  );
}
