'use client';

import { useState, ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { SkipToContent } from '@/components/shared/skip-to-content';
import { cn } from '@/lib/utils';

// ponytail: AnimatePresence mode="wait" blocked every route transition for ~0.5s.
// Re-render children directly — sidebar/topbar persist, page content swaps instantly.

interface DashboardShellProps {
  children: ReactNode;
  className?: string;
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient radial glow — adds depth without being distracting */}
      <div
        className="fixed inset-0 pointer-events-none -z-0"
        aria-hidden="true"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/[0.08] rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-primary/[0.05] rounded-full blur-[120px]" />
      </div>
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
          {children}
        </main>
      </div>
    </div>
  );
}
