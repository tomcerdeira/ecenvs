import assert from 'node:assert';
import { describe, it } from 'node:test';

import { parseDotEnv, parseEnvJson, serializeDotEnv } from '../src/renderer/lib/parsers';

describe('parseDotEnv', () => {
  it('parses simple KEY=value', () => {
    assert.deepStrictEqual(parseDotEnv('FOO=bar'), [{ name: 'FOO', value: 'bar' }]);
  });

  it('skips comments and blank lines', () => {
    assert.deepStrictEqual(parseDotEnv('# c\n\nBAZ=qux'), [{ name: 'BAZ', value: 'qux' }]);
  });
});

describe('parseEnvJson', () => {
  it('parses object map', () => {
    assert.deepStrictEqual(parseEnvJson('{"a":"1"}'), [{ name: 'a', value: '1' }]);
  });

  it('throws a clear message on invalid JSON', () => {
    assert.throws(() => parseEnvJson('{'), {
      message: /^Invalid JSON:/,
    });
  });
});

describe('serializeDotEnv', () => {
  it('round-trips with parseDotEnv', () => {
    const rows = [{ name: 'X', value: 'y' }];
    assert.deepStrictEqual(parseDotEnv(serializeDotEnv(rows)), rows);
  });
});
