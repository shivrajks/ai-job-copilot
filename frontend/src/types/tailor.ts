export interface SectionChange {
  section: string;
  changeType: string;
  originalText: string;
  suggestedText: string;
  reason: string;
  recommendationType: string | null;
}

export interface TailorProposal {
  resumeId: string;
  jobDescriptionId: string;
  originalAtsScore: number;
  estimatedNewAtsScore: number;
  originalStructuredData: string;
  tailoredStructuredData: string;
  changes: SectionChange[];
}

export interface SaveTailoredRequest {
  tailoredStructuredData: string;
  name: string;
}
