'use client';

import { Mic, Trash2, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SessionListItem } from '@/types/interview';
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS, STATUS_BADGES } from '@/types/interview';

interface InterviewCardProps {
  session: SessionListItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function InterviewCard({
  session,
  isSelected,
  onSelect,
  onDelete,
}: InterviewCardProps) {
  const difficultyColor = DIFFICULTY_COLORS[session.difficulty as keyof typeof DIFFICULTY_COLORS] || 'text-muted-foreground bg-accent';
  const statusBadge = STATUS_BADGES[session.status] || 'text-muted-foreground bg-accent';
  const progress = session.questionCount > 0
    ? Math.round((session.answeredCount / session.questionCount) * 100)
    : 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(session.id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(session.id); } }}
      className={cn(
        'w-full text-left p-4 rounded-lg border transition-colors cursor-pointer',
        'hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/30',
        isSelected
          ? 'bg-primary/5 border-primary/30'
          : 'bg-card border-border'
      )}
      aria-current={isSelected ? 'true' : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Mic className="w-4 h-4 text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-foreground truncate">
              {session.title}
            </h3>
            {session.companyName && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {session.roleTitle ? `${session.roleTitle} at ` : ''}{session.companyName}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={cn('text-[11px] px-1.5 py-0.5 rounded capitalize', difficultyColor)}>
                {DIFFICULTY_LABELS[session.difficulty as keyof typeof DIFFICULTY_LABELS] || session.difficulty}
              </span>
              <span className={cn('text-[11px] px-1.5 py-0.5 rounded capitalize', statusBadge)}>
                {session.status === 'IN_PROGRESS' ? 'In Progress' : 'Completed'}
              </span>
              {session.overallScore !== null && (
                <span className="text-[11px] text-muted-foreground">
                  Score: {session.overallScore}/10
                </span>
              )}
              <span className="text-[11px] text-muted-foreground">
                {new Date(session.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                {session.status === 'COMPLETED' ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" aria-hidden="true" />
                ) : (
                  <Sparkles className="w-3 h-3 text-amber-500" aria-hidden="true" />
                )}
                <span>
                  {session.answeredCount}/{session.questionCount} answered
                </span>
              </div>
              {session.status === 'IN_PROGRESS' && (
                <div className="w-16 h-1.5 bg-accent rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(session.id);
            }}
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label={`Delete ${session.title}`}
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <ChevronRight className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
