import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

export interface StatusConfig {
  icon: typeof Loader2;
  color: string;
  label: string;
}

export const parsingStatusConfig: Record<string, StatusConfig> = {
  PENDING: { icon: Loader2, color: 'text-amber-500', label: 'Pending' },
  PROCESSING: { icon: Loader2, color: 'text-blue-500', label: 'Processing' },
  PARSED: { icon: CheckCircle2, color: 'text-emerald-500', label: 'Parsed' },
  FAILED: { icon: AlertTriangle, color: 'text-destructive', label: 'Failed' },
};
