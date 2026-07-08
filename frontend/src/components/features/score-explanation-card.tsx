'use client';

import { motion } from 'framer-motion';
import { Target, Info } from 'lucide-react';
import type { ScoreExplanation, ScoreContribution } from '@/types/ats-report';
import { fadeUp } from '@/lib/animations/variants';
import { cn } from '@/lib/utils';

interface ScoreExplanationCardProps {
  explanation: ScoreExplanation;
}

function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-rose-600';
}

function scoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-500/10';
  if (score >= 60) return 'bg-amber-500/10';
  return 'bg-rose-500/10';
}

function barColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-rose-500';
}

export function ScoreExplanationCard({ explanation }: ScoreExplanationCardProps) {
  return (
    <motion.div variants={fadeUp} className="rounded-lg border border-border overflow-hidden">
      <div className="px-4 py-3 bg-accent/30 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Target className="w-4 h-4 text-primary" />
          Score Breakdown
        </h3>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className={cn(
            'w-16 h-16 rounded-2xl flex items-center justify-center shrink-0',
            scoreBg(explanation.overallScore)
          )}>
            <span className={cn('text-2xl font-bold', scoreColor(explanation.overallScore))}>
              {explanation.overallScore}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {explanation.summary}
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Contribution Breakdown
          </p>
          {explanation.contributions.map((c: ScoreContribution) => (
            <div key={c.category} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-foreground">{c.label}</span>
                  <span className="text-[11px] text-muted-foreground">
                    ({(c.weight * 100).toFixed(0)}%)
                  </span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {Math.round(c.weightedPoints * 10) / 10}
                </span>
              </div>
              <div className="w-full bg-accent rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${c.score}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={cn('h-full rounded-full', barColor(c.score))}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">{c.detail}</span>
                <span className="text-[11px] text-muted-foreground">
                  {c.score}% score &times; {c.weight} weight
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/30 text-xs text-muted-foreground">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <p>The ATS score is calculated as the weighted sum of all category scores. Each category contributes its score multiplied by its weight percentage.</p>
        </div>
      </div>
    </motion.div>
  );
}
