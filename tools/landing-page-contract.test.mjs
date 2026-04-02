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

test('landing page exposes three comparable landing variants and equal bilingual copy hooks', async () => {
  const html = await readRepoFile('landing.html');

  assert.match(html, /class="landing-stage"/);
  assert.match(html, /class="landing-variant-switcher"/);
  assert.match(html, /data-landing-variant="aurora"/);
  assert.match(html, /data-landing-variant="mirror"/);
  assert.match(html, /data-landing-variant="lattice"/);
  assert.equal((html.match(/class="hero-statement"/g) || []).length, 2);
  assert.match(html, /id="enterBtn"/);
  assert.doesNotMatch(html, /Loading\.\.\./);
  assert.match(html, /<script src="scripts\/assets\.js"><\/script>/);
  assert.match(html, /<script src="scripts\/landingCopy\.js"><\/script>/);
  assert.match(html, /<script src="scripts\/landingAnimation\.js"><\/script>/);
});

test('landing scripts keep variant switching, runtime copy hydration, and about navigation contracts', async () => {
  const [copyScript, animationScript] = await Promise.all([
    readRepoFile('scripts/landingCopy.js'),
    readRepoFile('scripts/landingAnimation.js'),
  ]);

  assert.match(copyScript, /querySelectorAll\('\.hero-statement'\)/);
  assert.match(copyScript, /querySelectorAll\('\[data-landing-variant\]'\)/);
  assert.match(copyScript, /fetchJson\('assets\/landing\/landing-manifest\.json'\)/);
  assert.match(animationScript, /document\.querySelector\('\.landing-stage'\)/);
  assert.match(animationScript, /dataset\.variant/);
  assert.match(animationScript, /window\.location\.href = "about\.html"/);
});

test('landing stylesheet keeps the full-screen stage responsive and preserves desktop-only variant controls', async () => {
  const css = await readRepoFile('styles/landing.css');
  assert.match(css, /min-height:\s*100dvh/);
  assert.match(css, /\.landing-variant-switcher/);
  assert.match(css, /@media\s*\(max-width:\s*640px\)/);
  assert.match(css, /@media\s*\(max-height:\s*720px\)/);
});
