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

test('contact.html delegates content hydration to contact.js', async () => {
  const html = await readRepoFile('contact.html');

  assert.match(html, /<script src="scripts\/assets\.js"><\/script>/);
  assert.match(html, /<script src="scripts\/contact\.js"><\/script>/);
  assert.doesNotMatch(html, /\[대표 전화번호\]/);
  assert.doesNotMatch(html, /\[문의 이메일 주소\]/);
  assert.doesNotMatch(html, /href="#"/);
});

test('contact manifest owns the editable contact copy', async () => {
  const manifest = JSON.parse(await readRepoFile('assets/contact/contact-manifest.json'));

  assert.equal(manifest.page, 'contact');
  assert.ok(manifest.texts);

  for (const key of [
    'heroKicker',
    'heroLead',
    'locationTitle',
    'locationAddress',
    'locationSubtext',
    'mapLabel',
    'contactTitle',
    'phoneLabel',
    'phoneValue',
    'emailLabel',
    'emailValue',
  ]) {
    assert.ok(manifest.texts[key], `missing texts.${key}`);
  }

  assert.ok(Object.hasOwn(manifest, 'mapUrl'));
});
