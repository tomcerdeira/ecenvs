import { Fragment } from 'react';
import { ChevronRight, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@renderer/components/ui/button';
import { shortClusterArn } from '@renderer/lib/aws-display';
import { cn } from '@renderer/lib/utils';
import { useConnectionStore } from '@renderer/stores/connection-store';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();

  const profile = useConnectionStore((s) => s.profile);
  const region = useConnectionStore((s) => s.region);
  const clusterArn = useConnectionStore((s) => s.clusterArn);
  const serviceName = useConnectionStore((s) => s.serviceName);
  const containerName = useConnectionStore((s) => s.containerName);

  const clusterShort = clusterArn ? shortClusterArn(clusterArn) : '—';
  const crumbs = [
    profile || '—',
    region || '—',
    clusterShort,
    serviceName || '—',
    containerName || '—',
  ];

  return (
    <header
      className={cn(
        'shrink-0 border-b border-border/80 bg-card/30 px-4 py-3 backdrop-blur-sm sm:px-6 sm:py-4',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="min-w-0 shrink-0">
          <p className="text-[11px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
            ecenvs
          </p>
          <p className="text-sm font-semibold tracking-tight sm:text-base">ECS environments</p>
        </div>
        <nav
          aria-label="Current connection"
          className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1 gap-y-0.5 text-xs text-muted-foreground sm:text-sm"
        >
          {crumbs.map((c, i) => (
            <Fragment key={i}>
              {i > 0 ? <ChevronRight aria-hidden className="size-3 shrink-0 opacity-50" /> : null}
              <span className="min-w-0 max-w-[min(100%,12rem)] truncate font-mono text-[11px] text-foreground sm:text-xs">
                {c}
              </span>
            </Fragment>
          ))}
        </nav>
        <div className="ml-auto flex shrink-0 flex-wrap items-center gap-2">
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
        </div>
      </div>
    </header>
  );
}
