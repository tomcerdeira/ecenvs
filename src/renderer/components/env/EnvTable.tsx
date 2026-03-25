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
  useEnvStore,
} from '@renderer/stores/env-store';

export function EnvTable() {
  const filtered = useEnvStore(selectFilteredRows);
  const rows = useEnvStore((s) => s.rows);
  const duplicateNames = getDuplicateTrimmedNames(rows);
  const updateRow = useEnvStore((s) => s.updateRow);
  const removeRow = useEnvStore((s) => s.removeRow);
  const toggleReveal = useEnvStore((s) => s.toggleReveal);
  const revealed = useEnvStore((s) => s.revealed);

  return (
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
                ? 'No environment variables. Add one or load from the task definition.'
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
  );
}
