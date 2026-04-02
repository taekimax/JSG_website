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

test('team.html delegates team list rendering to team.js', async () => {
  const html = await readRepoFile('team.html');

  assert.match(html, /id="team-member-app"/);
  assert.match(html, /<script src="scripts\/team\.js"><\/script>/);
  assert.doesNotMatch(html, /team-member\.html\?id=/);
});

test('team.js list renderer emits team cards', async () => {
  const source = await readRepoFile('scripts/team.js');

  assert.match(source, /class="team-card team-card-link"/);
});
