import { cn } from '@/lib/utils';
import { designTokens } from '@/lib/constants/design';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: keyof typeof designTokens.container;
}

export function PageContainer({
  children,
  className,
  maxWidth = 'xl',
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full',
        designTokens.container[maxWidth],
        designTokens.spacing.page.padding,
        className
      )}
    >
      {children}
    </div>
  );
}
