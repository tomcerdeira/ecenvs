import type { ReactNode } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@renderer/components/ui/button';
import { cn } from '@renderer/lib/utils';

interface HeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function Header({ title, description, actions, className }: HeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();

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
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            aria-label="Toggle light or dark theme"
            className="size-9"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            size="icon"
            type="button"
            variant="outline"
          >
            {resolvedTheme === 'dark' ? (
              <Sun aria-hidden className="size-4" />
            ) : (
              <Moon aria-hidden className="size-4" />
            )}
          </Button>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      </div>
    </header>
  );
}
