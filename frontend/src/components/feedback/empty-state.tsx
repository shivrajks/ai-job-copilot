import { cn } from '@/lib/utils';
import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
        {icon || <Inbox className="w-8 h-8 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && (
        action.href ? (
          <a href={action.href}>
            <Button variant="default" size="sm">
              {action.label}
            </Button>
          </a>
        ) : (
          <Button variant="default" size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        )
      )}
    </div>
  );
}
