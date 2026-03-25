import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import * as api from '@renderer/lib/api';
import { getErrorMessage } from '@renderer/lib/utils';
import type { DeploymentInfo, GetDeploymentsPayload } from '@shared/types';

const POLL_MS = 5000;
const MAX_MS = 30 * 60 * 1000;

function classify(d: DeploymentInfo): 'completed' | 'failed' | 'in_progress' {
  if (d.rolloutState === 'FAILED') return 'failed';
  if (d.rolloutState === 'COMPLETED') return 'completed';
  if (d.rolloutState === 'IN_PROGRESS') return 'in_progress';
  if (d.pendingCount > 0) return 'in_progress';
  if (d.status === 'PRIMARY' && d.desiredCount > 0 && d.runningCount >= d.desiredCount) {
    return 'completed';
  }
  if (d.status === 'PRIMARY' && d.desiredCount === 0 && d.pendingCount === 0) {
    return 'completed';
  }
  return 'in_progress';
}

export function useDeploymentPolling(base: GetDeploymentsPayload | null) {
  const [deployments, setDeployments] = useState<DeploymentInfo[]>([]);
  const [polling, setPolling] = useState(false);
  const targetTaskDefArnRef = useRef('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef(0);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPolling(false);
    targetTaskDefArnRef.current = '';
  }, []);

  const tick = useCallback(async () => {
    if (!base) return;
    if (Date.now() - startedAtRef.current > MAX_MS) {
      stop();
      toast.error('Deployment status polling timed out', {
        description: 'Check the AWS console for the latest state.',
      });
      return;
    }
    try {
      const list = await api.getDeployments(base);
      setDeployments(list);
      const targetArn = targetTaskDefArnRef.current;
      const primary = list.find((d) => d.status === 'PRIMARY');
      if (!primary || !targetArn) return;
      if (primary.taskDefinition !== targetArn) return;

      const outcome = classify(primary);
      if (outcome === 'failed') {
        stop();
        toast.error('Deployment failed', {
          description: `Rollout state: ${primary.rolloutState ?? 'FAILED'}`,
        });
        return;
      }
      if (outcome === 'completed') {
        stop();
        toast.success('Deployment completed', {
          description: 'The service reached a steady state for the new task definition.',
        });
      }
    } catch (e) {
      toast.error('Failed to poll deployment status', { description: getErrorMessage(e) });
    }
  }, [base, stop]);

  const start = useCallback(
    (taskDefinitionArn: string) => {
      if (!base) return;
      targetTaskDefArnRef.current = taskDefinitionArn;
      startedAtRef.current = Date.now();
      setPolling(true);
      void tick();
    },
    [base, tick]
  );

  useEffect(() => {
    if (!polling || !base) return;
    timerRef.current = setInterval(() => void tick(), POLL_MS);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [polling, base, tick]);

  useEffect(() => {
    if (!base) {
      setDeployments([]);
      stop();
    }
  }, [base, stop]);

  useEffect(() => {
    if (!base) return;
    void (async () => {
      try {
        const list = await api.getDeployments(base);
        setDeployments(list);
      } catch {
        /* ignore initial fetch errors */
      }
    })();
  }, [base?.profile, base?.region, base?.clusterArn, base?.serviceName]);

  return { deployments, polling, start, stop, refresh: tick };
}
