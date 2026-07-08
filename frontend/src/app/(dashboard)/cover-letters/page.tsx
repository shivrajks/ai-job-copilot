import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants/seo';
import CoverLettersPageClient from './page-client';

export const metadata: Metadata = {
  title: 'Cover Letters',
  description: 'Generate and manage personalized AI-powered cover letters.',
  openGraph: {
    title: 'Cover Letters — AI Job Copilot',
    description: 'Generate AI-powered cover letters.',
  },
};

export default function CoverLettersPage() {
  return <CoverLettersPageClient />;
}
