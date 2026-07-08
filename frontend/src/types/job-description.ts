export interface JobDescriptionListItem {
  id: string;
  title: string;
  company: string | null;
  sourceUrl: string | null;
  matchScore: number | null;
  analysisStatus: string;
  createdAt: string;
}

export interface JobDescriptionDetail {
  id: string;
  title: string;
  company: string | null;
  rawText: string | null;
  sourceUrl: string | null;
  extractedSkills: string | null;
  matchScore: number | null;
  analysisStatus: string;
  analyzedAt: string | null;
  analysisAttempts: number;
  errorMessage: string | null;
  structuredData: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobDescriptionStructuredData {
  basicInfo: {
    title: string | null;
    company: string | null;
    location: string | null;
    remote: boolean | null;
    employmentType: string | null;
    seniority: string | null;
  };
  compensation: {
    salaryMin: number | null;
    salaryMax: number | null;
    currency: string | null;
    includesEquity: boolean | null;
  };
  skills: {
    required: string[];
    preferred: string[];
    niceToHave: string[];
  };
  qualifications: {
    experienceYears: number | null;
    education: string | null;
    certifications: string[];
  };
  responsibilities: string[];
  benefits: string[];
  metadata: {
    postedDate: string | null;
    applicationDeadline: string | null;
  };
}

export interface CreateJobDescriptionRequest {
  title: string;
  company?: string;
  rawText?: string;
  sourceUrl?: string;
}

export interface UpdateJobDescriptionRequest {
  title: string;
  company?: string;
  rawText?: string;
  sourceUrl?: string;
}
