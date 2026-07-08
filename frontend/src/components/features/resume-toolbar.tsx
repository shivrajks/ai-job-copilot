'use client';

import { Search, X } from 'lucide-react';
import type { ParsingStatus } from '@/types/resume';
import { cn } from '@/lib/utils';

const statusFilters: { value: ParsingStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'PARSED', label: 'Parsed' },
  { value: 'FAILED', label: 'Failed' },
];

export type SortField = 'createdAt' | 'name' | 'atsScore' | 'fileSize';
export type SortDirection = 'asc' | 'desc';

export interface SortOption {
  field: SortField;
  direction: SortDirection;
  label: string;
}

export const sortOptions: SortOption[] = [
  { field: 'createdAt', direction: 'desc', label: 'Newest' },
  { field: 'createdAt', direction: 'asc', label: 'Oldest' },
  { field: 'name', direction: 'asc', label: 'Name A-Z' },
  { field: 'name', direction: 'desc', label: 'Name Z-A' },
  { field: 'atsScore', direction: 'desc', label: 'Highest ATS' },
  { field: 'fileSize', direction: 'desc', label: 'Largest file' },
];

interface ResumeToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: ParsingStatus | 'ALL';
  onStatusFilterChange: (status: ParsingStatus | 'ALL') => void;
  currentSort: SortOption;
  onSortChange: (option: SortOption) => void;
  totalCount: number;
  filteredCount: number;
}

export function ResumeToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  currentSort,
  onSortChange,
  totalCount,
  filteredCount,
}: ResumeToolbarProps) {
  const isFiltered = searchQuery !== '' || statusFilter !== 'ALL' || filteredCount !== totalCount;

  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search resumes..."
            aria-label="Search resumes"
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
            const option = sortOptions.find(
              (o) => `${o.field}-${o.direction}` === e.target.value
            );
            if (option) onSortChange(option);
          }}
          aria-label="Sort resumes"
          className={cn(
            'h-9 px-3 rounded-lg border border-border bg-background text-sm',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            'transition-colors cursor-pointer'
          )}
        >
          {sortOptions.map((option) => (
            <option
              key={`${option.field}-${option.direction}`}
              value={`${option.field}-${option.direction}`}
            >
              {option.label}
            </option>
          ))}
        </select>
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
          {isFiltered
            ? `${filteredCount} of ${totalCount}`
            : `${totalCount} ${totalCount === 1 ? 'resume' : 'resumes'}`}
        </p>
      </div>
    </div>
  );
}
