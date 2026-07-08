import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants/seo';
import InterviewsPageClient from './page-client';

export const metadata: Metadata = {
  title: 'Interview Coach',
  description: 'Practice with AI-generated interview questions and get real-time feedback.',
  openGraph: {
    title: 'Interview Coach — AI Job Copilot',
    description: 'Practice interviews with AI.',
  },
};

export default function InterviewsPage() {
  return <InterviewsPageClient />;
}
