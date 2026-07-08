'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PricingCard } from './pricing-card';
import { fadeUp, staggerContainer } from '@/lib/animations/variants';
import type { PricingTier } from './pricing-card';
import { cn } from '@/lib/utils';

interface PricingSectionProps {
  tiers: PricingTier[];
}

export function PricingSection({ tiers }: PricingSectionProps) {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="relative overflow-hidden px-6 py-28 scroll-mt-20" aria-label="Pricing">
      <div className="absolute inset-0 bg-white/65 dark:bg-[#070B16]" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,108,240,0.16),transparent_34%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(124,108,240,0.28),transparent_34%)]" aria-hidden="true" />
      <motion.div
        className="relative mx-auto max-w-5xl"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-100px' }}
        variants={staggerContainer}
      >
        <motion.div variants={fadeUp} className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-[#7C6CF0] dark:text-cyan-300">Pricing</p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">Start focused. Scale when the search gets serious.</h2>
          <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">Try the core workflow for free, then unlock unlimited generation, interview prep, and priority processing.</p>
        </motion.div>

        <motion.div variants={fadeUp} className="mb-12 flex items-center justify-center gap-3">
          <span className={cn('text-sm transition-colors', !yearly ? 'font-semibold text-slate-950 dark:text-white' : 'text-slate-500 dark:text-slate-400')}>Monthly</span>
          <button
            type="button"
            role="switch"
            aria-checked={yearly}
            aria-label="Toggle yearly billing"
            onClick={() => setYearly(!yearly)}
            className={cn(
              'relative h-8 w-14 rounded-full border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C6CF0] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#070B16]',
              yearly ? 'border-[#7C6CF0] bg-[#7C6CF0] dark:border-cyan-300 dark:bg-cyan-300' : 'border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.07]'
            )}
          >
            <span className={cn('absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300 dark:bg-slate-950', yearly && 'translate-x-6')} />
          </button>
          <span className={cn('text-sm transition-colors', yearly ? 'font-semibold text-slate-950 dark:text-white' : 'text-slate-500 dark:text-slate-400')}>
            Yearly
            <span className="ml-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">Save 17%</span>
          </span>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {tiers.map((tier) => (
            <motion.div key={tier.name} variants={fadeUp}>
              <PricingCard tier={tier} yearly={yearly} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
