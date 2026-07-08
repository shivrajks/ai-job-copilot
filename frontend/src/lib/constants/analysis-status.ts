import { Loader2, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

export interface StatusConfig {
  icon: typeof Loader2;
  color: string;
  label: string;
}

export const analysisStatusConfig: Record<string, StatusConfig> = {
  PENDING: { icon: Sparkles, color: 'text-muted-foreground', label: 'Pending' },
  PROCESSING: { icon: Loader2, color: 'text-blue-500', label: 'Analyzing' },
  ANALYZED: { icon: CheckCircle2, color: 'text-emerald-500', label: 'Analyzed' },
  FAILED: { icon: AlertTriangle, color: 'text-destructive', label: 'Failed' },
};
