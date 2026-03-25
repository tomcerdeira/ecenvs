import Store from 'electron-store';

import type { RecentConnection, RecentConnectionPayload } from '@shared/types';

export interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMaximized: boolean;
}

interface EcEnvsSchema {
  windowState: WindowState | null;
  recents: RecentConnection[];
}

export const appStore = new Store<EcEnvsSchema>({
  name: 'ecenvs',
  defaults: {
    windowState: null,
    recents: [],
  },
});

function recentKey(r: RecentConnectionPayload): string {
  return `${r.profile}\t${r.region}\t${r.clusterArn}\t${r.serviceName}\t${r.containerName}`;
}

export function addRecentConnection(entry: RecentConnectionPayload): void {
  const prev = appStore.get('recents');
  const k = recentKey(entry);
  const filtered = prev.filter((r) => recentKey(r) !== k);
  const next: RecentConnection[] = [
    { ...entry, updatedAt: new Date().toISOString() },
    ...filtered,
  ].slice(0, 5);
  appStore.set('recents', next);
}

export function listRecentConnections(): RecentConnection[] {
  return appStore.get('recents');
}
