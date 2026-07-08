'use client';

import {
  FileText,
  Calendar,
  Hash,
  BarChart3,
  RotateCcw,
} from 'lucide-react';
import type { ResumeDetail } from '@/types/resume';
import { FileSize } from '@/components/shared/file-size';
import { cn } from '@/lib/utils';
import { parsingStatusConfig } from '@/lib/constants/parsing-status';

interface ResumeDetailMetadataProps {
  detail: ResumeDetail;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const mimeTypeLabels: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/msword': 'DOC',
  'text/plain': 'TXT',
  'image/png': 'PNG',
  'image/jpeg': 'JPEG',
};

function getMimeTypeLabel(mimeType: string | null): string {
  if (!mimeType) return 'Unknown';
  return mimeTypeLabels[mimeType] || mimeType;
}

export function ResumeDetailMetadata({ detail }: ResumeDetailMetadataProps) {
  const status = parsingStatusConfig[detail.parsingStatus] || parsingStatusConfig.PENDING;
  const StatusIcon = status.icon;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <StatusIcon className={cn('w-4 h-4', status.color, detail.parsingStatus === 'PENDING' && 'animate-spin')} />
        <span className={cn('text-sm font-medium', status.color)}>{status.label}</span>
        {detail.isActive && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium ml-auto">
            Active
          </span>
        )}
      </div>

      {detail.parsingStatus === 'FAILED' && detail.errorMessage && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20" role="alert">
          <p className="text-xs text-destructive font-medium">Parsing failed</p>
          <p className="text-xs text-destructive/80 mt-0.5">{detail.errorMessage}</p>
        </div>
      )}

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between py-1">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Size
          </span>
          <FileSize bytes={detail.fileSize} className="text-foreground" />
        </div>

        <div className="flex items-center justify-between py-1">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Type
          </span>
          <span className="text-foreground font-medium">{getMimeTypeLabel(detail.mimeType)}</span>
        </div>

        <div className="flex items-center justify-between py-1">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5" />
            Version
          </span>
          <span className="text-foreground">v{detail.versionNum}</span>
        </div>

        <div className="flex items-center justify-between py-1">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            ATS Score
          </span>
          <span className={detail.atsScore !== null ? 'text-foreground font-medium' : 'text-muted-foreground'}>
            {detail.atsScore !== null ? `${detail.atsScore}/100` : 'Not analyzed'}
          </span>
        </div>

        {detail.parseAttempts !== null && detail.parseAttempts > 0 && (
          <div className="flex items-center justify-between py-1">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" />
              Parse attempts
            </span>
            <span className="text-foreground">{detail.parseAttempts}</span>
          </div>
        )}

        {detail.parsedAt && (
          <div className="flex items-center justify-between py-1">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Last parsed
            </span>
            <span className="text-foreground">{formatDateTime(detail.parsedAt)}</span>
          </div>
        )}

        <div className="flex items-center justify-between py-1">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Created
          </span>
          <span className="text-foreground">{formatDate(detail.createdAt)}</span>
        </div>

        <div className="flex items-center justify-between py-1">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Updated
          </span>
          <span className="text-foreground">{formatDateTime(detail.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}
