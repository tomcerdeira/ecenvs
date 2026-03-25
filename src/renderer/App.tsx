import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ThemeProvider, useTheme } from 'next-themes';
import { toast } from 'sonner';

import { ConnectionPanel } from '@renderer/components/connection/ConnectionPanel';
import { DeployPanel } from '@renderer/components/deploy/DeployPanel';
import { EnvTable } from '@renderer/components/env/EnvTable';
import { EnvToolbar } from '@renderer/components/env/EnvToolbar';
import { Header } from '@renderer/components/layout/Header';
import { MainPanel } from '@renderer/components/layout/MainPanel';
import { Toaster } from '@renderer/components/ui/sonner';
import { TooltipProvider } from '@renderer/components/ui/tooltip';
import { useDeploymentPolling } from '@renderer/hooks/useDeploymentPolling';
import { addRecent, getEnvironmentForContainer, saveEnvVars } from '@renderer/lib/api';
import { getErrorMessage } from '@renderer/lib/utils';
import { useConnectionStore } from '@renderer/stores/connection-store';
import { useEnvStore } from '@renderer/stores/env-store';

function AppContent() {
  const profile = useConnectionStore((s) => s.profile);
  const region = useConnectionStore((s) => s.region);
  const clusterArn = useConnectionStore((s) => s.clusterArn);
  const serviceName = useConnectionStore((s) => s.serviceName);
  const containerName = useConnectionStore((s) => s.containerName);

  const hydrateFromRemote = useEnvStore((s) => s.hydrateFromRemote);
  const clearEnv = useEnvStore((s) => s.clear);
  const markPlainSaved = useEnvStore((s) => s.markPlainSaved);

  const { setTheme, resolvedTheme } = useTheme();
  const resolvedThemeRef = useRef(resolvedTheme);
  resolvedThemeRef.current = resolvedTheme;

  const [envLoading, setEnvLoading] = useState(false);
  const envRequestId = useRef(0);

  const deployPayload = useMemo(() => {
    if (!profile.trim() || !region.trim() || !clusterArn.trim() || !serviceName.trim()) {
      return null;
    }
    return { profile, region, clusterArn, serviceName };
  }, [profile, region, clusterArn, serviceName]);

  const { deployments, polling, start } = useDeploymentPolling(deployPayload);

  const handleSaveDeploy = useCallback(async () => {
    const env = useEnvStore.getState().rows.map((r) => ({
      name: r.name.trim(),
      value: r.value,
    }));
    const result = await saveEnvVars({
      profile,
      region,
      clusterArn,
      serviceName,
      containerName: containerName.trim(),
      environment: env,
    });
    markPlainSaved();
    start(result.taskDefinitionArn);
    try {
      await addRecent({
        profile,
        region,
        clusterArn,
        serviceName,
        containerName: containerName.trim(),
      });
    } catch {
      /* ignore persistence errors */
    }
  }, [profile, region, clusterArn, serviceName, containerName, markPlainSaved, start]);

  useEffect(() => {
    return window.api.onThemeFromMain((mode) => {
      if (mode === 'toggle') {
        const cur = resolvedThemeRef.current ?? 'light';
        setTheme(cur === 'dark' ? 'light' : 'dark');
      } else {
        setTheme(mode);
      }
    });
  }, [setTheme]);

  useEffect(() => {
    return window.api.onApplyRecent((r) => {
      void useConnectionStore.getState().applyRecent({
        profile: r.profile,
        region: r.region,
        clusterArn: r.clusterArn,
        serviceName: r.serviceName,
        containerName: r.containerName,
      });
    });
  }, []);

  useEffect(() => {
    if (
      !containerName.trim() ||
      !profile.trim() ||
      !region.trim() ||
      !clusterArn.trim() ||
      !serviceName.trim()
    ) {
      clearEnv();
      setEnvLoading(false);
      return;
    }

    const id = ++envRequestId.current;
    setEnvLoading(true);
    void (async () => {
      try {
        const environment = await getEnvironmentForContainer({
          profile,
          region,
          clusterArn,
          serviceName,
          containerName: containerName.trim(),
        });
        if (id !== envRequestId.current) return;
        hydrateFromRemote(environment);
        try {
          await addRecent({
            profile,
            region,
            clusterArn,
            serviceName,
            containerName: containerName.trim(),
          });
        } catch {
          /* ignore */
        }
      } catch (e) {
        if (id !== envRequestId.current) return;
        toast.error('Failed to load environment', { description: getErrorMessage(e) });
        clearEnv();
      } finally {
        if (id === envRequestId.current) setEnvLoading(false);
      }
    })();
  }, [profile, region, clusterArn, serviceName, containerName, hydrateFromRemote, clearEnv]);

  const showEnvSection = Boolean(containerName.trim());
  const connectionReady = showEnvSection && !envLoading;

  return (
    <TooltipProvider>
      <div className="relative flex h-screen min-h-0 flex-col overflow-hidden bg-background text-foreground">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_90%_50%_at_50%_-20%,oklch(0.55_0.14_275/0.12),transparent_60%)]"
        />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
          <Header />
          <ConnectionPanel />
          {showEnvSection ? (
            <MainPanel>
              <section className="flex min-h-0 flex-1 flex-col">
                <div className="shrink-0 border-b border-border/60 pb-4">
                  <h2 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                    Environment variables
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Values are masked by default. Plain variables can be saved to ECS; secret
                    references stay in the task definition and are not edited here.
                  </p>
                </div>

                {envLoading ? (
                  <div
                    aria-busy="true"
                    aria-live="polite"
                    className="flex flex-1 items-center gap-2 py-8 text-sm text-muted-foreground"
                  >
                    <Loader2 aria-hidden className="size-4 animate-spin" />
                    Loading environment…
                  </div>
                ) : (
                  <>
                    <div className="shrink-0 border-b border-border/60 py-4">
                      <EnvToolbar
                        connectionReady={connectionReady}
                        onSaveDeploy={handleSaveDeploy}
                      />
                    </div>
                    <div className="min-h-0 flex-1 overflow-auto border-b border-border/60 py-4">
                      <EnvTable />
                    </div>
                    <div className="shrink-0 pt-4">
                      <DeployPanel deployments={deployments} polling={polling} />
                    </div>
                  </>
                )}
              </section>
            </MainPanel>
          ) : null}
        </div>
      </div>
      <Toaster />
    </TooltipProvider>
  );
}

export function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="ecenvs-theme">
      <AppContent />
    </ThemeProvider>
  );
}
