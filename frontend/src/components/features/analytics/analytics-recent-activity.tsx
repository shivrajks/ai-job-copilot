'use client';

import { motion } from 'framer-motion';
import {
  Briefcase,
  FileText,
  FileCheck,
  MessageSquare,
  FileSignature,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { RecentActivity } from '@/lib/api/analytics';

const activityIcons: Record<string, React.ReactNode> = {
  application: <Briefcase className="h-4 w-4" />,
  resume: <FileText className="h-4 w-4" />,
  job_description: <FileCheck className="h-4 w-4" />,
  interview: <MessageSquare className="h-4 w-4" />,
  cover_letter: <FileSignature className="h-4 w-4" />,
};

const activityColors: Record<string, string> = {
  application: 'bg-blue-500/10 text-blue-500',
  resume: 'bg-purple-500/10 text-purple-500',
  job_description: 'bg-green-500/10 text-green-500',
  interview: 'bg-orange-500/10 text-orange-500',
  cover_letter: 'bg-pink-500/10 text-pink-500',
};

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface AnalyticsRecentActivityProps {
  activities: RecentActivity[];
}

export function AnalyticsRecentActivity({
  activities,
}: AnalyticsRecentActivityProps) {
  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-8 text-center">
            No activity yet. Start using the platform to see your activity here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {activities.map((activity, i) => (
              <div
                key={`${activity.entityId}-${i}`}
                className="flex items-center gap-3 py-3 border-b border-border last:border-b-0"
              >
                <div
                  className={`rounded-lg p-2 ${
                    activityColors[activity.type] || 'bg-muted text-muted-foreground'
                  }`}
                >
                  {activityIcons[activity.type] || <Briefcase className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{activity.description}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatRelativeTime(activity.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
