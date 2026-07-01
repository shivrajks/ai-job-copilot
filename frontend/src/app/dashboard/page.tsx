'use client';

import { motion } from 'framer-motion';
import {
  LayoutDashboard, FileText, Target, Mail, Mic,
  BarChart3, Settings, LogOut, Sparkles, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: FileText, label: 'Resumes', href: '/resumes' },
  { icon: Target, label: 'Job Match', href: '/jobs' },
  { icon: Mail, label: 'Cover Letters', href: '/cover-letters' },
  { icon: Mic, label: 'Interview', href: '/interviews' },
  { icon: BarChart3, label: 'Tracker', href: '/tracker' },
];

const stats = [
  { label: 'Applied', value: '24', change: '+3', color: 'text-primary' },
  { label: 'Interviews', value: '8', change: '+2', color: 'text-sky-500' },
  { label: 'Offers', value: '2', change: '—', color: 'text-emerald-500' },
  { label: 'Response Rate', value: '33%', change: '+5%', color: 'text-amber-500' },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col fixed h-full">
        <div className="p-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold">AI Job Copilot</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </a>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-medium">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.fullName || 'User'}</p>
              <p className="text-xs text-muted-foreground">{user?.planTier || 'FREE'}</p>
            </div>
            <button onClick={clearAuth} className="text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.05 } } }}>
          {/* Header */}
          <motion.div variants={fadeUp} className="mb-8">
            <h1 className="text-2xl font-bold">Good morning, {user?.fullName?.split(' ')[0] || 'there'} 👋</h1>
            <p className="text-muted-foreground text-sm mt-1">Here's your job search overview</p>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeUp} className="grid grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="glass rounded-xl p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.change} this week</p>
              </div>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={fadeUp} className="glass rounded-xl p-6 mb-8">
            <h2 className="font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-3 gap-4">
              <a href="/resumes" className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Upload Resume</p>
                  <p className="text-xs text-muted-foreground">PDF or DOCX</p>
                </div>
              </a>
              <a href="/jobs" className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent transition-colors">
                <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-sky-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Analyze Job</p>
                  <p className="text-xs text-muted-foreground">Paste JD or URL</p>
                </div>
              </a>
              <a href="/interviews" className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent transition-colors">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Mic className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Practice Interview</p>
                  <p className="text-xs text-muted-foreground">AI-generated questions</p>
                </div>
              </a>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={fadeUp} className="glass rounded-xl p-6">
            <h2 className="font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {[
                { action: 'Resume optimized for Stripe', time: '2 minutes ago', icon: FileText },
                { action: 'New application at Vercel', time: '15 minutes ago', icon: Target },
                { action: 'Interview scheduled at Notion', time: '1 hour ago', icon: Mic },
                { action: 'Cover letter generated', time: '2 hours ago', icon: Mail },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
