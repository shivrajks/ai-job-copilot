'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export interface PricingTier {
  name: string;
  price: string;
  period: string;
  yearlyPrice?: string;
  features: string[];
  cta: string;
  ctaHref: string;
  popular?: boolean;
  variant?: 'default' | 'outline';
}

interface PricingCardProps {
  tier: PricingTier;
  yearly?: boolean;
}

export function PricingCard({ tier, yearly }: PricingCardProps) {
  const displayPrice = yearly && tier.yearlyPrice ? tier.yearlyPrice : tier.price;
  const displayPeriod = yearly ? '/yr' : tier.period;

  return (
    <motion.article
      layout
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className={
        tier.popular
          ? 'relative overflow-hidden rounded-[1.75rem] border border-violet-300/70 bg-white/[0.85] p-8 shadow-[0_38px_110px_-58px_rgba(124,108,240,0.95)] ring-2 ring-[#7C6CF0]/70 backdrop-blur-2xl dark:border-cyan-300/25 dark:bg-white/[0.075] dark:ring-cyan-300/30 dark:shadow-black/40'
          : 'relative overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white/[0.72] p-8 shadow-[0_28px_80px_-56px_rgba(15,23,42,0.7)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055] dark:shadow-black/30'
      }
    >
      {tier.popular && (
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#7C6CF0] via-sky-400 to-[#06D6A0]" aria-hidden="true" />
      )}
      {tier.popular && (
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="mb-5 inline-flex rounded-full bg-[#7C6CF0] px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-violet-500/20 dark:bg-cyan-300 dark:text-slate-950"
        >
          Most popular
        </motion.div>
      )}
      <h3 className="text-xl font-semibold text-slate-950 dark:text-white">{tier.name}</h3>
      <motion.p
        key={displayPrice}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white"
      >
        {displayPrice}
        <span className="ml-1 text-sm font-medium text-slate-400 dark:text-slate-500">{displayPeriod}</span>
      </motion.p>
      {yearly && tier.yearlyPrice && (
        <p className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-300">
          Save {Math.round((1 - parseInt(tier.yearlyPrice.replace('$', '')) / (parseInt(tier.price.replace('$', '')) * 12)) * 100)}% with yearly billing
        </p>
      )}

      <ul className="mt-7 space-y-3 text-sm text-slate-600 dark:text-slate-300">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#7C6CF0] dark:text-cyan-300" aria-hidden="true" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <a
        href={tier.ctaHref}
        className={
          tier.variant === 'outline'
            ? 'mt-8 inline-flex w-full items-center justify-center rounded-full border border-slate-200/80 bg-white/75 px-4 py-3 text-sm font-semibold text-slate-800 transition-all hover:border-violet-200 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-100 dark:hover:border-cyan-300/40 dark:hover:bg-white/[0.09]'
            : 'mt-8 inline-flex w-full items-center justify-center rounded-full bg-[#7C6CF0] px-4 py-3 text-sm font-semibold text-white shadow-[0_22px_60px_-28px_rgba(124,108,240,0.95)] transition-all hover:-translate-y-0.5 hover:bg-[#6B5CE0] dark:bg-cyan-300 dark:text-slate-950 dark:hover:bg-cyan-200'
        }
      >
        {tier.cta}
      </a>
    </motion.article>
  );
}
