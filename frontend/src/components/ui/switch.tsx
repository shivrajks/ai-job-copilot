'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, checked, defaultChecked, ...props }, ref) => {
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked ?? false);
    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : internalChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked;
      if (!isControlled) setInternalChecked(newChecked);
      onCheckedChange?.(newChecked);
    };

    return (
      <label
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors',
          'focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          isChecked ? 'bg-primary' : 'bg-input',
          className
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          checked={isChecked}
          onChange={handleChange}
          className="sr-only"
          aria-checked={isChecked}
          role="switch"
          {...props}
        />
        <span
          className={cn(
            'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-sm ring-0 transition-transform',
            isChecked ? 'translate-x-[18px]' : 'translate-x-[2px]'
          )}
        />
      </label>
    );
  }
);
Switch.displayName = 'Switch';

export { Switch };
