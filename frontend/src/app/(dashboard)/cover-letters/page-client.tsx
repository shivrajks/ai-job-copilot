'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import { useCoverLetterStore } from '@/store/cover-letters';
import { useResumeStore } from '@/store/resumes';
import { CoverLetterEditor } from '@/components/features/cover-letter-editor';
import { CoverLetterCard } from '@/components/features/cover-letter-card';
import { CoverLetterProgress } from '@/components/features/cover-letter-progress';
import { CoverLetterGenerateDialog } from '@/components/features/cover-letter-generate-dialog';
import { CoverLetterDeleteDialog } from '@/components/features/cover-letter-delete-dialog';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';

export default function CoverLettersPageClient() {
  const {
    coverLetters,
    currentLetter,
    proposal,
    isLoading,
    isGenerating,
    isSaving,
    error,
    fetchCoverLetters,
    fetchCoverLetter,
    generateProposal,
    saveCoverLetter,
    updateCoverLetter,
    deleteCoverLetter,
    clearProposal,
    clearError,
  } = useCoverLetterStore();

  const { resumes, fetchResumes } = useResumeStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    fetchCoverLetters();
    fetchResumes();
  }, [fetchCoverLetters, fetchResumes]);

  const activeResume = resumes.find((r) => r.isActive && r.parsingStatus === 'PARSED');

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    clearProposal();
    fetchCoverLetter(id);
  }, [fetchCoverLetter, clearProposal]);

  const handleGenerate = useCallback(async (params: {
    tone: string;
    template: string;
    companyName: string;
    hiringManager: string;
  }) => {
    if (!activeResume) return;
    try {
      await generateProposal({
        resumeId: activeResume.id,
        tone: params.tone,
        template: params.template,
        companyName: params.companyName || undefined,
        hiringManager: params.hiringManager || undefined,
      });
      setIsGenerateOpen(false);
    } catch {
      // Error handled by store
    }
  }, [activeResume, generateProposal]);

  const handleSave = useCallback(async (content: string, title: string, tone: string, template: string) => {
    if (currentLetter) {
      await updateCoverLetter(currentLetter.id, { content, title, tone, template });
    } else if (activeResume) {
      try {
        const detail = await saveCoverLetter({
          content,
          title,
          tone,
          template,
          resumeId: activeResume.id,
        });
        setSelectedId(detail.id);
      } catch {
        // Error handled by store
      }
    }
  }, [currentLetter, activeResume, saveCoverLetter, updateCoverLetter]);

  const handleRegenerate = useCallback((tone: string, template: string) => {
    handleGenerate({ tone, template, companyName: currentLetter?.companyName || '', hiringManager: currentLetter?.hiringManager || '' });
  }, [handleGenerate, currentLetter]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteCoverLetter(deleteTarget);
      if (selectedId === deleteTarget) {
        setSelectedId(null);
      }
      setDeleteTarget(null);
    } catch {
      // Error handled by store
    }
  }, [deleteTarget, selectedId, deleteCoverLetter]);

  const selectedLetter = currentLetter && currentLetter.id === selectedId ? currentLetter : null;

  return (
    <PageContainer>
      <PageHeader
        title="Cover Letters"
        description="Generate and manage personalized cover letters"
        actions={
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsGenerateOpen(true)}
            disabled={!activeResume}
            className="inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            Generate New
          </Button>
        }
      />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-80 shrink-0">
          <div className="space-y-2">
            {isLoading && coverLetters.length === 0 && (
              <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" aria-hidden="true" />
                <span className="sr-only">Loading cover letters...</span>
              </div>
            )}

            {error && !isLoading && (
              <ErrorState
                title="Failed to load cover letters"
                message={error}
                onRetry={fetchCoverLetters}
              />
            )}

            {!isLoading && !error && coverLetters.length === 0 && (
              <EmptyState
                icon={<Sparkles className="w-8 h-8 text-muted-foreground" aria-hidden="true" />}
                title="No cover letters yet"
                description="Generate your first cover letter from a job description"
                action={activeResume ? { label: 'Generate New', onClick: () => setIsGenerateOpen(true) } : undefined}
                className="py-12"
              />
            )}

            {coverLetters.map((letter) => (
              <CoverLetterCard
                key={letter.id}
                letter={letter}
                isSelected={selectedId === letter.id}
                onSelect={handleSelect}
                onDelete={(id) => setDeleteTarget(id)}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {isGenerating && !proposal && (
            <CoverLetterProgress />
          )}

          {proposal && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CoverLetterEditor
                content={proposal.content.fullText}
                title=""
                tone={proposal.tone}
                template={proposal.template}
                isSaving={isSaving}
                isGenerating={isGenerating}
                onSave={handleSave}
                onRegenerate={handleRegenerate}
              />
            </motion.div>
          )}

          {selectedLetter && !proposal && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CoverLetterEditor
                content={selectedLetter.content}
                title={selectedLetter.title}
                tone={selectedLetter.tone}
                template={selectedLetter.template}
                isSaving={isSaving}
                isGenerating={isGenerating}
                onSave={handleSave}
                onRegenerate={handleRegenerate}
              />
            </motion.div>
          )}

          {!selectedLetter && !proposal && !isGenerating && (
            <div className="flex items-center justify-center h-64 rounded-lg border border-dashed border-border">
              <div className="text-center">
                <Sparkles className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Select a cover letter or generate a new one
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <CoverLetterGenerateDialog
        isOpen={isGenerateOpen}
        isGenerating={isGenerating}
        resumeName={activeResume?.name || 'No active resume'}
        companyName=""
        onGenerate={handleGenerate}
        onClose={() => setIsGenerateOpen(false)}
      />

      {deleteTarget && (
        <CoverLetterDeleteDialog
          isOpen={!!deleteTarget}
          isDeleting={false}
          title={coverLetters.find((l) => l.id === deleteTarget)?.title || ''}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </PageContainer>
  );
}
