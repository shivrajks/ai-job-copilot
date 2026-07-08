'use client';

import { motion } from 'framer-motion';
import {
  Briefcase,
  FileText,
  FileCheck,
  MessageSquare,
  FileSignature,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnalyticsResponse } from '@/lib/api/analytics';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

const statIcons: Record<string, React.ReactNode> = {
  total: <Briefcase className="h-5 w-5" />,
  weekly: <TrendingUp className="h-5 w-5" />,
  monthly: <TrendingUp className="h-5 w-5" />,
  resumes: <FileText className="h-5 w-5" />,
  jobs: <FileCheck className="h-5 w-5" />,
  interviews: <MessageSquare className="h-5 w-5" />,
  coverLetters: <FileSignature className="h-5 w-5" />,
};

function StatCard({ title, value, subtitle, icon }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-5 space-y-2"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{title}</span>
        <div className="rounded-lg bg-primary/10 p-2 text-primary">{icon}</div>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {subtitle && (
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      )}
    </motion.div>
  );
}

interface AnalyticsStatCardsProps {
  data: AnalyticsResponse;
}

export function AnalyticsStatCards({ data }: AnalyticsStatCardsProps) {
  const { applications, resumes, jobDescriptions, interviews, coverLetters } = data;

  const cards = [
    {
      title: 'Total Applications',
      value: applications.total,
      subtitle: `${applications.appliedThisWeek} this week · ${applications.appliedThisMonth} this month`,
      icon: statIcons.total,
    },
    {
      title: 'Success Rate',
      value: `${applications.successRate}%`,
      subtitle: 'Applications resulting in offers',
      icon: statIcons.weekly,
    },
    {
      title: 'Active Resumes',
      value: resumes.active,
      subtitle: `${resumes.total} total · ${resumes.averageAtsScore ?? '—'} avg ATS`,
      icon: statIcons.resumes,
    },
    {
      title: 'Job Descriptions',
      value: jobDescriptions.total,
      subtitle: jobDescriptions.averageMatchScore
        ? `${jobDescriptions.averageMatchScore}% avg match`
        : 'No match scores yet',
      icon: statIcons.jobs,
    },
    {
      title: 'Interview Sessions',
      value: interviews.totalSessions,
      subtitle: interviews.averageScore
        ? `${interviews.averageScore}% avg score`
        : 'No sessions completed',
      icon: statIcons.interviews,
    },
    {
      title: 'Cover Letters',
      value: coverLetters.generatedCount,
      subtitle: 'Generated',
      icon: statIcons.coverLetters,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <StatCard {...card} />
        </motion.div>
      ))}
    </div>
  );
}
