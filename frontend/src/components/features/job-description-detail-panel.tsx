'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, ExternalLink, Sparkles, Loader2, Scale, FileText, Save } from 'lucide-react';
import type { JobDescriptionListItem, JobDescriptionDetail } from '@/types/job-description';
import { getJobDescription } from '@/lib/api/job-descriptions';
import { useJobDescriptionStore } from '@/store/job-descriptions';
import { useResumeStore } from '@/store/resumes';
import { useMatchStore } from '@/store/matches';
import { useAtsReportStore } from '@/store/ats-reports';
import { useTailorStore } from '@/store/tailor';
import { useCoverLetterStore } from '@/store/cover-letters';
import { JobDescriptionDetailSkeleton } from './job-description-detail-skeleton';
import { JobDescriptionDetailContent } from './job-description-detail-content';
import { MatchProgress } from './match-progress';
import { MatchResultView } from './match-result-view';
import { AtsReportProgress } from './ats-report-progress';
import { AtsReportView } from './ats-report-view';
import { TailorProgress } from './tailor-progress';
import { TailorSuggestionCards } from './tailor-suggestion-cards';
import { SaveTailoredResumeDialog } from './save-tailored-resume-dialog';
import { CoverLetterProgress } from './cover-letter-progress';
import { CoverLetterGenerateDialog } from './cover-letter-generate-dialog';
import { CoverLetterEditor } from './cover-letter-editor';
import { ErrorState } from '@/components/feedback/error-state';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface JobDescriptionDetailPanelProps {
  jd: JobDescriptionListItem | null;
  onClose: () => void;
  onEdit: (jd: JobDescriptionListItem) => void;
  onDelete: (jd: JobDescriptionListItem) => void;
}

export function JobDescriptionDetailPanel({
  jd,
  onClose,
  onEdit,
  onDelete,
}: JobDescriptionDetailPanelProps) {
  const [detail, setDetail] = useState<JobDescriptionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const isAnalyzing = useJobDescriptionStore((s) => s.isAnalyzing);
  const analyzeJobDescriptionAction = useJobDescriptionStore((s) => s.analyzeJobDescription);
  const resumes = useResumeStore((s) => s.resumes);
  const { isMatching, matchResult, matchResumeToJob, clearMatchResult } = useMatchStore();
  const { report: atsReport, isLoading: isAtsLoading, error: atsError, fetchReport, clearReport } = useAtsReportStore();
  const {
    proposal: tailorProposal,
    isTailoring,
    isSaving,
    acceptedChanges,
    tailor: tailorResume,
    save: saveTailored,
    clear: clearTailor,
  } = useTailorStore();
  const fetchResumes = useResumeStore((s) => s.fetchResumes);
  const {
    proposal: clProposal,
    isGenerating: isGeneratingCL,
    generateProposal: generateCL,
    clearProposal: clearCLProposal,
  } = useCoverLetterStore();
  const shouldReduceMotion = useReducedMotion();
  const [ariaMessage, setAriaMessage] = useState('');
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isCLDialogOpen, setIsCLDialogOpen] = useState(false);

  const activeResume = resumes.find((r) => r.isActive && r.parsingStatus === 'PARSED');
  const canMatch = detail?.analysisStatus === 'ANALYZED' && !!activeResume;

  const fetchDetail = useCallback(async (id: string) => {
    setIsLoading(true);
    setFetchError(null);
    setDetail(null);
    try {
      const result = await getJobDescription(id);
      setDetail(result);
    } catch (err) {
      setFetchError(
        err instanceof Error ? err.message : 'Failed to load job description details'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (jd) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      fetchDetail(jd.id);
      requestAnimationFrame(() => closeBtnRef.current?.focus());
    }
  }, [jd, fetchDetail]);

  const handleTailor = useCallback(async () => {
    if (!detail || !activeResume) return;
    setAriaMessage('Tailoring started');
    try {
      await tailorResume(activeResume.id, detail.id);
      setAriaMessage('Tailoring complete');
    } catch {
      setAriaMessage('Tailoring failed');
    }
  }, [detail, activeResume, tailorResume]);

  const handleSaveTailored = useCallback(async (name: string) => {
    if (!activeResume) return;
    try {
      await saveTailored(activeResume.id, name);
      await fetchResumes();
      setIsSaveDialogOpen(false);
      clearTailor();
      setAriaMessage('Tailored resume saved');
    } catch {
      setAriaMessage('Failed to save tailored resume');
    }
  }, [activeResume, saveTailored, fetchResumes, clearTailor]);

  const handleGenerateCL = useCallback(async (params: {
    tone: string;
    template: string;
    companyName: string;
    hiringManager: string;
  }) => {
    if (!activeResume || !detail) return;
    setAriaMessage('Generating cover letter');
    try {
      await generateCL({
        resumeId: activeResume.id,
        jobDescriptionId: detail.id,
        tone: params.tone,
        template: params.template,
        companyName: params.companyName || undefined,
        hiringManager: params.hiringManager || undefined,
      });
      setIsCLDialogOpen(false);
      setAriaMessage('Cover letter generated');
    } catch {
      setAriaMessage('Cover letter generation failed');
    }
  }, [activeResume, detail, generateCL]);

  const handleClose = useCallback(() => {
    clearMatchResult();
    clearReport();
    clearTailor();
    clearCLProposal();
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
    onClose();
  }, [onClose, clearMatchResult, clearReport, clearTailor, clearCLProposal]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && jd) handleClose();
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [jd, handleClose]);

  useEffect(() => {
    if (!jd) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    function trap(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, [jd]);

  const handleRetry = useCallback(() => {
    if (jd) fetchDetail(jd.id);
  }, [jd, fetchDetail]);

  const handleEdit = useCallback(() => {
    if (jd) onEdit(jd);
  }, [jd, onEdit]);

  const handleAnalyze = useCallback(async () => {
    if (!detail) return;
    setAriaMessage('Analysis started');
    try {
      const analyzed = await analyzeJobDescriptionAction(detail.id);
      setDetail(analyzed);
      setAriaMessage(analyzed.analysisStatus === 'ANALYZED' ? 'Analysis complete' : 'Analysis failed');
    } catch {
      setAriaMessage('Analysis failed');
    }
  }, [detail, analyzeJobDescriptionAction]);

  const handleDelete = useCallback(() => {
    if (jd) onDelete(jd);
  }, [jd, onDelete]);

  const handleMatch = useCallback(async () => {
    if (!detail || !activeResume) return;
    setAriaMessage('Matching started');
    try {
      await matchResumeToJob(activeResume.id, detail.id);
      setAriaMessage('Match complete');
    } catch {
      setAriaMessage('Match failed');
    }
  }, [detail, activeResume, matchResumeToJob]);

  const handleViewReport = useCallback(async () => {
    if (!detail || !activeResume) return;
    setAriaMessage('Loading ATS report');
    try {
      await fetchReport(activeResume.id, detail.id);
      setAriaMessage('ATS report loaded');
    } catch {
      setAriaMessage('Failed to load ATS report');
    }
  }, [detail, activeResume, fetchReport]);

  return (
    <AnimatePresence>
      {jd && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={handleClose}
            aria-hidden="true"
          />
          <motion.div
            ref={dialogRef}
            initial={shouldReduceMotion ? { x: 0 } : { x: '100%' }}
            animate={{ x: 0 }}
            exit={shouldReduceMotion ? { x: 0 } : { x: '100%' }}
            transition={shouldReduceMotion ? { duration: 0.1 } : { type: 'spring', stiffness: 300, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-busy={isLoading || isAnalyzing || isMatching || isAtsLoading}
            aria-labelledby="jd-detail-panel-title"
            className={cn(
              'fixed right-0 top-0 bottom-0 z-40',
              'w-full sm:max-w-md lg:max-w-lg',
              'bg-background border-l border-border shadow-xl',
              'flex flex-col'
            )}
          >
            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="sr-only"
            >
              {ariaMessage}
            </div>

            <div className="flex items-center justify-between p-4 md:p-6 border-b border-border shrink-0">
              <div className="min-w-0 flex-1">
                <h2
                  id="jd-detail-panel-title"
                  className="text-lg font-semibold truncate"
                >
                  {detail?.title || jd.title}
                </h2>
                <p className="text-sm text-muted-foreground truncate">
                  {detail?.company || jd.company || ''}
                </p>
              </div>
              <button
                ref={closeBtnRef}
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground transition-colors p-2 -mr-2 shrink-0"
                aria-label="Close job description details"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading && <JobDescriptionDetailSkeleton />}

              {fetchError && !isLoading && (
                <div className="p-6">
                  <ErrorState
                    title="Failed to load details"
                    message={fetchError}
                    onRetry={handleRetry}
                  />
                </div>
              )}

              {!detail && !isLoading && !fetchError && (
                <div className="p-6">
                  <p className="text-sm text-muted-foreground text-center py-12">
                    No data available
                  </p>
                </div>
              )}

              {detail && !isLoading && !fetchError && (
                <div className="p-4 md:p-6 space-y-6">
                  <JobDescriptionDetailContent detail={detail} />

                  {isMatching && (
                    <div className="rounded-lg border border-border">
                      <MatchProgress />
                    </div>
                  )}

                  {matchResult && !isMatching && !atsReport && (
                    <MatchResultView result={matchResult} />
                  )}

                  {matchResult && !isMatching && !atsReport && (
                    <div className="flex items-center gap-2 pt-4 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearMatchResult}
                      >
                        Hide Results
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleViewReport}
                        disabled={isAtsLoading}
                        className="inline-flex items-center gap-1.5"
                      >
                        {isAtsLoading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                            Loading Report...
                          </>
                        ) : (
                          <>
                            <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                            View Full ATS Report
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {isAtsLoading && !atsReport && (
                    <div className="rounded-lg border border-border">
                      <AtsReportProgress />
                    </div>
                  )}

                  {atsError && !isAtsLoading && !atsReport && (
                    <ErrorState
                      title="Failed to load ATS report"
                      message={atsError}
                      onRetry={handleViewReport}
                    />
                  )}

                  {atsReport && !isAtsLoading && (
                    <>
                      <AtsReportView
                        report={atsReport}
                        onTailor={handleTailor}
                        isTailoring={isTailoring}
                        onCoverLetter={() => setIsCLDialogOpen(true)}
                        isGeneratingCoverLetter={isGeneratingCL}
                      />

                      {isTailoring && !tailorProposal && (
                        <div className="rounded-lg border border-border">
                          <TailorProgress />
                        </div>
                      )}

                      {tailorProposal && !isTailoring && (
                        <>
                          <TailorSuggestionCards proposal={tailorProposal} />
                          <div className="flex items-center gap-2 pt-4 border-t border-border">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => setIsSaveDialogOpen(true)}
                              disabled={isSaving}
                              className="inline-flex items-center gap-1.5"
                            >
                              <Save className="w-3.5 h-3.5" aria-hidden="true" />
                              Save as New Version
                            </Button>
                          </div>
                        </>
                      )}

                      {isGeneratingCL && !clProposal && (
                        <div className="rounded-lg border border-border">
                          <CoverLetterProgress />
                        </div>
                      )}

                      {clProposal && !isGeneratingCL && (
                        <CoverLetterEditor
                          content={clProposal.content.fullText}
                          title=""
                          tone={clProposal.tone}
                          template={clProposal.template}
                          isSaving={false}
                          isGenerating={false}
                          onSave={() => {}}
                          onRegenerate={() => {}}
                        />
                      )}

                      <div className="flex items-center gap-2 pt-4 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            clearReport();
                            clearTailor();
                          }}
                        >
                          Hide Report
                        </Button>
                      </div>
                    </>
                  )}

                  <SaveTailoredResumeDialog
                    isOpen={isSaveDialogOpen}
                    isSaving={isSaving}
                    defaultName={detail && activeResume ? `${activeResume.name} — Tailored` : 'Tailored Resume'}
                    hasAcceptedChanges={acceptedChanges.size > 0}
                    onSave={handleSaveTailored}
                    onClose={() => setIsSaveDialogOpen(false)}
                  />

                  <CoverLetterGenerateDialog
                    isOpen={isCLDialogOpen}
                    isGenerating={isGeneratingCL}
                    resumeName={activeResume?.name || 'Active Resume'}
                    companyName={detail?.company || ''}
                    onGenerate={handleGenerateCL}
                    onClose={() => setIsCLDialogOpen(false)}
                  />

                  <div className="flex items-center gap-2 pt-4 border-t border-border">
                    {detail.analysisStatus !== 'PROCESSING' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        aria-busy={isAnalyzing}
                        className="inline-flex items-center gap-1.5"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                            {detail.analysisStatus === 'ANALYZED' ? 'Re-analyze' : 'Analyze'}
                          </>
                        )}
                      </Button>
                    )}
                    {canMatch && !matchResult && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleMatch}
                        disabled={isMatching}
                        aria-busy={isMatching}
                        className="inline-flex items-center gap-1.5"
                      >
                        {isMatching ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                            Matching...
                          </>
                        ) : (
                          <>
                            <Scale className="w-3.5 h-3.5" aria-hidden="true" />
                            Match with Resume
                          </>
                        )}
                      </Button>
                    )}
                    {detail?.sourceUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(detail.sourceUrl!, '_blank', 'noopener,noreferrer')}
                        className="inline-flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                        Visit Source
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEdit}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDelete}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/30"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
