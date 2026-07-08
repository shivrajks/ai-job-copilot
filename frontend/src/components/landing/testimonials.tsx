'use client';

import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { fadeUp, staggerContainer } from '@/lib/animations/variants';

const testimonials = [
  {
    identity: 'Candidate 01',
    role: 'Frontend engineering search',
    quote: 'The resume score finally made the gaps obvious. I rewrote two sections, matched the role better, and had a focused interview plan before applying.',
    result: '3 interview invites',
  },
  {
    identity: 'Candidate 02',
    role: 'Product management transition',
    quote: 'The tracker changed how I applied. Every role had a score, a draft, and a next action instead of disappearing into a spreadsheet.',
    result: '42 applications organized',
  },
  {
    identity: 'Candidate 03',
    role: 'Data analytics search',
    quote: 'The interview coach pulled questions from the exact job description. My answers sounded specific because they were tied to the role.',
    result: '92% match role',
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="relative overflow-hidden px-6 py-28" aria-label="Testimonials">
      <div className="absolute inset-0 bg-[#F6F8FF] dark:bg-[#050816]" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_35%,rgba(124,108,240,0.12),transparent_28%),radial-gradient(circle_at_82%_10%,rgba(6,214,160,0.10),transparent_25%)] dark:bg-[radial-gradient(circle_at_18%_35%,rgba(124,108,240,0.22),transparent_28%),radial-gradient(circle_at_82%_10%,rgba(6,214,160,0.14),transparent_25%)]" aria-hidden="true" />
      <motion.div
        className="relative mx-auto max-w-7xl"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-100px' }}
        variants={staggerContainer}
      >
        <motion.div variants={fadeUp} className="mb-14 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-[#7C6CF0] dark:text-cyan-300">Candidate signal</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              Less guessing. More qualified conversations.
            </h2>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
            ))}
            <span className="ml-2">Rated by job seekers</span>
          </div>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <motion.article key={testimonial.identity} variants={fadeUp} whileHover={{ y: -6, transition: { duration: 0.2 } }} className="relative overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white/[0.78] p-6 shadow-[0_28px_80px_-54px_rgba(15,23,42,0.75)] backdrop-blur-2xl transition-all duration-300 hover:border-violet-200 dark:border-white/10 dark:bg-white/[0.055] dark:shadow-black/30 dark:hover:border-cyan-300/30">
              <Quote className="absolute right-5 top-5 h-8 w-8 text-violet-200 dark:text-cyan-300/20" aria-hidden="true" />
              <div className="mb-8 flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-sm font-semibold text-white shadow-lg shadow-violet-500/20">
                  {testimonial.identity.slice(-2)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">{testimonial.identity}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{testimonial.role}</p>
                </div>
              </div>
              <blockquote className="text-sm leading-7 text-slate-600 dark:text-slate-300">&quot;{testimonial.quote}&quot;</blockquote>
              <div className="mt-6 inline-flex rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-[#7C6CF0] dark:bg-cyan-300/10 dark:text-cyan-300">
                {testimonial.result}
              </div>
            </motion.article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
