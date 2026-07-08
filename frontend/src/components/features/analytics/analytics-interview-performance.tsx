'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { ScoreTrend } from '@/lib/api/analytics';

interface AnalyticsInterviewPerformanceProps {
  scoreTrend: ScoreTrend[];
  averageScore: number | null;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function AnalyticsInterviewPerformance({
  scoreTrend,
  averageScore,
}: AnalyticsInterviewPerformanceProps) {
  if (!scoreTrend || scoreTrend.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Interview Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-8 text-center">
            No interview sessions yet. Complete an interview to see your performance trend.
          </p>
        </CardContent>
      </Card>
    );
  }

  const data = scoreTrend.map((s) => ({
    date: formatDate(s.date),
    score: s.score,
  }));

  const lowest = Math.min(...data.map((d) => d.score)) - 10;
  const yMin = Math.max(0, lowest);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Interview Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold">
              {averageScore !== null ? `${Math.round(averageScore)}%` : '—'}
            </span>
            <span className="text-sm text-muted-foreground">average score</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  domain={[yMin, 100]}
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
