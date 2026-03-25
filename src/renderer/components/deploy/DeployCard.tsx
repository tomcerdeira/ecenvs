import { Badge } from '@renderer/components/ui/badge';
import type { DeploymentInfo } from '@shared/types';

function shortArn(arn: string): string {
  const parts = arn.split('/');
  return parts[parts.length - 1] ?? arn;
}

export function DeployCard({ deployment }: { deployment: DeploymentInfo }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border/80 bg-card/50 px-4 py-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={deployment.status === 'PRIMARY' ? 'default' : 'secondary'}>
          {deployment.status}
        </Badge>
        {deployment.rolloutState ? (
          <Badge variant="outline">{deployment.rolloutState}</Badge>
        ) : null}
        <span className="text-xs text-muted-foreground tabular-nums">
          desired {deployment.desiredCount} · pending {deployment.pendingCount} · running{' '}
          {deployment.runningCount}
        </span>
      </div>
      <p
        className="break-all font-mono text-xs text-muted-foreground"
        title={deployment.taskDefinition}
      >
        {shortArn(deployment.taskDefinition)}
      </p>
      {deployment.updatedAt ? (
        <p className="text-xs text-muted-foreground">Updated {deployment.updatedAt}</p>
      ) : null}
    </div>
  );
}
