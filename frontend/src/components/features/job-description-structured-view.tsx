'use client';

import { useMemo } from 'react';
import { Building2, MapPin, Briefcase, DollarSign, GraduationCap, ListChecks, Gift, Award } from 'lucide-react';
import type { JobDescriptionStructuredData } from '@/types/job-description';
import { cn } from '@/lib/utils';

function SalaryDisplay({ min, max, currency }: { min: number | null; max: number | null; currency: string | null }) {
  let text: string;
  if (min != null && max != null) {
    text = `$${(min / 1000).toFixed(0)}k — $${(max / 1000).toFixed(0)}k`;
  } else if (min != null) {
    text = `From $${(min / 1000).toFixed(0)}k`;
  } else if (max != null) {
    text = `Up to $${(max / 1000).toFixed(0)}k`;
  } else {
    text = '';
  }
  return (
    <p className="text-sm font-medium">
      {text}
      {currency && <span className="text-xs text-muted-foreground ml-1">{currency}</span>}
    </p>
  );
}

interface JdStructuredViewProps {
  data: string;
}

export function JobDescriptionStructuredView({ data }: JdStructuredViewProps) {
  const parsed: JobDescriptionStructuredData | null = useMemo(() => {
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }, [data]);

  if (!parsed) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
        <p className="text-sm text-destructive">Unable to parse structured job description data.</p>
      </div>
    );
  }

  const { basicInfo, compensation, skills, qualifications, responsibilities, benefits } = parsed;

  const hasData = (basicInfo?.title || basicInfo?.company || basicInfo?.location ||
    compensation?.salaryMin != null || compensation?.salaryMax != null ||
    (skills?.required?.length ?? 0) > 0 || (skills?.preferred?.length ?? 0) > 0 ||
    (skills?.niceToHave?.length ?? 0) > 0 ||
    qualifications?.experienceYears != null || qualifications?.education != null ||
    (qualifications?.certifications?.length ?? 0) > 0 ||
    (responsibilities?.length ?? 0) > 0 || (benefits?.length ?? 0) > 0);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <p className="text-sm text-muted-foreground">No structured data available</p>
        <p className="text-xs text-muted-foreground/60">
          The analysis did not extract any structured information.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5" aria-live="polite">
      {basicInfo && (
        <div className="grid grid-cols-2 gap-3">
          {basicInfo.title && (
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Title</p>
              <p className="text-sm font-medium">{basicInfo.title}</p>
            </div>
          )}
          {basicInfo.company && (
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                Company
              </p>
              <p className="text-sm font-medium">{basicInfo.company}</p>
            </div>
          )}
          {basicInfo.location && (
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Location
              </p>
              <p className="text-sm font-medium">
                {basicInfo.location}
                {basicInfo.remote && <span className="text-xs text-emerald-500 ml-1">(Remote)</span>}
              </p>
            </div>
          )}
          {basicInfo.employmentType && (
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                Type
              </p>
              <p className="text-sm font-medium">{basicInfo.employmentType}</p>
            </div>
          )}
          {basicInfo.seniority && (
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Award className="w-3 h-3" />
                Seniority
              </p>
              <p className="text-sm font-medium">{basicInfo.seniority}</p>
            </div>
          )}
        </div>
      )}

      {compensation && (compensation.salaryMin != null || compensation.salaryMax != null) && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-2">
            <DollarSign className="w-3 h-3" />
            Compensation
          </h4>
          <div className="bg-accent/30 rounded-lg p-3 border border-border">
            <SalaryDisplay min={compensation.salaryMin} max={compensation.salaryMax} currency={compensation.currency} />
            {compensation.includesEquity && (
              <p className="text-xs text-emerald-500 mt-0.5">Includes equity</p>
            )}
          </div>
        </div>
      )}

      {skills && (skills.required.length > 0 || skills.preferred.length > 0 || skills.niceToHave.length > 0) && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Skills</h4>
          <div className="space-y-2">
            {skills.required.length > 0 && (
              <div>
                <p className="text-[11px] font-medium text-foreground mb-1">Required</p>
                <div className="flex flex-wrap gap-1.5">
                  {skills.required.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 text-[11px] rounded-full bg-primary/10 text-primary border border-primary/20">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {skills.preferred.length > 0 && (
              <div>
                <p className="text-[11px] font-medium text-muted-foreground mb-1">Preferred</p>
                <div className="flex flex-wrap gap-1.5">
                  {skills.preferred.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 text-[11px] rounded-full bg-accent border border-border">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {skills.niceToHave.length > 0 && (
              <div>
                <p className="text-[11px] font-medium text-muted-foreground mb-1">Nice to Have</p>
                <div className="flex flex-wrap gap-1.5">
                  {skills.niceToHave.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 text-[11px] rounded-full bg-muted text-muted-foreground border border-border/50">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {qualifications && (qualifications.experienceYears != null || qualifications.education != null || qualifications.certifications.length > 0) && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-2">
            <GraduationCap className="w-3 h-3" />
            Qualifications
          </h4>
          <div className="space-y-1 text-sm">
            {qualifications.experienceYears != null && (
              <p><span className="text-muted-foreground">Experience:</span> {qualifications.experienceYears}+ years</p>
            )}
            {qualifications.education && (
              <p><span className="text-muted-foreground">Education:</span> {qualifications.education}</p>
            )}
            {qualifications.certifications.length > 0 && (
              <p>
                <span className="text-muted-foreground">Certifications:</span>{' '}
                {qualifications.certifications.join(', ')}
              </p>
            )}
          </div>
        </div>
      )}

      {responsibilities.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-2">
            <ListChecks className="w-3 h-3" />
            Responsibilities
          </h4>
          <ul className="space-y-1">
            {responsibilities.map((r, i) => (
              <li key={i} className="text-sm text-foreground flex items-start gap-2">
                <span className="text-primary mt-1.5 shrink-0">•</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {benefits.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-2">
            <Gift className="w-3 h-3" />
            Benefits
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {benefits.map((b, i) => (
              <span key={i} className="px-2.5 py-1 text-xs rounded-full bg-accent/50 border border-border text-muted-foreground">
                {b}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
