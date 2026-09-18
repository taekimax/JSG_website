import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const config = await fs.readFile(new URL('.htaccess', root), 'utf8');
const headers = new Map([...config.matchAll(/^Header always set ([\w-]+) "([^"]+)"$/gm)]
  .map(([, name, value]) => [name.toLowerCase(), value]));
const policy = new Map((headers.get('content-security-policy') || '').split(';')
  .map(part => part.trim().split(/\s+/)).map(([name, ...values]) => [name, values]));

test('browser policy blocks injected scripts, framing, plugins and form submission', () => {
  const scripts = policy.get('script-src');
  assert.ok(scripts.includes("'self'"));
  assert.ok(!scripts.includes("'unsafe-inline'"));
  assert.ok(!scripts.includes("'unsafe-eval'"));
  for (const directive of ['script-src-attr', 'frame-src', 'frame-ancestors', 'object-src', 'base-uri', 'form-action']) {
    assert.deepEqual(policy.get(directive), ["'none'"], directive);
  }
  assert.deepEqual(policy.get('connect-src'), ["'self'"]);
  assert.equal(headers.get('x-content-type-options'), 'nosniff');
  assert.equal(headers.get('x-frame-options'), 'DENY');
  assert.equal(headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
  assert.equal(headers.get('permissions-policy'), 'camera=(), microphone=(), geolocation=()');
  assert.equal(headers.get('strict-transport-security'), 'max-age=31536000');
});

test('CSP permits existing boot/redirect scripts and same-site assets without unsafe-inline scripts', async () => {
  const pages = (await fs.readdir(root)).filter(name => name.endsWith('.html'));
  pages.push('admin/index.html');
  const expectedHashes = new Set();
  for (const page of pages) {
    const html = await fs.readFile(new URL(page, root), 'utf8');
    for (const [, attrs, script] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      const src = attrs.match(/\bsrc\s*=\s*"([^"]+)"/i)?.[1];
      if (src) {
        const url = new URL(src, `https://jsginvest.com/${page}`);
        assert.equal(url.origin, 'https://jsginvest.com', `${page}: ${src}`);
        await fs.access(new URL(url.pathname.slice(1), root));
      } else {
        const hash = `'sha256-${createHash('sha256').update(script).digest('base64')}'`;
        expectedHashes.add(hash);
        assert.ok(policy.get('script-src').includes(hash), `${page}: update CSP hash for changed inline script`);
      }
    }
    assert.doesNotMatch(html, /\son(?:click|load|error|focus|mouseover)\s*=/i, page);
    for (const [, href] of html.matchAll(/<link\b[^>]*\bhref="([^"]+)"/gi)) {
      const url = new URL(href, `https://jsginvest.com/${page}`);
      assert.equal(url.origin, 'https://jsginvest.com', `${page}: stylesheet/font origin`);
    }
  }
  assert.deepEqual(new Set(policy.get('script-src').filter(value => value.startsWith("'sha256-"))), expectedHashes,
    'remove hashes for retired inline scripts');
});
