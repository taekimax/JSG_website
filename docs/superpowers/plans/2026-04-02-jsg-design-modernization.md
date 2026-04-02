# JSG Design Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the JSG site around a cinematic founder-facing landing page and a calmer premium-editorial interior system without changing the current content pipeline or approved phrases.

**Architecture:** Implement the redesign in layers. First, update shared design tokens and the interior shell so every content page inherits one visual system. Next, redesign the landing page as the single accent surface. Then reflow page-level components in clusters while keeping their current asset manifests, IDs, and hydration entry points stable. Use small, contract-style Node tests to protect the new structural hooks and finish with an end-to-end browser check across every page.

**Tech Stack:** Static HTML, CSS, plain JavaScript, Node `--test`, manifest-driven text/image assets

---

## File Structure

- `styles/tokens.css`: palette, typography, spacing, and surface tokens for the new dark-shell/light-surface system
- `styles/layout.css`: shared header, page shell, content container, section pager, and sheet overlay styles
- `styles/main.css`: shared interior hero system and page component styling for About, Team, Philosophy, Portfolio, Notice, Contact, and Team Detail
- `styles/landing.css`: landing-only cinematic hero styling and CTA treatment
- `landing.html`: accent landing markup
- `about.html`: About page shell and bilingual section layout
- `team.html`: Team index shell and mount point
- `team-member.html`: Team detail shell and mount point
- `philosophy.html`: Philosophy page shell and three-card editorial structure
- `portfolio.html`: Portfolio page shell and mount point
- `notice.html`: Notice page shell and mount point
- `contact.html`: Contact page shell and manifest-backed contact sections
- `scripts/landingCopy.js`: hydrates landing hero copy and CTA labels into the new landing structure
- `scripts/landingAnimation.js`: keeps the landing animation but tunes it to the new palette and composition
- `scripts/aboutCopy.js`: keeps About text hydration working after markup reflow
- `scripts/team.js`: preserves team manifest rendering while upgrading the card/detail templates
- `scripts/philosophyCopy.js`: keeps Philosophy text hydration working after markup reflow
- `scripts/portfolio.js`: preserves portfolio manifest rendering while upgrading card markup
- `scripts/notice.js`: preserves notice list/detail rendering while upgrading document-style markup
- `scripts/contact.js`: preserves contact manifest hydration while upgrading panel markup
- `tools/interior-shell-contract.test.mjs`: guards the shared interior shell hooks
- `tools/landing-page-contract.test.mjs`: guards the landing page structure and script delegation
- `tools/editorial-content-pages.test.mjs`: guards the About/Philosophy/Contact layout hooks that scripts depend on
- `tools/team-detail-page-contract.test.mjs`: guards the upgraded Team detail rendering hooks
- `tools/notice-page-contract.test.mjs`: guards the upgraded Notice document structure
- `tools/team-page-contract.test.mjs`: existing Team contract test; extend only if the new Team rendering introduces intentional class contracts
- `tools/contact-page-contract.test.mjs`: existing Contact contract test
- `tools/portfolio-page-contract.test.mjs`: existing Portfolio contract test; update only if the intended rendered class contract changes
- `tools/validate-assets.mjs`: final asset-pipeline verification
- `docs/superpowers/specs/2026-04-02-jsg-design-modernization-design.md`: approved spec to keep open while implementing

## Cross-Cutting Guardrails

1. Preserve the current content pipeline. Do not move content out of the existing manifests or text files.
2. Keep approved phrases unchanged. Layout may change; wording may not.
3. Treat Korean and English as parallel content where both already exist.
4. Do not add new translated phrases unless the user separately approves a content update.
5. Keep the landing page as the strongest visual accent and keep interior motion restrained.
6. Keep every task aligned to the shared dark-shell/light-surface design philosophy from the approved spec.

## Task 1: Shared Interior Shell

**Files:**
- Create: `tools/interior-shell-contract.test.mjs`
- Modify: `styles/tokens.css`
- Modify: `styles/layout.css`
- Modify: `about.html`
- Modify: `team.html`
- Modify: `team-member.html`
- Modify: `philosophy.html`
- Modify: `portfolio.html`
- Modify: `notice.html`
- Modify: `contact.html`
- Test: `tools/interior-shell-contract.test.mjs`
- Test: `tools/team-page-contract.test.mjs`
- Test: `tools/contact-page-contract.test.mjs`
- Test: `tools/portfolio-page-contract.test.mjs`

- [ ] **Step 1: Write the failing shared-shell test**

```js
test('interior pages opt into the shared cinematic shell', async () => {
  for (const page of [
    'about.html',
    'team.html',
    'team-member.html',
    'philosophy.html',
    'portfolio.html',
    'notice.html',
    'contact.html',
  ]) {
    const html = await readRepoFile(page);
    assert.match(html, /class="site-main site-main--interior"/);
    assert.match(html, /class="container content-shell"/);
    assert.match(html, /class="bottom-nav section-pager"/);
  }
});
```

- [ ] **Step 2: Run the new shell test to verify it fails**

Run: `node --test tools/interior-shell-contract.test.mjs`  
Expected: `not ok` because the new shell classes are not present yet.

- [ ] **Step 3: Add the new shared tokens**

```css
:root {
  --shell-bg: #0b1320;
  --shell-depth: #182233;
  --surface-main: #f7f3ec;
  --surface-muted: #e4ddd2;
  --text-strong: #18202b;
  --text-inverse: #f4f1eb;
  --accent-cool: #8ecfff;
}
```

- [ ] **Step 4: Rebuild the shared shell in `styles/layout.css` and apply it to every interior page**

```html
<main class="site-main site-main--interior">
  <div class="container content-shell">
    ...
  </div>
</main>

<nav class="bottom-nav section-pager">
  ...
</nav>
```

- [ ] **Step 5: Run the shell test plus the existing data-flow contracts**

Run: `node --test tools/interior-shell-contract.test.mjs tools/team-page-contract.test.mjs tools/contact-page-contract.test.mjs tools/portfolio-page-contract.test.mjs`  
Expected: all tests pass.

- [ ] **Step 6: Commit the shared shell**

```bash
git add styles/tokens.css styles/layout.css about.html team.html team-member.html philosophy.html portfolio.html notice.html contact.html tools/interior-shell-contract.test.mjs
git commit -m "feat: modernize shared interior shell"
```

## Task 2: Landing Accent Surface

**Files:**
- Create: `tools/landing-page-contract.test.mjs`
- Modify: `landing.html`
- Modify: `styles/landing.css`
- Modify: `scripts/landingCopy.js`
- Modify: `scripts/landingAnimation.js`
- Test: `tools/landing-page-contract.test.mjs`

- [ ] **Step 1: Write the failing landing contract test**

```js
test('landing page keeps the accent hero structure and script hooks', async () => {
  const html = await readRepoFile('landing.html');
  assert.match(html, /class="landing-stage"/);
  assert.match(html, /class="hero-panel hero-panel--accent"/);
  assert.match(html, /id="enterBtn"/);
  assert.match(html, /<script src="scripts\/landingCopy\.js"><\/script>/);
  assert.match(html, /<script src="scripts\/landingAnimation\.js"><\/script>/);
});
```

- [ ] **Step 2: Run the landing test to verify it fails**

Run: `node --test tools/landing-page-contract.test.mjs`  
Expected: `not ok` because the new landing structure is not present yet.

- [ ] **Step 3: Rework `landing.html` into the accent stage while keeping the same content IDs**

```html
<main class="landing-stage">
  <section class="hero-panel hero-panel--accent">
    <p class="hero-kicker"></p>
    <p class="hero-lead"></p>
    <p class="hero-sub"></p>
    <button id="enterBtn" type="button"></button>
  </section>
</main>
```

- [ ] **Step 4: Update `styles/landing.css`, `scripts/landingCopy.js`, and `scripts/landingAnimation.js`**

```js
const kickerEl = document.querySelector('.hero-panel--accent .hero-kicker');
const leadEl = document.querySelector('.hero-panel--accent .hero-lead');
const subEl = document.querySelector('.hero-panel--accent .hero-sub');
```

Use this step to darken the visual system, enlarge the type, keep the CTA singular and obvious, and retune the canvas colors to the midnight palette.

- [ ] **Step 5: Run the landing contract test**

Run: `node --test tools/landing-page-contract.test.mjs`  
Expected: the test passes.

- [ ] **Step 6: Preview the landing page in a browser**

Run: `python3 -m http.server 4173`  
Check: `http://localhost:4173/landing.html`  
Expected: the landing page is the strongest visual accent, the copy still hydrates from `assets/landing/landing-manifest.json`, and the enter button still navigates to `about.html`.

- [ ] **Step 7: Commit the landing redesign**

```bash
git add landing.html styles/landing.css scripts/landingCopy.js scripts/landingAnimation.js tools/landing-page-contract.test.mjs
git commit -m "feat: redesign cinematic landing experience"
```

## Task 3: About, Philosophy, and Contact Editorial Reflow

**Files:**
- Create: `tools/editorial-content-pages.test.mjs`
- Modify: `about.html`
- Modify: `philosophy.html`
- Modify: `contact.html`
- Modify: `styles/main.css`
- Modify: `scripts/aboutCopy.js`
- Modify: `scripts/philosophyCopy.js`
- Modify: `scripts/contact.js`
- Test: `tools/editorial-content-pages.test.mjs`
- Test: `tools/contact-page-contract.test.mjs`

- [ ] **Step 1: Write the failing content-page structure test**

```js
test('About, Philosophy, and Contact expose the new editorial hooks', async () => {
  const [aboutHtml, philosophyHtml, contactHtml] = await Promise.all([
    readRepoFile('about.html'),
    readRepoFile('philosophy.html'),
    readRepoFile('contact.html'),
  ]);

  assert.match(aboutHtml, /class="page-hero-text bilingual-stack"/);
  assert.match(philosophyHtml, /class="phil-copy-pair"/);
  assert.match(contactHtml, /class="contact-card contact-card--location"/);
});
```

- [ ] **Step 2: Run the content-page test to verify it fails**

Run: `node --test tools/editorial-content-pages.test.mjs`  
Expected: `not ok` because the new editorial hooks are not present yet.

- [ ] **Step 3: Reflow About into a cleaner bilingual introduction**

```html
<div class="page-hero-text bilingual-stack">
  <p class="page-hero-kicker"></p>
  <p class="page-hero-sub"></p>
  <p class="page-hero-sub"></p>
</div>
```

Keep the same text sources and section count; only change composition and spacing.

- [ ] **Step 4: Reflow Philosophy and Contact while preserving existing script IDs**

```html
<div class="phil-copy-pair">
  <p class="phil-desc-en"></p>
  <p class="phil-desc-ko"></p>
</div>

<div class="contact-card contact-card--location">...</div>
```

Update `scripts/aboutCopy.js`, `scripts/philosophyCopy.js`, and `scripts/contact.js` only as needed to target the revised structure without changing manifest keys.

- [ ] **Step 5: Run the new content-page test plus the existing Contact contract**

Run: `node --test tools/editorial-content-pages.test.mjs tools/contact-page-contract.test.mjs`  
Expected: all tests pass.

- [ ] **Step 6: Preview `about.html`, `philosophy.html`, and `contact.html`**

Run: `python3 -m http.server 4173`  
Check: `http://localhost:4173/about.html`, `http://localhost:4173/philosophy.html`, `http://localhost:4173/contact.html`  
Expected: bilingual pairings feel intentional, the interior styling is calmer than landing, and Contact still behaves like a high-trust utility page.

- [ ] **Step 7: Commit the editorial content-page pass**

```bash
git add about.html philosophy.html contact.html styles/main.css scripts/aboutCopy.js scripts/philosophyCopy.js scripts/contact.js tools/editorial-content-pages.test.mjs
git commit -m "feat: reflow bilingual editorial content pages"
```

## Task 4: Team Index and Team Detail

**Files:**
- Create: `tools/team-detail-page-contract.test.mjs`
- Modify: `team.html`
- Modify: `team-member.html`
- Modify: `styles/main.css`
- Modify: `scripts/team.js`
- Modify: `tools/team-page-contract.test.mjs`
- Test: `tools/team-page-contract.test.mjs`
- Test: `tools/team-detail-page-contract.test.mjs`

- [ ] **Step 1: Write the failing Team detail contract**

```js
test('team detail renderer emits the upgraded identity and media hooks', async () => {
  const source = await readRepoFile('scripts/team.js');
  assert.match(source, /class="team-card-media"/);
  assert.match(source, /class="member-identity"/);
  assert.match(source, /class="member-pager"/);
});
```

- [ ] **Step 2: Run the Team tests to verify the new detail contract fails**

Run: `node --test tools/team-page-contract.test.mjs tools/team-detail-page-contract.test.mjs`  
Expected: the existing Team test passes, the new Team detail test fails.

- [ ] **Step 3: Rework the Team list and detail templates in `scripts/team.js`**

```js
return `
  <a class="team-card team-card-link" ...>
    <div class="team-card-media">...</div>
    <div class="team-content">...</div>
  </a>
`;
```

Keep `id="team-member-app"` and the manifest-backed member ordering intact.

- [ ] **Step 4: Update `team.html`, `team-member.html`, and `styles/main.css` to match the new portrait-led composition**

```html
<div class="team-detail-shell">
  <div id="team-member-app"></div>
</div>
```

Use this step to make the Team index feel curated and the Team detail page feel like a premium identity page.

- [ ] **Step 5: Run the Team tests**

Run: `node --test tools/team-page-contract.test.mjs tools/team-detail-page-contract.test.mjs`  
Expected: both tests pass.

- [ ] **Step 6: Preview Team list and Team detail**

Run: `python3 -m http.server 4173`  
Check: `http://localhost:4173/team.html` and at least two member detail URLs such as `http://localhost:4173/team-member.html?id=kim-jae-hong`  
Expected: list cards feel more selective, detail pages preserve pager behavior, and all copy remains unchanged.

- [ ] **Step 7: Commit the Team redesign**

```bash
git add team.html team-member.html styles/main.css scripts/team.js tools/team-page-contract.test.mjs tools/team-detail-page-contract.test.mjs
git commit -m "feat: redesign team directory and profiles"
```

## Task 5: Portfolio and Notice Presentation Refresh

**Files:**
- Create: `tools/notice-page-contract.test.mjs`
- Modify: `portfolio.html`
- Modify: `notice.html`
- Modify: `styles/main.css`
- Modify: `scripts/portfolio.js`
- Modify: `scripts/notice.js`
- Modify: `tools/portfolio-page-contract.test.mjs`
- Test: `tools/portfolio-page-contract.test.mjs`
- Test: `tools/notice-page-contract.test.mjs`

- [ ] **Step 1: Write the failing Notice contract and extend the Portfolio contract only if needed**

```js
test('notice detail renderer emits document-style record hooks', async () => {
  const source = await readRepoFile('scripts/notice.js');
  assert.match(source, /class="notice-record"/);
  assert.match(source, /class="notice-record-body"/);
});
```

- [ ] **Step 2: Run the Notice and Portfolio tests to verify the new Notice contract fails**

Run: `node --test tools/portfolio-page-contract.test.mjs tools/notice-page-contract.test.mjs`  
Expected: Portfolio remains green unless intentionally updated, Notice fails until the new hooks exist.

- [ ] **Step 3: Rework Portfolio cards into a more gallery-like structure**

```js
const media = document.createElement('div');
media.className = 'portfolio-card-media';
media.appendChild(img);
card.append(content, media);
```

Preserve `portfolio-img` unless there is a strong reason to intentionally replace that class and update the contract test in the same task.

- [ ] **Step 4: Rework Notice list/detail markup into a document-style presentation**

```js
container.innerHTML = `
  <article class="notice-record">
    <header class="notice-header">...</header>
    <div class="notice-record-body text-block"></div>
  </article>
`;
```

Keep notice IDs, date sorting, attachment downloads, and pager behavior intact.

- [ ] **Step 5: Run the Notice and Portfolio tests**

Run: `node --test tools/portfolio-page-contract.test.mjs tools/notice-page-contract.test.mjs`  
Expected: all tests pass.

- [ ] **Step 6: Preview `portfolio.html`, `notice.html`, and one notice detail page**

Run: `python3 -m http.server 4173`  
Check: `http://localhost:4173/portfolio.html`, `http://localhost:4173/notice.html`, and one existing notice detail URL  
Expected: Portfolio feels more image-led and founder-facing, while Notice feels quieter and more record-like.

- [ ] **Step 7: Commit the Portfolio and Notice refresh**

```bash
git add portfolio.html notice.html styles/main.css scripts/portfolio.js scripts/notice.js tools/portfolio-page-contract.test.mjs tools/notice-page-contract.test.mjs
git commit -m "feat: refresh portfolio and notice presentation"
```

## Task 6: Final Verification and Cleanup

**Files:**
- Modify: `README.md` only if implementation changes any contributor-facing design workflow or testing command
- Test: `tools/interior-shell-contract.test.mjs`
- Test: `tools/landing-page-contract.test.mjs`
- Test: `tools/editorial-content-pages.test.mjs`
- Test: `tools/team-page-contract.test.mjs`
- Test: `tools/team-detail-page-contract.test.mjs`
- Test: `tools/contact-page-contract.test.mjs`
- Test: `tools/portfolio-page-contract.test.mjs`
- Test: `tools/notice-page-contract.test.mjs`
- Test: `tools/validate-assets.mjs`

- [ ] **Step 1: Run the full contract suite**

Run: `node --test tools/interior-shell-contract.test.mjs tools/landing-page-contract.test.mjs tools/editorial-content-pages.test.mjs tools/team-page-contract.test.mjs tools/team-detail-page-contract.test.mjs tools/contact-page-contract.test.mjs tools/portfolio-page-contract.test.mjs tools/notice-page-contract.test.mjs`  
Expected: all tests pass.

- [ ] **Step 2: Run asset validation**

Run: `node tools/validate-assets.mjs`  
Expected: success with no missing manifest references or asset-path errors.

- [ ] **Step 3: Run the final browser review**

Run: `python3 -m http.server 4173`  
Check: `landing.html`, `about.html`, `team.html`, `team-member.html?id=kim-jae-hong`, `philosophy.html`, `portfolio.html`, `notice.html`, one notice detail page, and `contact.html` at desktop and mobile widths.  
Expected: landing is the strongest visual accent, interior pages share one calm editorial language, and all approved phrases remain unchanged.

- [ ] **Step 4: Update `README.md` only if contributor-facing behavior changed**

```md
## Design System Notes
- Landing carries the primary accent treatment.
- Interior pages share the cinematic shell + editorial surface system.
```

Skip this step if the redesign does not change contributor-facing instructions.

- [ ] **Step 5: Commit the final verification sweep**

```bash
git add README.md
git commit -m "docs: update design workflow notes"
```

If `README.md` did not change, skip this commit and keep the task complete after verification.
