import { ScrollArea } from '@renderer/components/ui/scroll-area';
import type { EnvRow } from '@renderer/stores/env-store';

type ChangeKind = 'added' | 'removed' | 'changed';

interface DiffEntry {
  name: string;
  kind: ChangeKind;
  before?: string;
  after?: string;
}

function buildDiff(original: EnvRow[], current: EnvRow[]): DiffEntry[] {
  const origMap = new Map<string, string>();
  for (const r of original) {
    const k = String(r.name ?? '').trim();
    if (!k) continue;
    origMap.set(k, String(r.value ?? ''));
  }
  const curMap = new Map<string, string>();
  for (const r of current) {
    const k = String(r.name ?? '').trim();
    if (!k) continue;
    curMap.set(k, String(r.value ?? ''));
  }

  const names = new Set<string>([...origMap.keys(), ...curMap.keys()]);
  const out: DiffEntry[] = [];
  for (const name of names) {
    const o = origMap.get(name);
    const c = curMap.get(name);
    if (o === undefined && c !== undefined) {
      out.push({ name, kind: 'added', after: c });
    } else if (o !== undefined && c === undefined) {
      out.push({ name, kind: 'removed', before: o });
    } else if (o !== undefined && c !== undefined && o !== c) {
      out.push({ name, kind: 'changed', before: o, after: c });
    }
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

export function DiffView({ original, current }: { original: EnvRow[]; current: EnvRow[] }) {
  const entries = buildDiff(original, current);
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No changes to plain environment variables.</p>
    );
  }

  return (
    <ScrollArea className="max-h-48 rounded-md border border-border/80">
      <ul className="divide-y divide-border/60 p-2 text-xs font-mono">
        {entries.map((e) => (
          <li className="py-2" key={`${e.kind}-${e.name}`}>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="min-w-0 shrink font-medium text-foreground">{e.name}</span>
              {e.kind === 'added' ? (
                <span className="text-emerald-600 dark:text-emerald-400">+ added</span>
              ) : null}
              {e.kind === 'removed' ? (
                <span className="text-red-600 dark:text-red-400">− removed</span>
              ) : null}
              {e.kind === 'changed' ? (
                <span className="text-amber-600 dark:text-amber-400">~ changed</span>
              ) : null}
            </div>
            {e.kind === 'added' ? (
              <p className="mt-1 break-all text-muted-foreground">{e.after}</p>
            ) : null}
            {e.kind === 'removed' ? (
              <p className="mt-1 break-all text-muted-foreground line-through">{e.before}</p>
            ) : null}
            {e.kind === 'changed' ? (
              <div className="mt-1 flex flex-col gap-1 text-muted-foreground">
                <p className="break-all line-through opacity-80">{e.before}</p>
                <p className="break-all text-foreground">{e.after}</p>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}
