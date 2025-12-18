# Assets Contract (Page-Based `assets/`)

This document defines non-negotiable conventions for the `assets/` migration so:
- managers can update content without touching scripts
- developers can keep scripts stable with predictable inputs
- the site remains consistent across pages

## A. Folder Ownership Model

- Canonical ownership is page-based: `assets/{page}/...`
- Shared assets live in: `assets/shared/...`
- Notices are separate: `assets/notices/...` (or kept in `data/` if we choose “Option A”)

Rule: if an asset is used by 2+ pages and is expected to be updated, it belongs in `assets/shared/`.

## B. Path Rules (to prevent breakage)

All paths inside manifests must be:
- site-root-relative: `assets/team/team-hero.jpg`
- never `../` and never absolute filesystem paths
- case-consistent (Windows is forgiving; hosting often is not)

## C. Manifest Rules (stable schemas)

Each page has exactly one entrypoint:
- `assets/{page}/{page}-manifest.json`

Required keys in every page manifest:
- `schemaVersion` (integer, starting at 1)
- `page` (string: `about`, `team`, `portfolio`, etc.)
- `assetVersion` (string; used for cache-busting)
- `heroImage` (string path; optional for some pages)
- `texts` (object; optional; string paths)

Optional keys:
- `$schema` (editor support only; should not be treated as an asset reference)
- `updatedAt` (string ISO datetime; informational)

Notices manifest (`assets/notices/notices-manifest.json`) required keys:
- `noticesJson` (must be `assets/notices/notices.json`)
- `uploadsBase` (must be `assets/notices/uploads/`)

Ordering/grouping rules:
- Any list that must render predictably uses `order` (number, ascending).
- `id` values are stable and never reused for different entities.

## D. Cache-Busting Without Renaming

Managers may keep filenames stable when replacing files.

Mechanism:
- Every manifest has `assetVersion`.
- Scripts append `?v={assetVersion}` to every URL sourced from the manifest.

Manager rule:
- after replacing a file contents without renaming, bump `assetVersion` in that page manifest.

## E. Filenames (flat folders need discipline)

Required filename conventions:
- lowercase kebab-case only
- no spaces, parentheses, or non-ascii in filenames
- keep extensions consistent (`.jpg` photos, `.png` logos/transparent)

Required ID-based patterns:
- Team member portrait filename base must match member `id`:
  - `assets/team/{member-id}.{ext}`
- Portfolio company logo filename base must match company `id`:
  - `assets/portfolio/{company-id}.{ext}`

Recommended patterns:
- Hero: `{page}-hero.jpg` (example: `team-hero.jpg`)
- Member portrait: `{member-id}.png` (example: `park-sang-jin.png`)
- Text fragment: `{topic}.txt` (example: `about-intro.txt`)

## F. Content Formats and Encoding

- JSON is UTF-8.
- Dates in data are `YYYY-MM-DD`.
- Text files are UTF-8 `.txt` files (rendered as text, not HTML).
- Use one `.txt` per manifest `texts` slot; for multi-paragraph slots, paragraphs are separated by a blank line and scripts split on blank lines and render each paragraph using `textContent` (multiple `<p>`).
- Links should be explicit manifest fields (e.g., `websiteUrl`) rather than embedded markup.

## G. Accessibility Minimums

- Any content-bearing image must have an `altKo` in data (optional `altEn`).
- Decorative images must be marked decorative by data (e.g., `decorative: true`) so rendering can use empty alt.

## H. “No Script Edits Later” Boundary

Managers are allowed to edit only:
- `assets/**` (manifests, images, text files, uploads)

Managers are not expected to edit:
- `scripts/**`, `styles/**`, page HTML structure

If a new content type is required, it must be added by a developer once, then become manifest-driven thereafter.



