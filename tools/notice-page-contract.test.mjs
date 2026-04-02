import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

async function readRepoFile(relativePath) {
  return fs.readFile(path.join(repoRoot, relativePath), 'utf8');
}

test('notice detail renderer emits document-style record hooks', async () => {
  const source = await readRepoFile('scripts/notice.js');
  assert.match(source, /class="notice-record"/);
  assert.match(source, /class="notice-record-body"/);
});
