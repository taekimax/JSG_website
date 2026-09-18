import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { stageSite } from './stage-site.mjs';

test('Cafe24 artifact excludes private files and preserves same-site CMS paths', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'jsg-stage-'));
  try {
    await fs.mkdir(path.join(root, 'assets/shared'), { recursive: true });
    await fs.writeFile(path.join(root, 'about.html'), '<main>Public</main>');
    await fs.writeFile(path.join(root, 'AGENTS.md'), 'Not a public page');
    await fs.writeFile(path.join(root, '.htaccess'), 'DirectoryIndex index.html\n');
    for (const file of ['cafe24.env', 'ssl.key', 'ssl.crt', 'jinsungsc_key_20260918.pem']) {
      await fs.writeFile(path.join(root, file), 'Private deployment file');
    }
    await fs.symlink('/not/a/real/local/mount', path.join(root, 'board-content'));
    const endpoints = {
      schemaVersion: 1,
      noticesManifest: '/board-content/notices-manifest.json',
      perspectiveManifest: '/board-content/perspective-manifest.json',
      portfolioManifest: '/board-content/portfolio-manifest.json'
    };
    await fs.writeFile(path.join(root, 'assets/shared/board-endpoints.json'), JSON.stringify(endpoints));
    const output = await stageSite({ root });
    assert.equal(await fs.readFile(path.join(output, 'about.html'), 'utf8'), '<main>Public</main>');
    for (const file of ['AGENTS.md', 'board-content', 'tools', '.git', 'cafe24.env', 'ssl.key', 'ssl.crt', 'jinsungsc_key_20260918.pem']) {
      await assert.rejects(fs.lstat(path.join(output, file)), { code: 'ENOENT' });
    }
    const staged = JSON.parse(await fs.readFile(path.join(output, 'assets/shared/board-endpoints.json'), 'utf8'));
    assert.equal(staged.portfolioManifest, '/board-content/portfolio-manifest.json');
    assert.equal(staged.noticesManifest, '/board-content/notices-manifest.json');
    assert.equal(staged.perspectiveManifest, '/board-content/perspective-manifest.json');
    assert.deepEqual(JSON.parse(await fs.readFile(path.join(root, 'assets/shared/board-endpoints.json'), 'utf8')), endpoints);
    const cafe24Output = await stageSite({ root });
    assert.equal(await fs.readFile(path.join(cafe24Output, '.htaccess'), 'utf8'), 'DirectoryIndex index.html\n');
    assert.deepEqual(JSON.parse(await fs.readFile(path.join(cafe24Output, 'assets/shared/board-endpoints.json'), 'utf8')), endpoints);
    for (const file of ['cafe24.env', 'ssl.key', 'ssl.crt', 'jinsungsc_key_20260918.pem']) {
      await assert.rejects(fs.lstat(path.join(cafe24Output, file)), { code: 'ENOENT' });
    }
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
