import test from 'node:test';
import assert from 'node:assert/strict';
import { readRepoFile } from './portfolio-render-harness.mjs';

const pages = ['about.html', 'team-member.html', 'portfolio.html', 'notice.html'];
const destinations = ['about', 'team', 'philosophy', 'portfolio', 'notice', 'contact'].map(section => `about.html#${section}`);

test('every interior page has the same reachable top navigation without an island or bottom sheet', async () => {
  for (const page of pages) {
    const html = await readRepoFile(page);
    const header = html.match(/<header class="site-header">[\s\S]*?<\/header>/)?.[0];
    assert.ok(header, page);
    assert.match(header, /aria-controls="primary-navigation" aria-expanded="false"/);
    assert.match(header, /<nav id="primary-navigation"/);
    const links = [...header.matchAll(/<a href="([^"]+)"[^>]*>(About|Team|Philosophy|Portfolio|Notice|Contact)<\/a>/g)];
    assert.deepEqual(links.map(link => link[1]), destinations, page);
    const active = `about.html#${page === 'team-member.html' ? 'team' : page.replace('.html', '')}`;
    assert.match(header, new RegExp(`href="${active.replace('.', '\\.')}" aria-current="page"`));
    assert.doesNotMatch(html, /bottom-nav|section-pager|section-sheet|sheet-toggle/);
    assert.match(html, /id="main-content"/);
    assert.match(html, /scripts\/ui\.js/);
  }
});
