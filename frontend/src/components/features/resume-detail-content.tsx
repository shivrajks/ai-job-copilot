'use client';

import { useState } from 'react';
import { Loader2, AlertTriangle, Sparkles, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';
import type { ResumeDetail } from '@/types/resume';
import { ResumeStructuredView } from './resume-structured-view';
import { cn } from '@/lib/utils';

interface ResumeDetailContentProps {
  detail: ResumeDetail;
}

export function ResumeDetailContent({ detail }: ResumeDetailContentProps) {
  if (detail.parsingStatus === 'PENDING') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
        <p className="text-sm font-medium text-foreground">Queued for parsing</p>
        <p className="text-xs text-muted-foreground mt-1">
          Click {'\u201C'}Parse Resume{'\u201D'} to begin processing.
        </p>
      </div>
    );
  }

  if (detail.parsingStatus === 'PROCESSING') {
    return <ParseProgress />;
  }

  if (detail.parsingStatus === 'FAILED') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
          <AlertTriangle className="w-6 h-6 text-destructive" />
        </div>
        <p className="text-sm font-medium text-foreground">Parsing failed</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          {detail.errorMessage || 'An unexpected error occurred during parsing.'}
        </p>
      </div>
    );
  }

  if (detail.parsingStatus === 'PARSED' && detail.parsedContent) {
    return <ParseResults detail={detail} />;
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mb-3">
        <Sparkles className="w-6 h-6 text-muted-foreground" />
      </div>
      <p className={cn(
        'text-sm font-medium',
        detail.parsingStatus === 'PARSED' ? 'text-muted-foreground' : 'text-foreground'
      )}>
        {detail.parsingStatus === 'PARSED'
          ? 'No content available'
          : 'Resume content not yet available'}
      </p>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs">
        {detail.parsingStatus === 'PARSED'
          ? 'The parsed content is empty. You may need to re-upload your resume.'
          : 'Parsed content will appear here once your resume has been processed.'}
      </p>
    </div>
  );
}

function ParseProgress() {
  return (
    <div className="space-y-5 py-8">
      <div className="flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        <p className="text-sm font-medium text-foreground">Parsing your resume</p>
      </div>

      <div className="max-w-xs mx-auto space-y-3">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="text-xs text-muted-foreground">Upload validated</span>
        </div>
        <div className="flex items-center gap-3">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500 shrink-0" />
          <span className="text-xs text-foreground">Extracting text from PDF</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-muted shrink-0" />
          <span className="text-xs text-muted-foreground">Analyzing with AI</span>
        </div>
      </div>

      <div className="w-full bg-accent rounded-full h-1.5 overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '45%' }} />
      </div>
    </div>
  );
}

function ParseResults({ detail }: { detail: ResumeDetail }) {
  const [rawOpen, setRawOpen] = useState(false);

  return (
    <div className="space-y-6">
      {detail.structuredData && (
        <ResumeStructuredView data={detail.structuredData} />
      )}

      <div className="border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => setRawOpen(!rawOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-accent/50 transition-colors"
          aria-expanded={rawOpen}
          aria-controls="raw-content-panel"
        >
          <span>Raw Content</span>
          {rawOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        </button>
        {rawOpen && (
          <div id="raw-content-panel" className="px-4 pb-4">
            <div className="p-4 rounded-lg bg-accent/50 border border-border">
              <pre className="text-sm whitespace-pre-wrap font-sans text-foreground">
                {detail.parsedContent}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
