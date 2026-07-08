'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { ResumeList } from '@/components/features/resume-list';
import { ResumeUploader } from '@/components/features/resume-uploader';
import { ResumeDetailPanel } from '@/components/features/resume-detail-panel';
import { ResumeToolbar, sortOptions } from '@/components/features/resume-toolbar';
import type { SortOption } from '@/components/features/resume-toolbar';
import { RenameDialog } from '@/components/features/rename-dialog';
import { DeleteDialog } from '@/components/features/delete-dialog';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { useResumeStore } from '@/store/resumes';
import type { ResumeListItem, ParsingStatus } from '@/types/resume';
import { cn } from '@/lib/utils';

export default function ResumesPageClient() {
  const {
    resumes,
    isLoading,
    isUploading,
    error,
    fetchResumes,
    uploadResume,
    renameResume,
    deleteResume,
    setActiveResume,
    clearError,
  } = useResumeStore();

  const [showUploader, setShowUploader] = useState(false);
  const [selectedResume, setSelectedResume] = useState<ResumeListItem | null>(null);

  const [renameTarget, setRenameTarget] = useState<ResumeListItem | null>(null);
  const [renamePending, setRenamePending] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ResumeListItem | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ParsingStatus | 'ALL'>('ALL');
  const [sortOption, setSortOption] = useState<SortOption>(sortOptions[0]);

  const filteredResumes = useMemo(() => {
    let result = resumes;

    if (statusFilter !== 'ALL') {
      result = result.filter((r) => r.parsingStatus === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter((r) => r.name.toLowerCase().includes(query));
    }

    return [...result].sort((a, b) => {
      const { field, direction } = sortOption;
      const dir = direction === 'asc' ? 1 : -1;

      if (field === 'name') {
        const cmp = a.name.localeCompare(b.name);
        return dir * cmp;
      }

      if (field === 'createdAt') {
        return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }

      const getVal = (r: ResumeListItem) =>
        field === 'atsScore' ? r.atsScore : r.fileSize;

      const aVal = getVal(a);
      const bVal = getVal(b);

      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;
      return dir * (aVal - bVal);
    });
  }, [resumes, searchQuery, statusFilter, sortOption]);

  const isFiltered = searchQuery !== '' || statusFilter !== 'ALL';
  const showEmptyFiltered = resumes.length > 0 && filteredResumes.length === 0;

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleUpload = async (file: File) => {
    await uploadResume(file);
  };

  const handleRename = async (name: string) => {
    if (!renameTarget) return;
    setRenamePending(true);
    try {
      await renameResume(renameTarget.id, name);
      setRenameTarget(null);
    } finally {
      setRenamePending(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeletePending(true);
    try {
      await deleteResume(deleteTarget.id);
      if (selectedResume?.id === deleteTarget.id) {
        setSelectedResume(null);
      }
      setDeleteTarget(null);
    } finally {
      setDeletePending(false);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await setActiveResume(id);
    } catch {
      // error is set in store
    }
  };

  const handleSelect = useCallback((resume: ResumeListItem) => {
    setSelectedResume((prev) => (prev?.id === resume.id ? null : resume));
  }, []);

  return (
    <>
      <PageHeader
        title="Resumes"
        description="Manage your resume versions"
        actions={
          <button
            onClick={() => setShowUploader(!showUploader)}
            disabled={isUploading}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0',
              isUploading
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            <Plus className="w-4 h-4" />
            Upload Resume
          </button>
        }
      />

      {error && !isLoading && (
        <ErrorState
          title="Failed to load resumes"
          message={error}
          onRetry={clearError}
          className="mb-6"
        />
      )}

      {showUploader && (
        <div className="mb-8">
          <ResumeUploader
            onUpload={handleUpload}
            isUploading={isUploading}
            onSuccess={() => setShowUploader(false)}
          />
        </div>
      )}

      {!isLoading && (
        <ResumeToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          currentSort={sortOption}
          onSortChange={setSortOption}
          totalCount={resumes.length}
          filteredCount={filteredResumes.length}
        />
      )}

      {showEmptyFiltered ? (
        <EmptyState
          icon={<Search className="w-8 h-8 text-muted-foreground" aria-hidden="true" />}
          title="No matches found"
          description="No resumes match your search or filter criteria."
          action={{ label: 'Clear filters', onClick: () => { setSearchQuery(''); setStatusFilter('ALL'); } }}
        />
      ) : (
        <ResumeList
          resumes={filteredResumes}
          isLoading={isLoading}
          onActivate={handleActivate}
          onRename={setRenameTarget}
          onDelete={setDeleteTarget}
          onSelect={handleSelect}
          onAdd={() => setShowUploader(true)}
        />
      )}

      <ResumeDetailPanel
        resume={selectedResume}
        onClose={() => setSelectedResume(null)}
        onActivate={handleActivate}
        onRename={setRenameTarget}
        onDelete={setDeleteTarget}
      />

      <RenameDialog
        open={!!renameTarget}
        currentName={renameTarget?.name || ''}
        onConfirm={handleRename}
        onCancel={() => setRenameTarget(null)}
        isPending={renamePending}
      />

      <DeleteDialog
        open={!!deleteTarget}
        resumeName={deleteTarget?.name || ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isPending={deletePending}
      />
    </>
  );
}
