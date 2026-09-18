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

test('home Contact section delegates content hydration to contact.js and exposes the in-page map hooks', async () => {
  const html = await readRepoFile('about.html');

  assert.match(html, /<script src="scripts\/assets\.js"><\/script>/);
  assert.match(html, /<script src="scripts\/contact\.js(?:\?[^"\s]+)?"><\/script>/);
  assert.match(html, /id="contact-map-image"/);
  assert.match(html, /class="contact-map-band"/);
  assert.match(html, /data-map-src="assets\/contact\/contact-map\.svg"/);
  assert.match(html, /id="contact-map-image"[^>]+role="img"[^>]+aria-label=/);
  assert.doesNotMatch(html, /contact-map-dialog/);
  assert.doesNotMatch(html, /\[대표 전화번호\]/);
  assert.doesNotMatch(html, /\[문의 이메일 주소\]/);
  assert.doesNotMatch(html, /href="#"/);
});

test('Contact map band keeps the full map visible with Yongdong-daero centered', async () => {
  const css = await readRepoFile('styles/home.css');

  assert.match(css, /\.home-page \.contact-map-band \{[^}]*width: 100vw;/);
  assert.match(css, /contact-map-right-seam\.svg/);
  assert.match(css, /background-position: calc\(50% \+ min\(192\.64px, 25\.389vw\)\) center, calc\(50% - min\(93\.36px, 12\.306vw\)\) center/);
  assert.match(css, /\.home-page \.contact-map-frame \{[^}]*width: min\(572px, 75\.389vw\);/);
  assert.match(css, /\.home-page \.contact-map-frame \{[^}]*left: 50%;[^}]*translateX\(-66\.3225%\)/);
  assert.doesNotMatch(css, /\.contact-map-frame::(?:before|after)/);
});

test('Contact map fits the viewport without extended color bands on mobile', async () => {
  const [css, script] = await Promise.all([
    readRepoFile('styles/home.css'),
    readRepoFile('scripts/contact.js'),
  ]);

  assert.match(css, /@media \(max-width: 699px\) \{[\s\S]*?\.home-page \.contact-map-band \{[^}]*background-image: var\(--contact-map-image,[^}]*background-position: center;[^}]*background-size: 100% 100%;/);
  assert.match(css, /@media \(max-width: 699px\) \{[\s\S]*?\.home-page \.contact-map-frame,[\s\S]*?width: 100vw;[^}]*left: 0;[^}]*transform: none;/);
  assert.match(script, /new URL\(versionedMapPath, document\.baseURI\)\.href/);
});

test('contact content files are public-facing and use the updated daechi address', async () => {
  const [address, phoneValue, emailValue] = await Promise.all([
    readRepoFile('assets/contact/location-address.txt'),
    readRepoFile('assets/contact/phone-value.txt'),
    readRepoFile('assets/contact/email-value.txt'),
  ]);

  assert.match(address, /테헤란로 514/);
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
