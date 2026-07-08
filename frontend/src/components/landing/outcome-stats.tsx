'use client';

import { motion } from 'framer-motion';
import { BarChart3, Clock3, ShieldCheck, Sparkles } from 'lucide-react';
import { fadeUp, staggerContainer } from '@/lib/animations/variants';

const stats = [
  { icon: BarChart3, value: '+24%', label: 'average ATS lift after optimization' },
  { icon: Clock3, value: '8 min', label: 'to move from resume to tailored application' },
  { icon: Sparkles, value: '6 tools', label: 'connected in one career workspace' },
  { icon: ShieldCheck, value: 'Private', label: 'resume data stays inside your account' },
];

export function OutcomeStats() {
  return (
    <section className="relative overflow-hidden border-y border-slate-200/70 bg-white/70 px-6 py-10 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.035]" aria-label="Outcome stats">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" aria-hidden="true" />
      <motion.div
        className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-80px' }}
        variants={staggerContainer}
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.value}
            variants={fadeUp}
            className="group rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-[0_24px_70px_-46px_rgba(15,23,42,0.65)] transition-all duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_28px_80px_-46px_rgba(124,108,240,0.75)] dark:border-white/10 dark:bg-white/[0.055] dark:shadow-black/20 dark:hover:border-cyan-300/30"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/10 text-[#7C6CF0] dark:bg-cyan-300/10 dark:text-cyan-300">
              <stat.icon className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{stat.value}</div>
            <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
