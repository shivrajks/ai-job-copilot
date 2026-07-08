'use client';

import { Mail, Trash2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CoverLetterListItem } from '@/types/cover-letter';

interface CoverLetterCardProps {
  letter: CoverLetterListItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CoverLetterCard({
  letter,
  isSelected,
  onSelect,
  onDelete,
}: CoverLetterCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(letter.id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(letter.id); } }}
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
            <Mail className="w-4 h-4 text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-foreground truncate">
              {letter.title}
            </h3>
            {letter.companyName && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {letter.companyName}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-accent text-muted-foreground capitalize">
                {letter.tone}
              </span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-accent text-muted-foreground capitalize">
                {letter.template}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {new Date(letter.createdAt).toLocaleDateString()}
              </span>
            </div>
            {letter.preview && (
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                {letter.preview}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(letter.id);
            }}
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label={`Delete ${letter.title}`}
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <ChevronRight className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
