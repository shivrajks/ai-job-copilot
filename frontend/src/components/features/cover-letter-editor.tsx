'use client';

import { useState, useCallback } from 'react';
import { Save, Copy, Check, Loader2, RotateCcw, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TONES, TEMPLATES } from '@/types/cover-letter';
import { Button } from '@/components/ui/button';

interface CoverLetterEditorProps {
  content: string;
  title: string;
  tone: string;
  template: string;
  isSaving: boolean;
  isGenerating: boolean;
  onSave: (content: string, title: string, tone: string, template: string) => void;
  onRegenerate: (tone: string, template: string) => void;
}

export function CoverLetterEditor({
  content,
  title: initialTitle,
  tone: initialTone,
  template: initialTemplate,
  isSaving,
  isGenerating,
  onSave,
  onRegenerate,
}: CoverLetterEditorProps) {
  const [editContent, setEditContent] = useState(content);
  const [title, setTitle] = useState(initialTitle);
  const [tone, setTone] = useState(initialTone);
  const [template, setTemplate] = useState(initialTemplate);
  const [copied, setCopied] = useState(false);

  const titleFromContent = content.split('\n')[0]?.replace(/^Subject:\s*/i, '').trim() || 'Cover Letter';

  const displayTitle = title || titleFromContent;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(editContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = editContent;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [editContent]);

  const handleSave = useCallback(() => {
    onSave(editContent, displayTitle, tone, template);
  }, [editContent, displayTitle, tone, template, onSave]);

  const handleRegenerate = useCallback(() => {
    onRegenerate(tone, template);
  }, [tone, template, onRegenerate]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSaving}
            className={cn(
              'w-full px-3 py-2 rounded-lg border border-border',
              'bg-background text-foreground text-sm font-medium',
              'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'placeholder:text-muted-foreground'
            )}
            placeholder="Cover Letter Title"
            maxLength={255}
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
            aria-label={copied ? 'Copied' : 'Copy to clipboard'}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                <span className="text-emerald-500">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" aria-hidden="true" />
                Copy
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !editContent.trim()}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              <>
              <Save className="w-4 h-4" aria-hidden="true" />
              Save
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <label htmlFor="cl-editor-tone" className="text-xs text-muted-foreground">
            Tone:
          </label>
          <select
            id="cl-editor-tone"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            disabled={isGenerating}
            className={cn(
              'px-2 py-1.5 rounded-md border border-border text-xs',
              'bg-background text-foreground',
              'focus:outline-none focus:ring-2 focus:ring-primary/30',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {TONES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="cl-editor-template" className="text-xs text-muted-foreground">
            Template:
          </label>
          <select
            id="cl-editor-template"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            disabled={isGenerating}
            className={cn(
              'px-2 py-1.5 rounded-md border border-border text-xs',
              'bg-background text-foreground',
              'focus:outline-none focus:ring-2 focus:ring-primary/30',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {TEMPLATES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleRegenerate}
          disabled={isGenerating}
          className="inline-flex items-center gap-1 text-xs px-2 py-1.5 rounded-md border border-border hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
              Generating...
            </>
          ) : (
            <>
              <RotateCcw className="w-3 h-3" aria-hidden="true" />
              Regenerate
            </>
          )}
        </button>
      </div>

      <div className="relative">
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          disabled={isSaving || isGenerating}
          className={cn(
            'w-full min-h-[400px] p-4 rounded-lg border border-border',
            'bg-background text-foreground text-sm leading-relaxed font-mono',
            'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'resize-y'
          )}
          placeholder="Your cover letter will appear here..."
          aria-label="Cover letter editor"
          spellCheck
        />
        {isGenerating && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center rounded-lg" role="alert" aria-live="polite">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              Generating...
            </div>
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground text-right">
        {editContent.length} characters
      </div>
    </div>
  );
}
