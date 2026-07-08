import { Logo } from '@/components/shared/logo';
import { navigation } from '@/lib/constants/navigation';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-slate-200/70 bg-white/70 px-6 py-14 dark:border-white/10 dark:bg-[#070B16]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,108,240,0.12),transparent_28%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(6,214,160,0.10),transparent_28%)]" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <Logo size="md" />
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-300">
              A connected AI workspace for resumes, job matching, cover letters, interview prep, and application tracking.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-950 dark:text-white">Product</h3>
            <nav aria-label="Product links" className="space-y-2">
              {navigation.footer.product.map((item) => (
                <a key={item.label} href={item.href} className="block text-sm text-slate-500 transition-colors hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-950 dark:text-white">Resources</h3>
            <nav aria-label="Resource links" className="space-y-2">
              {navigation.footer.resources.map((item) => (
                <a key={item.label} href={item.href} className="block text-sm text-slate-500 transition-colors hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          {navigation.footer.legal.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-950 dark:text-white">Legal</h3>
              <nav aria-label="Legal links" className="space-y-2">
                {navigation.footer.legal.map((item) => (
                  <a key={item.label} href={item.href} className="block text-sm text-slate-500 transition-colors hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          )}
        </div>

        <div className="mt-10 border-t border-slate-200/70 pt-6 text-sm text-slate-400 dark:border-white/10 dark:text-slate-500">
          &copy; {year} AI Job Copilot. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
