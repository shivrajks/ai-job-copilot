import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants/seo';
import DashboardPageClient from './page-client';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your AI Job Copilot dashboard — track applications, manage resumes, and monitor your job search.',
  openGraph: {
    title: 'Dashboard — AI Job Copilot',
    description: 'Your AI Job Copilot dashboard.',
  },
};

export default function DashboardPage() {
  return <DashboardPageClient />;
}
