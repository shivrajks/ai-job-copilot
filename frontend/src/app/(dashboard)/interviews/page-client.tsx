'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Mic } from 'lucide-react';
import { useInterviewStore } from '@/store/interviews';
import { useResumeStore } from '@/store/resumes';
import { InterviewCard } from '@/components/features/interview-card';
import { InterviewProgress } from '@/components/features/interview-progress';
import { InterviewSession } from '@/components/features/interview-session';
import { InterviewFeedbackView } from '@/components/features/interview-feedback';
import { InterviewGenerateDialog } from '@/components/features/interview-generate-dialog';
import { InterviewDeleteDialog } from '@/components/features/interview-delete-dialog';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import type { InterviewQuestion } from '@/types/interview';

export default function InterviewsPageClient() {
  const {
    sessions,
    currentSession,
    currentAnswers,
    feedback,
    overallScore,
    isLoading,
    isGenerating,
    isScoring,
    error,
    fetchSessions,
    fetchSession,
    generateSession,
    saveAnswer,
    submitForScoring,
    deleteSession,
    clearCurrentSession,
    clearError,
  } = useInterviewStore();

  const { resumes, fetchResumes } = useResumeStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
    fetchResumes();
  }, [fetchSessions, fetchResumes]);

  const activeResume = resumes.find((r) => r.isActive && r.parsingStatus === 'PARSED');

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    fetchSession(id);
  }, [fetchSession]);

  const handleGenerate = useCallback(async (params: {
    difficulty: string;
    questionCount: number;
    title: string;
  }) => {
    if (!activeResume) return;
    try {
      const session = await generateSession({
        resumeId: activeResume.id,
        difficulty: params.difficulty,
        questionCount: params.questionCount,
        title: params.title || undefined,
      });
      setIsGenerateOpen(false);
      setSelectedId(session.id);
    } catch {
      // Error handled by store
    }
  }, [activeResume, generateSession]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteSession(deleteTarget);
      if (selectedId === deleteTarget) {
        setSelectedId(null);
      }
      setDeleteTarget(null);
    } catch {
      // Error handled by store
    }
  }, [deleteTarget, selectedId, deleteSession]);

  const selectedSession = currentSession && currentSession.id === selectedId ? currentSession : null;

  let questions: InterviewQuestion[] = [];
  if (selectedSession?.questions) {
    try {
      const parsed = JSON.parse(selectedSession.questions);
      questions = parsed.questions || [];
    } catch {}
  }

  const showFeedback = feedback && feedback.length > 0;
  const showSession = selectedSession && !showFeedback && questions.length > 0;

  return (
    <PageContainer>
      <PageHeader
        title="Interview Coach"
        description="Practice with AI-generated interview questions"
        actions={
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsGenerateOpen(true)}
            disabled={!activeResume}
            className="inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            New Session
          </Button>
        }
      />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-80 shrink-0">
          <div className="space-y-2">
            {isLoading && sessions.length === 0 && (
              <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" aria-hidden="true" />
                <span className="sr-only">Loading interview sessions...</span>
              </div>
            )}

            {error && !isLoading && (
              <ErrorState
                title="Failed to load sessions"
                message={error}
                onRetry={fetchSessions}
              />
            )}

            {!isLoading && !error && sessions.length === 0 && (
              <EmptyState
                icon={<Mic className="w-8 h-8 text-muted-foreground" aria-hidden="true" />}
                title="No interview sessions yet"
                description="Create your first practice session to get started"
                action={activeResume ? { label: 'New Session', onClick: () => setIsGenerateOpen(true) } : undefined}
                className="py-12"
              />
            )}

            {sessions.map((session) => (
              <InterviewCard
                key={session.id}
                session={session}
                isSelected={selectedId === session.id}
                onSelect={handleSelect}
                onDelete={(id) => setDeleteTarget(id)}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {isGenerating && !selectedSession && (
            <InterviewProgress />
          )}

          {showSession && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {selectedSession.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedSession.questionCount} questions &middot; {selectedSession.difficulty} difficulty
                  </p>
                </div>
                <button
                  onClick={clearCurrentSession}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-accent"
                >
                  Back to list
                </button>
              </div>
              <InterviewSession
                questions={questions}
                answers={currentAnswers}
                difficulty={selectedSession.difficulty}
                isScoring={isScoring}
                onAnswerChange={saveAnswer}
                onSubmit={submitForScoring}
              />
            </motion.div>
          )}

          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {selectedSession?.title} — Feedback
                  </h2>
                </div>
                <button
                  onClick={clearCurrentSession}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-accent"
                >
                  Back to list
                </button>
              </div>
              <InterviewFeedbackView
                feedback={feedback}
                overallScore={overallScore ?? 0}
                totalQuestions={questions.length}
              />
            </motion.div>
          )}

          {!selectedSession && !isGenerating && !showFeedback && (
            <div className="flex items-center justify-center h-64 rounded-lg border border-dashed border-border">
              <div className="text-center">
                <Mic className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Select a session or create a new practice interview
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <InterviewGenerateDialog
        isOpen={isGenerateOpen}
        isGenerating={isGenerating}
        resumeName={activeResume?.name || 'No active resume'}
        onGenerate={handleGenerate}
        onClose={() => setIsGenerateOpen(false)}
      />

      {deleteTarget && (
        <InterviewDeleteDialog
          isOpen={!!deleteTarget}
          isDeleting={false}
          title={sessions.find((s) => s.id === deleteTarget)?.title || ''}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </PageContainer>
  );
}
