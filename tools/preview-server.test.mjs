import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { createPreviewServer } from './preview-server.mjs';

test('preview serves live public files under /jsg, rebases content, and excludes private paths', async t => {
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'jsg-preview-test-'));
  const root = path.join(temporary, 'site');
  const contentRoot = path.join(temporary, 'dist');
  await fs.mkdir(path.join(root, 'assets'), { recursive: true });
  await fs.mkdir(path.join(root, 'docs'), { recursive: true });
  await fs.mkdir(contentRoot);
  await fs.writeFile(path.join(root, 'about.html'), '<a href="about.html">Home</a>');
  await fs.writeFile(path.join(root, 'docs', 'private.txt'), 'private');
  await fs.writeFile(path.join(root, 'assets', 'endpoints.json'), '{"manifest":"/board-content/list.json"}');
  await fs.writeFile(path.join(contentRoot, 'list.json'), '{"image":"/board-content/ci.svg"}');
  await fs.writeFile(path.join(contentRoot, 'post.html'), '<img src="/board-content/ci.svg">');
  await fs.writeFile(path.join(contentRoot, 'ci.svg'), '<svg/>');
  await fs.symlink(path.join(root, 'docs', 'private.txt'), path.join(root, 'assets', 'escape.txt'));
  const server = createPreviewServer({ root, contentRoot });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    await new Promise(resolve => server.close(resolve));
    await fs.rm(temporary, { recursive: true, force: true });
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const redirect = await fetch(`${base}/jsg`, { redirect: 'manual' });
  assert.equal(redirect.headers.get('location'), '/jsg/about.html');
  assert.equal(await (await fetch(`${base}/jsg/`)).text(), '<a href="about.html">Home</a>');
  assert.deepEqual(await (await fetch(`${base}/jsg/assets/endpoints.json`)).json(), { manifest: '/jsg/board-content/list.json' });
  assert.deepEqual(await (await fetch(`${base}/jsg/board-content/list.json`)).json(), { image: '/jsg/board-content/ci.svg' });
  assert.equal(await (await fetch(`${base}/jsg/board-content/post.html`)).text(), '<img src="/jsg/board-content/ci.svg">');
  assert.equal(await (await fetch(`${base}/jsg/board-content/ci.svg`)).text(), '<svg/>');
  await fs.writeFile(path.join(root, 'about.html'), 'updated');
  assert.equal(await (await fetch(`${base}/jsg/`)).text(), 'updated');
  for (const url of ['/jsg/docs/private.txt', '/jsg/.git/config', '/jsg/assets/escape.txt', '/jsg/board-content/', '/assets/endpoints.json']) {
    assert.equal((await fetch(`${base}${url}`)).status, 404, url);
  }
  const traversalStatus = await new Promise(resolve => {
    http.get(`${base}/jsg/assets/%2e%2e/docs/private.txt`, response => {
      response.resume();
      resolve(response.statusCode);
    });
  });
  assert.equal(traversalStatus, 404);
  assert.equal((await fetch(`${base}/jsg/`, { method: 'POST' })).status, 405);
});
