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

test('contact.html delegates content hydration to contact.js and exposes the in-page map hooks', async () => {
  const html = await readRepoFile('contact.html');

  assert.match(html, /<script src="scripts\/assets\.js"><\/script>/);
  assert.match(html, /<script src="scripts\/contact\.js"><\/script>/);
  assert.match(html, /id="contact-map-image"/);
  assert.match(html, /id="contact-map-caption"/);
  assert.doesNotMatch(html, /\[대표 전화번호\]/);
  assert.doesNotMatch(html, /\[문의 이메일 주소\]/);
  assert.doesNotMatch(html, /href="#"/);
});

test('contact content files are public-facing and use the updated daechi address', async () => {
  const [address, phoneValue, emailValue] = await Promise.all([
    readRepoFile('assets/contact/location-address.txt'),
    readRepoFile('assets/contact/phone-value.txt'),
    readRepoFile('assets/contact/email-value.txt'),
  ]);

  assert.match(address, /대치동/);
  assert.match(address, /삼흥2빌딩 8층/);
  assert.doesNotMatch(phoneValue, /^\[/);
  assert.doesNotMatch(emailValue, /^\[/);
});

test('contact manifest owns the editable contact copy and map asset', async () => {
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
  assert.ok(Object.hasOwn(manifest, 'mapImage'));
  assert.ok(Object.hasOwn(manifest, 'mapCaption'));
});
