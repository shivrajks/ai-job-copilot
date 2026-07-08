import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants/seo';
import JobsPageClient from './page-client';

export const metadata: Metadata = {
  title: 'Job Match',
  description: 'Analyze job descriptions and see how your resume matches using AI.',
  openGraph: {
    title: 'Job Match — AI Job Copilot',
    description: 'Analyze job descriptions with AI.',
  },
};

export default function JobsPage() {
  return <JobsPageClient />;
}
