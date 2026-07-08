'use client';

import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SortField = 'createdAt' | 'title' | 'company';
export type SortDirection = 'asc' | 'desc';

export interface SortOption {
  field: SortField;
  direction: SortDirection;
  label: string;
}

export const sortOptions: SortOption[] = [
  { field: 'createdAt', direction: 'desc', label: 'Newest' },
  { field: 'createdAt', direction: 'asc', label: 'Oldest' },
  { field: 'title', direction: 'asc', label: 'Title A-Z' },
  { field: 'title', direction: 'desc', label: 'Title Z-A' },
  { field: 'company', direction: 'asc', label: 'Company A-Z' },
  { field: 'company', direction: 'desc', label: 'Company Z-A' },
];

interface JobDescriptionToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentSort: SortOption;
  onSortChange: (option: SortOption) => void;
  totalCount: number;
  filteredCount: number;
}

export function JobDescriptionToolbar({
  searchQuery,
  onSearchChange,
  currentSort,
  onSortChange,
  totalCount,
  filteredCount,
}: JobDescriptionToolbarProps) {
  const isFiltered = searchQuery !== '' || filteredCount !== totalCount;

  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title or company..."
            aria-label="Search job descriptions"
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
          aria-label="Sort job descriptions"
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

      <div className="flex items-center justify-end">
        <p className="text-xs text-muted-foreground" aria-live="polite" aria-atomic="true">
          {isFiltered
            ? `${filteredCount} of ${totalCount}`
            : `${totalCount} ${totalCount === 1 ? 'job description' : 'job descriptions'}`}
        </p>
      </div>
    </div>
  );
}
