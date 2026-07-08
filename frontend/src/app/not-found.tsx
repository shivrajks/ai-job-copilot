import Link from 'next/link';
import { Logo } from '@/components/shared/logo';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6">
      <div role="alert" className="text-center max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Logo size="lg" />
          </Link>
        </div>
        <h1 className="text-6xl font-bold tracking-tight mb-4">404</h1>
        <p className="text-xl font-semibold mb-2">Page Not Found</p>
        <p className="text-muted-foreground text-sm mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}
