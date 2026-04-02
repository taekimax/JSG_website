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

test('team detail renderer emits the upgraded identity and media hooks', async () => {
  const source = await readRepoFile('scripts/team.js');
  assert.match(source, /class="team-card-media"/);
  assert.match(source, /class="member-identity"/);
  assert.match(source, /class="member-pager"/);
});
