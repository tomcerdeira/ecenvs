import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';

import { ConnectionSelect } from '@renderer/components/connection/ConnectionSelect';
import { Button } from '@renderer/components/ui/button';
import { SelectItem } from '@renderer/components/ui/select';
import { Skeleton } from '@renderer/components/ui/skeleton';
import { shortClusterArn } from '@renderer/lib/aws-display';
import { listRecents } from '@renderer/lib/api';
import { cn } from '@renderer/lib/utils';
import { useConnectionStore } from '@renderer/stores/connection-store';
import { useUiStore } from '@renderer/stores/ui-store';
import type { RecentConnection } from '@shared/types';

function recentValue(r: RecentConnection): string {
  return `${r.profile}\t${r.region}\t${r.clusterArn}\t${r.serviceName}\t${r.containerName}`;
}

export function ConnectionPanel() {
  const connectionPanelOpen = useUiStore((s) => s.connectionPanelOpen);
  const setConnectionPanelOpen = useUiStore((s) => s.setConnectionPanelOpen);
  const toggleConnectionPanel = useUiStore((s) => s.toggleConnectionPanel);

  const loadInitialData = useConnectionStore((s) => s.loadInitialData);
  const setProfile = useConnectionStore((s) => s.setProfile);
  const setRegion = useConnectionStore((s) => s.setRegion);
  const loadClusters = useConnectionStore((s) => s.loadClusters);
  const setClusterArn = useConnectionStore((s) => s.setClusterArn);
  const setServiceName = useConnectionStore((s) => s.setServiceName);
  const setContainerName = useConnectionStore((s) => s.setContainerName);
  const applyRecent = useConnectionStore((s) => s.applyRecent);

  const profile = useConnectionStore((s) => s.profile);
  const region = useConnectionStore((s) => s.region);
  const clusterArn = useConnectionStore((s) => s.clusterArn);
  const serviceName = useConnectionStore((s) => s.serviceName);
  const containerName = useConnectionStore((s) => s.containerName);

  const profiles = useConnectionStore((s) => s.profiles);
  const regions = useConnectionStore((s) => s.regions);
  const clusters = useConnectionStore((s) => s.clusters);
  const services = useConnectionStore((s) => s.services);
  const containers = useConnectionStore((s) => s.containers);

  const loading = useConnectionStore((s) => s.loading);

  const [recents, setRecents] = useState<RecentConnection[]>([]);
  const [recentSelect, setRecentSelect] = useState('');

  const wasConnectedRef = useRef(false);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    void listRecents()
      .then(setRecents)
      .catch(() => {});
  }, [profile, region, clusterArn, serviceName, containerName]);

  const connected =
    Boolean(profile.trim()) &&
    Boolean(region.trim()) &&
    Boolean(clusterArn.trim()) &&
    Boolean(serviceName.trim()) &&
    Boolean(containerName.trim());

  useEffect(() => {
    if (connected && !wasConnectedRef.current) {
      setConnectionPanelOpen(false);
    }
    wasConnectedRef.current = connected;
  }, [connected, setConnectionPanelOpen]);

  const recentItems = useMemo(
    () =>
      recents.map((r) => ({
        value: recentValue(r),
        label: `${r.profile} · ${r.serviceName} · ${r.containerName}`,
        payload: r,
      })),
    [recents]
  );

  const profileDisabled = loading.profiles && profiles.length === 0;
  const regionDisabled = loading.regions && regions.length === 0;
  const canLoadClusters = Boolean(profile.trim()) && Boolean(region.trim()) && !loading.clusters;
  const clusterDisabled = clusters.length === 0 || loading.clusters;
  const serviceDisabled = !clusterArn || services.length === 0;
  const containerDisabled = !serviceName || containers.length === 0;

  const clusterShort = clusterArn ? shortClusterArn(clusterArn) : '—';
  const collapsedSummary = [
    profile || '—',
    region || '—',
    clusterShort,
    serviceName || '—',
    containerName || '—',
  ].join(' · ');

  return (
    <section className="shrink-0 border-b border-border/60 bg-card/15">
      <div className="flex items-start gap-2 px-4 py-3 sm:px-6">
        <Button
          aria-expanded={connectionPanelOpen}
          aria-controls="connection-panel-fields"
          className="h-auto min-h-11 shrink-0 gap-2 px-2 py-2 text-left font-normal sm:px-3"
          onClick={() => toggleConnectionPanel()}
          type="button"
          variant="ghost"
        >
          <ChevronDown
            aria-hidden
            className={cn(
              'size-4 shrink-0 transition-transform duration-200',
              connectionPanelOpen && 'rotate-180'
            )}
          />
          <span>
            <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              AWS connection
            </span>
            <span className="sr-only"> — {connectionPanelOpen ? 'expanded' : 'collapsed'}</span>
          </span>
        </Button>
        {!connectionPanelOpen ? (
          <p
            className="min-w-0 flex-1 pt-2 text-xs text-muted-foreground sm:text-sm"
            title={collapsedSummary}
          >
            {collapsedSummary}
          </p>
        ) : null}
      </div>

      {connectionPanelOpen ? (
        <div
          className="border-t border-border/40 px-4 pb-5 pt-2 sm:px-6 sm:pb-6"
          id="connection-panel-fields"
        >
          <p className="mb-4 text-sm text-muted-foreground">
            Choose profile and region, load clusters, then pick a service and container.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            {recentItems.length > 0 ? (
              <div className="sm:col-span-2 lg:col-span-3">
                <ConnectionSelect
                  id="conn-recents"
                  label="Recent connections"
                  placeholder="Apply a saved connection…"
                  value={recentSelect}
                  onValueChange={(v) => {
                    setRecentSelect(v);
                    const item = recentItems.find((x) => x.value === v);
                    if (item) {
                      void applyRecent({
                        profile: item.payload.profile,
                        region: item.payload.region,
                        clusterArn: item.payload.clusterArn,
                        serviceName: item.payload.serviceName,
                        containerName: item.payload.containerName,
                      });
                    }
                    setRecentSelect('');
                  }}
                >
                  {recentItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </ConnectionSelect>
              </div>
            ) : null}

            {profileDisabled ? (
              <div className="grid gap-2 sm:col-span-2 lg:col-span-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-11 w-full" />
              </div>
            ) : (
              <ConnectionSelect
                id="conn-profile"
                label="Profile"
                placeholder="Select profile"
                value={profile}
                onValueChange={setProfile}
                disabled={loading.profiles}
              >
                {profiles.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </ConnectionSelect>
            )}

            {regionDisabled ? (
              <div className="grid gap-2 sm:col-span-2 lg:col-span-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-11 w-full" />
              </div>
            ) : (
              <ConnectionSelect
                id="conn-region"
                label="Region"
                placeholder="Select region"
                value={region}
                onValueChange={setRegion}
                disabled={loading.regions}
              >
                {regions.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </ConnectionSelect>
            )}

            <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-3 lg:flex-row lg:items-end lg:gap-4">
              <div className="min-w-0 flex-1">
                <ConnectionSelect
                  id="conn-cluster"
                  label="Cluster"
                  placeholder={clusters.length ? 'Select cluster' : 'Load clusters first'}
                  value={clusterArn}
                  onValueChange={setClusterArn}
                  disabled={clusterDisabled}
                >
                  {clusters.map((arn) => (
                    <SelectItem key={arn} value={arn}>
                      {shortClusterArn(arn)}
                    </SelectItem>
                  ))}
                </ConnectionSelect>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-end">
                <Button
                  className="h-11 min-h-11 w-full shrink-0 sm:w-auto"
                  disabled={!canLoadClusters}
                  onClick={() => void loadClusters()}
                  type="button"
                >
                  {loading.clusters ? (
                    <>
                      <Loader2 aria-hidden className="mr-2 size-4 animate-spin" />
                      Loading…
                    </>
                  ) : (
                    'Load clusters'
                  )}
                </Button>
                {!profile.trim() || !region.trim() ? (
                  <p className="text-xs text-muted-foreground sm:max-w-[10rem] sm:pb-2">
                    Select profile and region first.
                  </p>
                ) : null}
              </div>
            </div>

            {loading.services && clusterArn ? (
              <div className="grid gap-2 sm:col-span-2 lg:col-span-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-11 w-full" />
              </div>
            ) : (
              <ConnectionSelect
                id="conn-service"
                label="Service"
                placeholder={services.length ? 'Select service' : 'Select a cluster first'}
                value={serviceName}
                onValueChange={setServiceName}
                disabled={serviceDisabled}
              >
                {services.map((svc) => (
                  <SelectItem key={svc.serviceArn} value={svc.serviceName}>
                    {svc.serviceName}
                  </SelectItem>
                ))}
              </ConnectionSelect>
            )}

            {loading.containers && serviceName ? (
              <div className="grid gap-2 sm:col-span-2 lg:col-span-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-11 w-full" />
              </div>
            ) : (
              <ConnectionSelect
                id="conn-container"
                label="Container"
                placeholder={containers.length ? 'Select container' : 'Select a service first'}
                value={containerName}
                onValueChange={setContainerName}
                disabled={containerDisabled}
              >
                {containers.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </ConnectionSelect>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
