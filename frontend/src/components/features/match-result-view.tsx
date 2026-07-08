'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Lightbulb, AlertTriangle, Target, Award } from 'lucide-react';
import type { MatchResult, CategoryBreakdown } from '@/types/match';
import { fadeUp } from '@/lib/animations/variants';
import { cn } from '@/lib/utils';

interface MatchResultViewProps {
  result: MatchResult;
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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function MatchResultView({ result }: MatchResultViewProps) {
  const breakdown = result.categoryBreakdown;
  const categories = [
    breakdown.skillMatch,
    breakdown.experienceMatch,
    breakdown.educationMatch,
    breakdown.certificationMatch,
    breakdown.titleMatch,
  ].filter(Boolean) as CategoryBreakdown[];

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        Match score is {result.atsScore} out of 100
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="px-4 py-3 bg-accent/30 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Target className="w-4 h-4 text-primary" />
            Resume Match Results
          </h3>
        </div>
        <div className="p-4 space-y-5">
          <div className="flex items-center gap-4">
            <div className={cn(
              'w-16 h-16 rounded-2xl flex items-center justify-center shrink-0',
              scoreBg(result.atsScore)
            )}>
              <span className={cn('text-2xl font-bold', scoreColor(result.atsScore))}>
                {result.atsScore}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                ATS Score
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Match percentage: {result.matchPercentage}% &middot; {formatDate(result.analyzedAt)}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Category Breakdown
            </p>
            {categories.map((cat) => (
              <div key={cat.label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{cat.label}</span>
                  <span className={cn('text-sm font-medium', scoreColor(cat.score))}>
                    {cat.score}%
                  </span>
                </div>
                <div className="w-full bg-accent rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.score}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className={cn('h-full rounded-full', barColor(cat.score))}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">{cat.detail}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {result.matchedSkills.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Matched Skills
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.matchedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.missingSkills.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  Missing Skills
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.missingSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-500/10 text-rose-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {result.strengths.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                Strengths
              </p>
              <ul className="space-y-1">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.weaknesses.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Weaknesses
              </p>
              <ul className="space-y-1">
                {result.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
