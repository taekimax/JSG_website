import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const read = path => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('website uses fixed external board manifests and keeps content out of the site repository', async () => {
  const endpoints = JSON.parse(await read('assets/shared/board-endpoints.json'));
  assert.deepEqual(endpoints, {
    schemaVersion: 1,
    noticesManifest: '/board-content/notices-manifest.json',
    perspectiveManifest: '/board-content/perspective-manifest.json',
    portfolioManifest: '/board-content/portfolio-manifest.json'
  });
  const [noticeScript, perspectiveScript] = await Promise.all([
    read('scripts/notice.js'),
    read('scripts/philosophyCopy.js')
  ]);
  assert.match(noticeScript, /board-endpoints\.json/);
  assert.match(perspectiveScript, /board-endpoints\.json/);
  for (const path of ['assets/portfolio/portfolio-manifest.json', 'assets/portfolio/acryl.txt', 'assets/notices/notices.json', 'assets/notices/source', 'assets/notices/attachments', 'assets/philosophy/posts.json']) {
    await assert.rejects(fs.access(new URL(`../${path}`, import.meta.url)), { code: 'ENOENT' });
  }
});

test('/admin redirects to the repository-scoped hosted Pages CMS editor', async () => {
  const html = await read('admin/index.html');
  const editor = 'https://app.pagescms.org/taekimax/jsg-board-content/main';
  assert.match(html, new RegExp(editor.replaceAll('.', '\\.')));
  assert.match(html, /name="robots" content="noindex, nofollow"/);
  assert.match(html, /window\.location\.replace/);
});
