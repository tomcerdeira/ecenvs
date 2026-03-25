import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { getErrorMessage } from '@shared/errors';

const AWS_DIR = path.join(os.homedir(), '.aws');
const CREDENTIALS_PATH = path.join(AWS_DIR, 'credentials');
const CONFIG_PATH = path.join(AWS_DIR, 'config');

/** INI section headers: [name] or [profile name] */
function parseSectionNames(contents: string): string[] {
  const names: string[] = [];
  const re = /^\s*\[([^\]]+)\]\s*$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(contents)) !== null) {
    names.push(m[1].trim());
  }
  return names;
}

/** Map config section label to CLI profile name. */
function configSectionToProfileName(section: string): string | null {
  if (section === 'default') {
    return 'default';
  }
  if (section.startsWith('profile ')) {
    return section.slice('profile '.length).trim() || null;
  }
  return null;
}

/** Map credentials file section to profile name (same as section text). */
function credentialsSectionToProfileName(section: string): string {
  return section.trim();
}

/**
 * Collect profile names from ~/.aws/credentials and ~/.aws/config.
 * Does not accept paths from IPC — only fixed paths above.
 */
export function listAwsProfiles():
  | { ok: true; profiles: string[] }
  | { ok: false; message: string } {
  const profiles = new Set<string>();

  try {
    if (fs.existsSync(CREDENTIALS_PATH)) {
      const text = fs.readFileSync(CREDENTIALS_PATH, 'utf8');
      for (const section of parseSectionNames(text)) {
        profiles.add(credentialsSectionToProfileName(section));
      }
    }
  } catch (e) {
    return { ok: false, message: `Failed to read credentials file: ${getErrorMessage(e)}` };
  }

  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const text = fs.readFileSync(CONFIG_PATH, 'utf8');
      for (const section of parseSectionNames(text)) {
        const name = configSectionToProfileName(section);
        if (name) {
          profiles.add(name);
        }
      }
    }
  } catch (e) {
    return { ok: false, message: `Failed to read config file: ${getErrorMessage(e)}` };
  }

  if (profiles.size === 0 && !fs.existsSync(CREDENTIALS_PATH) && !fs.existsSync(CONFIG_PATH)) {
    return {
      ok: false,
      message: 'No AWS config found at ~/.aws/credentials or ~/.aws/config',
    };
  }

  return { ok: true, profiles: [...profiles].sort((a, b) => a.localeCompare(b)) };
}
