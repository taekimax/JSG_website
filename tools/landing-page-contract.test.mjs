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
  assert.match(html, /class="hero-copy hero-copy--stack"/);
  assert.match(html, /id="enterBtn"/);
  assert.match(html, /id="landing-hero-title"/);
  assert.equal((html.match(/class="landingHero__fallbackGlyph"/g) || []).length, 3);
  assert.match(html, /<script type="module" src="generated\/landing-hero\/landing-hero\.js"><\/script>/);
  assert.doesNotMatch(html, /landing-variant-switcher/);
  assert.doesNotMatch(html, /scripts\/landingCopy\.js/);
  assert.doesNotMatch(html, /scripts\/landingAnimation\.js/);
});

test('landing hero source keeps react mount, manifest hydration, reduced-motion handling, and about navigation contracts', async () => {
  const [entrySource, sectionSource, reducedMotionHookSource, configSource, layoutSource] = await Promise.all([
    readRepoFile('src/landing/main.tsx'),
    readRepoFile('src/components/hero/LandingHeroSection.tsx'),
    readRepoFile('src/hooks/useReducedMotion.ts'),
    readRepoFile('src/config/heroConfig.ts'),
    readRepoFile('src/lib/glyph/glyphLayout.ts'),
  ]);

  assert.match(entrySource, /createRoot/);
  assert.match(entrySource, /landingHeroRoot/);
  assert.match(entrySource, /LandingHeroSection/);

  assert.match(sectionSource, /assets\/landing\/landing-manifest\.json/);
  assert.match(sectionSource, /useReducedMotion/);
  assert.match(sectionSource, /about\.html/);
  assert.match(sectionSource, /landingHero__canvas/);
  assert.match(sectionSource, /landingHero__content/);

  assert.match(reducedMotionHookSource, /prefers-reduced-motion/);

  assert.match(configSource, /clearColor:\s*'#05060a'/);
  assert.match(configSource, /gapRatioDesktop:\s*0\.21/);
  assert.match(
    configSource,
    /targetWidthRatio:\s*\{[\s\S]*desktop:\s*0\.56,[\s\S]*tablet:\s*0\.64,[\s\S]*mobile:\s*0\.8,[\s\S]*\}/,
  );
  assert.match(configSource, /maxHeightRatio:/);
  assert.match(configSource, /groupCenterY:/);
  assert.match(configSource, /opacity:\s*0\.82/);
  assert.match(configSource, /emissiveIntensity:\s*1\.05/);
  assert.match(configSource, /clickImpulse:\s*1\.0/);
  assert.match(layoutSource, /widthFitScale|heightFitScale|Math\.min/);
  assert.match(layoutSource, /groupCenterY|groupOffsetY/);
});

test('landing stylesheet keeps the hero section, canvas layering, fallback lockup, and mobile scroll contract', async () => {
  const css = await readRepoFile('styles/landing.css');

  assert.match(css, /\.landingHero\s*\{/);
  assert.match(css, /\.landingHero__canvas\s*\{/);
  assert.match(css, /\.landingHero__content\s*\{/);
  assert.match(css, /\.landingHero__fallbackGlyph\s*\{/);
  assert.match(css, /touch-action:\s*pan-y/);
  assert.match(css, /pointer-events:\s*none/);
  assert.match(css, /pointer-events:\s*auto/);
  assert.match(css, /\.landingHero__ctaWrap\s*\{[\s\S]*justify-self:\s*center;/);
  assert.match(css, /@media\s*\(max-width:\s*767px\)/);
});

test('landing production bundle is browser-safe and does not ship unresolved process.env guards', async () => {
  const bundle = await readRepoFile('generated/landing-hero/landing-hero.js');

  assert.doesNotMatch(bundle, /process\.env\.NODE_ENV/);
  assert.match(bundle, /landingHeroRoot/);
});
