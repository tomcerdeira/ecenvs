import type { ReactNode } from 'react';

import { cn } from '@renderer/lib/utils';

interface MainPanelProps {
  children: ReactNode;
  className?: string;
}

export function MainPanel({ children, className }: MainPanelProps) {
  return (
    <div className={cn('flex min-h-0 flex-1 flex-col overflow-hidden p-4 sm:p-6', className)}>
      {children}
    </div>
  );
}
