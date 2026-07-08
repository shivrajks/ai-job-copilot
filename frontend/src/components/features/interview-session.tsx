'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Send, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InterviewQuestion } from '@/types/interview';
import { InterviewQuestionCard } from '@/components/features/interview-question-card';
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS, CATEGORY_COLORS } from '@/types/interview';

interface InterviewSessionProps {
  questions: InterviewQuestion[];
  answers: Record<string, string>;
  difficulty: string;
  isScoring: boolean;
  onAnswerChange: (questionId: string, answer: string) => void;
  onSubmit: () => void;
}

export function InterviewSession({
  questions,
  answers,
  difficulty,
  isScoring,
  onAnswerChange,
  onSubmit,
}: InterviewSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const allAnswered = questions.length > 0 && answeredCount >= questions.length;
  const progress = questions.length > 0
    ? Math.round((answeredCount / questions.length) * 100)
    : 0;

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, questions.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const handleAnswerChange = useCallback((answer: string) => {
    onAnswerChange(currentQuestion.id, answer);
  }, [currentQuestion?.id, onAnswerChange]);

  const difficultyColor = DIFFICULTY_COLORS[difficulty as keyof typeof DIFFICULTY_COLORS] || 'text-muted-foreground bg-accent';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Progress:</span>
          <span className="text-sm font-medium">
            {answeredCount}/{questions.length} answered
          </span>
          <span className={cn('text-xs px-1.5 py-0.5 rounded capitalize', difficultyColor)}>
            {DIFFICULTY_LABELS[difficulty as keyof typeof DIFFICULTY_LABELS] || difficulty}
          </span>
        </div>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!allAnswered || isScoring}
          className={cn(
            'inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-colors',
            allAnswered && !isScoring
              ? 'text-white bg-primary hover:bg-primary/90'
              : 'text-muted-foreground bg-accent cursor-not-allowed opacity-50'
          )}
        >
          {isScoring ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              Scoring...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" aria-hidden="true" />
              Submit for Feedback
            </>
          )}
        </button>
      </div>

      <div
        className="w-full h-2 bg-accent rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${answeredCount} of ${questions.length} questions answered`}
      >
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Question {currentIndex + 1} of {questions.length}</span>
      </div>

      {currentQuestion && (
        <InterviewQuestionCard
          key={currentQuestion.id}
          question={currentQuestion}
          number={currentIndex + 1}
          answer={answers[currentQuestion.id] || ''}
          onAnswerChange={handleAnswerChange}
          isActive
        />
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="inline-flex items-center gap-1 text-sm px-3 py-2 rounded-lg border border-border hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Previous
        </button>

        <div className="flex items-center gap-1">
          {questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                idx === currentIndex
                  ? 'bg-primary'
                  : answers[questions[idx].id]
                  ? 'bg-primary/40'
                  : 'bg-accent'
              )}
              aria-label={`Go to question ${idx + 1}`}
            />
          ))}
        </div>

        {currentIndex < questions.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-1 text-sm px-3 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            disabled={!allAnswered || isScoring}
            className={cn(
              'inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-colors',
              allAnswered && !isScoring
                ? 'text-white bg-primary hover:bg-primary/90'
                : 'text-muted-foreground bg-accent cursor-not-allowed opacity-50'
            )}
          >
            {isScoring ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                Scoring...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                Submit
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
