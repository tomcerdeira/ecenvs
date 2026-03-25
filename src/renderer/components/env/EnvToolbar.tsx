import { Plus } from 'lucide-react';

import { Badge } from '@renderer/components/ui/badge';
import { Button } from '@renderer/components/ui/button';
import { Input } from '@renderer/components/ui/input';
import { Label } from '@renderer/components/ui/label';
import { selectFilteredRows, selectIsDirty, useEnvStore } from '@renderer/stores/env-store';

export function EnvToolbar() {
  const searchQuery = useEnvStore((s) => s.searchQuery);
  const setSearch = useEnvStore((s) => s.setSearch);
  const addRow = useEnvStore((s) => s.addRow);
  const rowCount = useEnvStore((s) => s.rows.length);
  const filteredCount = useEnvStore((s) => selectFilteredRows(s).length);
  const dirty = useEnvStore(selectIsDirty);
  const searching = Boolean(searchQuery.trim());

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:max-w-md">
        <Label className="text-xs font-medium text-muted-foreground" htmlFor="env-search">
          Search by name
        </Label>
        <Input
          className="font-mono text-sm"
          id="env-search"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter variables…"
          value={searchQuery}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {dirty ? (
          <Badge
            variant="outline"
            className="border-amber-500/50 text-amber-600 dark:text-amber-400"
          >
            Unsaved changes
          </Badge>
        ) : null}
        <p className="text-xs text-muted-foreground tabular-nums" aria-live="polite">
          {searching
            ? `${filteredCount} of ${rowCount} shown`
            : `${rowCount} ${rowCount === 1 ? 'variable' : 'variables'}`}
        </p>
        <Button className="gap-2" onClick={() => addRow()} type="button" variant="secondary">
          <Plus aria-hidden className="size-4" />
          Add variable
        </Button>
      </div>
    </div>
  );
}
