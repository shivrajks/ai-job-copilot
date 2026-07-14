'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  FileText,
  Target,
  Mail,
  Mic,
  BarChart3,
  Activity,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/shared/logo';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';
import { slideIn } from '@/lib/animations/variants';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Activity, label: 'Analytics', href: '/analytics' },
  { icon: FileText, label: 'Resumes', href: '/resumes' },
  { icon: Target, label: 'Job Match', href: '/jobs' },
  { icon: Mail, label: 'Cover Letters', href: '/cover-letters' },
  { icon: Mic, label: 'Interview', href: '/interviews' },
  { icon: BarChart3, label: 'Tracker', href: '/tracker' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const dialog = drawerRef.current;
    if (!dialog) return;
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    requestAnimationFrame(() => first?.focus());
    function trap(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, [isOpen]);

  const sidebarContent = (
    <aside
      id="sidebar-navigation"
      className={cn(
        'w-64 flex flex-col h-full',
        'lg:fixed lg:h-full lg:z-[40]',
        'bg-card/80 backdrop-blur-xl border-r border-white/[0.10]',
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="p-4 flex items-center justify-between">
        <Logo size="md" />
        <button
          onClick={onClose}
          className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-3 pt-2 pb-1">
        <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider px-3">
          Navigation
        </p>
      </div>
      <nav className="flex-1 px-3 pb-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 group',
                  isActive
                    ? 'bg-primary/[0.12] text-primary font-medium shadow-sm shadow-primary/[0.08]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.06]',
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon className={cn('w-4 h-4 shrink-0 transition-transform duration-200', 'group-hover:scale-110')} aria-hidden="true" />
                {item.label}
              </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-medium shrink-0">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.fullName || 'User'}
            </p>
            <p className="text-xs text-muted-foreground">
              {user?.planTier || 'FREE'}
            </p>
          </div>
          <button
            onClick={() => { logout(); router.replace('/auth/login'); }}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors shrink-0 rounded-lg"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop: always visible */}
      <div className="hidden lg:block">{sidebarContent}</div>

      {/* Mobile: drawer overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              onClick={onClose}
              aria-hidden="true"
            />
            <motion.div
              ref={drawerRef}
              variants={slideIn}
              initial="initial"
              animate="animate"
              exit="exit"
              className="fixed inset-y-0 left-0 z-50 lg:hidden overflow-y-auto"
              role="dialog"
              aria-modal="true"
              aria-label="Sidebar navigation"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
