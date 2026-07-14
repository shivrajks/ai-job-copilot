'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Lightbulb, TrendingUp, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InterviewFeedback } from '@/types/interview';

interface InterviewFeedbackViewProps {
  feedback: InterviewFeedback[];
  overallScore: number;
  totalQuestions: number;
}

function ScoreCircle({ score, label, size = 'md' }: { score: number; label: string; size?: 'sm' | 'md' | 'lg' }) {
  const color = score >= 8 ? 'text-emerald-500' : score >= 5 ? 'text-amber-500' : 'text-rose-500';
  const bgColor = score >= 8 ? 'bg-emerald-500/10' : score >= 5 ? 'bg-amber-500/10' : 'bg-rose-500/10';
  const dim = size === 'sm' ? 'w-12 h-12' : size === 'lg' ? 'w-24 h-24' : 'w-16 h-16';
  const textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-lg';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={cn('rounded-full flex items-center justify-center', dim, bgColor)}>
        <span className={cn('font-bold', textSize, color)}>{score}</span>
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export function InterviewFeedbackView({
  feedback,
  overallScore,
  totalQuestions,
}: InterviewFeedbackViewProps) {
  const scoreColor = overallScore >= 8 ? 'text-emerald-500' : overallScore >= 5 ? 'text-amber-500' : 'text-rose-500';
  const scoreBg = overallScore >= 8 ? 'bg-emerald-500/10' : overallScore >= 5 ? 'bg-amber-500/10' : 'bg-rose-500/10';

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center py-6"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className={cn('w-28 h-28 rounded-full flex items-center justify-center mb-3', scoreBg)}>
          <span className={cn('text-3xl font-bold', scoreColor)}>{overallScore}</span>
        </div>
        <p className="text-lg font-semibold text-foreground">Overall Score</p>
        <p className="text-sm text-muted-foreground mt-1">
          Based on {totalQuestions} question{totalQuestions !== 1 ? 's' : ''}
        </p>
      </motion.div>

      <div className="space-y-3">
        {feedback.map((item, idx) => (
          <motion.div
            key={item.questionId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="rounded-lg border border-white/[0.10] bg-card overflow-hidden"
          >
            <div className="p-4 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 min-w-0">
                  <span className="text-xs text-muted-foreground font-mono shrink-0 mt-0.5">
                    Q{idx + 1}
                  </span>
                  <p className="text-sm font-medium text-foreground line-clamp-2">
                    Question {idx + 1}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded-full',
                    item.overallScore >= 8 ? 'text-emerald-500 bg-emerald-500/10' :
                    item.overallScore >= 5 ? 'text-amber-500 bg-amber-500/10' :
                    'text-rose-500 bg-rose-500/10'
                  )}>
                    {item.overallScore}/10
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <ScoreCircle score={item.relevanceScore} label="Relevance" size="sm" />
                <ScoreCircle score={item.clarityScore} label="Clarity" size="sm" />
                <ScoreCircle score={item.completenessScore} label="Completeness" size="sm" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {item.strengths.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="w-3 h-3" aria-hidden="true" />
                      Strengths
                    </div>
                    <ul className="space-y-0.5">
                      {item.strengths.map((s, si) => (
                        <li key={si} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {item.improvements.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                      <Lightbulb className="w-3 h-3" aria-hidden="true" />
                      Improvements
                    </div>
                    <ul className="space-y-0.5">
                      {item.improvements.map((imp, ii) => (
                        <li key={ii} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <XCircle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
                          {imp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {item.suggestedAnswer && (
                <div className="border-t border-border pt-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                    <MessageSquare className="w-3 h-3" aria-hidden="true" />
                    Model Answer
                  </div>
                  <div className="p-3 rounded-lg bg-accent/50 text-sm text-foreground leading-relaxed">
                    {item.suggestedAnswer}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
