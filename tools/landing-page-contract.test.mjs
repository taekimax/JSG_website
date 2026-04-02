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

test('landing page keeps the accent hero structure and script hooks', async () => {
  const html = await readRepoFile('landing.html');
  assert.match(html, /class="landing-stage"/);
  assert.match(html, /class="hero-panel hero-panel--accent"/);
  assert.match(html, /id="enterBtn"/);
  assert.match(html, /<script src="scripts\/landingCopy\.js"><\/script>/);
  assert.match(html, /<script src="scripts\/landingAnimation\.js"><\/script>/);
});
