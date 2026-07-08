'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Logo } from '@/components/shared/logo';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Logo size="lg" />
          </Link>
        </div>

        {children}
      </motion.div>
    </main>
  );
}
