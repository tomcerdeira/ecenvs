import { Loader2 } from 'lucide-react';

import { DeployCard } from '@renderer/components/deploy/DeployCard';
import type { DeploymentInfo } from '@shared/types';

export function DeployPanel({
  deployments,
  polling,
}: {
  deployments: DeploymentInfo[];
  polling: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          Deployments
        </h3>
        {polling ? (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Loader2 aria-hidden className="size-3.5 animate-spin" />
            Watching rollout…
          </span>
        ) : null}
      </div>
      {deployments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No deployment data yet. Save to push a new revision.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {deployments.map((d) => (
            <li key={d.id}>
              <DeployCard deployment={d} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
