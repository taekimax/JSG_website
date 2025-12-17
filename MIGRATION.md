# MIGRATION: Page-Based `assets/` (Manager-Owned Content)

This document is the root reference for migrating the site to a page-based `assets/` structure so a site manager can update content without touching scripts.

Authoritative references:
- `ASSETS_CONTRACT.md` (rules; do not deviate)
- `VALIDATION.md` (required checks)
- `Validate.bat` / `tools/validate-assets.mjs` (validator)

---

## 1) Goals

- Page-based maintenance: update one page by editing `assets/{page}/...`.
- Stable schemas: predictable rendering order and grouping via JSON.
- Manager-only updates: after migration, managers edit only `assets/**` (and notice uploads), not `scripts/**`.
- Safer copy: all content copy is stored in UTF-8 `.txt` and rendered as text (no HTML fragments).

---

## 2) Current State (Implementation Snapshot)

- Images are stored in `images/`.
- Data JSON files are stored in `data/`:
  - `data/team.json`
  - `data/notices.json` and `data/uploads/`
- Scripts:
  - `scripts/team.js` fetches `data/team.json`
  - `scripts/notice.js` fetches `data/notices.json`

---

## 3) Target Structure

### 3.1 Folders

```
assets/
  shared/
    shared-manifest.json
    logo.png

  landing/
    landing-manifest.json
    ...

  about/
    about-manifest.json
    ...

  team/
    team-manifest.json
    ...

  philosophy/
    philosophy-manifest.json
    ...

  portfolio/
    portfolio-manifest.json
    ...

  contact/
    contact-manifest.json
    ...

  notices/
    notices-manifest.json
    notices.json
    uploads/
      ...
```

### 3.2 Manifest filenames

- Per-page manifest is always: `assets/{page}/{page}-manifest.json`
- Shared manifest is: `assets/shared/shared-manifest.json`

---

## 4) File Naming Rules (Required)

### 4.1 General

- lowercase kebab-case, no spaces.
- file extensions may vary by type.

### 4.2 ID-based asset filenames (required)

These rules prevent broken references and make maintenance predictable:

- Team member portrait filename must match member `id`:
  - `assets/team/{member-id}.{ext}`
- Portfolio company logo filename must match company `id`:
  - `assets/portfolio/{company-id}.{ext}`

The manifest must still include explicit `image` / `logo` fields; the filename rule is an additional constraint.

### 4.3 Other recommended conventions

- Hero images: `{page}-hero.{ext}` (example: `team-hero.jpg`)
- Page copy text files: `{topic}.txt` or `{section}.txt`

---

## 5) Text Content Policy (TXT Only)

- All page copy that managers will maintain is stored as UTF-8 `.txt`.
- Rendering rule: `.txt` is rendered as text (never `innerHTML`).
- Use one `.txt` per slot: split each page into stable “slots” that already exist in HTML (hero title, hero lead, section body, etc.), and store each slot’s text in its own file referenced by the page manifest.
- Paragraphs: within a single slot `.txt`, separate paragraphs with a blank line; scripts split on blank lines and render each paragraph via `textContent` (multiple `<p>`).
- Alternative (for single-element slots like headings): set the target container CSS to `white-space: pre-line;` and assign `textContent` so `\n` shows as line breaks.

### 5.1 Mandatory extraction scope (must-do)

The following must be moved to `.txt` during implementation:
- Landing page copy (from current `landing.html`)
- About page copy (from current `about.html`)
- Philosophy page copy (from current `philosophy.html`)

Requirement:
- Copy the text content exactly as it appears now (no rewriting).

---

## 6) Manifest Schemas (Stable)

### 6.1 Common fields (recommended)

```json
{
  "schemaVersion": 1,
  "page": "team",
  "assetVersion": "2025-12-16",
  "updatedAt": "2025-12-16T09:30:00+09:00"
}
```

### 6.2 Team (`assets/team/team-manifest.json`)

Required member fields:
- `id`, `group`, `order`, `nameKo`, `roleKo`, `roleEn`, `image`

Example:

```json
{
  "schemaVersion": 1,
  "page": "team",
  "assetVersion": "2025-12-16",
  "updatedAt": "2025-12-16T09:30:00+09:00",
  "heroImage": "assets/team/team-hero.jpg",
  "members": [
    {
      "id": "park-sang-jin",
      "group": "core",
      "order": 10,
      "nameKo": "박상진",
      "nameEn": "Park Sang-jin",
      "roleKo": "대표이사 / 회장",
      "roleEn": "CEO / Chairman",
      "image": "assets/team/park-sang-jin.png",
      "highlights": ["..."]
    }
  ]
}
```

### 6.3 Portfolio (`assets/portfolio/portfolio-manifest.json`)

Required company fields:
- `id`, `order`, `name`, `sector`, `logo`, `descriptionText`

Text rule:
- `descriptionText` is a UTF-8 `.txt` file that may contain multiple paragraphs separated by blank lines; scripts render them as multiple paragraphs (text-only).

Example:

```json
{
  "schemaVersion": 1,
  "page": "portfolio",
  "assetVersion": "2025-12-16",
  "updatedAt": "2025-12-16T09:30:00+09:00",
  "heroImage": "assets/portfolio/portfolio-hero.jpg",
  "companies": [
    {
      "id": "biotech-one",
      "order": 10,
      "name": "BioTech One",
      "sector": "Biotechnology",
      "logo": "assets/portfolio/biotech-one.png",
      "descriptionText": "assets/portfolio/biotech-one.txt"
    }
  ]
}
```

### 6.4 Landing/About/Philosophy (TXT extraction)

For these pages, manifests must reference `.txt` files that contain the exact current copy.

Recommendation:
- Use `texts` as a dictionary of slot keys to `.txt` paths; each slot `.txt` file may contain multiple paragraphs separated by blank lines, for example:

```json
{
  "schemaVersion": 1,
  "page": "about",
  "assetVersion": "2025-12-16",
  "updatedAt": "2025-12-16T09:30:00+09:00",
  "heroImage": "assets/about/about-hero.jpg",
  "texts": {
    "heroTitle": "assets/about/about-heroTitle.txt",
    "heroLead": "assets/about/about-heroLead.txt",
    "section1Body": "assets/about/about-section1Body.txt",
    "section2Body": "assets/about/about-section2Body.txt"
  }
}
```

---

### 6.5 Notices (`assets/notices/notices-manifest.json`)

Required fields:
- `schemaVersion`, `page`, `assetVersion`, `updatedAt`
- `noticesJson` (must be `assets/notices/notices.json`)
- `uploadsBase` (must be `assets/notices/uploads/`)

Example:

```json
{
  "schemaVersion": 1,
  "page": "notices",
  "assetVersion": "2025-12-16",
  "updatedAt": "2025-12-16T09:30:00+09:00",
  "noticesJson": "assets/notices/notices.json",
  "uploadsBase": "assets/notices/uploads/"
}
```

## 7) Migration Steps (Implementation)

The site is in development (not live yet), so we can migrate directly without backward compatibility.

### Step 0 — Prereqs and baseline

- Ensure Node is available: `node -v`
- Ensure git is clean and commit a pre-migration snapshot.
- Rollback approach: `git revert` to the pre-migration commit.

### Step 1 — Inventory and mapping

Build a mapping table of every reference to `images/` and `data/`:

PowerShell examples:
- `Get-ChildItem -Recurse -File -Include *.html,*.js,*.css | Select-String -Pattern "\bimages/" | Select Path,LineNumber,Line`
- `Get-ChildItem -Recurse -File -Include *.html,*.js,*.css | Select-String -Pattern "\bdata/" | Select Path,LineNumber,Line`

### Step 2 — Create `assets/` and rename/move assets

- Create required directories under `assets/`.
- Move/rename assets to comply with rules:
  - Team portraits → rename to `{member-id}.{ext}` and place in `assets/team/`
  - Portfolio logos → rename to `{company-id}.{ext}` and place in `assets/portfolio/`
  - Heroes → rename to `{page}-hero.{ext}` in the relevant folder
  - Shared logo → `assets/shared/logo.{ext}`
  - Notices attachments → move to `assets/notices/uploads/`

If other assets are referenced by ID in manifests, rename them similarly (base filename == ID).

### Step 3 — Create manifests and `.txt` files

- Create `assets/shared/shared-manifest.json`.
- Create required page manifests:
  - `assets/landing/landing-manifest.json`
  - `assets/about/about-manifest.json`
  - `assets/philosophy/philosophy-manifest.json`
  - `assets/team/team-manifest.json`
  - `assets/portfolio/portfolio-manifest.json`
  - `assets/notices/notices-manifest.json`

- Move notices data into assets:
  - `data/notices.json` → `assets/notices/notices.json`
  - `data/uploads/*` → `assets/notices/uploads/*`

- Extract and create `.txt` files for landing/about/philosophy:
  - Copy content exactly from current HTML pages.
  - Do not rewrite text; preserve punctuation and intentional line breaks.

### Step 4 — Update scripts/pages (no backward compatibility)

- Team
  - Update `scripts/team.js` to fetch `assets/team/team-manifest.json`.
- Portfolio
  - Render portfolio list/cards from `assets/portfolio/portfolio-manifest.json`.
  - Load each company `descriptionText` file and render as text.
- Landing/About/Philosophy
  - Update pages to load text from their manifests' `texts` entries and insert via `textContent`.
- Notices
  - Update `scripts/notice.js` to load notices from `assets/notices/` (using `assets/notices/notices-manifest.json` to locate `assets/notices/notices.json` and `assets/notices/uploads/`).

### Step 5 — Validate and verify

- Run validator:
  - Windows: `Validate.bat`
  - Any OS: `node tools/validate-assets.mjs`
- Run the site over HTTP and manually verify all migrated pages.

### Step 6 — Cleanup

Once `assets/` + scripts/pages are verified:
- Remove old `images/` and old `data/` (notices are migrated to `assets/`).

---

## 8) Manager Runbook (After Migration)

- Replace file content while keeping filename.
- Bump `assetVersion` in the page manifest whenever a file is replaced.
- Reorder items by changing numeric `order` in the manifest.

---

## 9) Notices (Required)

Notices are migrated under `assets/notices/` and have a page manifest:
- `assets/notices/notices-manifest.json`
- `assets/notices/notices.json`
- `assets/notices/uploads/`
