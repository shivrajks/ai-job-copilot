import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export function InlineLoader({ className, size = 'sm' }: InlineLoaderProps) {
  return (
    <Loader2
      className={cn('animate-spin text-muted-foreground', sizeMap[size], className)}
    />
  );
}
