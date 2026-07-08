'use client';

import { motion } from 'framer-motion';
import { ArrowUp, AlertTriangle, Info } from 'lucide-react';
import type { Recommendation } from '@/types/ats-report';
import { fadeUp } from '@/lib/animations/variants';
import { cn } from '@/lib/utils';

interface PriorityRecommendationsProps {
  recommendations: Recommendation[];
}

const priorityConfig = {
  HIGH: {
    label: 'High Priority',
    color: 'text-rose-600',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    icon: ArrowUp,
  },
  MEDIUM: {
    label: 'Medium Priority',
    color: 'text-amber-600',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: AlertTriangle,
  },
  LOW: {
    label: 'Low Priority',
    color: 'text-muted-foreground',
    bg: 'bg-accent/30',
    border: 'border-border',
    icon: Info,
  },
};

export function PriorityRecommendations({ recommendations }: PriorityRecommendationsProps) {
  const grouped = {
    HIGH: recommendations.filter((r) => r.priority === 'HIGH'),
    MEDIUM: recommendations.filter((r) => r.priority === 'MEDIUM'),
    LOW: recommendations.filter((r) => r.priority === 'LOW'),
  };

  const levels = ['HIGH', 'MEDIUM', 'LOW'] as const;

  return (
    <motion.div variants={fadeUp} className="rounded-lg border border-border overflow-hidden">
      <div className="px-4 py-3 bg-accent/30 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Recommendations</h3>
      </div>
      <div className="divide-y divide-border">
        {levels.map((level) => {
          const items = grouped[level];
          const config = priorityConfig[level];
          const Icon = config.icon;
          if (items.length === 0) return null;

          return (
            <div key={level} className="px-4 py-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium',
                  config.bg, config.color
                )}>
                  <Icon className="w-3 h-3" />
                  {config.label}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {items.length} recommendation{items.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="space-y-2">
                {items.map((rec, i) => (
                  <div
                    key={`${rec.category}-${i}`}
                    className={cn(
                      'p-3 rounded-lg border',
                      config.border,
                      level === 'LOW' ? 'bg-background' : config.bg.replace('bg-', 'bg-').replace('/10', '/5')
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">
                          {rec.label}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {rec.description}
                        </p>
                      </div>
                      <span className={cn(
                        'shrink-0 inline-flex items-center gap-0.5 text-[11px] font-medium',
                        config.color
                      )}>
                        +{Math.round(rec.estimatedImpact * 10) / 10}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {recommendations.length === 0 && (
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            No recommendations available. Your resume appears well-aligned with this role.
          </p>
        </div>
      )}
    </motion.div>
  );
}
