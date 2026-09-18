import test from 'node:test';
import assert from 'node:assert/strict';
import { createNoticeRuntime, readRepoFile } from './notice-render-harness.mjs';

const notice = { id: 'security', title: '공지 안내', date: '2026-09-18', category: '공시', attachments: [], bodyFormat: 'html' };

async function runtimeFor(t, html = '', options = {}) {
  const runtime = await createNoticeRuntime({
    fetchImpl: async () => ({ ok: true, text: async () => html }),
    ...options
  });
  t.after(runtime.close);
  return runtime;
}

async function render(runtime, values = {}) {
  await runtime.renderDetail([{ ...notice, ...values }], notice.id, runtime.app,
    '/board-content/attachments/', '/board-content/posts/', 'security-1');
  return runtime.app.querySelector('.notice-record-body');
}

test('attachment filename is literal text, not parsed markup or an event handler', async t => {
  const runtime = await runtimeFor(t, '<p>본문</p>');
  const filename = '자료 <img src=x onerror="window.pwned=1"> & 계약.pdf';
  await render(runtime, { attachments: [filename] });
  const attachment = runtime.app.querySelector('.attachment-link');
  assert.ok(attachment);
  assert.equal(attachment.querySelector('img'), null);
  assert.equal(runtime.app.querySelector('[onerror]'), null);
  assert.ok(attachment.textContent.includes(filename));
  assert.equal(attachment.getAttribute('href'), `/board-content/attachments/${encodeURIComponent(filename)}?v=security-1`);
});

test('Korean names, nested paths, spaces, punctuation and version query survive', async t => {
  const runtime = await runtimeFor(t);
  const names = ['2026 공시.pdf', '하위 폴더/계약서 (최종) & 100%.pdf', '자료/번호#1?.pdf'];
  runtime.app.innerHTML = runtime.renderAttachments(names, '/board-content/attachments', 'v & "한글"');
  const links = [...runtime.app.querySelectorAll('.attachment-link')];
  assert.equal(links.length, names.length);
  for (const [i, link] of links.entries()) {
    assert.ok(link.textContent.includes(names[i]));
    const expected = names[i].split('/').map(encodeURIComponent).join('/');
    assert.equal(link.getAttribute('href'), `/board-content/attachments/${expected}?v=${encodeURIComponent('v & "한글"')}`);
    assert.ok(link.hasAttribute('download'));
  }
});

test('attachment paths cannot traverse or supply an absolute/executable URL', async t => {
  const runtime = await runtimeFor(t);
  const invalid = ['../secret', 'nested/../../secret', './file', '/file', '//evil.example/file',
    'https://evil.example/file', 'javascript:alert(1)', 'data:text/html,hello', 'nested\\file',
    'nested//file', '%2e%2e/secret', '%252e%252e/secret', 'nested/%2Fsecret',
    'nested/%255csecret', 'bad\u0000.pdf', 'bad%0a.pdf', '', null, {}];
  for (const filename of invalid) {
    assert.equal(runtime.renderAttachments([filename], '/board-content/attachments/'), '', String(filename));
  }
  assert.equal(runtime.renderAttachments('not-an-array', '/board-content/attachments/'), '');
});

test('invalid attachment and post bases fail closed', async t => {
  let requests = 0;
  const runtime = await runtimeFor(t, '', { fetchImpl: async () => { requests++; throw new Error('must not fetch'); } });
  for (const base of ['javascript:alert(1)', 'data:text/html,x', 'file:///tmp/', '//evil.example/',
    'https://user:password@example.org/', 'https://cdn.example/files/', 'http://jsg.example/files/',
    '/safe/../escape/', '/safe/%2e%2e/',
    '/safe/%252e%252e/', '/safe/%2fescape/', '/safe\\escape/', '/safe/?x=', '/safe/#x', '']) {
    assert.equal(runtime.renderAttachments(['안내.pdf'], base), '', base);
    await runtime.renderDetail([notice], notice.id, runtime.app, '/files/', base);
    assert.equal(runtime.app.querySelector('.notice-record-body').textContent, '본문을 불러올 수 없습니다.', base);
  }
  assert.equal(requests, 0);
});

test('safe relative and same-origin attachment directories remain usable', async t => {
  const runtime = await runtimeFor(t);
  for (const base of ['/board-content/attachments/', 'board-content/attachments/', 'https://jsg.example/자료/']) {
    runtime.app.innerHTML = runtime.renderAttachments(['nested/한글.pdf'], base);
    assert.equal(runtime.app.querySelector('a').getAttribute('href'), `${base}nested/${encodeURIComponent('한글.pdf')}`);
  }
  runtime.app.innerHTML = runtime.renderAttachments(['한글.pdf'], '/files/"quoted"/');
  assert.equal(runtime.app.querySelector('a').getAttribute('href'), `/files/"quoted"/${encodeURIComponent('한글.pdf')}`);
  assert.equal(runtime.app.querySelector('a').attributes.length, 3);
});

test('generated HTML sanitization strips executable elements, attributes and DOM clobbering', async t => {
  const payload = `<h2 id="DOMPurify" onclick="window.pwned=1">안내</h2>
    <script>window.pwned=1</script><iframe srcdoc="<script>alert(1)</script>"></iframe>
    <object data="data:text/html,x"></object><embed src="https://example.org/evil">
    <style>body{display:none}</style><link rel="stylesheet" href="https://example.org/x">
    <base href="https://evil.example/"><meta http-equiv="refresh" content="0;url=https://evil.example">
    <form id="notice-app"><input name="DOMPurify"></form>
    <svg onload="window.pwned=1"><a href="javascript:alert(1)">bad</a></svg>
    <math><mtext><img src=x onerror="window.pwned=1"></mtext></math>
    <img src="/safe.png" onerror="window.pwned=1" srcset="data:text/html,x" style="display:none">
    <p data-action="execute" style="display:none">정상 본문</p>`;
  const runtime = await runtimeFor(t, payload);
  const body = await render(runtime);
  assert.equal(body.querySelector('script, iframe, object, embed, style, link, base, meta, form, input, svg, math'), null);
  for (const element of body.querySelectorAll('*')) {
    for (const attribute of element.attributes) {
      assert.ok(!/^on/i.test(attribute.name));
      assert.ok(!['style', 'srcdoc', 'srcset', 'id', 'name', 'data-action'].includes(attribute.name));
    }
  }
  assert.equal(body.querySelector('h2').textContent, '안내');
  assert.ok(body.textContent.includes('정상 본문'));
  assert.equal(body.querySelector('img').getAttribute('src'), '/safe.png');
});

test('safe Markdown structure, code, links and images are preserved', async t => {
  const html = `<h1>제목</h1><h2>안내</h2><h3>세부</h3><h4>넷</h4><h5>다섯</h5><h6>여섯</h6>
    <p><strong>굵게</strong> <em>강조</em> <del>취소</del><br>문단</p><hr>
    <blockquote><p>인용</p></blockquote><ul><li>하나</li></ul><ol start="3"><li>셋</li></ol>
    <table><thead><tr><th scope="col">항목</th></tr></thead><tbody><tr><td colspan="2">값</td></tr></tbody></table>
    <pre><code class="language-html">&lt;img onerror=alert(1)&gt;</code></pre>
    <a href="https://example.org/자료?q=1&amp;x=2" title="참고">공식 링크</a>
    <img src="/board-content/attachments/그림.png" alt="안내 그림" title="그림">`;
  const runtime = await runtimeFor(t, html);
  const body = await render(runtime);
  for (const tag of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'strong', 'em', 'del', 'br', 'hr', 'blockquote', 'ul', 'li', 'ol', 'table', 'thead', 'tr', 'th', 'tbody', 'td', 'pre', 'code', 'a', 'img']) {
    assert.ok(body.querySelector(tag), tag);
  }
  assert.equal(body.querySelector('code').textContent, '<img onerror=alert(1)>');
  assert.equal(body.querySelector('code').className, 'language-html');
  assert.equal(body.querySelector('img').alt, '안내 그림');
  assert.equal(body.querySelector('td').getAttribute('colspan'), '2');
  assert.equal(body.querySelector('a').getAttribute('href'), 'https://example.org/자료?q=1&x=2');
});

test('body URL policy removes unsafe schemes including encoded and whitespace variants', async t => {
  const hrefs = ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'jav&#x61;script:alert(1)',
    'java&#9;script:alert(1)', '&#10;javascript:alert(1)', 'data:text/html,x', 'vbscript:msgbox(1)',
    'file:///etc/passwd', 'blob:https://example.org/id', 'ftp://example.org/file', 'custom:open',
    'https://user:password@example.org/'];
  const runtime = await runtimeFor(t, hrefs.map(href => `<a href="${href}">bad</a><img src="${href}">`).join('')
    + '<img src="data:image/png;base64,aGVsbG8="><img src="mailto:user@example.org"><img src="tel:123">');
  const body = await render(runtime);
  assert.equal(body.querySelector('[href], [src]'), null);
});

test('Markdown table alignment survives sanitization without allowing arbitrary CSS', async t => {
  const runtime = await runtimeFor(t, `<table><thead><tr>
    <th style="text-align:left">Left</th><th style="text-align:center">Center</th>
    <th style="text-align:right">Right</th></tr></thead><tbody><tr>
    <td style=" text-align : LEFT ; ">왼쪽</td><td style="TEXT-ALIGN: center;">가운데</td>
    <td style="text-align:right;">오른쪽</td></tr></tbody></table>
    <table><tr><td style="text-align:center;color:red">Extra CSS</td>
    <td style="background:url(javascript:alert(1))">URL</td>
    <td style="text-align:expression(alert(1))">Expression</td></tr></table>
    <p style="text-align:center">Not a table cell</p>`);
  const body = await render(runtime);
  const cells = [...body.querySelectorAll('th, td')];
  assert.deepEqual(cells.map(cell => cell.getAttribute('align')),
    ['left', 'center', 'right', 'left', 'center', 'right', null, null, null]);
  assert.equal(body.querySelector('[style]'), null);
  assert.equal(body.querySelector('p').getAttribute('align'), null);
});

test('body URL policy permits relative, anchor, web, email and phone links and web images', async t => {
  const links = ['https://example.org/x', 'http://example.org/x', '/board-content/attachments/자료.pdf',
    'attachments/자료.pdf', '#section', '//example.org/x', 'mailto:contact@example.org', 'tel:+82212345678'];
  const images = ['https://example.org/x.png', 'http://example.org/x.png', '/images/그림.png', 'images/x.png'];
  const runtime = await runtimeFor(t, links.map(href => `<a href="${href}">link</a>`).join('')
    + images.map(src => `<img src="${src}" alt="safe">`).join(''));
  const body = await render(runtime);
  assert.deepEqual([...body.querySelectorAll('a')].map(a => a.getAttribute('href')), links);
  assert.deepEqual([...body.querySelectorAll('img')].map(img => img.getAttribute('src')), images);
});

test('missing or unsupported sanitizer and thrown sanitization fail closed, text notices still work', async t => {
  for (const state of ['missing', 'unsupported', 'throws']) {
    const runtime = await runtimeFor(t, '<img src=x onerror=alert(1)><p>HTML</p>', { sanitizer: state !== 'missing' });
    if (state === 'unsupported') runtime.window.DOMPurify.isSupported = false;
    if (state === 'throws') runtime.window.DOMPurify.sanitize = () => { throw new Error('failure'); };
    const body = await render(runtime);
    assert.equal(body.textContent, '본문을 불러올 수 없습니다.');
    assert.equal(body.querySelector('*'), null);
    const textBody = await render(runtime, { bodyFormat: 'text' });
    assert.equal(textBody.textContent, '<img src=x onerror=alert(1)><p>HTML</p>');
    assert.equal(textBody.querySelector('*'), null);
  }
});

test('both static pages load the vendored sanitizer before Notice', async () => {
  for (const page of ['about.html', 'notice.html']) {
    const html = await readRepoFile(page);
    const sanitizer = html.indexOf('src="scripts/vendor/dompurify-3.4.15.min.js"');
    const renderer = html.indexOf('src="scripts/notice.js?');
    assert.ok(sanitizer >= 0 && renderer > sanitizer, page);
  }
});
