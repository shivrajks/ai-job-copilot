'use client';

import { Loader2, CheckCircle2, FileText, BarChart3, Lightbulb } from 'lucide-react';

export function AtsReportProgress() {
  return (
    <div className="space-y-5 py-8">
      <div className="flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        <p className="text-sm font-medium text-foreground">Generating ATS report</p>
      </div>

      <div className="max-w-xs mx-auto space-y-3">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="text-xs text-muted-foreground">Match scores loaded</span>
        </div>
        <div className="flex items-center gap-3">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500 shrink-0" />
          <span className="text-xs text-foreground">Analyzing category breakdown</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-muted shrink-0" />
          <span className="text-xs text-muted-foreground">Calculating improvement impact</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-muted shrink-0" />
          <span className="text-xs text-muted-foreground">Building recommendations</span>
        </div>
      </div>

      <div className="w-full bg-accent rounded-full h-1.5 overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '55%' }} />
      </div>
    </div>
  );
}
