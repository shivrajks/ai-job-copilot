import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants/seo';
import TrackerPageClient from './page-client';

export const metadata: Metadata = {
  title: 'Application Tracker',
  description: 'Track your job applications from saved to offer with Kanban or list view.',
  openGraph: {
    title: 'Application Tracker — AI Job Copilot',
    description: 'Track your job applications.',
  },
};

export default function TrackerPage() {
  return <TrackerPageClient />;
}
