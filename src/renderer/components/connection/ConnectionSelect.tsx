import type { ReactNode } from 'react';

import { Label } from '@renderer/components/ui/label';
import { Select, SelectContent, SelectTrigger, SelectValue } from '@renderer/components/ui/select';
import { cn } from '@renderer/lib/utils';

interface ConnectionSelectProps {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  children: ReactNode;
  className?: string;
}

export function ConnectionSelect({
  id,
  label,
  value,
  onValueChange,
  disabled,
  placeholder = 'Select…',
  children,
  className,
}: ConnectionSelectProps) {
  return (
    <div className={cn('grid gap-2', className)}>
      <Label className="text-muted-foreground" htmlFor={id}>
        {label}
      </Label>
      <Select value={value || undefined} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          className="h-11 min-h-11 w-full border-border/90 bg-background/60 data-[size=default]:h-11"
          id={id}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  );
}
