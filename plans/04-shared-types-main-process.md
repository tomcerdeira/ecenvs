# Commit 4: Shared types, AWS ECS service, IPC, preload

## Commit message

```
feat: add typed IPC layer and AWS ECS service
```

## Overview

Define shared IPC channel names and TypeScript types for profiles, regions, clusters, services, env vars, and deployment status. Implement main-process services to read AWS profiles from disk and call ECS APIs via the AWS SDK v3. Register `ipcMain.handle` for all channels, expose a typed `window.api` from preload via `contextBridge`, and verify from renderer DevTools.

## Prerequisites

- [Commit 3](./03-shadcn-design-system.md) completed.
- Local AWS config optional for manual tests; handlers should return structured errors when credentials are missing.

## Files to create

| Path | Description |
|------|-------------|
| `src/shared/channels.ts` | String constants for every IPC channel (see list below). |
| `src/shared/types.ts` | `ApiResult<T>`, `EnvVar`, `ContainerEnv`, `ServiceInfo`, deployment DTOs, error shapes. |
| `src/main/services/aws-profiles.ts` | Parse `~/.aws/credentials` and `~/.aws/config` for profile names and default region hints. |
| `src/main/services/ecs-client.ts` | Wrapper using `@aws-sdk/client-ecs`: `ListClusters`, `ListServices`, `DescribeServices`, `DescribeTaskDefinition`, `RegisterTaskDefinition`, `UpdateService`; inject credentials from profile via `@aws-sdk/credential-providers`. |
| `src/main/ipc/handlers.ts` | Register all handlers; delegate to services; return `ApiResult` consistently. |
| `src/preload/index.ts` | `contextBridge.exposeInMainWorld('api', { ... })` with methods matching channels. |
| `src/preload/index.d.ts` or global `Window` augmentation | Type `window.api` for renderer. |

## Files to modify

| Path | Changes |
|------|---------|
| `src/main/index.ts` (or `main.ts`) | Import and call `registerIpcHandlers()` after `app.whenReady()` (or appropriate lifecycle). |
| `forge.config.ts` / Vite main config | Ensure preload script path is built and referenced in `BrowserWindow` `webPreferences.preload`. |
| `tsconfig` paths | Confirm `@shared/*` resolves for main, preload, renderer. |

## Dependencies to install

```bash
npm install @aws-sdk/client-ecs @aws-sdk/credential-providers
```

## Implementation details

### IPC channels (must match everywhere)

- `list-profiles`
- `list-regions` (can derive from static list `aws-regions` or `@aws-sdk/client-ec2` if you prefer; MVP may use a curated list + config file default)
- `list-clusters`
- `list-services`
- `get-env-vars`
- `save-env-vars`
- `get-deployments`

**Note:** If `list-regions` is not in MVP, implement as `describeRegions`-style or hardcoded common regions; document in handler.

### Types (illustrative)

```ts
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; details?: unknown } };

export interface EnvVar {
  name: string;
  value: string;
  /** Plain env vs secret ref — secrets may be read-only in UI later */
  source?: 'plain' | 'secret';
}

export interface ContainerEnv {
  containerName: string;
  environment: EnvVar[];
}
```

### `ecs-client.ts` responsibilities

- Accept `{ profile, region }` per call or construct client with `fromIni({ profile })` and region.
- **ListClusters**: paginate with `nextToken` if needed.
- **ListServices**: pass `cluster`, paginate.
- **DescribeServices**: get `taskDefinition` ARN for selected service.
- **DescribeTaskDefinition**: read `containerDefinitions[].environment` and `secrets` for later commits.
- **RegisterTaskDefinition** / **UpdateService**: used in Commit 7 — stubs may return `not implemented` until then, or implement early with feature flag.

**Recommendation:** Implement read-only paths fully in this commit; implement register/update in Commit 7 to avoid half-deploys, **or** implement and guard from UI.

### Preload API surface

Expose methods such as:

- `listProfiles(): Promise<ApiResult<string[]>>`
- `listClusters(profile, region): Promise<ApiResult<string[]>>`
- `listServices(...)`, `getEnvVars(...)` with cluster, serviceName, containerName params as needed.

Align parameter shapes with [Commit 5](./05-layout-shell-connection-flow.md).

### Security

- Never pass arbitrary file paths from renderer; main process only reads fixed AWS paths.
- Validate IPC payloads (zod optional) before SDK calls.

## Verification

- [ ] `npm run typecheck` passes across main/preload/renderer.
- [ ] Start app, open DevTools on renderer, run:
  ```js
  await window.api.listProfiles()
  ```
  Expect `{ ok: true, data: [...] }` or a structured error if no `~/.aws` files.

## Commit checklist

- [ ] All channels defined in `channels.ts` and used in handlers + preload.
- [ ] No `nodeIntegration: true`; `contextIsolation: true` with preload only.
- [ ] Manual DevTools test passes for `listProfiles` (or first available method).
