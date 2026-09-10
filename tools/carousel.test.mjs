import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function carousel(reduced = false, speed = 0.0585) {
  const events = {}, buttons = {}, attributes = {};
  let x = 0, frame, visibility;
  const viewport = {
    get scrollLeft() { return x; },
    set scrollLeft(value) { x = Math.round(value); },
    addEventListener(name, fn) { events[name] = fn; }
  };
  const button = { setAttribute(k, v) { attributes[k] = v; }, addEventListener(k, fn) { buttons[k] = fn; } };
  const group = {
    children: [{ getBoundingClientRect: () => ({ left: 0 }) }],
    getBoundingClientRect: () => ({ left: 0, width: 1000 }),
    nextElementSibling: { cloneNode: () => ({}) }, before() {}
  };
  const context = { window: { matchMedia: () => ({ matches: reduced, addEventListener() {} }) },
    ResizeObserver: class { observe() {} },
    IntersectionObserver: class { constructor(fn) { visibility = fn; } observe() {} },
    requestAnimationFrame(fn) { frame = fn; return 1; }, cancelAnimationFrame() { frame = undefined; } };
  vm.runInNewContext(fs.readFileSync(new URL('../scripts/carousel.js', import.meta.url), 'utf8'), context);
  context.window.JsgCarousel({ viewport, button, group, speed });
  visibility([{ isIntersecting: true }]);
  return { viewport, events, buttons, attributes,
    tick(time) { const fn = frame; frame = undefined; fn?.(time); events.scroll(); },
    running: () => Boolean(frame) };
}

test('carousel advances 117 pixels in two seconds despite integer scroll rounding', () => {
  const c = carousel();
  c.tick(100);
  for (let i = 1; i <= 120; i++) c.tick(100 + i * 1000 / 60);
  assert.equal(c.viewport.scrollLeft, 1117);
});

test('portfolio speed override advances 200 pixels in two seconds at 100 pixels per second', () => {
  const c = carousel(false, 0.1);
  c.tick(100);
  for (let i = 1; i <= 120; i++) c.tick(100 + i * 1000 / 60);
  assert.equal(c.viewport.scrollLeft, 1200);
});

test('manual scrolling keeps playing and wraps in both directions from the user position', () => {
  const c = carousel();
  for (const event of ['wheel', 'pointerdown', 'focusin']) c.events[event]?.();
  assert.equal(c.running(), true);
  assert.equal(c.attributes['aria-pressed'], 'false');
  c.viewport.scrollLeft = 900; c.events.scroll();
  assert.equal(c.viewport.scrollLeft, 1900);
  c.viewport.scrollLeft = 2050; c.events.scroll();
  assert.equal(c.viewport.scrollLeft, 1050);
  c.tick(100); c.tick(150);
  assert.equal(c.viewport.scrollLeft, 1053);
});

test('explicit continuous playback starts playing with either system motion preference', () => {
  for (const reduced of [false, true]) {
    const c = carousel(reduced);
    assert.equal(c.running(), true);
    assert.equal(c.attributes['aria-pressed'], 'false');
  }
});

test('only the button pauses playback and user scrolling preserves that choice', () => {
  const c = carousel();
  c.tick(100); c.tick(150);
  assert.equal(c.viewport.scrollLeft, 1003);
  c.buttons.click();
  assert.equal(c.running(), false);
  assert.equal(c.attributes['aria-pressed'], 'true');
  c.viewport.scrollLeft = 1400; c.events.scroll();
  for (const event of ['wheel', 'pointerdown', 'focusin']) c.events[event]?.();
  c.tick(200); c.tick(250);
  assert.equal(c.viewport.scrollLeft, 1400);
  assert.equal(c.running(), false);
  c.buttons.click();
  assert.equal(c.running(), true);
  assert.equal(c.attributes['aria-pressed'], 'false');
  c.tick(300); c.tick(350);
  assert.equal(c.viewport.scrollLeft, 1403);
});
