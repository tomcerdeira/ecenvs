import type { ReactNode } from 'react';

import { cn } from '@renderer/lib/utils';

interface HeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function Header({ title, description, actions, className }: HeaderProps) {
  return (
    <header
      className={cn(
        'shrink-0 border-b border-border/80 bg-card/30 px-6 py-4 backdrop-blur-sm sm:px-8',
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h1>
          {description ? (
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
