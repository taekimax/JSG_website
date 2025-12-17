# MIGRATION IMPLEMENTATION (Next Session)

Use this as the execution checklist for implementing the migration described in `MIGRATION.md`.

Authoritative references:
- `MIGRATION.md`
- `ASSETS_CONTRACT.md`
- `VALIDATION.md`

---

## 1) Decisions (Confirm at Start)

1. Portfolio dataset: these are currently dummy dataset for exemple use.  extract appropriate company IDs (kebab-case). These IDs become the filenames for logos and description text.

---

## 2) Prereqs

- Confirm Node is installed: `node -v`
- Ensure git is clean.
- Create a pre-migration commit (rollback is `git revert` back to this commit).

---

## 3) Inventory Audit (Paths to Update)

PowerShell (no ripgrep assumed):
- `Get-ChildItem -Recurse -File -Include *.html,*.js,*.css | Select-String -Pattern "\bimages/" | Select Path,LineNumber,Line`
- `Get-ChildItem -Recurse -File -Include *.html,*.js,*.css | Select-String -Pattern "\bdata/" | Select Path,LineNumber,Line`

Create a mapping table: Old path → New path.

---

## 4) Create `assets/` Skeleton

Create directories:
- `assets/shared/`
- `assets/landing/`
- `assets/about/`
- `assets/philosophy/`
- `assets/team/`
- `assets/portfolio/`
- `assets/notices/` and `assets/notices/uploads/`

Create manifests:
- `assets/shared/shared-manifest.json`
- `assets/landing/landing-manifest.json`
- `assets/about/about-manifest.json`
- `assets/philosophy/philosophy-manifest.json`
- `assets/team/team-manifest.json`
- `assets/portfolio/portfolio-manifest.json`
- `assets/notices/notices-manifest.json`

---

## 5) Rename and Move Assets (Required Conventions)

### 5.1 Shared
- Move `images/logo.png` → `assets/shared/logo.png`

### 5.2 Team portraits (required)
- For every team member, rename portrait to match the member `id`:
  - `assets/team/{member-id}.{ext}`
- Update `image` fields in `assets/team/team-manifest.json` accordingly.

### 5.3 Portfolio logos (required)
- For every portfolio company, rename logo to match the company `id`:
  - `assets/portfolio/{company-id}.{ext}`
- Update `logo` fields in `assets/portfolio/portfolio-manifest.json` accordingly.

### 5.4 Page heroes
- Move and rename hero images to `{page}-hero.{ext}` in their page folders.

### 5.5 Notices (required)
- Move `data/notices.json` → `assets/notices/notices.json`
- Move `data/uploads/*` → `assets/notices/uploads/*`

If any other asset is referenced by an `id` field in a manifest, apply the same convention (base filename == id).

---

## 6) Extract Copy to `.txt` (Required, No Changes)

Mandatory pages:
- `landing.html`
- `about.html`
- `philosophy.html`

Implementation rules:
- Create UTF-8 `.txt` files under the relevant page folder.
- Copy the text content exactly from the current website (no rewriting, no translation, no edits).
- Use one `.txt` per slot (hero title, hero lead, section body, etc.) and wire the `.txt` file paths in each page manifest under `texts`.
- For multi-paragraph slots, separate paragraphs with a blank line; scripts split on blank lines and render each paragraph as its own `<p>` using `textContent`.
- For single-element slots (e.g., headings), prefer `textContent` with `white-space: pre-line;` if explicit line breaks are needed.
- Make sure all pages have their copies in `.txt` so that they show exactly same content in the migrated website. review every pages and check if we have `.txt` for the copy for every slots in the page.

---

## 7) Update Scripts/Pages (No Backward Compatibility)

- Team
  - Update `scripts/team.js` to fetch `assets/team/team-manifest.json`.
  - Ensure member ordering uses `order`.

- Portfolio
  - Render from `assets/portfolio/portfolio-manifest.json`.
  - Load `descriptionText` from `.txt`, split on blank lines, and render each paragraph as its own `<p>` using `textContent`.

- Landing/About/Philosophy
  - Load `.txt` from their manifests' `texts` entries; for multi-paragraph slots, split on blank lines and render each paragraph as its own `<p>` using `textContent`.

- Notices
  - Update `scripts/notice.js` to load notices from `assets/notices/` (using `assets/notices/notices-manifest.json` to locate `assets/notices/notices.json` and `assets/notices/uploads/`).

---

## 8) Validate and Verify

- Run `Validate.bat` until it passes.
- Serve locally over HTTP (not `file://`) and verify:
  - landing/about/philosophy copy matches exactly
  - team list + member detail renders correctly
  - portfolio renders correctly and descriptions show
  - notices list/detail works and attachments download from `assets/notices/uploads/`

---

## 9) Cleanup

After verification:
- Remove old `images/` and old `data/` (notices are migrated to `assets/`).
