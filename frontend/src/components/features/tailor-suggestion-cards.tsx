'use client';

import { motion } from 'framer-motion';
import { Sparkles, Target, CheckCircle2 } from 'lucide-react';
import type { TailorProposal } from '@/types/tailor';
import { useTailorStore } from '@/store/tailor';
import { TailorSummaryCard } from './tailor-summary-card';
import { TailorSkillsCard } from './tailor-skills-card';
import { TailorExperienceCard } from './tailor-experience-card';
import { TailorEducationCard } from './tailor-education-card';
import { staggerContainer, fadeUp } from '@/lib/animations/variants';
import { cn } from '@/lib/utils';

interface TailorSuggestionCardsProps {
  proposal: TailorProposal;
}

function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-rose-600';
}

function scoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-500/10';
  if (score >= 60) return 'bg-amber-500/10';
  return 'bg-rose-500/10';
}

export function TailorSuggestionCards({ proposal }: TailorSuggestionCardsProps) {
  const { acceptedChanges, acceptChange, rejectChange, acceptAll, rejectAll } = useTailorStore();

  const sectionCard = (change: typeof proposal.changes[0], index: number) => {
    const accepted = acceptedChanges.has(index);
    const props = { change, index, accepted, onAccept: acceptChange, onReject: rejectChange };

    switch (change.section) {
      case 'summary':
        return <TailorSummaryCard key={index} {...props} />;
      case 'skills':
        return <TailorSkillsCard key={index} {...props} />;
      case 'experience':
        return <TailorExperienceCard key={index} {...props} />;
      case 'education':
        return <TailorEducationCard key={index} {...props} />;
      default:
        return null;
    }
  };

  const allAccepted = proposal.changes.every((_, i) => acceptedChanges.has(i));

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-5"
    >
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="px-4 py-3 bg-accent/30 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-500" />
            Tailored Resume Suggestions
          </h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                variants={fadeUp}
                className={cn('w-12 h-12 rounded-xl flex items-center justify-center', scoreBg(proposal.originalAtsScore))}
              >
                <span className={cn('text-lg font-bold', scoreColor(proposal.originalAtsScore))}>
                  {proposal.originalAtsScore}
                </span>
              </motion.div>
              <motion.div
                variants={fadeUp}
                className={cn('w-12 h-12 rounded-xl flex items-center justify-center', scoreBg(proposal.estimatedNewAtsScore))}
              >
                <span className={cn('text-lg font-bold', scoreColor(proposal.estimatedNewAtsScore))}>
                  {proposal.estimatedNewAtsScore}
                </span>
              </motion.div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Estimated improvement: <span className={cn(
                    'font-medium',
                    proposal.estimatedNewAtsScore > proposal.originalAtsScore ? 'text-emerald-600' : 'text-muted-foreground'
                  )}>
                    +{proposal.estimatedNewAtsScore - proposal.originalAtsScore} points
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={acceptAll}
                className="text-xs text-emerald-600 hover:text-emerald-500 transition-colors px-2 py-1 rounded hover:bg-emerald-500/10"
                aria-label="Accept all changes"
              >
                Accept All
              </button>
              <button
                onClick={rejectAll}
                className="text-xs text-rose-600 hover:text-rose-500 transition-colors px-2 py-1 rounded hover:bg-rose-500/10"
                aria-label="Reject all changes"
              >
                Reject All
              </button>
            </div>
          </div>

          {allAccepted && proposal.changes.length > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="text-xs text-emerald-700">
                All changes accepted. You can now save this as a new resume version.
              </p>
            </div>
          )}

          {proposal.changes.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Target className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No suggestions generated</p>
              <p className="text-xs text-muted-foreground/60">
                Your resume may already be well-aligned with this role.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {proposal.changes.map((change, index) => sectionCard(change, index))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
