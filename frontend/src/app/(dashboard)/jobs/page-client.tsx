'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { JobDescriptionList } from '@/components/features/job-description-list';
import { JobDescriptionToolbar, sortOptions } from '@/components/features/job-description-toolbar';
import type { SortOption } from '@/components/features/job-description-toolbar';
import { JobDescriptionDialog } from '@/components/features/job-description-dialog';
import type { JobDescriptionFormData } from '@/components/features/job-description-dialog';
import { JobDescriptionDetailPanel } from '@/components/features/job-description-detail-panel';
import { JobDescriptionDeleteDialog } from '@/components/features/job-description-delete-dialog';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { useJobDescriptionStore } from '@/store/job-descriptions';
import type { JobDescriptionListItem, JobDescriptionDetail } from '@/types/job-description';
import { cn } from '@/lib/utils';

export default function JobsPageClient() {
  const {
    jobDescriptions,
    isLoading,
    error,
    fetchJobDescriptions,
    getJobDescription,
    createJobDescription,
    updateJobDescription,
    deleteJobDescription,
    clearError,
  } = useJobDescriptionStore();

  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingJd, setEditingJd] = useState<JobDescriptionDetail | null>(null);
  const [dialogPending, setDialogPending] = useState(false);

  const [selectedJd, setSelectedJd] = useState<JobDescriptionListItem | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<JobDescriptionListItem | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const handleRefresh = useCallback(() => {
    fetchJobDescriptions({ force: true });
  }, [fetchJobDescriptions]);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>(sortOptions[0]);

  const filteredJobDescriptions = useMemo(() => {
    let result = jobDescriptions;

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(query) ||
          (j.company && j.company.toLowerCase().includes(query))
      );
    }

    return [...result].sort((a, b) => {
      const { field, direction } = sortOption;
      const dir = direction === 'asc' ? 1 : -1;

      if (field === 'title') {
        return dir * a.title.localeCompare(b.title);
      }

      if (field === 'company') {
        const aVal = a.company || '';
        const bVal = b.company || '';
        return dir * aVal.localeCompare(bVal);
      }

      return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    });
  }, [jobDescriptions, searchQuery, sortOption]);

  const showEmptyFiltered = jobDescriptions.length > 0 && filteredJobDescriptions.length === 0;

  useEffect(() => {
    fetchJobDescriptions();
  }, [fetchJobDescriptions]);

  const handleCreate = async (data: JobDescriptionFormData) => {
    setDialogPending(true);
    try {
      await createJobDescription(data as any);
      setShowDialog(false);
    } finally {
      setDialogPending(false);
    }
  };

  const handleEditStart = async (jd: JobDescriptionListItem) => {
    try {
      const detail = await getJobDescription(jd.id);
      setEditingJd(detail);
      setDialogMode('edit');
      setShowDialog(true);
    } catch {
      // error is set in store
    }
  };

  const handleEdit = async (data: JobDescriptionFormData) => {
    if (!editingJd) return;
    setDialogPending(true);
    try {
      await updateJobDescription(editingJd.id, data as any);
      setShowDialog(false);
      setEditingJd(null);
      if (selectedJd?.id === editingJd.id) {
        setSelectedJd(null);
      }
    } finally {
      setDialogPending(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeletePending(true);
    try {
      await deleteJobDescription(deleteTarget.id);
      if (selectedJd?.id === deleteTarget.id) {
        setSelectedJd(null);
      }
      setDeleteTarget(null);
    } finally {
      setDeletePending(false);
    }
  };

  const handleSelect = useCallback((jd: JobDescriptionListItem) => {
    setSelectedJd((prev) => (prev?.id === jd.id ? null : jd));
  }, []);

  return (
    <>
      <PageHeader
        title={<>Job Match{jobDescriptions.length > 0 && <span className="text-muted-foreground text-lg font-normal ml-2">({jobDescriptions.length})</span>}</>}
        description="Manage and analyze job descriptions"
        actions={
          <>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors shrink-0',
              'border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            aria-label="Refresh job descriptions"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
            Refresh
          </button>
          <button
            onClick={() => {
              setDialogMode('create');
              setEditingJd(null);
              setShowDialog(true);
            }}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0',
              'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            <Plus className="w-4 h-4" />
            Add Job Description
          </button>
          </>
        }
      />

      {error && !isLoading && (
        <ErrorState
          title="Failed to load job descriptions"
          message={error}
          onRetry={clearError}
          className="mb-6"
        />
      )}

      {!isLoading && (
        <JobDescriptionToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          currentSort={sortOption}
          onSortChange={setSortOption}
          totalCount={jobDescriptions.length}
          filteredCount={filteredJobDescriptions.length}
        />
      )}

      {showEmptyFiltered ? (
        <EmptyState
          icon={<Search className="w-8 h-8 text-muted-foreground" aria-hidden="true" />}
          title="No matches found"
          description="No job descriptions match your search criteria."
          action={{ label: 'Clear search', onClick: () => setSearchQuery('') }}
        />
      ) : (
        <JobDescriptionList
          items={filteredJobDescriptions}
          isLoading={isLoading}
          onSelect={handleSelect}
          onEdit={handleEditStart}
          onDelete={setDeleteTarget}
          onAdd={() => setShowDialog(true)}
        />
      )}

      <JobDescriptionDetailPanel
        jd={selectedJd}
        onClose={() => setSelectedJd(null)}
        onEdit={handleEditStart}
        onDelete={setDeleteTarget}
      />

      <JobDescriptionDialog
        open={showDialog}
        mode={dialogMode}
        jd={editingJd}
        onConfirm={dialogMode === 'create' ? handleCreate : handleEdit}
        onCancel={() => {
          setShowDialog(false);
          setEditingJd(null);
        }}
        isPending={dialogPending}
      />

      <JobDescriptionDeleteDialog
        open={!!deleteTarget}
        title={deleteTarget?.title || ''}
        company={deleteTarget?.company || ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isPending={deletePending}
      />
    </>
  );
}
