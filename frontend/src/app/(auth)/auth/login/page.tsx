import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants/seo';
import LoginPageClient from './page-client';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your AI Job Copilot account.',
  openGraph: {
    title: 'Sign In — AI Job Copilot',
    description: 'Sign in to your AI Job Copilot account.',
  },
};

export default function LoginPage() {
  return <LoginPageClient />;
}
