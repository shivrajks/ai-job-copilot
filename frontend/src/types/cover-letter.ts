export interface CoverLetterContent {
  subject: string;
  salutation: string;
  body: string[];
  closing: string;
  signature: string;
  fullText: string;
}

export interface CoverLetterProposal {
  resumeId: string;
  jobDescriptionId: string | null;
  content: CoverLetterContent;
  tone: string;
  template: string;
}

export interface CoverLetterListItem {
  id: string;
  title: string;
  companyName: string | null;
  tone: string;
  template: string;
  preview: string;
  createdAt: string;
  updatedAt: string;
}

export interface CoverLetterDetail {
  id: string;
  title: string;
  content: string;
  tone: string;
  template: string;
  companyName: string | null;
  hiringManager: string | null;
  recipientTitle: string | null;
  resumeId: string | null;
  jobDescriptionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateCoverLetterRequest {
  resumeId: string;
  jobDescriptionId?: string;
  tone: string;
  template: string;
  companyName?: string;
  hiringManager?: string;
}

export interface SaveCoverLetterRequest {
  content: string;
  title: string;
  tone?: string;
  template?: string;
  companyName?: string;
  hiringManager?: string;
  recipientTitle?: string;
  jobDescriptionId?: string;
  resumeId?: string;
}

export interface UpdateCoverLetterRequest {
  content: string;
  title: string;
  tone?: string;
  template?: string;
  companyName?: string;
  hiringManager?: string;
  recipientTitle?: string;
}

export const TONES = ['professional', 'warm', 'enthusiastic'] as const;
export type Tone = typeof TONES[number];

export const TEMPLATES = ['professional', 'modern', 'concise'] as const;
export type Template = typeof TEMPLATES[number];
