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

test('About, Philosophy, and Contact expose the updated editorial hooks', async () => {
  const home = await readRepoFile('about.html');
  const aboutHtml = home.split('<section id="about"')[1].split('<section id="team"')[0];
  const philosophyHtml = home.split('<section id="philosophy"')[1].split('<section id="portfolio"')[0];
  const contactHtml = home.split('<section id="contact"')[1];

  assert.match(
    home.split('<footer')[1],
    /<div class="page-hero-text bilingual-stack">[\s\S]*?<p class="page-hero-kicker">[\s\S]*?<p class="page-hero-sub"[^>]*>[\s\S]*?<p class="page-hero-sub"[^>]*>/,
  );
  assert.equal((aboutHtml.match(/class="text-block about-section"/g) || []).length, 2);
  assert.equal((home.split('<footer')[1].match(/class="page-hero-sub"/g) || []).length, 2);

  assert.match(
    philosophyHtml,
    /class="page-hero-text bilingual-stack">[\s\S]*?class="page-hero-sub"[\s\S]*?class="page-hero-sub"/,
  );

  const philosophyCards = philosophyHtml.match(/<article class="philosophy-card">[\s\S]*?<\/article>/g) || [];
  assert.equal(philosophyCards.length, 3);
  philosophyCards.forEach((cardHtml) => {
    assert.match(
      cardHtml,
      /class="phil-copy-stack">[\s\S]*?class="phil-desc-en"[\s\S]*?class="phil-desc-ko"/,
    );
  });

  assert.match(contactHtml, /class="contact-card"/);
  assert.match(contactHtml, /class="contact-map-frame"/);
  assert.match(contactHtml, /id="contact-map-image"/);
  for (const id of [
    'contact-hero-kicker',
    'contact-location-address',
    'contact-map-image',
    'contact-phone-label',
    'contact-phone-value',
    'contact-email-label',
    'contact-email-value',
  ]) {
    assert.match(contactHtml, new RegExp(`id="${id}"`));
  }
});

test('hydration scripts use stable hooks rather than presentation-only wrappers', async () => {
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
  assert.doesNotMatch(philosophyScript, /\.phil-copy-stack/);

  assert.match(contactScript, /getElementById\('contact-location-address'\)/);
  assert.match(contactScript, /getElementById\('contact-map-image'\)/);
  assert.match(contactScript, /getElementById\('contact-phone-value'\)/);
  assert.match(contactScript, /getElementById\('contact-email-value'\)/);
  assert.doesNotMatch(contactScript, /\.contact-map-frame/);
});
