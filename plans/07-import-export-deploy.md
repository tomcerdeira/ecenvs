# Commit 7: Import, export, save & deploy, polling

## Commit message

```
feat: add import/export and save & deploy flow
```

## Overview

Add `lib/parsers.ts` for `.env` and JSON serialization, export buttons (Blob download), import with `AlertDialog` confirmation when replacing, and **Save & Deploy** calling `RegisterTaskDefinition` + `UpdateService` via IPC. Add `DeployPanel` / `DeployCard`, `useDeploymentPolling` (5s interval until terminal state), and **Cmd/Ctrl+S** shortcut.

## Prerequisites

- [Commit 6](./06-env-table.md) completed: editable env table with dirty state.
- [Commit 4](./04-shared-types-main-process.md): ECS client implements register/update or is completed in this commit.

## Files to create

| Path                                             | Description                                                                            |
| ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `src/renderer/lib/parsers.ts`                    | Parse `.env` (KEY=value, quotes, comments), JSON array/object formats; serialize back. |
| `src/renderer/components/deploy/DeployPanel.tsx` | Shows active deployment status.                                                        |
| `src/renderer/components/deploy/DeployCard.tsx`  | Badges for phase/status, timestamps.                                                   |
| `src/renderer/hooks/useDeploymentPolling.ts`     | Poll `get-deployments` every 5s until `COMPLETED` / `FAILED` / timeout.                |

## Files to modify

| Path                                         | Changes                                                                                                                  |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `src/renderer/components/env/EnvToolbar.tsx` | Add Import, Export JSON, Export `.env` buttons.                                                                          |
| `src/main/services/ecs-client.ts`            | Full `RegisterTaskDefinition` (clone task def, patch env for target container) + `UpdateService`.                        |
| `src/main/ipc/handlers.ts`                   | `save-env-vars` builds new task def revision and triggers service update; `get-deployments` returns ECS deployment info. |
| `src/preload/index.ts`                       | Expose save + deployment APIs.                                                                                           |
| `src/renderer/App.tsx` or layout             | Global keyboard shortcut for save (prevent default in inputs where needed).                                              |

## Dependencies to install

Optional: `dotenv` parsing — prefer a small custom parser or `dotenv` package:

```bash
npm install dotenv
```

(Or implement minimal line parser without new deps.)

## Implementation details

### Export

- **Export JSON**: `JSON.stringify(rows, null, 2)`, `Blob` + `<a download>`.
- **Export .env**: `NAME=value` per line, escape as needed.

### Import

- File picker → parse → if existing rows non-empty, `AlertDialog`: “Replace all environment variables?” → on confirm, replace store rows and mark dirty.

### Save & deploy

1. Confirm via `AlertDialog` (optional if already dirty prompt).
2. IPC `save-env-vars` payload: profile, region, cluster, service, container name, env key/values (plain only).
3. Main: `DescribeTaskDefinition` → clone → update target `containerDefinitions[].environment` → `RegisterTaskDefinition` → `UpdateService` with new revision.
4. Return `deploymentId` or service ARN + started deployment id for polling.

### Polling

- `useDeploymentPolling`: start after save; call `get-deployments`; stop on success/failure; show toast on completion.

### Shortcut

- `useEffect` + `window.addEventListener('keydown')`: `(e.metaKey || e.ctrlKey) && e.key === 's'` → `preventDefault`, trigger save flow.

## Verification

- [ ] Export JSON and `.env`, re-import, data round-trips (spot-check special characters).
- [ ] Save & deploy creates new task definition revision (verify in AWS console).
- [ ] Polling updates UI until deployment completes.
- [ ] Cmd/Ctrl+S opens save or triggers deploy confirmation without browser save dialog.

## Commit checklist

- [ ] Rollback story documented in README (manual revert in AWS) — optional note in PR.
- [ ] Errors from AWS shown via toast with message.
