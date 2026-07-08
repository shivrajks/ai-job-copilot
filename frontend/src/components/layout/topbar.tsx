'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { Menu, ChevronRight, LayoutDashboard } from 'lucide-react';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { UserMenu } from '@/components/layout/user-menu';
import { cn } from '@/lib/utils';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/resumes': 'Resumes',
  '/jobs': 'Job Match',
  '/cover-letters': 'Cover Letters',
  '/interviews': 'Interview Coach',
  '/tracker': 'Application Tracker',
  '/settings': 'Settings',
  '/analytics': 'Analytics',
};

interface TopbarProps {
  onMenuToggle: () => void;
  isSidebarOpen?: boolean;
}

export function Topbar({ onMenuToggle, isSidebarOpen }: TopbarProps) {
  const pathname = usePathname();
  const title = pageTitles[pathname] || 'Dashboard';

  const breadcrumbs = useMemo(() => {
    const parts: { label: string; href?: string }[] = [];
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      parts.push({ label: 'Home', href: '/dashboard' });
    }
    if (title && title !== 'Dashboard') {
      parts.push({ label: title });
    }
    return parts;
  }, [pathname, title]);

  return (
    <header className="h-16 border-b border-border bg-white/70 dark:bg-background/80 backdrop-blur-xl flex items-center px-4 lg:px-6 gap-3 transition-colors duration-300">
      <button
        onClick={onMenuToggle}
        className="lg:hidden text-muted-foreground hover:text-foreground transition-colors -ml-1"
        aria-label="Toggle sidebar"
        aria-expanded={isSidebarOpen}
        aria-controls="sidebar-navigation"
      >
        <Menu className="w-5 h-5" aria-hidden="true" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <LayoutDashboard className="w-3.5 h-3.5" aria-hidden="true" />
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.label} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="w-3 h-3" aria-hidden="true" />}
              <span className={cn(i === breadcrumbs.length - 1 ? 'text-foreground font-semibold' : '')}>
                {crumb.label}
              </span>
            </span>
          ))}
        </div>
        <h1 className="text-lg font-semibold mt-0.5">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
