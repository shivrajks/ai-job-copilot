import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants/seo';
import AnalyticsPageClient from './page-client';

export const metadata: Metadata = {
  title: 'Analytics',
  description: 'Track your job search performance, response rates, and interview success metrics.',
  openGraph: {
    title: 'Analytics — AI Job Copilot',
    description: 'Job search analytics and insights.',
  },
};

export default function AnalyticsPage() {
  return <AnalyticsPageClient />;
}
