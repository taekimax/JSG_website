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

  assert.match(aboutHtml, /class="page-hero-text bilingual-stack"/);
  assert.match(philosophyHtml, /class="phil-copy-pair"/);
  assert.match(contactHtml, /class="contact-card contact-card--location"/);
});
