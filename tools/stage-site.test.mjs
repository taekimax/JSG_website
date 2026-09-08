import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { stageSite } from './stage-site.mjs';

test('Pages artifact excludes private/local files and routes all CMS data to the public output site', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'jsg-stage-'));
  try {
    await fs.mkdir(path.join(root, 'assets/shared'), { recursive: true });
    await fs.writeFile(path.join(root, 'about.html'), '<main>Public</main>');
    await fs.writeFile(path.join(root, 'AGENTS.md'), 'Not a public page');
    await fs.symlink('/not/a/real/local/mount', path.join(root, 'board-content'));
    const endpoints = {
      schemaVersion: 1,
      noticesManifest: '/board-content/notices-manifest.json',
      perspectiveManifest: '/board-content/perspective-manifest.json',
      portfolioManifest: '/board-content/portfolio-manifest.json'
    };
    await fs.writeFile(path.join(root, 'assets/shared/board-endpoints.json'), JSON.stringify(endpoints));
    const output = await stageSite({ root, githubPages: true });
    assert.equal(await fs.readFile(path.join(output, 'about.html'), 'utf8'), '<main>Public</main>');
    for (const file of ['AGENTS.md', 'board-content', 'tools', '.git']) {
      await assert.rejects(fs.lstat(path.join(output, file)), { code: 'ENOENT' });
    }
    const staged = JSON.parse(await fs.readFile(path.join(output, 'assets/shared/board-endpoints.json'), 'utf8'));
    assert.equal(staged.portfolioManifest, '/jsg-public-content/board-content/portfolio-manifest.json');
    assert.equal(staged.noticesManifest, '/jsg-public-content/board-content/notices-manifest.json');
    assert.equal(staged.perspectiveManifest, '/jsg-public-content/board-content/perspective-manifest.json');
    assert.deepEqual(JSON.parse(await fs.readFile(path.join(root, 'assets/shared/board-endpoints.json'), 'utf8')), endpoints);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
