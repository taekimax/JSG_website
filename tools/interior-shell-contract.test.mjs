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

test('interior pages opt into the shared cinematic shell', async () => {
  for (const page of [
    'about.html',
    'team.html',
    'team-member.html',
    'philosophy.html',
    'portfolio.html',
    'notice.html',
    'contact.html',
  ]) {
    const html = await readRepoFile(page);
    assert.match(html, /class="site-main site-main--interior"/);
    assert.match(html, /class="container content-shell"/);
    assert.match(html, /class="bottom-nav section-pager"/);
  }
});

test('page-level CSS does not override shared interior shell backgrounds', async () => {
  const css = await readRepoFile('styles/main.css');

  assert.doesNotMatch(
    css,
    /\.[a-z0-9-]+-page\s+\.site-main(?:--interior)?\s*\{[^}]*background(?:-image|-color)?\s*:/is
  );
});

test('desktop layout does not keep the floating pager over interior content', async () => {
  const css = await readRepoFile('styles/layout.css');
  assert.match(
    css,
    /@media\s*\(min-width:\s*1024px\)[\s\S]*?\.bottom-nav\s*\{[\s\S]*?display:\s*none/is
  );
});
