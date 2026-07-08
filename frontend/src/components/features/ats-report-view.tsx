'use client';

import { motion } from 'framer-motion';
import { FileText, Sparkles, Loader2, Mail } from 'lucide-react';
import type { AtsReport } from '@/types/ats-report';
import { ScoreExplanationCard } from './score-explanation-card';
import { CategoryAnalysisPanel } from './category-analysis-panel';
import { PriorityRecommendations } from './priority-recommendations';
import { fadeUp } from '@/lib/animations/variants';
import { Button } from '@/components/ui/button';

interface AtsReportViewProps {
  report: AtsReport;
  onTailor?: () => void;
  isTailoring?: boolean;
  onCoverLetter?: () => void;
  isGeneratingCoverLetter?: boolean;
}

export function AtsReportView({ report, onTailor, isTailoring, onCoverLetter, isGeneratingCoverLetter }: AtsReportViewProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        ATS report loaded. Score is {report.atsScore} out of 100 with {report.recommendations.length} recommendations.
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="px-4 py-3 bg-accent/30 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-primary" />
            ATS Analysis Report
          </h3>
        </div>
        <div className="p-4 space-y-6">
          <ScoreExplanationCard explanation={report.scoreExplanation} />

          {report.missingSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {report.missingSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-500/10 text-rose-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          <PriorityRecommendations recommendations={report.recommendations} />

          <CategoryAnalysisPanel categories={report.categoryExplanations} />

          {(onTailor || onCoverLetter) && (
            <div className="pt-2 border-t border-border flex flex-wrap gap-2">
              {onTailor && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onTailor}
                  disabled={isTailoring}
                  className="inline-flex items-center gap-1.5"
                >
                  {isTailoring ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                      Tailoring...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                      Tailor Resume
                    </>
                  )}
                </Button>
              )}
              {onCoverLetter && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCoverLetter}
                  disabled={isGeneratingCoverLetter}
                  className="inline-flex items-center gap-1.5"
                >
                  {isGeneratingCoverLetter ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                      Generate Cover Letter
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
