'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { StageCount } from '@/lib/api/analytics';

const stageColors: Record<string, string> = {
  SAVED: 'hsl(var(--muted-foreground))',
  APPLIED: 'hsl(var(--primary))',
  PHONE_SCREEN: 'hsl(142 76% 50%)',
  TECHNICAL_INTERVIEW: 'hsl(191 91% 50%)',
  ONSITE: 'hsl(271 81% 60%)',
  OFFER: 'hsl(35 92% 55%)',
  REJECTED: 'hsl(var(--destructive))',
  WITHDRAWN: 'hsl(var(--muted-foreground))',
};

function getStageColor(stage: string): string {
  return stageColors[stage] || 'hsl(var(--muted-foreground))';
}

function formatStageLabel(stage: string): string {
  return stage
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface AnalyticsApplicationPipelineProps {
  byStage: StageCount[];
}

export function AnalyticsApplicationPipeline({
  byStage,
}: AnalyticsApplicationPipelineProps) {
  if (!byStage || byStage.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Application Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-8 text-center">
            No applications yet. Start tracking your job applications to see your pipeline.
          </p>
        </CardContent>
      </Card>
    );
  }

  const data = [...byStage]
    .sort((a, b) => b.count - a.count)
    .map((s) => ({
      name: formatStageLabel(s.stage),
      count: s.count,
      stage: s.stage,
    }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Application Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  width={140}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                  formatter={(value) => [value, 'Applications']}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={24}>
                  {data.map((entry) => (
                    <Cell key={entry.stage} fill={getStageColor(entry.stage)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
