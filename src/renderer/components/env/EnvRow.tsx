import { Copy, Eye, EyeOff, Trash2 } from 'lucide-react';

import { Badge } from '@renderer/components/ui/badge';
import { Button } from '@renderer/components/ui/button';
import { Input } from '@renderer/components/ui/input';
import { TableCell, TableRow } from '@renderer/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip';
import { toast } from 'sonner';
import type { EnvRow as EnvRowModel } from '@renderer/stores/env-store';

interface EnvRowProps {
  row: EnvRowModel;
  nameSuffix: string;
  isDuplicateName: boolean;
  revealed: boolean;
  readOnly?: boolean;
  isSecret?: boolean;
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
  readOnly = false,
  isSecret = false,
  onNameChange,
  onValueChange,
  onDelete,
  onToggleReveal,
}: EnvRowProps) {
  const nameId = `env-name-${row.id}`;
  const valueId = `env-value-${row.id}`;

  async function copyValue() {
    const text = `${row.name}=${row.value}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied', { description: 'Variable copied to clipboard' });
    } catch {
      toast.error('Could not copy');
    }
  }

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
            readOnly={readOnly}
            spellCheck={false}
            value={row.name}
          />
          {isSecret ? <Badge variant="secondary">Secret</Badge> : null}
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
          placeholder={isSecret ? 'valueFrom ref' : 'value'}
          readOnly={readOnly}
          spellCheck={false}
          type={revealed ? 'text' : 'password'}
          value={row.value}
        />
      </TableCell>
      <TableCell className="w-[1%] whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label="Copy name=value"
                className="size-9 shrink-0"
                onClick={() => void copyValue()}
                size="icon"
                type="button"
                variant="ghost"
              >
                <Copy aria-hidden className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy</TooltipContent>
          </Tooltip>
          <Button
            aria-label={revealed ? 'Hide value' : 'Reveal value'}
            className="size-9 shrink-0"
            disabled={readOnly && !isSecret}
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
          {!readOnly ? (
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
          ) : null}
        </div>
      </TableCell>
    </TableRow>
  );
}
