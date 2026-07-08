'use client';

import { useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer } from '@/lib/animations/variants';
import { useAnalyticsStore } from '@/store/analytics';
import { useAuthStore } from '@/store/auth';
import { PageHeader } from '@/components/layout/page-header';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/feedback/error-state';
import { SkeletonStatCard } from '@/components/feedback/skeleton';
import { AnalyticsStatCards } from '@/components/features/analytics/analytics-stat-cards';
import { AnalyticsApplicationPipeline } from '@/components/features/analytics/analytics-application-pipeline';
import { AnalyticsTopSkills } from '@/components/features/analytics/analytics-top-skills';
import { AnalyticsInterviewPerformance } from '@/components/features/analytics/analytics-interview-performance';
import { AnalyticsAtsOverview } from '@/components/features/analytics/analytics-ats-overview';
import { AnalyticsRecentActivity } from '@/components/features/analytics/analytics-recent-activity';

export default function AnalyticsPageClient() {
  const hasFetched = useRef(false);
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, error, fetchData } = useAnalyticsStore();

  useEffect(() => {
    if (!hasFetched.current && !data && !isLoading) {
      hasFetched.current = true;
      fetchData();
    }
  }, [fetchData, data, isLoading]);

  return (
    <PageContainer>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          <PageHeader
            title={`Analytics${user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}`}
            description="Track your job search performance and insights"
            actions={
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
            }
          />

          {error && (
            <ErrorState
              title="Failed to load analytics"
              message={error}
              onRetry={fetchData}
            />
          )}

          {isLoading && !data && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonStatCard key={i} />
              ))}
            </div>
          )}

          {data && (
            <>
              <AnalyticsStatCards data={data} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnalyticsApplicationPipeline byStage={data.applications.byStage} />
                <AnalyticsTopSkills skills={data.jobDescriptions.topSkills} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnalyticsInterviewPerformance
                  scoreTrend={data.interviews.scoreTrend}
                  averageScore={data.interviews.averageScore}
                />
                <AnalyticsAtsOverview
                  resumes={data.resumes}
                  jobDescriptions={data.jobDescriptions}
                />
              </div>

              <AnalyticsRecentActivity activities={data.recentActivity} />
            </>
          )}
        </motion.div>
      </PageContainer>
  );
}
