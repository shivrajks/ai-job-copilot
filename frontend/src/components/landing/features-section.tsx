'use client';

import { motion } from 'framer-motion';
import { BarChart3, FileText, LayoutDashboard, Mail, Mic, Target } from 'lucide-react';
import { FeatureCard } from './feature-card';
import { fadeUp, staggerContainer } from '@/lib/animations/variants';

function ResumeVisual() {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-[#080D1A]/80">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-900 dark:text-white">Resume scan</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Impact bullets highlighted</p>
        </div>
        <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-[10px] font-semibold text-[#7C6CF0] dark:bg-cyan-300/10 dark:text-cyan-300">18 fixes</span>
      </div>
      <div className="space-y-2">
        {[82, 66, 94].map((width, index) => (
          <div key={index} className="h-3 rounded-full bg-white shadow-sm dark:bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-[#7C6CF0] to-[#06D6A0]" style={{ width: `${width}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {['React', 'Metrics', 'Leadership'].map((chip) => (
          <span key={chip} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-medium text-slate-500 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300">{chip}</span>
        ))}
      </div>
    </div>
  );
}

function AtsVisual() {
  return (
    <div className="flex items-center gap-5 rounded-3xl border border-slate-200/80 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-[#080D1A]/80">
      <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-200 dark:text-white/10" />
        <circle cx="50" cy="50" r="38" fill="none" stroke="#06D6A0" strokeWidth="10" strokeLinecap="round" strokeDasharray="238" strokeDashoffset="28" />
      </svg>
      <div>
        <p className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">88</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">ATS readiness</p>
        <p className="mt-3 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">+21 after rewrite</p>
      </div>
    </div>
  );
}

function MatchVisual() {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-[#080D1A]/80">
      {[
        { label: 'Role keywords', value: 91, color: 'from-[#7C6CF0] to-indigo-400' },
        { label: 'Experience fit', value: 84, color: 'from-[#06D6A0] to-cyan-400' },
        { label: 'Skill gaps', value: 68, color: 'from-amber-300 to-orange-400' },
      ].map((row) => (
        <div key={row.label} className="mb-3 last:mb-0">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">{row.label}</span>
            <span className="font-semibold text-slate-900 dark:text-white">{row.value}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white dark:bg-white/10">
            <div className={`h-full rounded-full bg-gradient-to-r ${row.color}`} style={{ width: `${row.value}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function LetterVisual() {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-[#080D1A]/80">
      <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-white/[0.06]">
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-[10px] font-semibold text-[#7C6CF0] dark:bg-cyan-300/10 dark:text-cyan-300">Tailored</span>
          <span className="text-[10px] text-slate-400">38 sec</span>
        </div>
        <div className="space-y-2">
          <div className="h-2 rounded-full bg-slate-200 dark:bg-white/15" />
          <div className="h-2 w-5/6 rounded-full bg-slate-100 dark:bg-white/10" />
          <div className="h-2 w-2/3 rounded-full bg-slate-100 dark:bg-white/10" />
        </div>
      </div>
    </div>
  );
}

function InterviewVisual() {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-[#080D1A]/80">
      <div className="flex h-16 items-end gap-1.5">
        {[36, 70, 44, 86, 58, 96, 50, 78, 42, 62].map((height, index) => (
          <div key={index} className="flex-1 rounded-full bg-gradient-to-t from-violet-500 to-cyan-300" style={{ height: `${height}%` }} />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] font-medium text-slate-500 dark:text-slate-400">
        <span className="rounded-full bg-white px-2 py-1 dark:bg-white/10">Clarity</span>
        <span className="rounded-full bg-white px-2 py-1 dark:bg-white/10">Structure</span>
        <span className="rounded-full bg-white px-2 py-1 dark:bg-white/10">Impact</span>
      </div>
    </div>
  );
}

function TrackerVisual() {
  return (
    <div className="grid grid-cols-3 gap-2 rounded-3xl border border-slate-200/80 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-[#080D1A]/80">
      {[
        { label: 'Saved', count: 2, color: 'bg-slate-300 dark:bg-slate-500' },
        { label: 'Applied', count: 3, color: 'bg-violet-400' },
        { label: 'Interview', count: 2, color: 'bg-emerald-400' },
      ].map((column) => (
        <div key={column.label} className="rounded-2xl bg-white p-2 dark:bg-white/[0.06]">
          <p className="mb-2 text-[10px] font-semibold text-slate-500 dark:text-slate-400">{column.label}</p>
          <div className="space-y-1.5">
            {Array.from({ length: column.count }).map((_, index) => (
              <div key={index} className={`h-7 rounded-xl ${column.color}`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const features = [
  {
    icon: FileText,
    eyebrow: 'Resume Intelligence',
    title: 'Turn a static resume into a hiring signal map.',
    desc: 'Parse skills, outcomes, seniority, gaps, and keyword density before a recruiter or ATS ever sees it.',
    accent: '#7C6CF0',
    visual: <ResumeVisual />,
    wide: true,
  },
  {
    icon: BarChart3,
    eyebrow: 'ATS Score Engine',
    title: 'Know the score before you apply.',
    desc: 'Measure formatting, keyword alignment, role fit, and section completeness with direct fixes.',
    accent: '#06D6A0',
    visual: <AtsVisual />,
  },
  {
    icon: Target,
    eyebrow: 'Job Match Analysis',
    title: 'Compare every role against your real profile.',
    desc: 'See where you are strong, where you are exposed, and what to improve for each application.',
    accent: '#3B82F6',
    visual: <MatchVisual />,
  },
  {
    icon: Mail,
    eyebrow: 'Cover Letter Generator',
    title: 'Create tailored letters without starting over.',
    desc: 'Generate concise, role-specific drafts that reuse the strongest evidence from your resume.',
    accent: '#8B5CF6',
    visual: <LetterVisual />,
  },
  {
    icon: Mic,
    eyebrow: 'Interview Coach',
    title: 'Practice answers that sound specific, not scripted.',
    desc: 'Get questions, structure feedback, and follow-up prompts based on the job you are chasing.',
    accent: '#F97316',
    visual: <InterviewVisual />,
  },
  {
    icon: LayoutDashboard,
    eyebrow: 'Application Tracker',
    title: 'Keep every opportunity moving.',
    desc: 'Track status, notes, next actions, and AI-generated artifacts in a single pipeline.',
    accent: '#14B8A6',
    visual: <TrackerVisual />,
    wide: true,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative overflow-hidden px-6 py-28 scroll-mt-20" aria-label="Features">
      <div className="absolute inset-0 bg-white/55 dark:bg-[#070B16]" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(124,108,240,0.13),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(59,130,246,0.11),transparent_28%)] dark:bg-[radial-gradient(circle_at_16%_18%,rgba(124,108,240,0.26),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(6,214,160,0.14),transparent_28%)]" aria-hidden="true" />

      <motion.div
        className="relative mx-auto max-w-7xl"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-100px' }}
        variants={staggerContainer}
      >
        <motion.div variants={fadeUp} className="mb-14 max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-[#7C6CF0] dark:text-cyan-300">Feature showcase</p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            Premium modules for every high-stakes application.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
            Each tool has its own intelligence, but the value compounds because every module shares the same career context.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <motion.div key={feature.eyebrow} variants={fadeUp} className={feature.wide ? 'lg:col-span-2' : undefined}>
              <FeatureCard {...feature} wide={false} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
