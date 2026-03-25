# Commit 8: Diff view, secrets visibility, copy to clipboard

## Commit message

```
feat: add diff view, secrets visibility, and copy-to-clipboard
```

## Overview

Add `DiffView` comparing `originalRows` vs current rows with added/removed/changed styling. Show diff before save confirmation where appropriate. Fetch `secrets` from the task definition and render read-only rows with a “Secret” badge. Add per-row copy with `Tooltip` feedback.

## Prerequisites

- [Commit 7](./07-import-export-deploy.md) completed: save flow and ECS describe returning full task def metadata.
- `DescribeTaskDefinition` exposes `secrets` array for the selected container (main process should pass to renderer or merge into get-env response).

## Files to create

| Path                                       | Description                                                                                       |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `src/renderer/components/env/DiffView.tsx` | Side-by-side or unified diff list; color-code added (green), removed (red), changed (amber/blue). |

## Files to modify

| Path                                                  | Changes                                                                 |
| ----------------------------------------------------- | ----------------------------------------------------------------------- |
| `src/shared/types.ts`                                 | Types for secret refs (`name`, `valueFrom` or ARN).                     |
| `src/main/services/ecs-client.ts`                     | Include `secrets` in normalized env payload.                            |
| `src/renderer/stores/env-store.ts`                    | Hold `secretRows` read-only separate from editable plain env.           |
| `src/renderer/components/env/EnvTable.tsx` or sibling | Render secrets section below or merged with read-only styling.          |
| `src/renderer/components/env/EnvRow.tsx`              | Copy button using `navigator.clipboard.writeText` + `Tooltip` “Copied!” |
| Save confirmation flow                                | Insert `DiffView` step before final `AlertDialog` confirm (Commit 7).   |

## Dependencies to install

None required; use Clipboard API (Electron renderer with secure context).

## Implementation details

### Diff algorithm

- Build maps `name -> value` for original and current.
- **Added**: key in current, not in original.
- **Removed**: key in original, not in current.
- **Changed**: same key, different value.
- **Unchanged**: optional collapse/hide in UI.

### Secrets

- From ECS: `secrets: [{ name, valueFrom }]` on container def.
- Display name + masked `valueFrom` or arn suffix; **no** plaintext secret values from AWS Secrets Manager (unless explicitly fetched — **do not** fetch secret values in v1).

### Copy

- Button copies **value** (or name=value) per row; for masked plain vars, copy actual value from state.
- Show transient “Copied” via Tooltip or Sonner.

## Verification

- [ ] Change several vars → diff shows correct added/removed/changed.
- [ ] Secrets appear as read-only rows with badge; not editable.
- [ ] Copy puts expected string on clipboard (paste elsewhere).

## Commit checklist

- [ ] Secret ARNs never logged in full if policy discourages (optional redaction in logs).
