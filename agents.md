# JSG Investment Website - Agent Guide (Current Implementation)

Primary rulebook describing the *live* implementation in `C:\dev\jsg_website`. Keep all edits consistent with what’s already shipped.

---

## 1) Purpose & Identity
- Premium, minimalist, responsive site for JSG Investment (new-technology finance).
- Identity: disciplined reasoning, radical transparency, justice/safety/growth mindset.
- Audience: innovative founders, investors, partners.
- Stack: HTML5 + Vanilla CSS + Vanilla JS. Multi-page app (full reloads), static hosting.

## 2) Repo Map & Sources
- Root pages: `landing.html` (main animation entry), `index.html` (redirect to landing), `about.html`, `team.html`, `philosophy.html`, `portfolio.html`, `notice.html`, `contact.html`.
- Data & assets: `data/notices.json`, `images/` (logos/headshots), `data/uploads/` (notice attachments, optional).
- Styles: `styles/tokens.css` (design tokens), `styles/reset.css`, `styles/layout.css` (header/bottom-nav/sheet), `styles/main.css` (page components), `styles/landing.css`.
- Scripts: `scripts/ui.js` (bottom sheet + nav highlight), `scripts/notice.js` (list/detail rendering from JSON), `scripts/landingAnimation.js` (landing shards animation).

## 3) Design Tokens & Breakpoints (from tokens.css)
- Backgrounds: BG/Page `#FFFFFF`, BG/Soft `#F9FAFB`.
- Text/Neutral: Text/Main `#111827`, Text/Muted `#6B7280`, Border/Light `#E5E7EB`, Base/White `#FFFFFF`.
- Brand/Accent: Brand/RoyalBlue `#1D4ED8` (header/nav/CTAs), Brand/DeepBlue `#0F172A` (headings), Accent/RoyalPurple `#6D28D9` (philosophy strips), Accent/CrimsonRed `#DC2626` (notice badge only).
- Functional: Action/PrimaryBg = RoyalBlue on White text, Action/PrimaryText = RoyalBlue, Action/Disabled `#9CA3AF`.
- Typography: system-ui/-apple-system/BlinkMacSystemFont/Segoe UI/"Noto Sans KR"/sans-serif. H1 28/700, H2 22/600, H3 18/600, body 16/400, caption 13.
- Dimensions: header 60px, bottom nav 56px, container max width 800px (centered).
- Breakpoints: mobile 0–767, tablet 768–1023, desktop ≥1024. Mobile-first base styles.

## 4) Layout & Navigation
- Skeleton: `<header class="site-header">`, `<main class="site-main">`, floating `<nav class="bottom-nav">`, `.section-sheet` + `.sheet-overlay`.
- Header: fixed RoyalBlue bar with “JSG Investment” brand link to `/`; desktop nav links (About/Team/Philosophy/Portfolio/Notice/Contact) get `.current` via `ui.js`.
- Bottom nav (kept on desktop): pill with back arrow, section button (`#sheet-toggle` shows “{Section} ▲”), and forward arrow. Disable back on About, disable forward on Contact. White chip on blue bar for section button; arrows white/disabled gray.
- Section sheet: overlay + sliding panel above bottom nav. Link order: About → Team → Philosophy → Portfolio → Notice → Contact. Current page link has `.current` and is non-clickable. ESC or overlay tap closes.
- Main spacing: top padding accounts for fixed header; bottom padding for floating nav.

## 5) Component Patterns (main.css)
- Text blocks: `.text-block` spacing for paragraphs. `.h1-title` uses Brand/DeepBlue; `.h2-title` uses Text/Main.
- Cards: soft background, 12px radius, light border, hover lift/shadow on team/portfolio cards.
- Team cards: horizontal flex even on mobile; text left, portrait image right (`.team-img` 30%/max 120px, aspect 3:4, border-left). Roles are uppercase blue, bios muted.
- Portfolio cards: horizontal flex; text left, logo image right (`<img class="portfolio-img">` currently with real logos).
- Philosophy cards: soft card with purple `.phil-strip`, values: Respect / Health / Integrity (not Justice/Safety/Growth); English + Korean blurbs.
- Notice list/detail: list with title, date, category pipe; `isImportant` renders crimson badge. Detail view shows title/date/category, HTML content, optional attachments list, and a back button styled via `.contact-btn`.
- Contact blocks: sections for Location and Contact Information with muted labels and CTA button.

## 6) Page Snapshots
- `landing.html`: shard animation spelling “JSG” (no logo image), CTA button “입장/Enter” triggers animation then redirects to `about.html`; ESC goes straight to About. `index.html` auto-redirects to `landing.html`. Prototype iris logo lives in `landing/jsg_landing_prototype_logo.html`.
- `about.html`: centered logo (`images/logo.png`, max 200px), bilingual intro paragraphs, thin purple strip divider, two narrative sections.
- `team.html`: Core Team (박상진, 최승만, 박준혁) with headshots for two; Advisory Board of six with text-only cards. Single-column grid across breakpoints.
- `philosophy.html`: Mission blurbs plus three cards (Respect/Health/Integrity) with purple strips.
- `portfolio.html`: Four sample companies (BioTech One, Future MedTech, Green Energy Lab, Nano Systems) with sectors and descriptions; real logos (`images/lilly.png`, `olive.jpg`, `CIS.png`, `tomocube.png`) on the right.
- `notice.html`: Uses `scripts/notice.js` to fetch `data/notices.json`. `?id=` query renders detail; otherwise renders sorted list (date desc). Attachments download from `data/uploads/{filename}` if present.
- `contact.html`: Placeholder address/phone/email text; “지도 열기” button is a dead link.

## 7) Content & Data Rules
- All copy stays in Korean-first with embedded English per current pages. Do not invent new palette values or fonts.
- Notices: structure defined by `data/notices.json` (`id`, `title`, `date`, `category`, `isImportant`, `content` HTML, optional `attachments`). Keep CrimsonRed only for important badges.
- Contact info remains placeholder brackets for now. Portfolio/company data is sample but uses actual logo assets already in `images/`.

## 8) Interactivity & Behavior
- `ui.js`: builds overlay, toggles `.section-sheet` via `#sheet-toggle`, closes on overlay click or ESC; applies `.current` to matching desktop nav links based on `window.location.pathname`.
- `notice.js`: client-side fetch/render; gracefully handles missing/invalid `id` with an error message and back link.
- Landing animation: shard expansion/fade; redirects to About after animation or on Enter/Enter key; reduced-motion sends directly to About.

## 9) Guardrails for Future Work
- Preserve MPA routing and current nav order; no SPA frameworks or complex transitions beyond existing micro hovers and sheet slide.
- Keep color usage minimal (text + 1–2 accents). Maintain header RoyalBlue and bottom-nav treatment.
- Card layouts are horizontal by default even on mobile; if changing, update CSS + docs together.
- Reuse existing classes/tokens; avoid introducing new fonts or palettes without updating tokens.
- When adding sections, ensure bottom-nav arrows and sheet states stay coherent (disable first/last, highlight current).
