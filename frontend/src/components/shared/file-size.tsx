import { cn } from '@/lib/utils';

interface FileSizeProps {
  bytes: number | null;
  className?: string;
}

export function FileSize({ bytes, className }: FileSizeProps) {
  if (bytes === null || bytes === undefined) return null;

  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  const formatted = unitIndex === 0
    ? `${value}`
    : `${value.toFixed(1)}`;

  return (
    <span className={cn('text-sm text-muted-foreground', className)}>
      {formatted} {units[unitIndex]}
    </span>
  );
}
