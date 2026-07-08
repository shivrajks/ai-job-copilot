'use client';

import { cn } from '@/lib/utils';

interface SkipToContentProps {
  contentId?: string;
  className?: string;
}

export function SkipToContent({
  contentId = 'main-content',
  className,
}: SkipToContentProps) {
  return (
    <a
      href={`#${contentId}`}
      className={cn(
        'sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999]',
        'focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground',
        'focus:text-sm focus:font-medium focus:outline-none focus:ring-2 focus:ring-ring',
        className
      )}
    >
      Skip to content
    </a>
  );
}
