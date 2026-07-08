'use client';

import { useMemo } from 'react';
import { Building2, GraduationCap, Award, Globe } from 'lucide-react';
import type { ResumeStructuredData } from '@/types/resume';

interface ResumeStructuredViewProps {
  data: string;
}

export function ResumeStructuredView({ data }: ResumeStructuredViewProps) {
  const parsed: ResumeStructuredData | null = useMemo(() => {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }, [data]);

  if (!parsed) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
        <p className="text-sm text-destructive">Unable to parse structured data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {parsed.personalInfo && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">Personal Info</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {parsed.personalInfo.fullName && (
              <div><span className="text-muted-foreground">Name:</span> <span className="text-foreground font-medium">{parsed.personalInfo.fullName}</span></div>
            )}
            {parsed.personalInfo.email && (
              <div><span className="text-muted-foreground">Email:</span> <span className="text-foreground">{parsed.personalInfo.email}</span></div>
            )}
            {parsed.personalInfo.phone && (
              <div><span className="text-muted-foreground">Phone:</span> <span className="text-foreground">{parsed.personalInfo.phone}</span></div>
            )}
            {parsed.personalInfo.location && (
              <div><span className="text-muted-foreground">Location:</span> <span className="text-foreground">{parsed.personalInfo.location}</span></div>
            )}
            {parsed.personalInfo.linkedin && (
              <div className="col-span-2"><span className="text-muted-foreground">LinkedIn:</span> <span className="text-foreground">{parsed.personalInfo.linkedin}</span></div>
            )}
          </div>
        </div>
      )}

      {parsed.summary && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">Summary</h3>
          <p className="text-sm text-foreground">{parsed.summary}</p>
        </div>
      )}

      {parsed.skills && parsed.skills.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            Skills
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {parsed.skills.map((skill, i) => (
              <span key={i} className="px-2.5 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {parsed.experience && parsed.experience.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-blue-500" />
            Experience
          </h3>
          <div className="space-y-3">
            {parsed.experience.map((exp, i) => (
              <div key={i} className="p-3 rounded-lg bg-accent/30 border border-border">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{exp.title}</p>
                    <p className="text-xs text-muted-foreground">{exp.company}</p>
                  </div>
                  {exp.startDate && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      {exp.startDate} — {exp.endDate || 'Present'}
                    </span>
                  )}
                </div>
                {exp.description && (
                  <p className="text-xs text-muted-foreground mt-1.5">{exp.description}</p>
                )}
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="mt-1.5 space-y-0.5">
                    {exp.highlights.map((h, j) => (
                      <li key={j} className="text-xs text-muted-foreground flex items-start gap-1">
                        <span className="text-primary mt-1">•</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {parsed.education && parsed.education.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-green-500" />
            Education
          </h3>
          <div className="space-y-2">
            {parsed.education.map((edu, i) => (
              <div key={i} className="p-3 rounded-lg bg-accent/30 border border-border">
                <p className="text-sm font-medium text-foreground">{edu.institution}</p>
                {(edu.degree || edu.field) && (
                  <p className="text-xs text-muted-foreground">
                    {[edu.degree, edu.field].filter(Boolean).join(' — ')}
                  </p>
                )}
                {edu.gpa && <p className="text-xs text-muted-foreground">GPA: {edu.gpa}</p>}
                {(edu.startYear || edu.endYear) && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {edu.startYear || '?'} — {edu.endYear || 'Present'}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {parsed.certifications && parsed.certifications.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-purple-500" />
            Certifications
          </h3>
          <div className="space-y-1">
            {parsed.certifications.map((cert, i) => (
              <p key={i} className="text-sm text-foreground">• {cert}</p>
            ))}
          </div>
        </div>
      )}

      {parsed.languages && parsed.languages.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-cyan-500" />
            Languages
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {parsed.languages.map((lang, i) => (
              <span key={i} className="px-2.5 py-1 text-xs rounded-full bg-accent border border-border">
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
