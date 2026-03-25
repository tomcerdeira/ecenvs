import { create } from 'zustand';
import { toast } from 'sonner';

import * as api from '@renderer/lib/api';
import type { RecentConnectionPayload, ServiceInfo } from '@shared/types';

export type ConnectionLoading = {
  profiles: boolean;
  regions: boolean;
  clusters: boolean;
  services: boolean;
  containers: boolean;
};

const idleLoading: ConnectionLoading = {
  profiles: false,
  regions: false,
  clusters: false,
  services: false,
  containers: false,
};

interface ConnectionState {
  profile: string;
  region: string;
  clusterArn: string;
  serviceName: string;
  containerName: string;
  profiles: string[];
  regions: string[];
  clusters: string[];
  services: ServiceInfo[];
  containers: string[];
  loading: ConnectionLoading;

  loadInitialData: () => Promise<void>;
  setProfile: (value: string) => void;
  setRegion: (value: string) => void;
  loadClusters: () => Promise<void>;
  setClusterArn: (value: string) => void;
  setServiceName: (value: string) => void;
  setContainerName: (value: string) => void;

  /** Restore connection fields and reload clusters, services, and container names. */
  applyRecent: (r: RecentConnectionPayload) => Promise<void>;
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  profile: '',
  region: '',
  clusterArn: '',
  serviceName: '',
  containerName: '',
  profiles: [],
  regions: [],
  clusters: [],
  services: [],
  containers: [],
  loading: { ...idleLoading },

  loadInitialData: async () => {
    set((s) => ({
      ...s,
      loading: { ...s.loading, profiles: true, regions: true },
    }));
    try {
      const [profiles, regions] = await Promise.all([api.listProfiles(), api.listRegions()]);
      set((s) => ({
        ...s,
        profiles,
        regions,
        loading: { ...s.loading, profiles: false, regions: false },
      }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error('Failed to load profiles or regions', { description: msg });
      set((s) => ({
        ...s,
        loading: { ...s.loading, profiles: false, regions: false },
      }));
    }
  },

  setProfile: (value) => {
    set((s) => ({
      ...s,
      profile: value,
      clusterArn: '',
      serviceName: '',
      containerName: '',
      clusters: [],
      services: [],
      containers: [],
    }));
  },

  setRegion: (value) => {
    set((s) => ({
      ...s,
      region: value,
      clusterArn: '',
      serviceName: '',
      containerName: '',
      clusters: [],
      services: [],
      containers: [],
    }));
  },

  loadClusters: async () => {
    const { profile, region } = get();
    if (!profile.trim() || !region.trim()) {
      toast.error('Select a profile and region first');
      return;
    }
    set((s) => ({ ...s, loading: { ...s.loading, clusters: true } }));
    try {
      const clusters = await api.listClusters({ profile, region });
      set((s) => ({
        ...s,
        clusters,
        clusterArn: '',
        serviceName: '',
        containerName: '',
        services: [],
        containers: [],
        loading: { ...s.loading, clusters: false },
      }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error('Failed to load clusters', { description: msg });
      set((s) => ({ ...s, loading: { ...s.loading, clusters: false } }));
    }
  },

  setClusterArn: (value) => {
    set((s) => ({
      ...s,
      clusterArn: value,
      serviceName: '',
      containerName: '',
      services: [],
      containers: [],
    }));
    if (!value.trim()) return;

    const { profile, region } = get();
    if (!profile.trim() || !region.trim()) return;

    set((s) => ({ ...s, loading: { ...s.loading, services: true } }));
    void (async () => {
      try {
        const snap = get();
        const services = await api.listServices({
          profile: snap.profile,
          region: snap.region,
          clusterArn: snap.clusterArn,
        });
        set((s) => ({
          ...s,
          services,
          loading: { ...s.loading, services: false },
        }));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        toast.error('Failed to load services', { description: msg });
        set((s) => ({ ...s, loading: { ...s.loading, services: false } }));
      }
    })();
  },

  setServiceName: (value) => {
    set((s) => ({
      ...s,
      serviceName: value,
      containerName: '',
      containers: [],
    }));
    if (!value.trim()) return;

    const { profile, region, clusterArn } = get();
    if (!profile.trim() || !region.trim() || !clusterArn.trim()) return;

    set((s) => ({ ...s, loading: { ...s.loading, containers: true } }));
    void (async () => {
      try {
        const snap = get();
        const containers = await api.getContainerNamesForService({
          profile: snap.profile,
          region: snap.region,
          clusterArn: snap.clusterArn,
          serviceName: snap.serviceName,
        });
        set((s) => ({
          ...s,
          containers,
          containerName: '',
          loading: { ...s.loading, containers: false },
        }));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        toast.error('Failed to load containers', { description: msg });
        set((s) => ({ ...s, loading: { ...s.loading, containers: false } }));
      }
    })();
  },

  setContainerName: (value) => {
    set((s) => ({ ...s, containerName: value }));
  },

  applyRecent: async (r) => {
    set({
      profile: r.profile,
      region: r.region,
      clusterArn: '',
      serviceName: '',
      containerName: '',
      clusters: [],
      services: [],
      containers: [],
    });
    set((s) => ({ ...s, loading: { ...s.loading, clusters: true } }));
    try {
      const clusters = await api.listClusters({ profile: r.profile, region: r.region });
      set((s) => ({
        ...s,
        clusters,
        clusterArn: r.clusterArn,
        loading: { ...s.loading, clusters: false, services: true },
      }));
      const snap = get();
      const services = await api.listServices({
        profile: snap.profile,
        region: snap.region,
        clusterArn: snap.clusterArn,
      });
      set((s) => ({
        ...s,
        services,
        serviceName: r.serviceName,
        loading: { ...s.loading, services: false, containers: true },
      }));
      const snap2 = get();
      const containers = await api.getContainerNamesForService({
        profile: snap2.profile,
        region: snap2.region,
        clusterArn: snap2.clusterArn,
        serviceName: snap2.serviceName,
      });
      set((s) => ({
        ...s,
        containers,
        containerName: r.containerName,
        loading: { ...s.loading, containers: false },
      }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error('Failed to apply recent connection', { description: msg });
      set((s) => ({
        ...s,
        loading: { ...idleLoading },
      }));
    }
  },
}));
