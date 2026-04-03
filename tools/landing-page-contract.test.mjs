import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

async function readRepoFile(relativePath) {
  return fs.readFile(path.join(repoRoot, relativePath), 'utf8');
}

test('landing page exposes the new hero root, canvas/content contract, and generated module hook', async () => {
  const html = await readRepoFile('landing.html');

  assert.match(html, /id="landingHeroRoot"/);
  assert.match(html, /class="landingHero"/);
  assert.match(html, /class="landingHero__canvas"/);
  assert.match(html, /class="landingHero__content"/);
  assert.match(html, /class="landingHero__copyColumn"/);
  assert.match(html, /class="hero-copy hero-copy--stack"/);
  assert.match(html, /id="enterBtn"/);
  assert.match(html, /id="landing-hero-title"/);
  assert.equal((html.match(/class="landingHero__fallbackGlyph"/g) || []).length, 3);
  assert.match(
    html,
    /<script type="module" src="\/generated\/landing-hero\/landing-hero\.js\?v=2026-04-03-svg-hero-03"><\/script>/,
  );
  assert.doesNotMatch(html, /landing-variant-switcher/);
  assert.doesNotMatch(html, /scripts\/landingCopy\.js/);
  assert.doesNotMatch(html, /scripts\/landingAnimation\.js/);
});

test('landing hero source keeps react mount, manifest hydration, reduced-motion handling, and about navigation contracts', async () => {
  const [entrySource, sectionSource, svgSource, css, buildSource] = await Promise.all([
    readRepoFile('src/landing/main.tsx'),
    readRepoFile('src/components/hero/LandingHeroSection.tsx'),
    readRepoFile('src/components/hero/LandingHeroSvg.tsx'),
    readRepoFile('styles/landing.css'),
    readRepoFile('src/lib/heroBuild.ts'),
  ]);

  assert.match(entrySource, /createRoot/);
  assert.match(entrySource, /landingHeroRoot/);
  assert.match(entrySource, /LandingHeroSection/);
  assert.match(entrySource, /__JSG_LANDING_HERO_BUILD__/);
  assert.match(entrySource, /dataset\.heroBuild/);
  assert.match(entrySource, /console\.info/);

  assert.match(sectionSource, /assets\/landing\/landing-manifest\.json/);
  assert.match(sectionSource, /LandingHeroSvg/);
  assert.match(sectionSource, /about\.html/);
  assert.match(sectionSource, /landingHero__canvas/);
  assert.match(sectionSource, /landingHero__content/);
  assert.match(sectionSource, /landingHero__copyColumn/);
  assert.match(sectionSource, /landingHero__buildBadge/);
  assert.doesNotMatch(sectionSource, /HeroCanvas/);
  assert.doesNotMatch(sectionSource, /useHeroPointer/);
  assert.doesNotMatch(sectionSource, /useQualityTier/);
  assert.doesNotMatch(sectionSource, /useReducedMotion/);
  assert.doesNotMatch(sectionSource, /onPointer/);

  assert.match(svgSource, /landing-hero-svg/);
  assert.match(svgSource, /viewBox="0 0 1440 900"/);
  assert.match(svgSource, /clipPath id="clip-j"/);
  assert.match(svgSource, /clipPath id="clip-s"/);
  assert.match(svgSource, /clipPath id="clip-g"/);
  assert.match(svgSource, /@keyframes heroFloat/);
  assert.match(svgSource, /@keyframes bandSweep/);
  assert.doesNotMatch(svgSource, /onPointer|onMouse|onHover|pointerRef|HeroPointerState/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(buildSource, /2026-04-03-svg-hero-03/);
  assert.match(buildSource, /127\.0\.0\.1/);
  assert.match(buildSource, /localhost/);
});

test('landing stylesheet keeps the hero section, canvas layering, fallback lockup, and mobile scroll contract', async () => {
  const css = await readRepoFile('styles/landing.css');

  assert.match(css, /\.landingHero\s*\{/);
  assert.match(css, /\.landingHero__canvas\s*\{/);
  assert.match(css, /\.landingHero__content\s*\{/);
  assert.match(css, /\.landingHero__copyColumn\s*\{/);
  assert.match(css, /\.landing-hero-svg\s*\{/);
  assert.match(css, /\.landing-hero-svg__scene\s*\{/);
  assert.match(css, /\.landingHero__fallbackGlyph\s*\{/);
  assert.match(css, /pointer-events:\s*none/);
  assert.match(css, /pointer-events:\s*auto/);
  assert.match(css, /\.landingHero__ctaWrap\s*\{[\s\S]*justify-items:\s*center;/);
  assert.match(css, /\.landingHero__buildBadge\s*\{/);
  assert.match(css, /@media\s*\(max-width:\s*767px\)/);
});

test('landing production bundle is browser-safe and does not ship unresolved process.env guards', async () => {
  const bundle = await readRepoFile('generated/landing-hero/landing-hero.js');

  assert.doesNotMatch(bundle, /process\.env\.NODE_ENV/);
  assert.match(bundle, /landingHeroRoot/);
  assert.match(bundle, /2026-04-03-svg-hero-03/);
});

test('landing motion contract remains stable but visibly alive at source level', async () => {
  const svgSource = await readRepoFile('src/components/hero/LandingHeroSvg.tsx');

  assert.match(svgSource, /landing-hero-svg__lockup/);
  assert.match(svgSource, /landing-hero-svg__core--j/);
  assert.match(svgSource, /landing-hero-svg__core--s/);
  assert.match(svgSource, /landing-hero-svg__core--g/);
  assert.match(svgSource, /landing-hero-svg__shimmer-band/);
  assert.match(svgSource, /landing-hero-svg__pulse/);
  assert.match(svgSource, /landing-hero-svg__micro-shard/);
  assert.match(svgSource, /@keyframes coreDriftJ/);
  assert.match(svgSource, /@keyframes coreDriftS/);
  assert.match(svgSource, /@keyframes coreDriftG/);
  assert.doesNotMatch(svgSource, /onPointer|onMouse|raycast|interaction/i);
});

test('landing hero bundle switches away from the WebGL scene path', async () => {
  const [sectionSource, bundle] = await Promise.all([
    readRepoFile('src/components/hero/LandingHeroSection.tsx'),
    readRepoFile('generated/landing-hero/landing-hero.js'),
  ]);

  assert.match(sectionSource, /LandingHeroSvg/);
  assert.doesNotMatch(sectionSource, /HeroCanvas/);
  assert.match(bundle, /landing-hero-svg/);
});
