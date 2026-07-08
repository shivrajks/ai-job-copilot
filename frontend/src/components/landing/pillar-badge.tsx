import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PillarBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function PillarBadge({ children, className }: PillarBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-violet-200/70 bg-white/70 px-4 py-1.5 text-sm font-medium text-[#6758E8] shadow-[0_16px_40px_-28px_rgba(124,108,240,0.9)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.07] dark:text-violet-200',
        className
      )}
    >
      <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
      {children}
    </div>
  );
}
