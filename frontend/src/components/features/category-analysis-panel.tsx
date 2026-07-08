'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { CategoryExplanation } from '@/types/ats-report';
import { fadeUp } from '@/lib/animations/variants';
import { cn } from '@/lib/utils';

interface CategoryAnalysisPanelProps {
  categories: CategoryExplanation[];
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

export function CategoryAnalysisPanel({ categories }: CategoryAnalysisPanelProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (category: string) => {
    setExpanded((prev) => (prev === category ? null : category));
  };

  return (
    <motion.div variants={fadeUp} className="rounded-lg border border-border overflow-hidden">
      <div className="px-4 py-3 bg-accent/30 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Category Analysis</h3>
      </div>
      <div className="divide-y divide-border">
        {categories.map((cat) => {
          const isOpen = expanded === cat.category;
          return (
            <div key={cat.category}>
              <button
                onClick={() => toggle(cat.category)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors text-left"
                aria-expanded={isOpen}
                aria-controls={`cat-panel-${cat.category}`}
              >
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold',
                  scoreBg(cat.score)
                )}>
                  <span className={scoreColor(cat.score)}>{cat.score}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{cat.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{cat.detail}</p>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
              </button>

              {isOpen && (
                <div id={`cat-panel-${cat.category}`} className="px-4 pb-4 space-y-3">
                  <div className="w-full bg-accent rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.score}%` }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      className={cn('h-full rounded-full', barColor(cat.score))}
                    />
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {cat.explanation}
                  </p>

                  {cat.strengths.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Strengths
                      </p>
                      {cat.strengths.map((s, i) => (
                        <p key={i} className="text-xs text-muted-foreground pl-5">
                          {s}
                        </p>
                      ))}
                    </div>
                  )}

                  {cat.weaknesses.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Weaknesses
                      </p>
                      {cat.weaknesses.map((w, i) => (
                        <p key={i} className="text-xs text-muted-foreground pl-5">
                          {w}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
