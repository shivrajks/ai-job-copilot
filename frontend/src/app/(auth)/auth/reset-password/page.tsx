import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants/seo';
import ResetPasswordPageClient from './page-client';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Reset your AI Job Copilot password.',
  openGraph: {
    title: 'Reset Password — AI Job Copilot',
    description: 'Reset your AI Job Copilot password.',
  },
};

export default function ResetPasswordPage() {
  return <ResetPasswordPageClient />;
}
