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
  assert.match(html, /<script src="scripts\/assets\.js"><\/script>/);
  assert.match(html, /<script src="scripts\/landingCopy\.js"><\/script>/);
  assert.match(html, /<script src="scripts\/landingAnimation\.js"><\/script>/);
});

test('landing scripts keep the runtime copy and navigation contract', async () => {
  const [copyScript, animationScript] = await Promise.all([
    readRepoFile('scripts/landingCopy.js'),
    readRepoFile('scripts/landingAnimation.js'),
  ]);

  assert.match(copyScript, /querySelector\('\.landing-stage'\)/);
  assert.match(copyScript, /stageEl\.querySelector\('\.hero-kicker'\)/);
  assert.match(copyScript, /stageEl\.querySelector\('\.hero-lead'\)/);
  assert.match(copyScript, /stageEl\.querySelector\('\.hero-sub'\)/);
  assert.match(copyScript, /fetchJson\('assets\/landing\/landing-manifest\.json'\)/);
  assert.match(animationScript, /window\.location\.href = "about\.html"/);
  assert.match(animationScript, /window\.location\.replace\("about\.html"\)/);
});

test('landing stylesheet keeps CTA reachable on short-height viewports', async () => {
  const css = await readRepoFile('styles/landing.css');
  assert.match(css, /min-height:\s*100dvh/);
  assert.match(css, /overflow-y:\s*auto/);
  assert.match(css, /@media\s*\(max-height:\s*720px\)/);
});
