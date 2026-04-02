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

test('portfolio stylesheet defines the image class rendered by portfolio.js', async () => {
  const [js, css] = await Promise.all([
    readRepoFile('scripts/portfolio.js'),
    readRepoFile('styles/main.css'),
  ]);

  assert.match(js, /img\.className = 'portfolio-img'/);
  assert.match(css, /\.portfolio-img(?:\s*,\s*\.portfolio-img-placeholder|\s*)\s*\{/);
  assert.match(css, /@media \(min-width: 768px\)[\s\S]*?\.portfolio-img(?:\s*,\s*\.portfolio-img-placeholder|\s*)\s*\{/);
});
