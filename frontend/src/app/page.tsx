'use client';

import { motion } from 'framer-motion';
import { Sparkles, FileText, Target, Mic, BarChart3, Mail } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const features = [
  { icon: FileText, title: 'Resume Analyzer', desc: 'AI-powered ATS scoring, skill extraction, and keyword optimization.' },
  { icon: Target, title: 'Job Match', desc: 'See exactly how you match any job posting with detailed skill analysis.' },
  { icon: Mail, title: 'Cover Letters', desc: 'Generate tailored cover letters in seconds with customizable tone.' },
  { icon: Mic, title: 'Interview Coach', desc: 'Practice with AI-generated questions and get real-time feedback.' },
  { icon: BarChart3, title: 'Analytics', desc: 'Track your pipeline, response rates, and optimize your strategy.' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="glass-nav fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg">AI Job Copilot</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="/auth/login" className="text-sm hover:text-foreground transition-colors">Login</a>
            <a
              href="/auth/register"
              className="text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-40 pb-24 px-6">
        <motion.div
          className="max-w-5xl mx-auto text-center"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Job Search
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6"
          >
            Land Your Dream Job
            <br />
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              With AI Precision
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Stop sending generic resumes. Our AI analyzes every job description,
            optimizes your resume, and prepares you to ace the interview.
          </motion.p>
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4">
            <a
              href="/auth/register"
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all hover:scale-105 inline-flex items-center gap-2"
            >
              Start Free
              <span className="text-xs opacity-70">No credit card</span>
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <motion.div
          className="max-w-6xl mx-auto"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.h2
            variants={fadeUp}
            className="text-3xl font-bold text-center mb-4"
          >
            Everything You Need
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-muted-foreground text-center mb-16 max-w-xl mx-auto"
          >
            From resume to offer, we've got every step covered.
          </motion.p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-6 hover:shadow-lg transition-shadow cursor-default"
              >
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <motion.div
          className="max-w-4xl mx-auto"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} className="text-3xl font-bold text-center mb-4">
            Simple Pricing
          </motion.h2>
          <motion.p variants={fadeUp} className="text-muted-foreground text-center mb-16">
            Start free. Upgrade when you need more.
          </motion.p>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free */}
            <motion.div variants={fadeUp} className="glass rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-1">Free</h3>
              <p className="text-3xl font-bold mb-4">$0<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li>✓ 5 AI requests/month</li>
                <li>✓ 3 resumes</li>
                <li>✓ 3 job analyses</li>
                <li>✓ 20 tracked applications</li>
              </ul>
              <a href="/auth/register" className="block w-full text-center py-2.5 rounded-lg border border-border hover:bg-secondary transition-colors text-sm font-medium">
                Start Free
              </a>
            </motion.div>
            {/* Pro */}
            <motion.div variants={fadeUp} className="glass rounded-xl p-8 ring-2 ring-primary relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold mb-1">Pro</h3>
              <p className="text-3xl font-bold mb-4">$12<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li>✓ Unlimited AI requests</li>
                <li>✓ Unlimited resumes</li>
                <li>✓ Interview simulator</li>
                <li>✓ AI feedback on answers</li>
                <li>✓ Priority processing</li>
              </ul>
              <a href="/auth/register" className="block w-full text-center py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium">
                Start Pro →
              </a>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <span>© 2026 AI Job Copilot</span>
          <div className="flex gap-4">
            <a href="/auth/login">Login</a>
            <a href="/auth/register">Register</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
