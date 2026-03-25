# Commit 5: Layout shell and AWS connection flow

## Commit message

```
feat: add sidebar layout and AWS connection flow
```

## Overview

Build the application shell (sidebar + main panel + header), compose profile/region/cluster/service/container selectors, add a Zustand `connection-store` with async cascade loading, and a typed `lib/api.ts` wrapper around `window.api` so the UI stays decoupled from IPC details.

## Prerequisites

- [Commit 4](./04-shared-types-main-process.md) completed: IPC + ECS reads working for profiles, clusters, services, and container list (or minimal stubs that resolve for your test account).

## Files to create

| Path | Description |
|------|-------------|
| `src/renderer/components/layout/Sidebar.tsx` | App branding, nav placeholder, connection summary. |
| `src/renderer/components/layout/MainPanel.tsx` | Scrollable main area for connection + future table. |
| `src/renderer/components/layout/Header.tsx` | Title, optional actions slot. |
| `src/renderer/components/connection/ConnectionSelect.tsx` | Labeled `Select` wrapper (label + shadcn Select). |
| `src/renderer/components/connection/ConnectionPanel.tsx` | Profile, region, cluster, service, container selects; buttons: “Load clusters” / refresh as needed. |
| `src/renderer/stores/connection-store.ts` | Zustand store: `profile`, `region`, `cluster`, `serviceName`, `containerName`, lists, loading flags, errors, actions. |
| `src/renderer/lib/api.ts` | Thin typed functions calling `window.api.*` with consistent error handling. |

## Files to modify

| Path | Changes |
|------|---------|
| `src/renderer/App.tsx` | Compose Sidebar + MainPanel; place ConnectionPanel in main content. |
| `src/renderer/main.tsx` | Ensure React root and any providers still wrap App. |

## Dependencies to install

```bash
npm install zustand
```

## Implementation details

### Connection cascade

1. User picks **profile** + **region** → enable “Load clusters” (or auto-fetch on change).
2. **Load clusters** → `listClusters` → populate cluster select.
3. Selecting **cluster** → `listServices` → populate service select.
4. Selecting **service** → `describeServices` / task def → list **container** names from task definition.
5. Selecting **container** → triggers `get-env-vars` in Commit 6 (store selected ids for next step).

### `connection-store` state (illustrative)

- `profiles: string[]`, `regions: string[]` (static or from IPC).
- `clusters: string[]`, `services: Array<{ name: string; ... }>`, `containers: string[]`.
- `loading: { clusters?: boolean; services?: boolean; containers?: boolean }`.
- Actions: `setProfile`, `setRegion`, `loadClusters`, `loadServices`, `loadContainers`, `reset downstream` when upstream changes.

### `lib/api.ts`

- Re-export or wrap each IPC method; map `ApiResult` failures to thrown errors or Result type — pick one pattern and use consistently in stores.

### UX

- Disable selects until prerequisites are selected; show `Skeleton` or spinner in panel during loads.
- Surface errors with `Sonner` toast (from Commit 3) on failure.

## Verification

- [ ] Select a valid profile and region, load clusters, pick cluster → services appear.
- [ ] Pick service → container names appear (from task definition).
- [ ] Changing profile or region clears downstream selections and refetches appropriately.

## Commit checklist

- [ ] No raw `window.api` calls outside `lib/api.ts` (except dev test).
- [ ] Layout is responsive within min window size; touch targets ≥ 44px where applicable.
