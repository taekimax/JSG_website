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

test('About, Philosophy, and Contact expose the new editorial hooks', async () => {
  const [aboutHtml, philosophyHtml, contactHtml] = await Promise.all([
    readRepoFile('about.html'),
    readRepoFile('philosophy.html'),
    readRepoFile('contact.html'),
  ]);

  assert.match(
    aboutHtml,
    /<div class="page-hero-text bilingual-stack">[\s\S]*?<p class="page-hero-kicker">[\s\S]*?<p class="page-hero-sub">[\s\S]*?<p class="page-hero-sub">/,
  );
  assert.equal((aboutHtml.match(/class="text-block about-section"/g) || []).length, 2);
  assert.equal((aboutHtml.match(/class="page-hero-sub"/g) || []).length, 2);

  const philosophyCards = philosophyHtml.match(/<article class="philosophy-card">[\s\S]*?<\/article>/g) || [];
  assert.equal(philosophyCards.length, 3);
  philosophyCards.forEach((cardHtml) => {
    assert.match(
      cardHtml,
      /class="phil-copy-pair">[\s\S]*?class="phil-desc-en"[\s\S]*?class="phil-desc-ko"/,
    );
  });

  assert.match(contactHtml, /class="contact-card contact-card--location"/);
  assert.match(
    contactHtml,
    /class="contact-card contact-card--location">[\s\S]*?id="contact-location-address"[\s\S]*?id="contact-location-subtext"[\s\S]*?id="contact-map-link"/,
  );
  for (const id of [
    'contact-hero-kicker',
    'contact-hero-lead',
    'contact-location-title',
    'contact-location-address',
    'contact-location-subtext',
    'contact-map-link',
    'contact-title',
    'contact-phone-label',
    'contact-phone-value',
    'contact-email-label',
    'contact-email-value',
  ]) {
    assert.match(contactHtml, new RegExp(`id="${id}"`));
  }
});

test('hydration scripts use stable hooks rather than editorial wrapper classes', async () => {
  const [aboutScript, philosophyScript, contactScript] = await Promise.all([
    readRepoFile('scripts/aboutCopy.js'),
    readRepoFile('scripts/philosophyCopy.js'),
    readRepoFile('scripts/contact.js'),
  ]);

  assert.match(aboutScript, /hero\?\.querySelector\('\.page-hero-kicker'\)/);
  assert.match(aboutScript, /hero\.querySelectorAll\('\.page-hero-sub'\)/);
  assert.doesNotMatch(aboutScript, /\.bilingual-stack/);

  assert.match(philosophyScript, /card\.querySelector\('\.phil-desc-en'\)/);
  assert.match(philosophyScript, /card\.querySelector\('\.phil-desc-ko'\)/);
  assert.doesNotMatch(philosophyScript, /\.phil-copy-pair/);

  assert.match(contactScript, /getElementById\('contact-location-address'\)/);
  assert.match(contactScript, /getElementById\('contact-location-subtext'\)/);
  assert.match(contactScript, /getElementById\('contact-phone-value'\)/);
  assert.match(contactScript, /getElementById\('contact-email-value'\)/);
  assert.doesNotMatch(contactScript, /\.contact-card--location/);
  assert.doesNotMatch(contactScript, /:last-of-type/);
});
