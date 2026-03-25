import { useCallback, useEffect, useRef, useState } from 'react';
import { Download, Loader2, Plus, Rocket, Upload } from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@renderer/components/ui/alert-dialog';
import { DiffView } from '@renderer/components/env/DiffView';
import { Badge } from '@renderer/components/ui/badge';
import { Button } from '@renderer/components/ui/button';
import { Input } from '@renderer/components/ui/input';
import { Label } from '@renderer/components/ui/label';
import {
  parseDotEnv,
  parseEnvJson,
  serializeDotEnv,
  serializeEnvJson,
} from '@renderer/lib/parsers';
import {
  getDuplicateTrimmedNames,
  selectFilteredPlainCount,
  selectIsDirty,
  useEnvStore,
  type EnvRow,
} from '@renderer/stores/env-store';

function downloadText(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function plainRowsFromParsed(vars: { name: string; value: string }[]): EnvRow[] {
  return vars.map((v) => ({
    id: crypto.randomUUID(),
    name: v.name,
    value: v.value,
  }));
}

export function EnvToolbar({
  connectionReady,
  onSaveDeploy,
}: {
  connectionReady: boolean;
  onSaveDeploy: () => Promise<void>;
}) {
  const searchQuery = useEnvStore((s) => s.searchQuery);
  const setSearch = useEnvStore((s) => s.setSearch);
  const addRow = useEnvStore((s) => s.addRow);
  const rows = useEnvStore((s) => s.rows);
  const originalRows = useEnvStore((s) => s.originalRows);
  const replacePlainRows = useEnvStore((s) => s.replacePlainRows);
  const rowCount = rows.length;
  const filteredCount = useEnvStore(selectFilteredPlainCount);
  const dirty = useEnvStore(selectIsDirty);
  const searching = Boolean(searchQuery.trim());

  const [importReplaceOpen, setImportReplaceOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const pendingImportText = useRef<string | null>(null);
  const pendingImportKind = useRef<'env' | 'json'>('env');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const runImport = useCallback(
    (text: string, kind: 'env' | 'json') => {
      try {
        const vars = kind === 'json' ? parseEnvJson(text) : parseDotEnv(text);
        replacePlainRows(plainRowsFromParsed(vars));
        toast.success('Imported environment', {
          description: `${vars.length} variable(s) loaded.`,
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        toast.error('Import failed', { description: msg });
      }
    },
    [replacePlainRows]
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const name = file.name.toLowerCase();
    const kind: 'env' | 'json' = name.endsWith('.json') ? 'json' : 'env';
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      if (rows.length > 0) {
        pendingImportText.current = text;
        pendingImportKind.current = kind;
        setImportReplaceOpen(true);
      } else {
        runImport(text, kind);
      }
    };
    reader.readAsText(file);
  };

  const confirmImportReplace = () => {
    const text = pendingImportText.current;
    const kind = pendingImportKind.current;
    setImportReplaceOpen(false);
    pendingImportText.current = null;
    if (text) runImport(text, kind);
  };

  const handleExportJson = () => {
    const text = serializeEnvJson(rows.map((r) => ({ name: r.name, value: r.value })));
    downloadText('environment.json', text, 'application/json');
  };

  const handleExportEnv = () => {
    const text = serializeDotEnv(rows.map((r) => ({ name: r.name, value: r.value })));
    downloadText('environment.env', text, 'text/plain');
  };

  const handleSaveClick = useCallback(() => {
    if (!connectionReady) {
      toast.error('Connect to a cluster, service, and container first.');
      return;
    }
    const state = useEnvStore.getState();
    const currentRows = state.rows;
    if (!selectIsDirty(state)) {
      toast.message('No changes to save');
      return;
    }
    const dup = getDuplicateTrimmedNames(currentRows);
    if (dup.size > 0) {
      toast.error('Fix duplicate variable names before saving.');
      return;
    }
    const empty = currentRows.some((r) => !r.name.trim());
    if (empty) {
      toast.error('Remove or name every row before saving.');
      return;
    }
    setSaveOpen(true);
  }, [connectionReady]);

  const confirmSave = async () => {
    setSaving(true);
    try {
      await onSaveDeploy();
      setSaveOpen(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error('Save failed', { description: msg });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 's') return;
      e.preventDefault();
      handleSaveClick();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleSaveClick]);

  const saveDisabled = !connectionReady || !dirty || saving;

  return (
    <>
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
          <input
            accept=".env,.json,text/plain"
            className="hidden"
            onChange={onFileChange}
            ref={fileInputRef}
            type="file"
          />
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
          <Button
            className="gap-2"
            onClick={() => fileInputRef.current?.click()}
            type="button"
            variant="outline"
          >
            <Upload aria-hidden className="size-4" />
            Import
          </Button>
          <Button className="gap-2" onClick={handleExportJson} type="button" variant="outline">
            <Download aria-hidden className="size-4" />
            Export JSON
          </Button>
          <Button className="gap-2" onClick={handleExportEnv} type="button" variant="outline">
            <Download aria-hidden className="size-4" />
            Export .env
          </Button>
          <Button
            className="gap-2"
            disabled={saveDisabled}
            onClick={() => void handleSaveClick()}
            type="button"
            variant="default"
          >
            {saving ? (
              <Loader2 aria-hidden className="size-4 animate-spin" />
            ) : (
              <Rocket aria-hidden className="size-4" />
            )}
            Save &amp; deploy
          </Button>
          <Button className="gap-2" onClick={() => addRow()} type="button" variant="secondary">
            <Plus aria-hidden className="size-4" />
            Add variable
          </Button>
        </div>
      </div>

      <AlertDialog onOpenChange={setImportReplaceOpen} open={importReplaceOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace environment variables?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace all plain environment variables in the editor. Secret references
              from the task definition are kept until you reload.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImportReplace} type="button">
              Replace all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog onOpenChange={setSaveOpen} open={saveOpen}>
        <AlertDialogContent className="max-h-[min(90vh,640px)] overflow-y-auto sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Save and deploy?</AlertDialogTitle>
            <AlertDialogDescription>
              This registers a new task definition revision with your plain environment variables
              and updates the ECS service. Secret references are unchanged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <p className="mb-2 text-xs font-medium text-muted-foreground uppercase">Changes</p>
            <DiffView current={rows} original={originalRows} />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving} type="button">
              Cancel
            </AlertDialogCancel>
            <Button disabled={saving} onClick={() => void confirmSave()} type="button">
              {saving ? (
                <>
                  <Loader2 aria-hidden className="mr-2 inline size-4 animate-spin" />
                  Deploying…
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
