'use client';

import { motion } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  desc: string;
  accent: string;
  visual: ReactNode;
  wide?: boolean;
}

export function FeatureCard({ icon: Icon, eyebrow, title, desc, accent, visual, wide }: FeatureCardProps) {
  const accentStyle = {
    '--feature-accent': accent,
  } as CSSProperties;

  return (
    <motion.article
      style={accentStyle}
      className={cn(
        'group relative flex min-h-[360px] flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white/[0.78] p-5 shadow-[0_28px_80px_-54px_rgba(15,23,42,0.75)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1.5 hover:border-violet-200 hover:shadow-[0_34px_95px_-54px_rgba(124,108,240,0.9)] dark:border-white/10 dark:bg-white/[0.055] dark:shadow-black/30 dark:hover:border-cyan-300/30',
        wide && 'lg:col-span-2'
      )}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
    >
      <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: `radial-gradient(circle at 24% 12%, ${accent}22, transparent 38%)` }} aria-hidden="true" />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-400">
            {eyebrow}
          </div>
          <h3 className="max-w-md text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{title}</h3>
          <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600 dark:text-slate-300">{desc}</p>
        </div>
        <div
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl shadow-sm"
          style={{ background: `linear-gradient(135deg, ${accent}1F, ${accent}0A)`, color: accent }}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <div className="relative z-10 mt-auto pt-8">
        {visual}
      </div>
    </motion.article>
  );
}
