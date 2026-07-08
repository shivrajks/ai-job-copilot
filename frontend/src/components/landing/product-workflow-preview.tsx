'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, FileText, Mail, Mic, Target, Upload } from 'lucide-react';
import { fadeUp, staggerContainer } from '@/lib/animations/variants';

const stages = [
  { icon: Upload, label: 'Upload', detail: 'Resume parsed' },
  { icon: Target, label: 'Score', detail: 'ATS gaps found' },
  { icon: FileText, label: 'Tailor', detail: 'Keywords aligned' },
  { icon: Mail, label: 'Send', detail: 'Cover letter ready' },
  { icon: Mic, label: 'Prepare', detail: 'Interview set' },
];

const trackerRows = [
  { role: 'Senior Frontend Engineer', status: 'Interview', score: '92%', color: 'bg-emerald-400' },
  { role: 'Product Engineer', status: 'Tailoring', score: '84%', color: 'bg-violet-400' },
  { role: 'Design Systems Lead', status: 'Saved', score: '76%', color: 'bg-sky-400' },
];

export function ProductWorkflowPreview() {
  return (
    <section id="workflow" className="relative overflow-hidden px-6 py-28 scroll-mt-20" aria-label="Product workflow preview">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(124,108,240,0.14),transparent_34%),radial-gradient(circle_at_80%_70%,rgba(6,214,160,0.12),transparent_30%)] dark:bg-[radial-gradient(circle_at_20%_10%,rgba(124,108,240,0.24),transparent_34%),radial-gradient(circle_at_82%_74%,rgba(6,214,160,0.16),transparent_30%)]" aria-hidden="true" />
      <motion.div
        className="relative mx-auto max-w-7xl"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-100px' }}
        variants={staggerContainer}
      >
        <motion.div variants={fadeUp} className="mx-auto mb-14 max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-[#7C6CF0] dark:text-cyan-300">Workflow preview</p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            One continuous path from resume to interview.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
            AI Job Copilot keeps every application artifact connected, so the resume, match score, cover letter, tracker, and prep notes all move together.
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-4 shadow-[0_35px_120px_-65px_rgba(35,51,120,0.8)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055] dark:shadow-black/40 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-[#080D1A]/80">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Active workflow</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">Candidate command lane</h3>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300">Live</span>
              </div>

              <div className="space-y-3">
                {stages.map((stage, index) => (
                  <div key={stage.label} className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.055]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/10 text-[#7C6CF0] dark:bg-cyan-300/10 dark:text-cyan-300">
                      <stage.icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{stage.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{stage.detail}</p>
                    </div>
                    {index < stages.length - 1 ? <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600" aria-hidden="true" /> : <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-inner dark:border-white/10 dark:bg-[#0A1020]">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">Application tracker</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Ranked by match confidence</p>
                </div>
                <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 dark:border-white/10 dark:text-slate-300">3 active</span>
              </div>

              <div className="space-y-3">
                {trackerRows.map((row) => (
                  <div key={row.role} className="grid grid-cols-[1fr_auto] gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.05]">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${row.color}`} />
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{row.role}</p>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{row.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-950 dark:text-white">{row.score}</p>
                      <p className="text-xs text-slate-400">match</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 p-4 text-white shadow-[0_20px_55px_-28px_rgba(124,108,240,0.9)]">
                  <p className="text-xs text-white/70">Cover letter</p>
                  <p className="mt-1 text-sm font-semibold">Ready for review</p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-300/20 dark:bg-emerald-300/10">
                  <p className="text-xs text-emerald-700 dark:text-emerald-200">Interview prep</p>
                  <p className="mt-1 text-sm font-semibold text-emerald-950 dark:text-emerald-50">8 questions queued</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
