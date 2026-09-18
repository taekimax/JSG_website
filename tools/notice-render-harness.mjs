import fs from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const repoRoot = new URL('../', import.meta.url);
const containerDocument = new JSDOM('<!doctype html>').window.document;

export async function readRepoFile(relativePath) {
  return fs.readFile(new URL(relativePath, repoRoot), 'utf8');
}

export function createContainer() {
  return containerDocument.createElement('main');
}

export async function createNoticeRuntime({ fetchImpl, search = '', sanitizer = true } = {}) {
  const source = await readRepoFile('scripts/notice.js');
  const purifier = sanitizer ? await readRepoFile('scripts/vendor/dompurify-3.4.15.min.js') : '';
  const dom = new JSDOM('<!doctype html><main id="notice-app"></main>', {
    url: `https://jsg.example/notice.html${search}`,
    runScripts: 'outside-only'
  });
  const { window } = dom;
  const listeners = new Map();
  const addEventListener = window.document.addEventListener.bind(window.document);
  window.document.addEventListener = (name, callback, options) => {
    if (name === 'DOMContentLoaded') listeners.set(name, callback);
    else addEventListener(name, callback, options);
  };
  window.fetch = fetchImpl || (async () => ({ ok: true, async json() { return {}; }, async text() { return ''; } }));
  window.console.error = () => {};
  if (sanitizer) window.eval(purifier);
  window.eval(source);

  return {
    window,
    document: window.document,
    app: window.document.getElementById('notice-app'),
    renderList: window.renderList,
    renderDetail: window.renderDetail,
    renderAttachments: window.renderAttachments,
    buildNoticePager: window.buildNoticePager,
    close: () => window.close(),
    async runDomContentLoaded() {
      const handler = listeners.get('DOMContentLoaded');
      if (!handler) throw new Error('DOMContentLoaded handler was not registered');
      await handler();
    }
  };
}
