import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readRepoFile } from './portfolio-render-harness.mjs';

async function navigationRuntime(hash = '', resources = {}) {
  class Element extends EventTarget {
    constructor(id) {
      super();
      this.id = id;
      this.attrs = new Map();
      this.classes = new Set();
      this.children = [];
      this.top = 1000;
      this.classList = {
        add: value => this.classes.add(value),
        remove: value => this.classes.delete(value),
        toggle: (value, on) => on ? this.classes.add(value) : this.classes.delete(value),
        contains: value => this.classes.has(value),
      };
    }
    setAttribute(name, value) { this.attrs.set(name, value); }
    getAttribute(name) { return this.attrs.get(name) ?? null; }
    removeAttribute(name) { this.attrs.delete(name); }
    contains(node) { return node === this || this.children.some(child => child.contains(node)); }
    querySelectorAll() { return this.children; }
    getBoundingClientRect() { return { top: this.top }; }
    focus() { document.activeElement = this; }
    scrollIntoView() { this.scrollCount = (this.scrollCount || 0) + 1; }
  }
  const ids = ['about', 'team', 'philosophy', 'perspective', 'portfolio', 'notice', 'contact'];
  const sections = ids.map(id => new Element(id));
  sections[2].children.push(sections[3]);
  const nav = new Element('primary-navigation');
  nav.children = ids.map(id => Object.assign(new Element(id + '-link'), { href: `https://example.test/jsg/about.html#${id}` }));
  const toggle = new Element('toggle');
  toggle.setAttribute('aria-expanded', 'false');
  const header = new Element('header');
  header.children.push(nav, toggle);
  const main = new Element('main');
  const loading = new Element('page-loading');
  if (resources.minimum) loading.setAttribute('data-min-display-ms', String(resources.minimum));
  const contentSections = sections.filter(section => section.id !== 'perspective');
  contentSections.forEach(section => section.setAttribute('data-content-ready', 'false'));
  const document = new EventTarget();
  document.querySelectorAll = selector => selector === '[data-content-ready]' ? contentSections : selector === 'img' ? resources.images || [] : [];
  document.fonts = { ready: resources.fonts || Promise.resolve() };
  document.documentElement = new Element('html');
  document.documentElement.classList.add('page-pending');
  document.activeElement = null;
  document.getElementById = id => id === loading.id ? loading : id === nav.id ? nav : sections.find(section => section.id === id);
  document.querySelector = selector => ({ '.site-header': header, '.menu-toggle': toggle, main })[selector];
  const location = { pathname: '/jsg/about.html', hash };
  const window = Object.assign(new EventTarget(), { location });
  const frames = new Map();
  let sequence = 0;
  const history = { pushState: (_state, _title, hash) => { location.hash = hash; } };
  const runtime = vm.createContext({ document, window, location, history, setTimeout: resources.setTimeout || setTimeout, URL, Event, requestAnimationFrame: fn => { frames.set(++sequence, fn); return sequence; }, cancelAnimationFrame: id => frames.delete(id), ResizeObserver: class { observe() {} } });
  vm.runInContext(await readRepoFile('scripts/ui.js'), runtime);
  document.dispatchEvent(new Event('DOMContentLoaded'));
  const flush = () => { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(fn => fn()); };
  return { document, window, sections, nav, toggle, location, flush, loading, contentSections };
}

test('detail pages render without a loading message or greeting gate', async () => {
  for (const page of ['team-member.html', 'portfolio.html', 'notice.html']) {
    const html = await readRepoFile(page);
    assert.doesNotMatch(html, /classList\.add\(['"]page-pending['"]\)/);
    assert.doesNotMatch(html, /id="page-loading"/);
    assert.doesNotMatch(html, />Hello!</);
  }
});

test('one page status waits for the final content owner and clears after settlement', async () => {
  const r = await navigationRuntime();
  assert.equal(r.loading.hidden, false);
  assert.equal(r.loading.textContent, 'Hello!');
  for (const section of r.contentSections.slice(0, -1)) {
    section.setAttribute('data-content-ready', 'true');
    r.document.dispatchEvent(new Event('jsg:section-ready'));
  }
  assert.equal(r.loading.hidden, false);
  r.contentSections.at(-1).setAttribute('data-content-ready', 'true');
  r.document.dispatchEvent(new Event('jsg:section-ready'));
  assert.equal(r.loading.hidden, false);
  r.flush();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(r.loading.hidden, true);
  assert.equal(r.loading.textContent, '');
  assert.equal(r.document.documentElement.classList.contains('page-pending'), true);
  r.flush();
  assert.equal(r.document.documentElement.classList.contains('page-pending'), false);
});

test('home minimum overlaps loading and holds fast content until 500 ms', async () => {
  for (const timerFirst of [false, true]) {
    let finishMinimum;
    const r = await navigationRuntime('', { minimum: 500, setTimeout: (fn, delay) => {
      assert.equal(delay, 500);
      finishMinimum = fn;
    } });
    if (timerFirst) finishMinimum();
    assert.equal(r.loading.hidden, false);
    r.contentSections.forEach(section => section.setAttribute('data-content-ready', 'true'));
    r.document.dispatchEvent(new Event('jsg:section-ready'));
    r.flush();
    await new Promise(resolve => setImmediate(resolve));
    if (!timerFirst) {
      assert.equal(r.loading.hidden, false);
      finishMinimum();
      await new Promise(resolve => setImmediate(resolve));
    }
    assert.equal(r.loading.hidden, true);
  }
});

test('greeting waits for fonts and image decoding and settles after an image failure', async () => {
  let finishFonts, finishImage;
  const fonts = new Promise(resolve => { finishFonts = resolve; });
  const decoded = new Promise((_resolve, reject) => { finishImage = reject; });
  const image = { loading: 'eager', getBoundingClientRect: () => ({}), decode: () => decoded };
  const r = await navigationRuntime('', { fonts, images: [image] });
  r.contentSections.forEach(section => section.setAttribute('data-content-ready', 'true'));
  r.document.dispatchEvent(new Event('jsg:section-ready'));
  r.flush();
  assert.equal(r.loading.hidden, false);
  finishFonts();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(r.loading.hidden, false);
  finishImage(new Error('unavailable image'));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(r.loading.hidden, true);
});

test('nested Perspective initial navigation waits for content owners then focuses the requested section', async () => {
  const r = await navigationRuntime('#perspective');
  for (const section of r.sections.filter(section => section.id !== 'perspective' && section.id !== 'contact')) section.setAttribute('data-content-ready', 'true');
  r.document.dispatchEvent(new Event('jsg:section-ready'));
  r.flush();
  assert.equal(r.sections[3].scrollCount, undefined);
  r.sections.at(-1).setAttribute('data-content-ready', 'true');
  r.document.dispatchEvent(new Event('jsg:section-ready'));
  r.flush();
  assert.equal(r.sections[3].scrollCount, undefined);
  await new Promise(resolve => setImmediate(resolve));
  r.flush();
  r.flush();
  assert.equal(r.sections[3].scrollCount, 1);
  assert.equal(r.document.activeElement, r.sections[3]);
});

test('hamburger opens, Escape restores focus, and a section choice closes it and navigates', async () => {
  const r = await navigationRuntime();
  r.toggle.dispatchEvent(new Event('click'));
  assert.equal(r.toggle.getAttribute('aria-expanded'), 'true');
  assert.equal(r.toggle.getAttribute('aria-label'), 'Close menu');
  assert.equal(r.nav.classList.contains('is-open'), true);
  const escape = new Event('keydown');
  Object.defineProperty(escape, 'key', { value: 'Escape' });
  r.document.dispatchEvent(escape);
  assert.equal(r.toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(r.document.activeElement, r.toggle);
  r.toggle.dispatchEvent(new Event('click'));
  r.nav.children[3].dispatchEvent(new Event('click', { cancelable: true }));
  r.flush();
  assert.equal(r.toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(r.nav.classList.contains('is-open'), false);
  assert.equal(r.location.hash, '#perspective');
  assert.equal(r.document.activeElement, r.sections[3]);
});
