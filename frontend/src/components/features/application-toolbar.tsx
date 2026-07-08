'use client';

import { Search, X } from 'lucide-react';
import type { ApplicationStage } from '@/types/application';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState, useCallback } from 'react';

export type SortField = 'createdAt' | 'company';
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
];

type StageFilter = ApplicationStage | 'ALL';

const stageFilters: { value: StageFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'SAVED', label: 'Saved' },
  { value: 'APPLIED', label: 'Applied' },
  { value: 'PHONE_SCREEN', label: 'Phone' },
  { value: 'TECHNICAL_INTERVIEW', label: 'Technical' },
  { value: 'ONSITE', label: 'Onsite' },
  { value: 'OFFER', label: 'Offer' },
  { value: 'REJECTED', label: 'Rejected' },
];

interface ApplicationToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  stageFilter: StageFilter;
  onStageFilterChange: (stage: StageFilter) => void;
  currentSort: SortOption;
  onSortChange: (option: SortOption) => void;
  totalCount: number;
  filteredCount: number;
}

export function ApplicationToolbar({
  searchQuery,
  onSearchChange,
  stageFilter,
  onStageFilterChange,
  currentSort,
  onSortChange,
  totalCount,
  filteredCount,
}: ApplicationToolbarProps) {
  const isFiltered = searchQuery !== '' || stageFilter !== 'ALL' || filteredCount !== totalCount;
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleChange = useCallback((value: string) => {
    setLocalQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearchChange(value), 250);
  }, [onSearchChange]);

  const handleClear = useCallback(() => {
    setLocalQuery('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onSearchChange('');
  }, [onSearchChange]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={localQuery}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Search by company or role..."
            aria-label="Search applications"
            className={cn(
              'w-full h-9 pl-9 pr-8 rounded-lg border border-border bg-background text-sm',
              'placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
              'transition-colors'
            )}
          />
          {localQuery && (
            <button
              onClick={handleClear}
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
          aria-label="Sort applications"
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
          {stageFilters.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onStageFilterChange(value)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                stageFilter === value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent text-muted-foreground hover:text-foreground'
              )}
              aria-pressed={stageFilter === value}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground shrink-0 ml-3">
          {isFiltered
            ? `${filteredCount} of ${totalCount}`
            : `${totalCount} ${totalCount === 1 ? 'application' : 'applications'}`}
        </p>
      </div>
    </div>
  );
}
