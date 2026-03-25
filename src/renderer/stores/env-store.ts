import { create } from 'zustand';

import type { EnvVar } from '@shared/types';

export interface EnvRow {
  id: string;
  name: string;
  value: string;
}

function newRow(partial?: Partial<Pick<EnvRow, 'name' | 'value'>>): EnvRow {
  return {
    id: crypto.randomUUID(),
    name: partial?.name ?? '',
    value: partial?.value ?? '',
  };
}

/** Stable ordering for dirty comparison (ids are stable per row for the session). */
export function rowsFingerprint(rows: EnvRow[]): string {
  const sorted = [...rows].sort((a, b) => a.id.localeCompare(b.id));
  return JSON.stringify(sorted.map((r) => ({ name: r.name, value: r.value })));
}

/**
 * Per-row reveal: user may compare two values side-by-side.
 * Keys are row ids; omit or false means masked.
 */
type RevealedMap = Record<string, boolean>;

export function getDuplicateTrimmedNames(rows: EnvRow[]): Set<string> {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const key = r.name.trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const dup = new Set<string>();
  for (const [name, n] of counts) {
    if (n > 1) dup.add(name);
  }
  return dup;
}

interface EnvState {
  /** Editable plain environment variables. */
  rows: EnvRow[];
  /** Read-only secret refs from the task definition (not sent on save). */
  secretRows: EnvRow[];
  originalRows: EnvRow[];
  searchQuery: string;
  revealed: RevealedMap;

  hydrateFromRemote: (environment: EnvVar[]) => void;
  /** Replace plain rows only (e.g. import). */
  replacePlainRows: (rows: EnvRow[]) => void;
  clear: () => void;
  setSearch: (query: string) => void;
  updateRow: (id: string, patch: Partial<Pick<EnvRow, 'name' | 'value'>>) => void;
  addRow: () => void;
  removeRow: (id: string) => void;
  toggleReveal: (id: string) => void;
  /** After successful save, sync baseline to current plain rows. */
  markPlainSaved: () => void;
}

export const useEnvStore = create<EnvState>((set, get) => ({
  rows: [],
  secretRows: [],
  originalRows: [],
  searchQuery: '',
  revealed: {},

  hydrateFromRemote: (environment) => {
    const rows: EnvRow[] = [];
    const secretRows: EnvRow[] = [];
    for (const e of environment) {
      const row = {
        id: crypto.randomUUID(),
        name: e.name,
        value: e.value,
      };
      if (e.source === 'secret') {
        secretRows.push(row);
      } else {
        rows.push(row);
      }
    }
    set({
      rows,
      secretRows,
      originalRows: rows.map((r) => ({ ...r })),
      searchQuery: '',
      revealed: {},
    });
  },

  replacePlainRows: (nextRows) => {
    set({
      rows: nextRows,
      revealed: {},
    });
  },

  clear: () => {
    set({
      rows: [],
      secretRows: [],
      originalRows: [],
      searchQuery: '',
      revealed: {},
    });
  },

  setSearch: (query) => set({ searchQuery: query }),

  updateRow: (id, patch) => {
    set((s) => ({
      rows: s.rows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
  },

  addRow: () => {
    set((s) => ({ rows: [...s.rows, newRow()] }));
  },

  removeRow: (id) => {
    set((s) => {
      const revealed = { ...s.revealed };
      delete revealed[id];
      return {
        rows: s.rows.filter((r) => r.id !== id),
        revealed,
      };
    });
  },

  toggleReveal: (id) => {
    set((s) => {
      const next = !s.revealed[id];
      return { revealed: { ...s.revealed, [id]: next } };
    });
  },

  markPlainSaved: () => {
    const { rows } = get();
    set({ originalRows: rows.map((r) => ({ ...r })) });
  },
}));

export function selectFilteredRows(state: EnvState): EnvRow[] {
  const q = state.searchQuery.trim().toLowerCase();
  const plain = state.rows;
  if (!q) return plain;
  return plain.filter((r) => r.name.toLowerCase().includes(q));
}

export function selectFilteredSecretRows(state: EnvState): EnvRow[] {
  const q = state.searchQuery.trim().toLowerCase();
  const secrets = state.secretRows;
  if (!q) return secrets;
  return secrets.filter((r) => r.name.toLowerCase().includes(q));
}

export function selectIsDirty(state: EnvState): boolean {
  return rowsFingerprint(state.rows) !== rowsFingerprint(state.originalRows);
}
