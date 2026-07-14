'use client';

import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import {
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  MoreHorizontal,
  FileText,
  GripVertical,
} from 'lucide-react';
import type { ApplicationListItem, ApplicationStage } from '@/types/application';
import { STAGE_LABELS, STAGE_COLORS } from '@/types/application';
import { cn } from '@/lib/utils';

interface KanbanCardProps {
  application: ApplicationListItem;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (application: ApplicationListItem) => void;
  onDelete: (application: ApplicationListItem) => void;
  onOpenDetail: (application: ApplicationListItem) => void;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatSalary(min: number | null, max: number | null): string {
  if (min === null && max === null) return '';
  const fmt = (n: number) => {
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
    return `$${n}`;
  };
  if (min !== null && max !== null) return `${fmt(min)} - ${fmt(max)}`;
  if (min !== null) return `${fmt(min)}+`;
  return `Up to ${fmt(max!)}`;
}

export function KanbanCard({
  application,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
  onOpenDetail,
}: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application.id,
    data: { application },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-lg border border-white/[0.10] bg-card p-3 transition-shadow',
        isDragging ? 'shadow-xl opacity-90' : 'shadow-sm hover:shadow-md',
        isSelected && 'ring-2 ring-primary'
      )}
    >
      <div className="flex items-start gap-2">
        <button
          {...listeners}
          {...attributes}
          className="mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors shrink-0"
          aria-label="Drag to move"
          tabIndex={-1}
        >
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4
                className="text-sm font-semibold truncate cursor-pointer hover:text-primary transition-colors"
                onClick={() => onOpenDetail(application)}
              >
                {application.role}
              </h4>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Building2 className="h-3 w-3 shrink-0" />
                <span className="truncate">{application.company}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect(application.id);
                  }}
                  className={cn(
                    'w-4 h-4 rounded border transition-colors',
                    isSelected
                      ? 'bg-primary border-primary'
                      : 'border-border hover:border-primary'
                  )}
                  aria-label={isSelected ? 'Deselect' : 'Select'}
                  aria-checked={isSelected}
                  role="checkbox"
                >
                  {isSelected && (
                    <svg viewBox="0 0 16 16" className="w-4 h-4 text-primary-foreground">
                      <path
                        d="M3 8l3 3 7-7"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>

              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Quick actions handled via parent
                  }}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="More actions"
                  tabIndex={-1}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
            {application.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate max-w-[100px]">{application.location}</span>
              </span>
            )}
            {application.appliedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 shrink-0" />
                {formatDate(application.appliedAt)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
            {application.resumeName && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground truncate max-w-[120px]">
                <FileText className="h-3 w-3 shrink-0" />
                {application.resumeName}
              </span>
            )}
            <span
              className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full border',
                STAGE_COLORS[application.stage as ApplicationStage] || ''
              )}
            >
              {STAGE_LABELS[application.stage as ApplicationStage] || application.stage}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
