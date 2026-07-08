'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/shared/logo';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { navigation } from '@/lib/constants/navigation';

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.activeElement as HTMLElement | null;
    drawerRef.current?.focus();
    return () => prev?.focus();
  }, [mobileOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 transition-all duration-300 ${
        scrolled
          ? 'border-b border-slate-200/70 bg-white/[0.82] shadow-[0_18px_55px_-36px_rgba(15,23,42,0.55)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#070B16]/[0.82] dark:shadow-black/20'
          : 'bg-white/60 backdrop-blur-xl dark:bg-[#070B16]/[0.45]'
      }`}
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Logo size="md" />
        </Link>

        <nav
          className="hidden md:flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400"
          role="navigation"
          aria-label="Site navigation"
        >
          {navigation.landing.map((item) => (
            <a
                key={item.href}
                href={item.href}
                className="relative rounded-full px-3 py-2 transition-all duration-200 hover:bg-slate-100/70 hover:text-slate-950 dark:hover:bg-white/[0.07] dark:hover:text-white"
              >
                {item.label}
              </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle variant="landing" />
          <a
            href="/auth/login"
            className="hidden px-3 py-2 text-sm text-slate-500 transition-colors hover:text-slate-950 dark:text-slate-400 dark:hover:text-white sm:inline"
          >
            Login
          </a>
          <a
            href="/auth/register"
            className="hidden items-center gap-1.5 rounded-full bg-[#7C6CF0] px-4 py-2 text-sm font-medium text-white shadow-[0_16px_35px_-20px_rgba(124,108,240,0.9)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#6B5CE0] hover:shadow-[0_20px_42px_-18px_rgba(124,108,240,0.9)] sm:inline-flex"
          >
            Get Started
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
          <button
            ref={toggleRef}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/70 bg-white/75 text-slate-600 transition-all hover:bg-slate-100/70 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.07] dark:text-slate-300 dark:hover:bg-white/[0.1] dark:hover:text-white md:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-slate-950/[0.45] backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.nav
              ref={drawerRef}
              tabIndex={-1}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 right-0 top-16 z-50 flex w-72 flex-col gap-1 border-l border-slate-200 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-[#070B16]/95 md:hidden"
              role="navigation"
              aria-label="Mobile navigation"
            >
              {navigation.landing.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm text-slate-600 transition-all hover:bg-slate-100/70 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/[0.07] dark:hover:text-white"
                >
                  {item.label}
                </a>
              ))}
              <div className="my-3 flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/[0.05]">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Theme</span>
                <ThemeToggle variant="landing" />
              </div>
              <hr className="my-3 border-slate-200 dark:border-white/10" />
              <a
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm text-slate-600 transition-all hover:bg-slate-100/70 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/[0.07] dark:hover:text-white"
              >
                Login
              </a>
              <a
                href="/auth/register"
                onClick={() => setMobileOpen(false)}
                className="mt-1 rounded-full bg-[#7C6CF0] px-4 py-2.5 text-center text-sm font-medium text-white shadow-[0_18px_42px_-22px_rgba(124,108,240,0.95)] transition-all hover:bg-[#6B5CE0]"
              >
                Get Started
              </a>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
