import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants/seo';
import HomePageClient from './page-client';

export const metadata: Metadata = {
  title: 'AI Job Copilot — Land Your Dream Job',
  description: siteConfig.description,
  openGraph: {
    title: 'AI Job Copilot — Land Your Dream Job',
    description: siteConfig.description,
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
