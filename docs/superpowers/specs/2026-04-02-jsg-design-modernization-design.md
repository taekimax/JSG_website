# JSG Website Design Modernization

> 역사 자료 — 2026-09-06부터 이 실험 worktree의 실행 지침으로 사용하지 않습니다. 아래의 승인, 요구사항, 작업 절차, 검증 결과는 당시 기록입니다. 현재 작업은 루트 `AGENTS.md`와 이번 사용자 결정에 따릅니다.

Date: 2026-04-02
Status: Historical approval; inactive for the current experiment
Scope: Presentation-layer redesign of the current static site

## Summary

JSG should be redesigned around a cinematic, founder-facing identity with the strongest visual accent concentrated on the landing page. After entry, the rest of the site should settle into a disciplined, premium editorial system that feels coherent, global, and trustworthy. The content pipeline remains unchanged. Existing phrases stay as written unless later explicitly revised with the user.

This is a design modernization, not a content rewrite and not a platform migration. The work should preserve the current asset-driven HTML and JavaScript architecture while replacing the visual language, shared styling system, and page layout rhythm.

## Goals

1. Make the site feel more selective, premium, and memorable for prospective portfolio companies and founders.
2. Keep a consolidated design philosophy across the full site instead of having isolated page-by-page styling.
3. Concentrate the strongest visual effect on the landing page hero and entry experience.
4. Present Korean and English as intentionally parallel voices rather than primary and secondary copy.
5. Improve hierarchy, pacing, and page composition without changing the underlying corporate phrases.
6. Preserve the cleaned-up content and asset pipeline so redesign work does not destabilize rendering.

## Non-Goals

1. No content model rewrite.
2. No copy rewrite unless the user later approves specific phrase changes.
3. No broad motion system across interior pages.
4. No new CMS, framework, or build pipeline.
5. No page-specific visual language that breaks the shared site identity.

## Approved Direction

The approved direction is `cinematic founder` with a darker palette and minimal motion outside the landing experience.

The site should feel:

- founder-facing before investor-facing
- premium editorial before generic corporate
- dark and cinematic before bright and minimal
- composed and credible rather than loud or experimental

The landing page is the main accent surface. Interior pages should inherit the same design philosophy, but in a calmer form. The visual energy should step down after entry so the site still reads as stable and institutional enough to support trust.

## Design Principles

### 1. One system, one attitude

All pages should feel like they belong to the same firm and the same design system. Shared tokens, shared hero logic, shared panel treatment, shared typography rules, and shared navigation behavior should drive the experience.

### 2. Accent at the front door

The landing page carries the strongest atmosphere, contrast, and visual drama. Interior pages should not compete with it. They should feel refined, legible, and confident.

### 3. Bilingual by design, not by exception

Where Korean and English appear together, both should feel intentional. English should not be reduced to caption status, and Korean should not be visually overwhelmed by English display treatment. Composition must create the "global feel" rather than copy changes.

### 4. Editorial pacing over app styling

The site should move away from generic floating-app UI cues and toward editorial composition: better spacing rhythm, stronger image framing, cleaner reading surfaces, and more deliberate section breaks.

### 5. Keep the phrases

The current phrases are preserved. Design changes must improve how the phrases are read, grouped, and emphasized without rewriting them.

## Visual System

### Palette

Use a dark shell with lighter reading surfaces.

- Primary shell background: midnight navy in the `#0b1320` to `#101826` range
- Secondary shell/background depth: charcoal blue in the `#141d2b` to `#1a2535` range
- Primary interior surface: warm-cool off-white in the `#f4efe7` to `#f7f3ec` range
- Secondary interior surface: muted stone in the `#ded8cf` to `#e6e0d7` range
- Primary dark text on light surfaces: `#18202b`
- Primary light text on dark surfaces: `#f4f1eb`
- Accent: one restrained cool accent in the `#7dbfff` to `#96d2ff` range

The accent should be used sparingly for key buttons, small highlights, focus states, and subtle emphasis. It should not turn the interior pages into a bright product-marketing site.

### Typography

Typography should signal premium editorial composure.

- Use an expressive serif for major display moments and hero headlines.
- Use a clean sans-serif for navigation, metadata, buttons, captions, and body copy.
- Avoid the current plain system-stack feeling as the primary visual identity.
- Korean and English must align in perceived weight and rhythm even if they use different font families or fallback behavior.

The implementation plan should include a specific font-loading approach that works in the current static site, but the design intent is fixed: display typography must feel intentional and non-generic.

### Surface Treatment

- Dark outer frame around the page
- Light editorial panels as the main reading surfaces
- Sharper panel edges and cleaner borders than the current soft rounded-app look
- Shadows should be present but restrained, with depth driven more by contrast and framing than by heavy blur
- Image crops should feel confident and selective

### Motion

- Landing page: highest motion, reveal, and atmosphere
- Interior pages: mostly static
- Acceptable interior motion: subtle hover states, small reveal polish where it supports orientation, and gentle transitions on interactive elements
- Not acceptable: expressive motion language across all pages

## Shared Layout System

### Header

The header should remain fixed, but it should feel more integrated with the cinematic shell. It should read as part of the site identity rather than a generic top bar. Desktop navigation should feel crisp, understated, and editorial.

### Main Content Frame

The current centered container approach can remain conceptually, but it should be redesigned as a more deliberate stage:

- darker site background
- more premium interior content surfaces
- stronger vertical rhythm
- less "mobile app card dropped on a gradient"

### Bottom Navigation

The bottom navigation should remain functionally present, but it should be visually integrated into the new system. It should become a slimmer, more composed section pager rather than a chunky floating pill. The sheet interaction can remain, but its surface and spacing should match the new editorial language.

### Hero System

Use one shared hero framework across interior pages:

- bold image or visual surface
- compact kicker
- stronger headline/subcopy composition
- consistent spacing and framing
- dark-shell context with clear content focus

Each page may vary image position and copy arrangement, but the family resemblance should be obvious.

## Page-Specific Direction

### Landing

Landing remains the dramatic entry page and is the single biggest accent surface in the redesign.

Requirements:

- Preserve the splash-style entry behavior
- Make the hero more impactful and less generic
- Increase typography scale and clarity
- Keep bilingual presentation intentional
- Use darker cinematic palette and depth
- Keep one unmistakable primary call to enter

The landing page should feel like a selective invitation into JSG rather than a placeholder animation with a button.

### About

About should become the brand-introduction page inside the calmer interior system.

Requirements:

- Keep the existing phrases
- Reflow the hero and the two major sections for cleaner pacing
- Present bilingual copy in a more deliberate paired structure
- Make the logo and introductory framing feel more premium and less like a simple content block

### Team Index

Team should become more portrait-led and selective.

Requirements:

- Keep the asset-driven member list pipeline
- Use stronger portrait framing and card rhythm
- Clarify hierarchy between name, role, and biography
- Make the page feel curated rather than list-like

### Team Detail

Team detail should feel like a continuation of the same curated system rather than a generic detail template.

Requirements:

- Reuse the shared hero framework
- Elevate the member portrait and identity block
- Keep biography copy unchanged
- Preserve relationship with the shared team manifest pipeline

### Philosophy

Philosophy should feel like an editorial spread built around three principles.

Requirements:

- Keep the three-value structure
- Upgrade card composition and spacing
- Preserve bilingual parallelism
- Make the page feel more foundational to the firm identity

### Portfolio

Portfolio should become more gallery-like and founder-facing.

Requirements:

- Keep the current content source and item set
- Make company cards more image-led and premium
- Improve visual rhythm and spacing
- Preserve legibility of names and descriptions without adding extra noise

### Notice

Notice should feel more document-like and trustworthy.

Requirements:

- Keep the current notice data flow and attachments
- Present notices as credible records rather than generic cards
- Improve hierarchy between title, date, body, and attachment actions
- Keep the page quieter and more institutional than Portfolio or Landing

### Contact

Contact should feel intentional and high-trust instead of purely utilitarian.

Requirements:

- Keep the current manifest-driven content and actions
- Improve hierarchy between location and contact details
- Make the map/action surface feel integrated with the premium system
- Present bilingual cues consistently where content allows

## Bilingual Rules

1. Treat Korean and English as parallel content where both already exist.
2. Do not reduce English to a footnote style unless the content itself is explicitly secondary.
3. Keep pairings visually grouped so the bilingual logic feels systematic across pages.
4. If a page already includes both languages, preserve both.
5. If a page has bilingual intent but inconsistent presentation, redesign the presentation rather than rewriting the phrases.
6. Do not add new translated phrases as part of this modernization pass unless the user separately approves a content update.

## Technical Constraints

1. Keep the current HTML, CSS, and plain JavaScript stack.
2. Preserve the asset-manifest and text-file content pipeline.
3. Prefer shared styling primitives over page-specific one-off fixes.
4. Redesign should be implemented primarily through shared CSS tokens, shared layout patterns, and modest HTML structure reflow.
5. Dynamic page scripts should continue to populate the same content without requiring content-source changes.

## Verification Requirements

Implementation will be considered complete only if all of the following remain true:

1. Existing contract tests for Team, Contact, and Portfolio still pass.
2. `node tools/validate-assets.mjs` still passes.
3. Dynamic pages still render correctly with the redesigned layout.
4. Landing has the strongest visual accent and interior pages remain calmer.
5. The same design philosophy is visible across About, Team, Philosophy, Portfolio, Notice, Contact, and Team Detail.
6. Existing phrases remain unchanged unless separately approved by the user.

## Planning Notes

Implementation planning should follow this order:

1. audit and revise shared tokens, typography, shell, and navigation primitives
2. redesign landing as the accent surface
3. redesign the shared interior hero system
4. reflow page components in this order: About, Team, Philosophy, Portfolio, Notice, Contact
5. verify dynamic rendering and contract tests

This order is intentional because the redesign should be system-led, not page-led.
