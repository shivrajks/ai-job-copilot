import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: { icon: 'w-6 h-6', box: 'w-7 h-7 rounded-md', sparkle: 'w-3.5 h-3.5', text: 'text-sm' },
  md: { icon: 'w-8 h-8', box: 'w-9 h-9 rounded-lg', sparkle: 'w-4 h-4', text: 'text-lg' },
  lg: { icon: 'w-10 h-10', box: 'w-11 h-11 rounded-xl', sparkle: 'w-5 h-5', text: 'text-xl' },
};

export function Logo({ showText = true, size = 'md', className }: LogoProps) {
  const s = sizeMap[size];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          s.box,
          'bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center'
        )}
      >
        <Sparkles className={cn(s.sparkle, 'text-white')} />
      </div>
      {showText && (
        <span className={cn('font-semibold text-slate-950 transition-colors dark:text-white', s.text)}>AI Job Copilot</span>
      )}
    </div>
  );
}
