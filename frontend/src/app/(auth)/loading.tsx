import { Loader2 } from 'lucide-react';

export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background" role="status" aria-label="Loading authentication page">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" aria-hidden="true" />
    </div>
  );
}
