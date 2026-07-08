import { CheckCircle2 } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
}

const checks = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number', test: (p: string) => /\d/.test(p) },
  { label: 'One special character (@$!%*?&)', test: (p: string) => /[@$!%*?&]/.test(p) },
];

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  return (
    <ul className="space-y-1 pt-1" aria-label="Password requirements" aria-live="polite" aria-atomic="true">
      {checks.map((check) => {
        const valid = check.test(password);
        return (
          <li key={check.label} className="flex items-center gap-2 text-xs">
            {valid ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" aria-hidden="true" />
            ) : (
              <div className="w-3 h-3 rounded-full border border-muted-foreground/30 shrink-0" />
            )}
            <span className={valid ? 'text-emerald-600' : 'text-muted-foreground'}>
              {check.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
