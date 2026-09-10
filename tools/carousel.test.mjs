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

test('portfolio speed override advances 240 pixels in two seconds at 120 pixels per second', () => {
  const c = carousel(false, 0.12);
  c.tick(100);
  for (let i = 1; i <= 120; i++) c.tick(100 + i * 1000 / 60);
  assert.equal(c.viewport.scrollLeft, 1240);
});

test('manual scrolling pauses motion, wraps in both directions and resumes from that position', () => {
  const c = carousel();
  c.events.wheel();
  assert.equal(c.running(), false);
  assert.equal(c.attributes['aria-pressed'], 'true');
  c.viewport.scrollLeft = 900; c.events.scroll();
  assert.equal(c.viewport.scrollLeft, 1900);
  c.viewport.scrollLeft = 2050; c.events.scroll();
  assert.equal(c.viewport.scrollLeft, 1050);
  c.buttons.click();
  c.tick(100); c.tick(150);
  assert.equal(c.viewport.scrollLeft, 1053);
  c.events.focusin();
  assert.equal(c.running(), false);
});

test('reduced motion starts paused and still permits native horizontal scrolling', () => {
  const c = carousel(true);
  assert.equal(c.running(), false);
  c.viewport.scrollLeft = 1400; c.events.scroll();
  assert.equal(c.viewport.scrollLeft, 1400);
  assert.equal(c.attributes['aria-pressed'], 'true');
});

test('carousel starts playing and pauses on touch until explicitly resumed', () => {
  const c = carousel();
  assert.equal(c.running(), true);
  assert.equal(c.attributes['aria-pressed'], 'false');
  c.tick(100); c.tick(150);
  assert.equal(c.viewport.scrollLeft, 1003);
  c.events.pointerdown();
  assert.equal(c.running(), false);
  assert.equal(c.attributes['aria-pressed'], 'true');
  c.tick(200); c.tick(250);
  assert.equal(c.viewport.scrollLeft, 1003);
  c.buttons.click();
  assert.equal(c.running(), true);
  assert.equal(c.attributes['aria-pressed'], 'false');
});
