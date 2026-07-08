'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TabsContextValue {
  activeTab: string;
  onTabChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

function Tabs({ defaultValue = 'tab-0', value, onValueChange, children, className }: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const isControlled = value !== undefined;
  const activeTab = isControlled ? value : internalValue;

  const handleTabChange = React.useCallback(
    (tabValue: string) => {
      if (!isControlled) setInternalValue(tabValue);
      onValueChange?.(tabValue);
    },
    [isControlled, onValueChange]
  );

  return (
    <TabsContext.Provider value={{ activeTab, onTabChange: handleTabChange }}>
      <div className={className} data-orientation="horizontal">
        {children}
      </div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex h-10 items-center rounded-lg bg-muted p-1 text-muted-foreground',
        className
      )}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error('TabsTrigger must be used within Tabs');

  const isActive = ctx.activeTab === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? 'active' : 'inactive'}
      onClick={() => ctx.onTabChange(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isActive
          ? 'bg-background text-foreground shadow-sm'
          : 'hover:text-foreground',
        className
      )}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

function TabsContent({ value, children, className }: TabsContentProps) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error('TabsContent must be used within Tabs');

  if (ctx.activeTab !== value) return null;

  return (
    <div
      role="tabpanel"
      data-state="active"
      className={cn('mt-4', className)}
    >
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
