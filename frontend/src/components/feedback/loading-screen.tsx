import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingScreenProps {
  message?: string;
  className?: string;
}

export function LoadingScreen({
  message = 'Loading...',
  className,
}: LoadingScreenProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center min-h-[60vh] gap-3',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
