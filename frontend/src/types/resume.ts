export type ParsingStatus = 'PENDING' | 'PROCESSING' | 'PARSED' | 'FAILED';

export interface ResumeStructuredData {
  personalInfo: {
    fullName: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
    linkedin: string | null;
    portfolio: string | null;
  };
  summary: string | null;
  skills: string[];
  experience: Array<{
    company: string;
    title: string;
    startDate: string | null;
    endDate: string | null;
    description: string | null;
    highlights: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string | null;
    field: string | null;
    startYear: number | null;
    endYear: number | null;
    gpa: string | null;
  }>;
  certifications: string[];
  languages: string[];
}

export interface ResumeListItem {
  id: string;
  name: string;
  versionNum: number;
  parsingStatus: ParsingStatus;
  isActive: boolean;
  fileSize: number | null;
  atsScore: number | null;
  createdAt: string;
}

export interface ResumeDetail {
  id: string;
  name: string;
  versionNum: number;
  parsingStatus: ParsingStatus;
  errorMessage: string | null;
  isActive: boolean;
  originalFileUrl: string | null;
  parsedContent: string | null;
  structuredData: string | null;
  fileSize: number | null;
  mimeType: string | null;
  atsScore: number | null;
  parseAttempts: number | null;
  parsedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UploadResponse {
  id: string;
  name: string;
  status: string;
  message: string;
}

export interface RenameRequest {
  name: string;
}
