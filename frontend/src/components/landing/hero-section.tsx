'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, PlayCircle, Shield, Sparkles } from 'lucide-react';
import { PillarBadge } from './pillar-badge';
import { HeroVisual } from './hero-visual';
import { fadeUp, staggerContainer } from '@/lib/animations/variants';

const trustSignals = [
  { icon: Shield, label: 'Private by design' },
  { icon: CheckCircle, label: 'No credit card' },
  { icon: Sparkles, label: 'ATS-ready outputs' },
];

export function HeroSection() {
  return (
    <section className="relative isolate px-6 pb-16 pt-28 lg:min-h-screen lg:pb-12 lg:pt-24" aria-label="Hero">
      <div className="absolute inset-0 -z-10 bg-[#F6F8FF] transition-colors duration-500 dark:bg-[#050816]" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_18%,rgba(124,108,240,0.20),transparent_32%),radial-gradient(circle_at_86%_22%,rgba(6,214,160,0.18),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.82),rgba(246,248,255,0.86)_45%,rgba(246,248,255,1))] dark:bg-[radial-gradient(circle_at_16%_14%,rgba(124,108,240,0.38),transparent_34%),radial-gradient(circle_at_82%_22%,rgba(6,214,160,0.22),transparent_30%),linear-gradient(180deg,rgba(5,8,22,0.92),rgba(9,13,28,0.92)_46%,rgba(5,8,22,1))]" aria-hidden="true" />
      <div
        className="absolute inset-0 -z-10 opacity-[0.42] dark:opacity-[0.22]"
        style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.12) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.88fr_1.12fr] xl:gap-14">
        <motion.div initial="initial" animate="animate" variants={staggerContainer} className="max-w-2xl lg:pt-10">
          <motion.div variants={fadeUp}>
            <PillarBadge>AI career command center</PillarBadge>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mt-6 max-w-2xl text-5xl font-semibold tracking-[-0.055em] text-slate-950 dark:text-white sm:text-6xl lg:text-7xl lg:leading-[0.92]"
          >
            Apply smarter.<br />Interview better.<br />Get hired faster.
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            AI Job Copilot turns your resume, job descriptions, cover letters, interviews, and application tracker into one guided system for getting hired faster.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="/auth/register"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#7C6CF0] px-6 py-3 text-sm font-semibold text-white shadow-[0_24px_60px_-26px_rgba(124,108,240,0.95)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#6B5CE0] hover:shadow-[0_30px_70px_-24px_rgba(124,108,240,0.95)] active:translate-y-0"
            >
              Start free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
            <a
              href="#workflow"
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-slate-200/80 bg-white/75 px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.07] dark:text-slate-100 dark:hover:border-cyan-300/40 dark:hover:text-white"
            >
              <PlayCircle className="h-4 w-4 text-[#7C6CF0] transition-transform group-hover:scale-110 dark:text-cyan-300" aria-hidden="true" />
              See workflow
            </a>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
            {trustSignals.map((signal) => (
              <span key={signal.label} className="inline-flex items-center gap-1.5">
                <signal.icon className="h-4 w-4 text-emerald-500 dark:text-emerald-300" aria-hidden="true" />
                {signal.label}
              </span>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.18, ease: 'easeOut' }}
          className="relative lg:-mr-3 xl:-mr-6"
        >
          <HeroVisual />
        </motion.div>
      </div>
    </section>
  );
}
