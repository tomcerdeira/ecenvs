import { Eye, EyeOff, Trash2 } from 'lucide-react';

import { Badge } from '@renderer/components/ui/badge';
import { Button } from '@renderer/components/ui/button';
import { Input } from '@renderer/components/ui/input';
import { TableCell, TableRow } from '@renderer/components/ui/table';
import type { EnvRow as EnvRowModel } from '@renderer/stores/env-store';

interface EnvRowProps {
  row: EnvRowModel;
  nameSuffix: string;
  isDuplicateName: boolean;
  revealed: boolean;
  onNameChange: (name: string) => void;
  onValueChange: (value: string) => void;
  onDelete: () => void;
  onToggleReveal: () => void;
}

export function EnvRow({
  row,
  nameSuffix,
  isDuplicateName,
  revealed,
  onNameChange,
  onValueChange,
  onDelete,
  onToggleReveal,
}: EnvRowProps) {
  const nameId = `env-name-${row.id}`;
  const valueId = `env-value-${row.id}`;

  return (
    <TableRow>
      <TableCell className="min-w-[140px] max-w-[min(100%,280px)]">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            aria-invalid={isDuplicateName}
            className="min-w-0 flex-1 font-mono text-xs"
            id={nameId}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="NAME"
            spellCheck={false}
            value={row.name}
          />
          {isDuplicateName ? (
            <Badge title="Duplicate name" variant="warning">
              Duplicate
            </Badge>
          ) : null}
        </div>
      </TableCell>
      <TableCell className="min-w-[180px] max-w-[min(100%,420px)]">
        <Input
          aria-labelledby={nameId}
          autoComplete="off"
          className="font-mono text-xs"
          id={valueId}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder="value"
          spellCheck={false}
          type={revealed ? 'text' : 'password'}
          value={row.value}
        />
      </TableCell>
      <TableCell className="w-[1%] whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          <Button
            aria-label={revealed ? 'Hide value' : 'Reveal value'}
            className="size-9 shrink-0"
            onClick={onToggleReveal}
            size="icon"
            type="button"
            variant="ghost"
          >
            {revealed ? (
              <EyeOff aria-hidden className="size-4" />
            ) : (
              <Eye aria-hidden className="size-4" />
            )}
          </Button>
          <Button
            aria-label={`Remove variable ${nameSuffix}`}
            className="size-9 shrink-0 text-destructive hover:text-destructive"
            onClick={onDelete}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Trash2 aria-hidden className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
