'use client';

import { SiteHeader } from '@/components/navigation/site-header';
import { Footer } from '@/components/navigation/footer';
import { HeroSection } from '@/components/landing/hero-section';
import { OutcomeStats } from '@/components/landing/outcome-stats';
import { FeaturesSection } from '@/components/landing/features-section';
import { PricingSection } from '@/components/landing/pricing-section';
import { HowItWorks } from '@/components/landing/how-it-works';
import { ProductWorkflowPreview } from '@/components/landing/product-workflow-preview';
import { Testimonials } from '@/components/landing/testimonials';
import { FAQ } from '@/components/landing/faq';

const pricingTiers = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    features: ['5 AI requests/month', '3 resumes', '3 job analyses', '20 tracked applications'],
    cta: 'Start Free',
    ctaHref: '/auth/register',
    variant: 'outline' as const,
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/mo',
    yearlyPrice: '$120',
    features: ['Unlimited AI requests', 'Unlimited resumes', 'Interview simulator', 'AI feedback on answers', 'Priority processing'],
    cta: 'Start Pro',
    ctaHref: '/auth/register',
    popular: true,
  },
];

export default function HomePageClient() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F6F8FF] text-slate-950 transition-colors duration-500 dark:bg-[#050816] dark:text-white">
      <SiteHeader />

      <main id="main-content" tabIndex={-1}>
        <HeroSection />
        <OutcomeStats />
        <HowItWorks />
        <FeaturesSection />
        <ProductWorkflowPreview />
        <Testimonials />
        <PricingSection tiers={pricingTiers} />
        <FAQ />
      </main>

      <Footer />
    </div>
  );
}
