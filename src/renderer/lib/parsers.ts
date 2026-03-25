import { getErrorMessage } from '@shared/errors';
import type { PlainEnvVar } from '@shared/types';

/**
 * Minimal .env parser: KEY=value, optional double/single quotes, # comments, blank lines.
 */
export function parseDotEnv(text: string): PlainEnvVar[] {
  const out: PlainEnvVar[] = [];
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const name = trimmed.slice(0, eq).trim();
    if (!name) continue;
    let value = trimmed.slice(eq + 1);
    if (
      (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
      (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
    ) {
      value = value.slice(1, -1).replace(/\\n/g, '\n').replace(/\\r/g, '\r');
    }
    out.push({ name, value });
  }
  return out;
}

export function parseEnvJson(text: string): PlainEnvVar[] {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error(`Invalid JSON: ${getErrorMessage(e)}`);
  }
  if (Array.isArray(data)) {
    const out: PlainEnvVar[] = [];
    for (const item of data) {
      if (item && typeof item === 'object' && 'name' in item) {
        const name = String((item as { name: unknown }).name);
        const value =
          'value' in item && (item as { value: unknown }).value !== undefined
            ? String((item as { value: unknown }).value)
            : '';
        if (name) out.push({ name, value });
      }
    }
    return out;
  }
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return Object.entries(data as Record<string, unknown>).map(([name, value]) => ({
      name,
      value: value === null || value === undefined ? '' : String(value),
    }));
  }
  throw new Error('JSON must be an object map or an array of { name, value }');
}

export function serializeDotEnv(vars: PlainEnvVar[]): string {
  return vars
    .filter((v) => v.name.trim().length > 0)
    .map((v) => {
      const name = v.name.trim();
      const val = v.value;
      if (/[\n\r#"]/.test(val) || val.includes("'")) {
        const escaped = val.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
        return `${name}="${escaped}"`;
      }
      if (val.includes(' ') || val === '') {
        return `${name}="${val.replace(/"/g, '\\"')}"`;
      }
      return `${name}=${val}`;
    })
    .join('\n');
}

export function serializeEnvJson(vars: PlainEnvVar[]): string {
  const list = vars
    .filter((v) => v.name.trim().length > 0)
    .map((v) => ({
      name: v.name.trim(),
      value: v.value,
    }));
  return JSON.stringify(list, null, 2);
}
