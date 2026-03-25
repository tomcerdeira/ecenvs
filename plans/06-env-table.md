# Commit 6: Env var table — CRUD, search, masking

## Commit message

```
feat: add env var table with CRUD and search
```

## Overview

Implement the core env editor: `EnvTable`, `EnvRow`, and `EnvToolbar` backed by a Zustand `env-store` with `rows`, `originalRows`, dirty state, search query, and per-row masked value reveal. Support add/remove rows, duplicate-name warnings, and wire `Sonner` for notifications.

## Prerequisites

- [Commit 5](./05-layout-shell-connection-flow.md) completed: connection store selects cluster/service/container.
- IPC `get-env-vars` returns plain env key/value pairs for the selected container.

## Files to create

| Path | Description |
|------|-------------|
| `src/renderer/components/env/EnvTable.tsx` | shadcn `Table` with header (Name / Value / Actions). |
| `src/renderer/components/env/EnvRow.tsx` | Single row: `Input` or masked display, reveal toggle, delete. |
| `src/renderer/components/env/EnvToolbar.tsx` | Search input, “Add variable”, optional row count. |
| `src/renderer/stores/env-store.ts` | Zustand: rows, originalRows, dirty, search, revealedRowId/set, actions. |

## Files to modify

| Path | Changes |
|------|---------|
| `src/renderer/App.tsx` | Render EnvToolbar + EnvTable below ConnectionPanel when container selected; on selection change, call `get-env-vars` and hydrate store. |
| `src/renderer/main.tsx` | Ensure `<Toaster />` from `sonner` is mounted (if not already). |

## Dependencies to install

None beyond existing Zustand and shadcn (Sonner already added in Commit 3).

## Implementation details

### Data model

- Each row: `{ id: string; name: string; value: string }` (stable `id` for React keys — use `crypto.randomUUID()` on add).
- `originalRows`: snapshot after successful load from ECS (used in Commit 8 for diff).
- `dirty`: `true` when current rows differ from `originalRows` (deep compare or serialized compare).

### Masking

- Default: show value as `••••••` or type `password` input until user clicks eye/reveal for that row.
- `revealedRowId`: at most one row revealed at a time, or per-row boolean map — document choice in store.

### Search

- Filter rows by **name** substring (case-insensitive); empty query shows all.

### Duplicate names

- When two+ rows share the same non-empty name (trimmed), show `Badge` variant `destructive` or `warning` on duplicate rows.

### IPC

- On container select: `get-env-vars` → set `rows` + `originalRows`, clear `dirty`.

## Verification

- [ ] After loading env from ECS, table lists all variables.
- [ ] Edit value → dirty indicator (badge or header text) shows unsaved state.
- [ ] Add/remove row updates table; search filters correctly.
- [ ] Mask/reveal works per row; duplicates show warning.

## Commit checklist

- [ ] No plaintext secrets logged to console.
- [ ] Lint/typecheck pass; keyboard focus order reasonable in table.
