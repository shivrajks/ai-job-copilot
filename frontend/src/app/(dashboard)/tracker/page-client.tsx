'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Plus, Search, LayoutList, Columns3 } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { ApplicationList } from '@/components/features/application-list';
import { ApplicationToolbar, sortOptions } from '@/components/features/application-toolbar';
import type { SortOption } from '@/components/features/application-toolbar';
import { KanbanBoard } from '@/components/features/kanban/kanban-board';
import { KanbanToolbar } from '@/components/features/kanban-toolbar';
import type { SortOption as KanbanSortOption } from '@/components/features/kanban-toolbar';
import { useMediaQuery } from '@/hooks/use-media-query';
import { ApplicationDialog } from '@/components/features/application-dialog';
import type { ApplicationFormData } from '@/components/features/application-dialog';
import { ApplicationDetailPanel } from '@/components/features/application-detail-panel';
import { ApplicationDeleteDialog } from '@/components/features/application-delete-dialog';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { useApplicationStore } from '@/store/applications';
import type { ApplicationListItem, ApplicationDetail, ApplicationStage } from '@/types/application';
import { cn } from '@/lib/utils';

type StageFilter = ApplicationStage | 'ALL';
type ViewMode = 'list' | 'kanban';

export default function TrackerPageClient() {
  const {
    applications,
    isLoading,
    error,
    fetchApplications,
    getApplication,
    createApplication,
    updateApplication,
    updateApplicationStage,
    deleteApplication,
    batchUpdateStage,
    batchDelete,
    selectedIds,
    toggleSelection,
    clearSelection,
    clearError,
  } = useApplicationStore();

  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingApplication, setEditingApplication] = useState<ApplicationDetail | null>(null);
  const [dialogPending, setDialogPending] = useState(false);

  const [selectedApplication, setSelectedApplication] = useState<ApplicationListItem | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<ApplicationListItem | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<StageFilter>('ALL');
  const [sortOption, setSortOption] = useState<SortOption>(sortOptions[0]);
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  useEffect(() => {
    if (isMobile) {
      setViewMode('list');
    }
  }, [isMobile]);

  const filteredApplications = useMemo(() => {
    let result = applications;

    if (stageFilter !== 'ALL') {
      result = result.filter((a) => a.stage === stageFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter(
        (a) =>
          a.company.toLowerCase().includes(query) ||
          a.role.toLowerCase().includes(query)
      );
    }

    return [...result].sort((a, b) => {
      const { field, direction } = sortOption;
      const dir = direction === 'asc' ? 1 : -1;

      if (field === 'company') {
        return dir * a.company.localeCompare(b.company);
      }

      return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    });
  }, [applications, searchQuery, stageFilter, sortOption]);

  const showEmptyFiltered = applications.length > 0 && filteredApplications.length === 0;

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleCreate = async (data: ApplicationFormData) => {
    setDialogPending(true);
    try {
      await createApplication(data as any);
      setShowDialog(false);
    } finally {
      setDialogPending(false);
    }
  };

  const handleEditStart = async (application: ApplicationListItem) => {
    try {
      const detail = await getApplication(application.id);
      setEditingApplication(detail);
      setDialogMode('edit');
      setShowDialog(true);
    } catch {
      // error is set in store
    }
  };

  const handleEdit = async (data: ApplicationFormData) => {
    if (!editingApplication) return;
    setDialogPending(true);
    try {
      await updateApplication(editingApplication.id, data as any);
      setShowDialog(false);
      setEditingApplication(null);
      if (selectedApplication?.id === editingApplication.id) {
        setSelectedApplication(null);
      }
    } finally {
      setDialogPending(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeletePending(true);
    try {
      await deleteApplication(deleteTarget.id);
      if (selectedApplication?.id === deleteTarget.id) {
        setSelectedApplication(null);
      }
      setDeleteTarget(null);
    } finally {
      setDeletePending(false);
    }
  };

  const handleStageChange = useCallback(async (id: string, stage: ApplicationStage) => {
    try {
      await updateApplicationStage(id, { stage });
    } catch {
      // error is set in store
    }
  }, [updateApplicationStage]);

  const handleSelect = useCallback((application: ApplicationListItem) => {
    setSelectedApplication((prev) => (prev?.id === application.id ? null : application));
  }, []);

  const handleBulkMove = useCallback(async (stage: ApplicationStage) => {
    await batchUpdateStage(Array.from(selectedIds), stage);
  }, [batchUpdateStage, selectedIds]);

  const handleBulkDelete = useCallback(async () => {
    await batchDelete(Array.from(selectedIds));
  }, [batchDelete, selectedIds]);

  return (
    <>
      <PageHeader
        title={<>Application Tracker{applications.length > 0 && <span className="text-muted-foreground text-lg font-normal ml-2">({applications.length})</span>}</>}
        description="Track your job applications from saved to offer"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'px-3 py-2 text-xs font-medium transition-colors flex items-center gap-1',
                  viewMode === 'list'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground hover:text-foreground'
                )}
                aria-label="List view"
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                disabled={isMobile}
                className={cn(
                  'px-3 py-2 text-xs font-medium transition-colors flex items-center gap-1',
                  viewMode === 'kanban'
                    ? 'bg-primary text-primary-foreground'
                    : isMobile
                      ? 'bg-background text-muted-foreground/40 cursor-not-allowed'
                      : 'bg-background text-muted-foreground hover:text-foreground'
                )}
                aria-label="Board view"
                title={isMobile ? 'Board view is only available on larger screens' : 'Board view'}
              >
                <Columns3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Board</span>
              </button>
            </div>

            <button
              onClick={() => {
                setDialogMode('create');
                setEditingApplication(null);
                setShowDialog(true);
              }}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0',
                'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              <Plus className="w-4 h-4" />
              Add Application
            </button>
          </div>
        }
      />

      {error && !isLoading && (
        <ErrorState
          title="Failed to load applications"
          message={error}
          onRetry={clearError}
          className="mb-6"
        />
      )}

      {!isLoading && viewMode === 'list' && (
        <ApplicationToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          stageFilter={stageFilter}
          onStageFilterChange={setStageFilter}
          currentSort={sortOption}
          onSortChange={setSortOption}
          totalCount={applications.length}
          filteredCount={filteredApplications.length}
        />
      )}

      {!isLoading && viewMode === 'kanban' && (
        <KanbanToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          stageFilter={stageFilter}
          onStageFilterChange={setStageFilter}
          currentSort={{ label: '', field: 'createdAt', direction: 'desc' }}
          onSortChange={() => {}}
          totalCount={applications.length}
          filteredCount={filteredApplications.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedCount={selectedIds.size}
          onBulkMove={handleBulkMove}
          onBulkDelete={handleBulkDelete}
        />
      )}

      {viewMode === 'list' && showEmptyFiltered && (
        <EmptyState
          icon={<Search className="w-8 h-8 text-muted-foreground" aria-hidden="true" />}
          title="No matches found"
          description="No applications match your search or filter criteria."
          action={{ label: 'Clear filters', onClick: () => { setSearchQuery(''); setStageFilter('ALL'); } }}
        />
      )}

      {viewMode === 'list' && !showEmptyFiltered && (
        <ApplicationList
          applications={filteredApplications}
          isLoading={isLoading}
          onSelect={handleSelect}
          onEdit={handleEditStart}
          onDelete={setDeleteTarget}
          onStageChange={handleStageChange}
          onAdd={() => setShowDialog(true)}
        />
      )}

      {viewMode === 'kanban' && !isLoading && applications.length > 0 && (
        <KanbanBoard
          applications={filteredApplications}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelection}
          onEdit={handleEditStart}
          onDelete={setDeleteTarget}
          onOpenDetail={setSelectedApplication}
        />
      )}

      {viewMode === 'kanban' && !isLoading && applications.length === 0 && (
        <EmptyState
          icon={<Columns3 className="w-8 h-8 text-muted-foreground" aria-hidden="true" />}
          title="No applications yet"
          description="Add your first application to get started with the Kanban board."
          action={{ label: 'Add Application', onClick: () => setShowDialog(true) }}
        />
      )}

      <ApplicationDetailPanel
        application={selectedApplication}
        onClose={() => setSelectedApplication(null)}
        onEdit={handleEditStart}
        onDelete={setDeleteTarget}
        onStageChange={handleStageChange}
      />

      <ApplicationDialog
        open={showDialog}
        mode={dialogMode}
        application={editingApplication}
        onConfirm={dialogMode === 'create' ? handleCreate : handleEdit}
        onCancel={() => {
          setShowDialog(false);
          setEditingApplication(null);
        }}
        isPending={dialogPending}
      />

      <ApplicationDeleteDialog
        open={!!deleteTarget}
        company={deleteTarget?.company || ''}
        role={deleteTarget?.role || ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isPending={deletePending}
      />
    </>
  );
}
