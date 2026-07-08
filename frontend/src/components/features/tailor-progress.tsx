'use client';

import { Loader2, Sparkles } from 'lucide-react';

export function TailorProgress() {
  return (
    <div className="space-y-5 py-8">
      <div className="flex items-center justify-center gap-3">
        <Sparkles className="w-5 h-5 text-purple-500 animate-pulse" />
        <p className="text-sm font-medium text-foreground">Analyzing and tailoring your resume</p>
      </div>

      <div className="max-w-xs mx-auto space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-purple-400 border-t-transparent animate-spin shrink-0" />
          <span className="text-xs text-foreground">Reviewing ATS analysis</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-muted shrink-0" />
          <span className="text-xs text-muted-foreground">Comparing with job requirements</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-muted shrink-0" />
          <span className="text-xs text-muted-foreground">Generating tailored suggestions</span>
        </div>
      </div>

      <div className="w-full bg-accent rounded-full h-1.5 overflow-hidden">
        <div className="h-full bg-purple-500 rounded-full animate-pulse" style={{ width: '40%' }} />
      </div>
    </div>
  );
}
