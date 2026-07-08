import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants/seo';
import ForgotPasswordPageClient from './page-client';

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your AI Job Copilot password.',
  openGraph: {
    title: 'Forgot Password — AI Job Copilot',
    description: 'Reset your AI Job Copilot password.',
  },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageClient />;
}
