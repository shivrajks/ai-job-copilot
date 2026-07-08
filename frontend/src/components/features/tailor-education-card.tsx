'use client';

import { Check, X, GraduationCap, Sparkles } from 'lucide-react';
import type { SectionChange } from '@/types/tailor';
import { cn } from '@/lib/utils';

interface TailorEducationCardProps {
  change: SectionChange;
  index: number;
  accepted: boolean;
  onAccept: (index: number) => void;
  onReject: (index: number) => void;
}

export function TailorEducationCard({
  change,
  index,
  accepted,
  onAccept,
  onReject,
}: TailorEducationCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border overflow-hidden transition-colors',
        accepted ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border bg-card'
      )}
    >
      <div className="px-4 py-3 bg-accent/30 border-b border-border flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-green-500" />
          Education
        </h4>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onAccept(index)}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              accepted
                ? 'bg-emerald-500/10 text-emerald-600'
                : 'text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10'
            )}
            aria-label="Accept education change"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={() => onReject(index)}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              !accepted
                ? 'bg-rose-500/10 text-rose-600'
                : 'text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10'
            )}
            aria-label="Reject education change"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Original</p>
          <p className="text-sm text-muted-foreground line-through">{change.originalText}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[11px] font-medium text-emerald-600 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Suggested
          </p>
          <p className="text-sm text-foreground">{change.suggestedText}</p>
        </div>
        <div className="flex items-start gap-2 p-2 rounded bg-accent/30">
          <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground">{change.reason}</p>
        </div>
      </div>
    </div>
  );
}
