'use client';

import { motion } from 'framer-motion';
import { Loader2, FileText, Sparkles, CheckCircle2 } from 'lucide-react';

const steps = [
  { icon: FileText, label: 'Analyzing resume and job match' },
  { icon: Sparkles, label: 'Crafting content' },
  { icon: CheckCircle2, label: 'Polishing final draft' },
];

export function CoverLetterProgress() {
  return (
    <div
      className="rounded-lg border border-border overflow-hidden"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label="Generating cover letter"
    >
      <div className="px-4 py-3 bg-accent/30 border-b border-border">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-primary animate-spin" aria-hidden="true" />
          <span className="text-sm font-medium text-foreground">
            Generating Cover Letter
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <step.icon className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
            </div>
            <span className="text-sm text-muted-foreground">{step.label}</span>
          </div>
        ))}

        <div className="w-full h-1.5 bg-accent rounded-full overflow-hidden mt-2">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '70%' }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </div>
  );
}
