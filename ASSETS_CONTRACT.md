# Assets Contract (Page-Based `assets/`)

> Current worktree scope (2026-09-06): retained because the current user request preserves the content pipeline and manager editing boundary. This document does not fix the visual design or technology stack. See `AGENTS.md` for the collaborative design workflow.

This document defines non-negotiable conventions for the `assets/` migration so:
- managers can update content without touching scripts
- developers can keep scripts stable with predictable inputs
- the site remains consistent across pages

## A. Folder Ownership Model

- Canonical ownership is page-based: `assets/{page}/...`
- Shared assets live in: `assets/shared/...`
- Notice page artwork remains in `assets/notices/`; Notice records and media live in the separate private `jsg-board-content` repository.
- `assets/shared/board-endpoints.json` is the fixed bridge to generated Notice and Perspective manifests at `/board-content/`.

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
- Portfolio company logo filename base must match company `id` when a non-empty path is supplied:
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
- Notice managers use Pages CMS over `jsg-board-content`; they do not edit this website repository.

Managers are not expected to edit:
- `scripts/**`, `styles/**`, page HTML structure

If a new content type is required, it must be added by a developer once, then become manifest-driven thereafter.




## Current Presentation Note (2026-09-06)

Company logos are not displayed in this experiment. The existing `logo` key remains in the schema; the current validator already accepts an empty string for a company without a logo. Existing files and manifest references are retained. Company names, ordering and detail links all come from the same `companies` array; `descriptionText` remains required for the existing detail view. This is a presentation change, not a replacement content pipeline.

## Authorized Additions (2026-09-07)

- Team partners (`group: "core"`) may provide `summaryKo` alongside their existing English `summary`. The displayed Korean summary translates the approved English summary. Advisor summaries remain in the data but are not displayed. Group IDs are unchanged; the UI label is Partners.
- Perspective reads the generated `/board-content/perspective-manifest.json`. Its index contains `schemaVersion: 1`, one HTTPS root `publicationUrl`, and `posts` entries with plain-text `title`, `YYYY-MM-DD` `date`, and a same-publication `/p/` article `url`.
- The private content repository synchronizes the Substack RSS index and preserves older entries absent from the latest feed. The website reads the published index through the existing no-cache JSON loader.
- Moving the About company introduction to the home footer preserves its About manifest/text sources. Removing decorative hero images from rendered pages does not remove their legacy manifest fields or asset files.

- Contact renders full-width phone, email, Korean/English address, then the map, without Location or a duplicate Contact subheading. `texts.addressLabel` and `texts.locationAddressEn` own the new label and user-supplied English address. Legacy text keys/files remain compatible but are not fetched for hidden content. `mapImage` points to `contact-map.png`; the editable `contact-map.svg` is retained alongside it. Address, telephone, and email remain managed by their existing TXT files.

## Separate board content contract (approved 2026-09-07)

- The private `taekimax/jsg-board-content` repository owns Notice Markdown, Notice media, Perspective RSS data, preview fixtures and generated output. The website repository owns only display code and `assets/shared/board-endpoints.json`.
- Notice front matter uses `id`, `title`, `date`, `category`, `isImportant`, `attachments` and `draft`. `date` is the explicit `YYYY-MM-DD` publication date and is not replaced during migration or editing. Existing IDs remain stable; new IDs come from the generated filename.
- The content publisher generates `/board-content/notices.json`, `/board-content/posts/{id}.html`, referenced attachments, and Notice/Perspective asset manifests. Raw Markdown HTML is disabled. Drafts and preview fixtures are excluded from published output.
- Pages CMS deletion and rename are disabled. Withdrawing a notice uses `draft: true`. Administrators edit only the private content repository through the browser editor.
- Posting changes the content repository and generated `/board-content/` files. It does not change the website source repository.
