import { cn } from '@/lib/utils';
import { designTokens } from '@/lib/constants/design';

interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function SectionContainer({
  children,
  className,
  id,
}: SectionContainerProps) {
  return (
    <section
      id={id}
      className={cn(designTokens.spacing.section.padding, 'px-6', className)}
    >
      {children}
    </section>
  );
}
