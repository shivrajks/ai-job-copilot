import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants/seo';
import ResumesPageClient from './page-client';

export const metadata: Metadata = {
  title: 'Resumes',
  description: 'Upload, manage, and analyze your resumes with AI-powered ATS scoring.',
  openGraph: {
    title: 'Resumes — AI Job Copilot',
    description: 'Manage your resumes with AI-powered tools.',
  },
};

export default function ResumesPage() {
  return <ResumesPageClient />;
}
