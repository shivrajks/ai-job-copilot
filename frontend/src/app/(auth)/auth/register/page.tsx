import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants/seo';
import RegisterPageClient from './page-client';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create your AI Job Copilot account and start optimizing your job search.',
  openGraph: {
    title: 'Create Account — AI Job Copilot',
    description: 'Create your AI Job Copilot account and start optimizing your job search.',
  },
};

export default function RegisterPage() {
  return <RegisterPageClient />;
}
