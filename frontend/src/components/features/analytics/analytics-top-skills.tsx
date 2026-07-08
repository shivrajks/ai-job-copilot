'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AnalyticsTopSkillsProps {
  skills: string[];
}

export function AnalyticsTopSkills({ skills }: AnalyticsTopSkillsProps) {
  if (!skills || skills.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Requested Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-8 text-center">
            No skills data yet. Analyze job descriptions to see top requested skills.
          </p>
        </CardContent>
      </Card>
    );
  }

  const maxCount = skills.length;
  const data = skills.map((skill, i) => ({
    name: skill.length > 20 ? skill.substring(0, 20) + '...' : skill,
    fullName: skill,
    count: maxCount - i,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Top Requested Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  width={140}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                  formatter={(_value, _name, props) => {
                    const p = props as { payload: { fullName: string } };
                    return [p.payload.fullName, 'Skill'];
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="hsl(var(--primary))"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-4">
            {skills.slice(0, 8).map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
