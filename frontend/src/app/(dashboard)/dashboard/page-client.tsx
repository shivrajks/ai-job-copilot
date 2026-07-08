'use client';

import { useEffect, useMemo, useCallback, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  FileText, Target, Mic, Plus,
  Clock, RefreshCw,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { ErrorState } from '@/components/feedback/error-state';
import { Skeleton } from '@/components/feedback/skeleton';
import { DashboardResumeWidget } from '@/components/features/dashboard-resume-widget';
import { DashboardApplicationWidget } from '@/components/features/dashboard-application-widget';
import { DashboardJobDescriptionWidget } from '@/components/features/dashboard-jd-widget';
import { DashboardRecentApplications } from '@/components/features/dashboard-recent-applications';
import { DashboardRecentJobDescriptions } from '@/components/features/dashboard-recent-jds';
import { fadeUp, staggerContainer } from '@/lib/animations/variants';
import { useAuthStore } from '@/store/auth';
import { useApplicationStore } from '@/store/applications';
import { useJobDescriptionStore } from '@/store/job-descriptions';
import { cn } from '@/lib/utils';

function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = value;
    const duration = 400;
    const startTime = performance.now();
    let rafId: number;

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.round(progress * end));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [inView, value]);

  return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

const quickActions = [
  {
    href: '/resumes',
    label: 'Upload Resume',
    desc: 'PDF or DOCX',
    icon: Plus,
    color: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  {
    href: '/jobs',
    label: 'Analyze Job',
    desc: 'Paste JD or URL',
    icon: Target,
    color: 'bg-sky-500/10',
    iconColor: 'text-sky-500',
  },
  {
    href: '/interviews',
    label: 'Practice Interview',
    desc: 'AI-generated questions',
    icon: Mic,
    color: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
  },
];

interface StatCard {
  label: string;
  value: string;
  color: string;
  id: string;
}

export default function DashboardPageClient() {
  const user = useAuthStore((s) => s.user);
  const hasFetchedApps = useRef(false);
  const hasFetchedJds = useRef(false);

  const applications = useApplicationStore((s) => s.applications);
  const appIsLoading = useApplicationStore((s) => s.isLoading);
  const appError = useApplicationStore((s) => s.error);
  const fetchApplications = useApplicationStore((s) => s.fetchApplications);
  const clearAppError = useApplicationStore((s) => s.clearError);

  const fetchJobDescriptions = useJobDescriptionStore((s) => s.fetchJobDescriptions);
  const jdIsLoading = useJobDescriptionStore((s) => s.isLoading);

  useEffect(() => {
    if (!hasFetchedApps.current && applications.length === 0 && !appIsLoading) {
      hasFetchedApps.current = true;
      fetchApplications();
    }
  }, [fetchApplications, applications.length, appIsLoading]);

  useEffect(() => {
    if (!hasFetchedJds.current && !jdIsLoading) {
      hasFetchedJds.current = true;
      fetchJobDescriptions();
    }
  }, [fetchJobDescriptions, jdIsLoading]);

  const handleRefresh = useCallback(() => {
    fetchApplications();
    fetchJobDescriptions();
  }, [fetchApplications, fetchJobDescriptions]);

  const stats: StatCard[] = useMemo(() => {
    const total = applications.length;
    const interviews = applications.filter(
      (a) => a.stage === 'PHONE_SCREEN' || a.stage === 'TECHNICAL_INTERVIEW' || a.stage === 'ONSITE'
    ).length;
    const offers = applications.filter((a) => a.stage === 'OFFER').length;

    const totalApplied = applications.filter(
      (a) => a.stage !== 'SAVED' && a.stage !== 'WITHDRAWN'
    ).length;
    const responded = applications.filter(
      (a) =>
        a.stage === 'PHONE_SCREEN' ||
        a.stage === 'TECHNICAL_INTERVIEW' ||
        a.stage === 'ONSITE' ||
        a.stage === 'OFFER' ||
        a.stage === 'REJECTED'
    ).length;
    const rate = totalApplied > 0 ? Math.round((responded / totalApplied) * 100) : 0;

    return [
      { label: 'Applied', value: String(total), color: 'text-primary', id: 'stat-applied' },
      { label: 'Interviews', value: String(interviews), color: 'text-sky-500', id: 'stat-interviews' },
      { label: 'Offers', value: String(offers), color: 'text-emerald-500', id: 'stat-offers' },
      { label: 'Response Rate', value: `${rate}%`, color: 'text-amber-500', id: 'stat-rate' },
    ];
  }, [applications]);

  return (
    <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        {/* Welcome */}
        <motion.div variants={fadeUp}>
          <PageHeader
            title={<>Good morning, {user?.fullName?.split(' ')[0] || 'there'} <span aria-hidden="true">👋</span></>}
            description="Here's your job search overview"
            actions={
              <button
                onClick={handleRefresh}
                disabled={appIsLoading}
                className={cn(
                  'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors shrink-0',
                  'border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                aria-label="Refresh dashboard data"
              >
                <RefreshCw className={cn('w-4 h-4', appIsLoading && 'animate-spin')} />
                Refresh
              </button>
            }
          />
        </motion.div>

        {/* Global error banner */}
        {appError && (
          <motion.div variants={fadeUp} className="mb-6">
            <ErrorState
              title="Error loading applications"
              message={appError}
              onRetry={clearAppError}
            />
          </motion.div>
        )}

        {/* Stats */}
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8"
          aria-busy={appIsLoading && applications.length === 0}
        >
          {appIsLoading && applications.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass rounded-xl p-4 md:p-5 space-y-3">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-7 w-12" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))
          ) : (
            stats.map((stat) => {
              const numVal = parseInt(stat.value.replace('%', ''));
              const isPercent = stat.value.includes('%');
              return (
                <motion.div
                  key={stat.id}
                  className="glass rounded-xl p-4 md:p-5 group"
                  aria-label={`${stat.label}: ${stat.value}`}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                >
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    {stat.label}
                  </p>
                  <p className={cn('text-xl md:text-2xl font-bold font-mono', stat.color)}>
                    <AnimatedCounter value={numVal} suffix={isPercent ? '%' : ''} />
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">current total</p>
                </motion.div>
              );
            })
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeUp} className="glass rounded-xl p-4 md:p-6 mb-6 md:mb-8">
          <h2 className="font-semibold mb-3 md:mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            {quickActions.map((action) => (
              <motion.a
                key={action.label}
                href={action.href}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                className="flex items-center gap-3 p-3 md:p-4 rounded-lg border border-border hover:bg-accent transition-colors group"
              >
                <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110`}>
                  <action.icon className={`w-5 h-5 ${action.iconColor}`} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Widgets grid */}
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8"
        >
          {/* Resume Overview */}
          <motion.div
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="glass rounded-xl p-4 md:p-6"
            role="region"
            aria-labelledby="widget-resume-heading"
          >
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" aria-hidden="true" />
              <h2 id="widget-resume-heading" className="font-semibold">Resume</h2>
            </div>
            <DashboardResumeWidget />
          </motion.div>

          {/* Application Progress */}
          <motion.div
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="glass rounded-xl p-4 md:p-6"
            role="region"
            aria-labelledby="widget-apps-heading"
          >
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-sky-500" aria-hidden="true" />
              <h2 id="widget-apps-heading" className="font-semibold">Applications</h2>
            </div>
            <DashboardApplicationWidget />
          </motion.div>

          {/* Job Descriptions */}
          <motion.div
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="glass rounded-xl p-4 md:p-6"
            role="region"
            aria-labelledby="widget-jd-heading"
          >
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-amber-500" aria-hidden="true" />
              <h2 id="widget-jd-heading" className="font-semibold">Job Match</h2>
            </div>
            <DashboardJobDescriptionWidget />
          </motion.div>
        </motion.div>

        {/* Recent Activity — Applications */}
        <motion.div
          variants={fadeUp}
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className="glass rounded-xl p-4 md:p-6 mb-6 md:mb-8"
          role="region"
          aria-labelledby="widget-recent-apps-heading"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
            <h2 id="widget-recent-apps-heading" className="font-semibold">Recent Applications</h2>
          </div>
          <DashboardRecentApplications />
        </motion.div>

        {/* Recent Activity — Job Descriptions */}
        <motion.div
          variants={fadeUp}
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className="glass rounded-xl p-4 md:p-6"
          role="region"
          aria-labelledby="widget-jd-heading"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
            <h2 id="widget-recent-jds-heading" className="font-semibold">Recent Job Descriptions</h2>
          </div>
          <DashboardRecentJobDescriptions />
        </motion.div>
      </motion.div>
  );
}
