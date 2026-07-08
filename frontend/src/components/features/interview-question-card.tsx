'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InterviewQuestion } from '@/types/interview';
import { CATEGORY_COLORS, CATEGORY_LABELS, DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '@/types/interview';

interface InterviewQuestionCardProps {
  question: InterviewQuestion;
  number: number;
  answer: string;
  onAnswerChange: (answer: string) => void;
  isActive: boolean;
}

export function InterviewQuestionCard({
  question,
  number,
  answer,
  onAnswerChange,
  isActive,
}: InterviewQuestionCardProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const categoryColor = CATEGORY_COLORS[question.category] || 'text-muted-foreground bg-accent';
  const difficultyColor = DIFFICULTY_COLORS[question.difficulty.toLowerCase() as keyof typeof DIFFICULTY_COLORS] || 'text-muted-foreground bg-accent';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'rounded-lg border transition-colors overflow-hidden',
        isActive ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'
      )}
    >
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-mono">
            Question {number}
          </span>
          <div className="flex items-center gap-1.5">
            <span className={cn('text-[11px] px-1.5 py-0.5 rounded', categoryColor)}>
              {CATEGORY_LABELS[question.category] || question.category}
            </span>
            <span className={cn('text-[11px] px-1.5 py-0.5 rounded', difficultyColor)}>
              {DIFFICULTY_LABELS[question.difficulty.toLowerCase() as keyof typeof DIFFICULTY_LABELS] || question.difficulty}
            </span>
          </div>
        </div>

        <p className="text-sm font-medium text-foreground leading-relaxed">
          {question.question}
        </p>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MessageSquare className="w-3 h-3" aria-hidden="true" />
          <span>{question.estimatedTime}</span>
        </div>

        <div className="space-y-2">
          <label
            htmlFor={`answer-${question.id}`}
            className="text-xs font-medium text-muted-foreground"
          >
            Your Answer
          </label>
          <textarea
            id={`answer-${question.id}`}
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            className={cn(
              'w-full min-h-[100px] p-3 rounded-lg border border-border',
              'bg-background text-foreground text-sm leading-relaxed',
              'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
              'resize-y placeholder:text-muted-foreground'
            )}
            placeholder="Type your answer here..."
            aria-label={`Answer for question ${number}`}
          />
        </div>

        <div className="border-t border-border pt-3">
          <button
            type="button"
            onClick={() => setShowAnswer(!showAnswer)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            aria-expanded={showAnswer}
            aria-controls={`suggested-answer-${question.id}`}
          >
            <Lightbulb className="w-3.5 h-3.5" aria-hidden="true" />
            {showAnswer ? 'Hide' : 'Show'} Suggested Answer
            {showAnswer ? (
              <ChevronUp className="w-3 h-3" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-3 h-3" aria-hidden="true" />
            )}
          </button>

          {showAnswer && (
            <motion.div
              id={`suggested-answer-${question.id}`}
              role="region"
              aria-label="Suggested answer"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2 space-y-2"
            >
              <div className="p-3 rounded-lg bg-accent/50 text-sm text-foreground leading-relaxed">
                {question.suggestedAnswer}
              </div>

              {question.keyPoints.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Key Points:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {question.keyPoints.map((point, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {question.followUpQuestions.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Follow-up Questions:</p>
                  <ul className="space-y-0.5">
                    {question.followUpQuestions.map((fq, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground italic">
                        &ldquo;{fq}&rdquo;
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
