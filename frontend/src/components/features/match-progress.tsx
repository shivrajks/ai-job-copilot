'use client';

import { Loader2, CheckCircle2, Sparkles } from 'lucide-react';

export function MatchProgress() {
  return (
    <div className="space-y-5 py-8">
      <div className="flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        <p className="text-sm font-medium text-foreground">Computing match score</p>
      </div>

      <div className="max-w-xs mx-auto space-y-3">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="text-xs text-muted-foreground">Resume and job description loaded</span>
        </div>
        <div className="flex items-center gap-3">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500 shrink-0" />
          <span className="text-xs text-foreground">Comparing skills and requirements</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-muted shrink-0" />
          <span className="text-xs text-muted-foreground">Analyzing experience and education</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-muted shrink-0" />
          <span className="text-xs text-muted-foreground">Generating match report</span>
        </div>
      </div>

      <div className="w-full bg-accent rounded-full h-1.5 overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '60%' }} />
      </div>
    </div>
  );
}
