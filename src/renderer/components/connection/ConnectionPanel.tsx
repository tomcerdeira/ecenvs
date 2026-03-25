import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { ConnectionSelect } from '@renderer/components/connection/ConnectionSelect';
import { Button } from '@renderer/components/ui/button';
import { SelectItem } from '@renderer/components/ui/select';
import { Skeleton } from '@renderer/components/ui/skeleton';
import { shortClusterArn } from '@renderer/lib/aws-display';
import { listRecents } from '@renderer/lib/api';
import { useConnectionStore } from '@renderer/stores/connection-store';
import type { RecentConnection } from '@shared/types';

function recentValue(r: RecentConnection): string {
  return `${r.profile}\t${r.region}\t${r.clusterArn}\t${r.serviceName}\t${r.containerName}`;
}

export function ConnectionPanel() {
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

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    void listRecents()
      .then(setRecents)
      .catch(() => {});
  }, [profile, region, clusterArn, serviceName, containerName]);

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

  return (
    <section className="rounded-xl border border-border/80 bg-card/40 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),0_24px_48px_-24px_rgba(0,0,0,0.55)] backdrop-blur-md sm:p-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          AWS connection
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose profile and region, load clusters, then pick a service and container.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-6">
        {recentItems.length > 0 ? (
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
        ) : null}

        {profileDisabled ? (
          <div className="grid gap-2">
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
          <div className="grid gap-2">
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

        <div className="flex flex-wrap items-end gap-3">
          <Button
            className="h-11 min-h-11 shrink-0"
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
            <p className="text-xs text-muted-foreground">Select profile and region first.</p>
          ) : null}
        </div>

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

        {loading.services && clusterArn ? (
          <div className="grid gap-2">
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
          <div className="grid gap-2">
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
    </section>
  );
}
