'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

const variantStyles = {
  default: 'bg-primary',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  destructive: 'bg-red-500',
};

export function Progress({
  className,
  value = 0,
  max = 100,
  variant = 'default',
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-muted', className)}
      {...props}
    >
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500 ease-out',
          variantStyles[variant]
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
