'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Brain, CheckCircle2, FileText, Mail, Mic, Sparkles, Target, Upload, Wand2, Zap } from 'lucide-react';
import type { ReactNode } from 'react';

const floatTransition = {
  repeat: Infinity,
  repeatType: 'reverse' as const,
  duration: 4,
  ease: 'easeInOut',
};

const workflow = [
  { icon: Upload, label: 'Upload' },
  { icon: Brain, label: 'Analyze' },
  { icon: Wand2, label: 'Tailor' },
  { icon: Mic, label: 'Prepare' },
];

function ScoreRing({ score = 92 }: { score?: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-200 dark:text-white/10" />
        <motion.circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="url(#atsGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, delay: 0.5, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="atsGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7C6CF0" />
            <stop offset="100%" stopColor="#06D6A0" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{score}</span>
        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">ATS</span>
      </div>
    </div>
  );
}

function MiniBar({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
        <span>{label}</span>
        <span className="font-semibold text-slate-700 dark:text-slate-200">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        <div className={`h-full rounded-full ${color}`} style={{ width: value }} />
      </div>
    </div>
  );
}

function FloatingCard({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
      transition={reduceMotion ? undefined : { ...floatTransition, delay }}
      className={`absolute z-20 hidden rounded-2xl border border-slate-200/80 bg-white/[0.88] p-3 shadow-[0_28px_70px_-38px_rgba(35,51,120,0.85)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#11182A]/[0.88] dark:shadow-black/40 sm:block ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function HeroVisual() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto h-[560px] w-full max-w-[760px] sm:h-[620px] lg:h-[650px]">
      <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7C6CF0]/20 blur-[130px] dark:bg-[#7C6CF0]/30" aria-hidden="true" />
      <div className="absolute right-0 top-24 h-[340px] w-[340px] rounded-full bg-[#06D6A0]/[0.16] blur-[110px] dark:bg-[#06D6A0]/20" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.35 }}
        className="absolute left-1/2 top-2 z-30 flex w-[min(94%,620px)] -translate-x-1/2 items-center justify-between rounded-full border border-slate-200/70 bg-white/[0.78] p-1.5 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.65)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.07]"
      >
        {workflow.map((step, index) => (
          <div key={step.label} className="flex min-w-0 flex-1 items-center">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full px-2 py-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-violet-500/10 text-[#7C6CF0] dark:bg-cyan-300/10 dark:text-cyan-300">
                <step.icon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {index < workflow.length - 1 && <div className="h-px w-5 bg-gradient-to-r from-violet-300/70 to-cyan-300/40" aria-hidden="true" />}
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 34, rotateX: 4, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        transition={{ duration: 0.75, delay: 0.2, ease: 'easeOut' }}
        className="absolute inset-x-0 top-20 mx-auto w-full max-w-[720px] rounded-[2rem] border border-white/80 bg-white/[0.86] shadow-[0_45px_130px_-54px_rgba(35,51,120,0.9)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#0A1020]/90 dark:shadow-[0_45px_130px_-54px_rgba(0,0,0,0.95)]"
      >
        <div className="flex items-center gap-2 border-b border-slate-200/70 px-5 py-3 dark:border-white/10">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <div className="ml-3 hidden flex-1 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-medium text-slate-400 dark:bg-white/5 dark:text-slate-500 sm:block">
            app.aijobcopilot.com / command-center
          </div>
          <div className="ml-auto rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-300">Live scan</div>
        </div>

        <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[0.58fr_0.42fr]">
          <div className="space-y-4">
            <div className="rounded-[1.35rem] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.045]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Candidate system</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">Application readiness</h3>
                </div>
                <ScoreRing />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200/70 bg-white p-3 dark:border-white/10 dark:bg-[#0C1326]">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-xl bg-violet-500/10 text-[#7C6CF0] dark:bg-cyan-300/10 dark:text-cyan-300">
                      <FileText className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">Resume intelligence</p>
                      <p className="text-[10px] text-slate-400">18 fixes found</p>
                    </div>
                  </div>
                  <MiniBar label="Keyword fit" value="84%" color="bg-gradient-to-r from-[#7C6CF0] to-[#06D6A0]" />
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-white p-3 dark:border-white/10 dark:bg-[#0C1326]">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                      <Target className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">Job match</p>
                      <p className="text-[10px] text-slate-400">Senior Product Engineer</p>
                    </div>
                  </div>
                  <MiniBar label="Match" value="91%" color="bg-gradient-to-r from-emerald-400 to-cyan-400" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {['Saved', 'Applied', 'Interview'].map((stage, index) => (
                <div key={stage} className="rounded-2xl border border-slate-200/70 bg-white p-3 dark:border-white/10 dark:bg-white/[0.045]">
                  <p className="text-[10px] font-medium text-slate-400">{stage}</p>
                  <div className="mt-2 space-y-1.5">
                    {Array.from({ length: index + 1 }).map((_, itemIndex) => (
                      <div key={itemIndex} className="h-2 rounded-full bg-gradient-to-r from-violet-200 to-cyan-200 dark:from-violet-400/50 dark:to-cyan-300/50" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.35rem] border border-slate-200/80 bg-white p-4 dark:border-white/10 dark:bg-white/[0.045]">
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#7C6CF0] text-white shadow-lg shadow-violet-500/25">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">AI assistant</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Next best action</p>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-slate-600 dark:bg-[#080D1A] dark:text-slate-300">
                Add measurable impact to the first two bullets, then regenerate the cover letter for this role.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-3 dark:border-white/10 dark:bg-white/[0.045]">
                <Mail className="mb-3 h-4 w-4 text-[#7C6CF0] dark:text-cyan-300" aria-hidden="true" />
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Cover letter</p>
                <p className="mt-1 text-[10px] text-slate-400">Ready in 38 sec</p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white p-3 dark:border-white/10 dark:bg-white/[0.045]">
                <Mic className="mb-3 h-4 w-4 text-emerald-500" aria-hidden="true" />
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Interview prep</p>
                <p className="mt-1 text-[10px] text-slate-400">8 prompts queued</p>
              </div>
            </div>

            <div className="rounded-[1.35rem] border border-slate-200/80 bg-slate-950 p-4 text-white shadow-[0_24px_70px_-38px_rgba(15,23,42,0.9)] dark:border-white/10 dark:bg-white/[0.06]">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold">Automation queue</p>
                <Zap className="h-4 w-4 text-cyan-300" aria-hidden="true" />
              </div>
              <div className="space-y-2 text-[11px] text-white/70">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> Resume tailored</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> Tracker updated</div>
                <div className="flex items-center gap-2"><span className="h-3.5 w-3.5 rounded-full border border-cyan-300/70" /> Follow-up drafted</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <FloatingCard className="left-0 top-28 w-[190px]" delay={0.15}>
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-500/10 text-[#7C6CF0] dark:bg-cyan-300/10 dark:text-cyan-300">
            <Upload className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">Resume upload</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Parsed in 4 sec</p>
          </div>
        </div>
      </FloatingCard>

      <FloatingCard className="right-0 top-36 w-[174px]" delay={0.55}>
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">ATS score</p>
        <div className="mt-2 flex items-end gap-2">
          <span className="text-3xl font-semibold text-slate-950 dark:text-white">92</span>
          <span className="pb-1 text-xs text-emerald-600 dark:text-emerald-300">+18 pts</span>
        </div>
      </FloatingCard>

      <FloatingCard className="bottom-16 left-8 w-[210px]" delay={0.35}>
        <p className="text-xs font-semibold text-slate-900 dark:text-white">Job match card</p>
        <MiniBar label="Role alignment" value="88%" color="bg-gradient-to-r from-[#7C6CF0] to-[#06D6A0]" />
      </FloatingCard>

      <FloatingCard className="bottom-8 right-5 w-[210px]" delay={0.75}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">Cover letter ready</p>
            <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">Tone: concise, confident</p>
          </div>
          <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden="true" />
        </div>
      </FloatingCard>

      {!reduceMotion && (
        <motion.div
          className="absolute right-10 top-24 z-30 hidden h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_28px_10px_rgba(103,232,249,0.42)] sm:block"
          animate={{ opacity: [0.35, 1, 0.35], scale: [1, 1.35, 1] }}
          transition={{ repeat: Infinity, duration: 3.4, ease: 'easeInOut' }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
