import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants/seo';
import SettingsPageClient from './page-client';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your AI Job Copilot account, preferences, and notifications.',
  openGraph: {
    title: 'Settings — AI Job Copilot',
    description: 'Manage your account settings.',
  },
};

export default function SettingsPage() {
  return <SettingsPageClient />;
}
