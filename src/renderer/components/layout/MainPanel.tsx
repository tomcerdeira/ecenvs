import type { ReactNode } from 'react';

import { ScrollArea } from '@renderer/components/ui/scroll-area';
import { cn } from '@renderer/lib/utils';

interface MainPanelProps {
  children: ReactNode;
  className?: string;
}

export function MainPanel({ children, className }: MainPanelProps) {
  return (
    <ScrollArea className={cn('min-h-0 flex-1', className)}>
      <div className="min-h-[min(100%,480px)] p-6 sm:p-8">{children}</div>
    </ScrollArea>
  );
}
