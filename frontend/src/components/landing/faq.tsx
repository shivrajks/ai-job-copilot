'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fadeUp, staggerContainer } from '@/lib/animations/variants';

const faqs = [
  {
    question: 'What is AI Job Copilot?',
    answer: 'AI Job Copilot is an all-in-one job search workspace that helps you optimize your resume, match job descriptions, generate cover letters, practice interviews, and track applications in one place.',
  },
  {
    question: 'How does ATS scoring work?',
    answer: 'The score compares your resume with a job description across keyword coverage, skills alignment, formatting compatibility, and section completeness. It then gives direct improvements you can apply before submitting.',
  },
  {
    question: 'Can I track my job applications?',
    answer: 'Yes. The tracker organizes roles by status, notes, reminders, match score, and generated assets, so every opportunity has a clear next action.',
  },
  {
    question: 'Is my resume data safe?',
    answer: 'Your data is encrypted in transit and at rest. We do not sell your resume data, and you can delete your account and associated data at any time.',
  },
  {
    question: 'Is there a free plan?',
    answer: 'Yes. The Free plan includes limited AI requests, resume uploads, job analyses, and tracked applications. Pro unlocks unlimited AI requests and the interview simulator.',
  },
];

function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const id = `faq-${question.replace(/\s+/g, '-').toLowerCase()}`;
  const buttonId = `${id}-button`;

  return (
    <div className="border-b border-slate-200/70 last:border-0 dark:border-white/10">
      <h3>
        <button
          id={buttonId}
          onClick={onToggle}
          className="flex w-full items-center justify-between rounded-xl px-2 py-5 text-left text-sm font-semibold text-slate-950 transition-colors hover:text-[#7C6CF0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C6CF0] focus-visible:ring-offset-2 dark:text-white dark:hover:text-cyan-300 dark:focus-visible:ring-offset-[#070B16]"
          aria-expanded={isOpen}
          aria-controls={id}
        >
          {question}
          <ChevronDown
            className={cn('ml-4 h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 dark:text-slate-500', isOpen && 'rotate-180')}
            aria-hidden="true"
          />
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={id}
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            role="region"
            aria-labelledby={buttonId}
          >
            <div className="px-2 pb-5 text-sm leading-7 text-slate-600 dark:text-slate-300">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative overflow-hidden px-6 py-28 scroll-mt-20" aria-label="Frequently asked questions">
      <div className="absolute inset-0 bg-[#F6F8FF] dark:bg-[#050816]" aria-hidden="true" />
      <motion.div
        className="relative mx-auto max-w-4xl"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-100px' }}
        variants={staggerContainer}
      >
        <motion.div variants={fadeUp} className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-[#7C6CF0] dark:text-cyan-300">FAQ</p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">Questions before you start?</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">A quick read on how the product works, what is included, and how your data is handled.</p>
        </motion.div>

        <motion.div variants={fadeUp} className="rounded-[1.75rem] border border-slate-200/80 bg-white/[0.78] p-4 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.8)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055] dark:shadow-black/30 sm:p-6">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
