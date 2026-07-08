'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface ThemeToggleProps {
  variant?: 'default' | 'landing';
  className?: string;
}

export function ThemeToggle({ variant = 'default', className }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className={cn(variant === 'landing' ? 'h-9 w-[76px] rounded-full' : 'h-9 w-9 rounded-lg', className)}
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  if (variant === 'landing') {
    return (
      <button
        type="button"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className={cn(
          'group relative inline-flex h-9 w-[76px] items-center justify-between overflow-hidden rounded-full border p-1',
          'border-slate-200/80 bg-white/80 text-slate-500 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.55)] backdrop-blur-xl',
          'transition-all duration-300 hover:border-violet-300 hover:text-slate-900 hover:shadow-[0_18px_40px_-22px_rgba(124,108,240,0.65)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C6CF0] focus-visible:ring-offset-2',
          'dark:border-white/10 dark:bg-white/[0.07] dark:text-slate-300 dark:shadow-[0_16px_40px_-24px_rgba(0,0,0,0.9)] dark:hover:border-cyan-300/40 dark:hover:text-white dark:focus-visible:ring-offset-[#070B16]',
          className
        )}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-pressed={isDark}
      >
        <motion.span
          layout
          className={cn(
            'absolute left-1 top-1 h-7 w-7 rounded-full shadow-sm transition-colors',
            isDark
              ? 'translate-x-[38px] bg-slate-950 shadow-cyan-500/10'
              : 'translate-x-0 bg-white shadow-violet-500/20'
          )}
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          aria-hidden="true"
        />
        <span className={cn('relative z-10 grid h-7 w-7 place-items-center rounded-full transition-colors', !isDark && 'text-amber-500')}>
          <Sun className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <span className={cn('relative z-10 grid h-7 w-7 place-items-center rounded-full transition-colors', isDark && 'text-cyan-300')}>
          <Moon className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'relative w-9 h-9 rounded-lg flex items-center justify-center',
        'text-muted-foreground hover:text-foreground hover:bg-accent',
        'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
    >
      <motion.div
        key={isDark ? 'moon' : 'sun'}
        initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
        transition={{ duration: 0.2 }}
      >
        {isDark ? (
          <Sun className="w-4 h-4" aria-hidden="true" />
        ) : (
          <Moon className="w-4 h-4" aria-hidden="true" />
        )}
      </motion.div>
    </button>
  );
}
