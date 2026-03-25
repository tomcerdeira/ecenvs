import { shortClusterArn } from '@renderer/lib/aws-display';
import { cn } from '@renderer/lib/utils';
import { useConnectionStore } from '@renderer/stores/connection-store';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const profile = useConnectionStore((s) => s.profile);
  const region = useConnectionStore((s) => s.region);
  const clusterArn = useConnectionStore((s) => s.clusterArn);
  const serviceName = useConnectionStore((s) => s.serviceName);
  const containerName = useConnectionStore((s) => s.containerName);

  const clusterShort = clusterArn ? shortClusterArn(clusterArn) : '—';
  const service = serviceName || '—';
  const container = containerName || '—';

  return (
    <aside
      className={cn(
        'flex w-full min-w-0 shrink-0 flex-col border-b border-border/80 bg-card/25 backdrop-blur-md sm:w-60 sm:border-r sm:border-b-0 lg:w-64',
        className
      )}
    >
      <div className="border-b border-border/60 px-5 py-5 sm:px-6">
        <p className="text-[11px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
          ecenvs
        </p>
        <p className="mt-2 text-base font-semibold tracking-tight">ECS environments</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Browse clusters, services, and task env.
        </p>
      </div>

      <nav className="px-5 py-4 sm:px-6" aria-label="Main">
        <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
          Navigation
        </p>
        <ul className="mt-3 space-y-1">
          <li>
            <span className="block min-h-11 rounded-md border border-border/60 bg-background/40 px-3 py-2.5 text-sm font-medium text-foreground">
              Connection
            </span>
          </li>
          <li>
            <span className="block min-h-11 rounded-md px-3 py-2.5 text-sm text-muted-foreground">
              Env editor (soon)
            </span>
          </li>
        </ul>
      </nav>

      <div className="mt-auto border-t border-border/60 px-5 py-5 sm:px-6">
        <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
          Connection
        </p>
        <dl className="mt-3 space-y-2 text-xs text-muted-foreground">
          <div className="flex justify-between gap-2">
            <dt className="shrink-0 text-[11px] uppercase">Profile</dt>
            <dd className="min-w-0 truncate text-right text-foreground">{profile || '—'}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="shrink-0 text-[11px] uppercase">Region</dt>
            <dd className="min-w-0 truncate text-right text-foreground">{region || '—'}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="shrink-0 text-[11px] uppercase">Cluster</dt>
            <dd className="min-w-0 truncate text-right font-mono text-[11px] text-foreground">
              {clusterShort}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="shrink-0 text-[11px] uppercase">Service</dt>
            <dd className="min-w-0 truncate text-right text-foreground">{service}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="shrink-0 text-[11px] uppercase">Container</dt>
            <dd className="min-w-0 truncate text-right text-foreground">{container}</dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}
