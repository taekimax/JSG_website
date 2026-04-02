import test from 'node:test';
import assert from 'node:assert/strict';
import { createContainer, createNoticeRuntime } from './notice-render-harness.mjs';

function extractNoticeIdsFromLinks(html) {
  const ids = [];
  const pattern = /href="notice\.html\?id=([^"&]+)"/g;
  let match = pattern.exec(html);
  while (match) {
    ids.push(decodeURIComponent(match[1]));
    match = pattern.exec(html);
  }
  return ids;
}

test('notice list renderer uses record hooks and keeps date-desc ordering', async () => {
  const { renderList } = await createNoticeRuntime();
  const container = createContainer();
  const notices = [
    { id: 'notice-old', title: 'Old', date: '2025-01-10', category: '일반' },
    { id: 'notice-new', title: 'New', date: '2025-03-10', category: '정책', isImportant: true },
    { id: 'notice-mid', title: 'Mid', date: '2025-02-10', category: '안내' }
  ];

  renderList(notices, container);

  assert.match(container.innerHTML, /class="notice-list"/);
  assert.match(container.innerHTML, /class="notice-record-item"/);
  assert.match(container.innerHTML, /class="notice-record-item-header"/);
  assert.deepEqual(extractNoticeIdsFromLinks(container.innerHTML), ['notice-new', 'notice-mid', 'notice-old']);
});

test('notice detail renderer includes record hooks and preserves pager and attachments behavior', async () => {
  const requests = [];
  const { renderDetail } = await createNoticeRuntime({
    fetchImpl: async (url) => {
      requests.push(String(url));
      return {
        ok: true,
        async text() {
          return '본문 계약 테스트';
        }
      };
    }
  });

  const notices = [
    { id: 'notice-next', title: '다음 공지 제목', date: '2026-02-11', category: '정책', attachments: [] },
    {
      id: 'notice-current',
      title: '현재 공지 제목',
      date: '2026-02-10',
      category: '안내',
      attachments: ['policy guide.pdf', 'folder/attachment.txt']
    },
    { id: 'notice-prev', title: '이전 공지 제목', date: '2026-02-09', category: '일반', attachments: [] }
  ];
  const container = createContainer();

  await renderDetail(
    notices,
    'notice-current',
    container,
    'assets/notices/attachments/',
    'assets/notices/posts/',
    'contract-1'
  );

  assert.match(container.innerHTML, /class="notice-record"/);
  assert.match(container.innerHTML, /class="notice-record-body"/);
  assert.match(container.innerHTML, /본문 계약 테스트/);
  assert.match(container.innerHTML, /<article class="notice-record">[\s\S]*class="notice-pager"[\s\S]*<\/article>/);
  assert.match(container.innerHTML, /<article class="notice-record">[\s\S]*class="notice-pager-link prev" href="notice\.html\?id=notice-next"/);
  assert.match(container.innerHTML, /<article class="notice-record">[\s\S]*class="notice-pager-link next" href="notice\.html\?id=notice-prev"/);
  assert.match(container.innerHTML, /<article class="notice-record">[\s\S]*class="notice-pager-list" href="notice\.html"/);
  assert.match(container.innerHTML, /href="assets\/notices\/attachments\/policy%20guide\.pdf\?v=contract-1"/);
  assert.match(container.innerHTML, /href="assets\/notices\/attachments\/folder\/attachment\.txt\?v=contract-1"/);
  assert.ok(
    requests.includes('assets/notices/posts/notice-current.txt?v=contract-1'),
    'detail renderer should fetch notice post text with versioned URL'
  );
});

test('notice loading state is applied through the DOMContentLoaded path before fetches resolve', async () => {
  let resolveManifest;
  let resolveNotices;
  const manifestResponse = new Promise((resolve) => {
    resolveManifest = resolve;
  });
  const noticesResponse = new Promise((resolve) => {
    resolveNotices = resolve;
  });

  const runtime = await createNoticeRuntime({
    fetchImpl: async (url) => {
      if (String(url).includes('notices-manifest.json')) {
        return manifestResponse;
      }
      return noticesResponse;
    }
  });

  const readyPromise = runtime.runDomContentLoaded();

  assert.match(runtime.app.innerHTML, /class="notice-record-item notice-loading"/);
  assert.match(runtime.app.innerHTML, /불러오는 중/);

  resolveManifest({
    async json() {
      return {
        noticesJson: 'assets/notices/notices.json',
        attachmentsBase: 'assets/notices/attachments/',
        postsBase: 'assets/notices/posts/',
        assetVersion: 'contract-1'
      };
    }
  });

  resolveNotices({
    async json() {
      return [];
    }
  });

  await readyPromise;
});
