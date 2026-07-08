'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ACCEPT_STRING = '.pdf,.docx';
const SUCCESS_DURATION = 1500;

interface ResumeUploaderProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  onSuccess?: () => void;
}

export function ResumeUploader({ onUpload, isUploading, onSuccess }: ResumeUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Only PDF and DOCX files are accepted.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be under 5MB.';
    }
    return null;
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (uploadSuccess) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }

    setError(null);
    setSelectedFile(file);

    try {
      await onUpload(file);
      setUploadSuccess(true);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => {
        setUploadSuccess(false);
        setSelectedFile(null);
        onSuccess?.();
      }, SUCCESS_DURATION);
    } catch {
      setError('Upload failed. Please try again.');
    }
  }, [validateFile, onUpload, onSuccess, uploadSuccess]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (inputRef.current) inputRef.current.value = '';
  }, [handleFile]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  }, []);

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onKeyDown={handleKeyDown}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
            aria-label="Upload resume (PDF or DOCX)"
            aria-disabled={isUploading || undefined}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-accent/30'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_STRING}
          className="sr-only"
          onChange={handleInputChange}
          aria-hidden="true"
          tabIndex={-1}
        />

        {uploadSuccess ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" aria-hidden="true" />
            <p className="text-sm font-medium text-emerald-500">Upload successful!</p>
          </div>
        ) : isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-primary" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Uploading resume...</p>
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col items-center gap-2">
            <FileText className="w-8 h-8 text-primary" aria-hidden="true" />
            <p className="text-sm font-medium">{selectedFile.name}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-medium">
              Drop your PDF here or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              PDF or DOCX files up to 5MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <div
          className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}
    </div>
  );
}
