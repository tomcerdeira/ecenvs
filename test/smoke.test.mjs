import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

test('package.json has expected identity', () => {
  assert.equal(pkg.name, 'ecenvs');
  assert.match(pkg.version, /^\d+\.\d+\.\d+/);
  assert.equal(pkg.license, 'MIT');
});
