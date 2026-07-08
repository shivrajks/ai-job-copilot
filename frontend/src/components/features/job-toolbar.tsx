'use client';

import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import type { JobStatus, WorkMode, Priority } from '@/types/jobs';
import { STATUS_LABELS, WORK_MODE_LABELS, PRIORITY_LABELS } from '@/types/jobs';
import { cn } from '@/lib/utils';

export type SortField = 'createdAt' | 'title' | 'company' | 'status' | 'priority' | 'deadline' | 'appliedDate';
export type SortDirection = 'asc' | 'desc';

export interface SortOption {
  field: SortField;
  direction: SortDirection;
  label: string;
}

export const sortOptions: SortOption[] = [
  { field: 'createdAt', direction: 'desc', label: 'Newest' },
  { field: 'createdAt', direction: 'asc', label: 'Oldest' },
  { field: 'company', direction: 'asc', label: 'Company A-Z' },
  { field: 'company', direction: 'desc', label: 'Company Z-A' },
  { field: 'status', direction: 'asc', label: 'Status' },
  { field: 'priority', direction: 'desc', label: 'Priority' },
  { field: 'deadline', direction: 'asc', label: 'Deadline' },
];

interface JobToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  workModeFilter: string;
  onWorkModeFilterChange: (mode: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (priority: string) => void;
  showFavorites: boolean;
  onFavoritesToggle: (show: boolean) => void;
  currentSort: SortOption;
  onSortChange: (option: SortOption) => void;
  totalCount: number;
  filteredCount: number;
}

const statusFilters = [
  { value: '', label: 'All' },
  { value: 'SAVED', label: 'Saved' },
  { value: 'APPLIED', label: 'Applied' },
  { value: 'PHONE_SCREEN', label: 'Phone' },
  { value: 'TECHNICAL_INTERVIEW', label: 'Technical' },
  { value: 'ONSITE_INTERVIEW', label: 'Onsite' },
  { value: 'OFFER', label: 'Offer' },
  { value: 'REJECTED', label: 'Rejected' },
];

export function JobToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  workModeFilter,
  onWorkModeFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  showFavorites,
  onFavoritesToggle,
  currentSort,
  onSortChange,
  totalCount,
  filteredCount,
}: JobToolbarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const isFiltered = searchQuery !== '' || statusFilter !== '' || workModeFilter !== '' || priorityFilter !== '' || showFavorites;

  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search jobs by title, company, or notes..."
            aria-label="Search jobs"
            className={cn(
              'w-full h-9 pl-9 pr-8 rounded-lg border border-border bg-background text-sm',
              'placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
              'transition-colors'
            )}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <select
          value={`${currentSort.field}-${currentSort.direction}`}
          onChange={(e) => {
            const option = sortOptions.find((o) => `${o.field}-${o.direction}` === e.target.value);
            if (option) onSortChange(option);
          }}
          aria-label="Sort jobs"
          className={cn(
            'h-9 px-3 rounded-lg border border-border bg-background text-sm',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            'transition-colors cursor-pointer'
          )}
        >
          {sortOptions.map((option) => (
            <option key={`${option.field}-${option.direction}`} value={`${option.field}-${option.direction}`}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'h-9 px-3 rounded-lg border text-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            showFilters || isFiltered ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-muted-foreground'
          )}
          aria-label="Toggle filters"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          {statusFilters.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onStatusFilterChange(value)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                statusFilter === value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent text-muted-foreground hover:text-foreground'
              )}
              aria-pressed={statusFilter === value}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground shrink-0 ml-3">
          {isFiltered ? `${filteredCount} of ${totalCount}` : `${totalCount} ${totalCount === 1 ? 'job' : 'jobs'}`}
        </p>
      </div>

      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-accent/50">
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Work Mode:</label>
            <select
              value={workModeFilter}
              onChange={(e) => onWorkModeFilterChange(e.target.value)}
              className="h-8 px-2 rounded border border-border bg-background text-xs"
            >
              <option value="">All</option>
              {Object.entries(WORK_MODE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Priority:</label>
            <select
              value={priorityFilter}
              onChange={(e) => onPriorityFilterChange(e.target.value)}
              className="h-8 px-2 rounded border border-border bg-background text-xs"
            >
              <option value="">All</option>
              {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showFavorites}
              onChange={(e) => onFavoritesToggle(e.target.checked)}
              className="rounded border-border"
            />
            <span className="text-xs">Favorites only</span>
          </label>
        </div>
      )}
    </div>
  );
}
