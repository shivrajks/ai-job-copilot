'use client';

import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { ResumeAnalytics, JobDescriptionAnalytics } from '@/lib/api/analytics';

interface AnalyticsAtsOverviewProps {
  resumes: ResumeAnalytics;
  jobDescriptions: JobDescriptionAnalytics;
}

export function AnalyticsAtsOverview({
  resumes,
  jobDescriptions,
}: AnalyticsAtsOverviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>ATS & Match Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Average ATS Score</span>
              <span className="text-sm font-semibold">
                {resumes.averageAtsScore !== null ? `${Math.round(resumes.averageAtsScore)}%` : '—'}
              </span>
            </div>
            <Progress
              value={resumes.averageAtsScore ?? 0}
              variant={resumes.averageAtsScore !== null && resumes.averageAtsScore >= 70 ? 'success' : resumes.averageAtsScore !== null && resumes.averageAtsScore >= 40 ? 'warning' : 'default'}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>Highest: {resumes.highestAtsScore !== null ? `${resumes.highestAtsScore}%` : '—'}</span>
              <span>100%</span>
            </div>
          </div>

          <div className="h-px bg-border" />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Total Resumes</span>
              <p className="text-xl font-bold">{resumes.total}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Active</span>
              <p className="text-xl font-bold">{resumes.active}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Avg Match Score</span>
              <p className="text-xl font-bold">
                {jobDescriptions.averageMatchScore !== null
                  ? `${Math.round(jobDescriptions.averageMatchScore)}%`
                  : '—'}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Total JDs</span>
              <p className="text-xl font-bold">{jobDescriptions.total}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
