'use client';

import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ApplicationStage } from '@/types/application';
import { APPLICATION_STAGES, STAGE_LABELS } from '@/types/application';

export type SortOption = {
  label: string;
  field: 'createdAt' | 'company' | 'appliedAt';
  direction: 'asc' | 'desc';
};

export const sortOptions: SortOption[] = [
  { label: 'Newest', field: 'createdAt', direction: 'desc' },
  { label: 'Oldest', field: 'createdAt', direction: 'asc' },
  { label: 'Company A-Z', field: 'company', direction: 'asc' },
  { label: 'Company Z-A', field: 'company', direction: 'desc' },
  { label: 'Recently Applied', field: 'appliedAt', direction: 'desc' },
];

interface KanbanToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  stageFilter: ApplicationStage | 'ALL';
  onStageFilterChange: (value: ApplicationStage | 'ALL') => void;
  currentSort: SortOption;
  onSortChange: (option: SortOption) => void;
  totalCount: number;
  filteredCount: number;
  viewMode: 'list' | 'kanban';
  onViewModeChange: (mode: 'list' | 'kanban') => void;
  selectedCount: number;
  onBulkMove: (stage: ApplicationStage) => void;
  onBulkDelete: () => void;
}

export function KanbanToolbar({
  searchQuery,
  onSearchChange,
  stageFilter,
  onStageFilterChange,
  currentSort,
  onSortChange,
  totalCount,
  filteredCount,
  viewMode,
  onViewModeChange,
  selectedCount,
  onBulkMove,
  onBulkDelete,
}: KanbanToolbarProps) {
  return (
    <div className="space-y-3 mb-6">
      {/* View toggle + search row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by company or role..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn(
              'w-full h-9 pl-9 pr-8 rounded-lg border border-border bg-background text-sm',
              'placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
              'transition-colors'
            )}
            aria-label="Search applications"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => onViewModeChange('list')}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors',
                viewMode === 'list'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:text-foreground'
              )}
            >
              List
            </button>
            <button
              onClick={() => onViewModeChange('kanban')}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors',
                viewMode === 'kanban'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:text-foreground'
              )}
            >
              Board
            </button>
          </div>

          {/* Count */}
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {filteredCount} / {totalCount}
          </span>
        </div>
      </div>

      {/* Filter + Sort row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Stage filter pills */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onStageFilterChange('ALL')}
            className={cn(
              'text-xs px-2.5 py-1 rounded-full border transition-colors',
              stageFilter === 'ALL'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:text-foreground hover:border-primary'
            )}
          >
            All
          </button>
          {APPLICATION_STAGES.filter((s) => s !== 'WITHDRAWN').map((stage) => (
            <button
              key={stage}
              onClick={() => onStageFilterChange(stage === stageFilter ? 'ALL' : stage)}
              className={cn(
                'text-xs px-2.5 py-1 rounded-full border transition-colors',
                stageFilter === stage
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-primary'
              )}
            >
              {STAGE_LABELS[stage]}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={currentSort.label}
              onChange={(e) => {
                const opt = sortOptions.find((o) => o.label === e.target.value);
                if (opt) onSortChange(opt);
              }}
              className={cn(
                'h-8 pl-2 pr-7 rounded-lg border border-border bg-background text-xs',
                'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                'transition-colors cursor-pointer appearance-none'
              )}
              aria-label="Sort applications"
            >
              {sortOptions.map((opt) => (
                <option key={opt.label} value={opt.label}>
                  {opt.label}
                </option>
              ))}
            </select>
            <SlidersHorizontal className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Bulk actions bar */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
          <span className="text-xs font-medium text-primary">{selectedCount} selected</span>
          <div className="h-3 w-px bg-border" />
          <div className="flex flex-wrap gap-1">
            {APPLICATION_STAGES.slice(0, 7).map((stage) => (
              <button
                key={stage}
                onClick={() => onBulkMove(stage)}
                className="text-xs px-2 py-0.5 rounded-full border border-primary/20 text-primary hover:bg-primary/10 transition-colors"
              >
                {STAGE_LABELS[stage]}
              </button>
            ))}
          </div>
          <div className="h-3 w-px bg-border" />
          <button
            onClick={onBulkDelete}
            className="text-xs px-2 py-0.5 rounded-full border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
