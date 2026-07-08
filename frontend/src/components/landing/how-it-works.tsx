'use client';

import { motion } from 'framer-motion';
import { BarChart3, FileText, Send, Upload } from 'lucide-react';
import { fadeUp, staggerContainer } from '@/lib/animations/variants';

const steps = [
  {
    icon: Upload,
    title: 'Import your resume',
    desc: 'Drop in your resume once. The workspace extracts skills, role history, outcomes, and target seniority.',
    metric: '04 sec parse',
  },
  {
    icon: BarChart3,
    title: 'Read the job signal',
    desc: 'Paste a role and see where your profile fits, where it is weak, and what the ATS is likely to reward.',
    metric: '92 target score',
  },
  {
    icon: FileText,
    title: 'Tailor the application',
    desc: 'Generate resume improvements and a cover letter that reuse the strongest evidence from your experience.',
    metric: '1 connected draft',
  },
  {
    icon: Send,
    title: 'Track and prepare',
    desc: 'Move the opportunity through your pipeline, then rehearse interview answers with role-specific prompts.',
    metric: '8 prep prompts',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden px-6 py-28 scroll-mt-20" aria-label="How it works">
      <div className="absolute inset-0 bg-[#F6F8FF] dark:bg-[#050816]" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/60 to-transparent dark:via-cyan-300/30" aria-hidden="true" />
      <motion.div
        className="relative mx-auto max-w-7xl"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-100px' }}
        variants={staggerContainer}
      >
        <motion.div variants={fadeUp} className="mb-16 grid gap-6 lg:grid-cols-[0.78fr_1fr] lg:items-end">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-[#7C6CF0] dark:text-cyan-300">Operating system</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              A job search workflow that stays connected.
            </h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            The product is designed around one sequence: understand the role, improve the application, send with confidence, and keep the next step visible.
          </p>
        </motion.div>

        <div className="relative grid gap-4 lg:grid-cols-4">
          <div className="absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-violet-300/20 via-violet-400/70 to-cyan-300/50 lg:block" aria-hidden="true" />
          {steps.map((step, index) => (
            <motion.div key={step.title} variants={fadeUp} className="relative rounded-[1.75rem] border border-slate-200/80 bg-white/75 p-5 shadow-[0_28px_80px_-55px_rgba(15,23,42,0.75)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055] dark:shadow-black/30">
              <div className="mb-8 flex items-center justify-between">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-violet-500/10 text-[#7C6CF0] dark:bg-cyan-300/10 dark:text-cyan-300">
                  <step.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-400 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-500">
                  0{index + 1}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{step.desc}</p>
              <div className="mt-6 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-white/[0.07] dark:text-slate-300">
                {step.metric}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
