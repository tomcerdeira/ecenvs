import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@renderer/components/ui/table';
import { EnvRow } from '@renderer/components/env/EnvRow';
import {
  getDuplicateTrimmedNames,
  selectFilteredRows,
  selectFilteredSecretRows,
  useEnvStore,
} from '@renderer/stores/env-store';

export function EnvTable() {
  const filtered = useEnvStore(selectFilteredRows);
  const filteredSecrets = useEnvStore(selectFilteredSecretRows);
  const rows = useEnvStore((s) => s.rows);
  const secretRows = useEnvStore((s) => s.secretRows);
  const duplicateNames = getDuplicateTrimmedNames(rows);
  const updateRow = useEnvStore((s) => s.updateRow);
  const removeRow = useEnvStore((s) => s.removeRow);
  const toggleReveal = useEnvStore((s) => s.toggleReveal);
  const revealed = useEnvStore((s) => s.revealed);
  const searching = Boolean(useEnvStore((s) => s.searchQuery.trim()));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Name</TableHead>
              <TableHead scope="col">Value</TableHead>
              <TableHead className="text-right" scope="col">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell className="p-6 text-center text-sm text-muted-foreground" colSpan={3}>
                  {rows.length === 0
                    ? 'No plain environment variables. Add one, load from the task definition, or import a file.'
                    : 'No variables match your search.'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row) => {
                const trimmed = row.name.trim();
                const isDup = Boolean(trimmed && duplicateNames.has(trimmed));
                return (
                  <EnvRow
                    isDuplicateName={isDup}
                    key={row.id}
                    nameSuffix={trimmed || row.id.slice(0, 8)}
                    onDelete={() => removeRow(row.id)}
                    onNameChange={(name) => updateRow(row.id, { name })}
                    onToggleReveal={() => toggleReveal(row.id)}
                    onValueChange={(value) => updateRow(row.id, { value })}
                    revealed={Boolean(revealed[row.id])}
                    row={row}
                  />
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {secretRows.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Secrets (read-only)
          </h3>
          <p className="text-xs text-muted-foreground">
            References from the task definition. Values are not fetched from Secrets Manager.
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Name</TableHead>
                <TableHead scope="col">Value from</TableHead>
                <TableHead className="text-right" scope="col">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSecrets.length === 0 ? (
                <TableRow>
                  <TableCell className="p-4 text-center text-sm text-muted-foreground" colSpan={3}>
                    {searching ? 'No secrets match your search.' : null}
                  </TableCell>
                </TableRow>
              ) : (
                filteredSecrets.map((row) => (
                  <EnvRow
                    isDuplicateName={false}
                    isSecret
                    key={row.id}
                    nameSuffix={row.name.trim() || row.id.slice(0, 8)}
                    onDelete={() => {}}
                    onNameChange={() => {}}
                    onToggleReveal={() => toggleReveal(row.id)}
                    onValueChange={() => {}}
                    readOnly
                    revealed={Boolean(revealed[row.id])}
                    row={row}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </div>
  );
}
