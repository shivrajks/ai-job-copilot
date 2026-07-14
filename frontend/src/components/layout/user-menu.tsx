'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-xs font-medium shrink-0">
          {user?.fullName?.charAt(0) || 'U'}
        </div>
        <span className="text-sm font-medium hidden sm:block max-w-[120px] truncate">
          {user?.fullName || 'User'}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/[0.10] bg-card/95 backdrop-blur-xl shadow-xl',
              'z-50 overflow-hidden'
            )}
            role="menu"
          >
            <div className="p-3 border-b border-border">
              <p className="text-sm font-medium truncate">{user?.fullName || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
              <p className="text-xs text-primary mt-1">{user?.planTier || 'FREE'}</p>
            </div>

            <div className="p-1">
              <button
                onClick={() => { setOpen(false); router.push('/settings'); }}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                role="menuitem"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button
                onClick={() => { setOpen(false); logout(); router.replace('/auth/login'); }}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                role="menuitem"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
