'use client';

import { useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { SkipToContent } from '@/components/shared/skip-to-content';
import { pageTransition } from '@/lib/animations/variants';
import { cn } from '@/lib/utils';

interface DashboardShellProps {
  children: ReactNode;
  className?: string;
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div
        className="fixed inset-0 bg-gradient-to-br from-transparent via-background to-primary/[0.02] pointer-events-none -z-0"
        aria-hidden="true"
      />
      <SkipToContent contentId="dashboard-main" />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:ml-64 flex flex-col min-h-screen relative z-0">
        <Topbar onMenuToggle={() => setSidebarOpen(true)} isSidebarOpen={sidebarOpen} />

        <main
          id="dashboard-main"
          className={cn('flex-1 p-4 md:p-6 lg:p-8 transition-colors duration-300', className)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              variants={pageTransition}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
