# Validation Plan (Dev-Run Sanity Checks)

Goal: prevent broken deploys caused by missing files, malformed JSON, duplicate IDs, or inconsistent content references.

This validator is developer-run (CI or local), not manager-run.

## A. What to Validate (Fail/Pass Criteria)

### A1. Manifests exist
- `assets/shared/shared-manifest.json` exists (if we use shared)
- For each migrated page: `assets/{page}/{page}-manifest.json` exists

### A2. Manifests parse
- Every `assets/**/*-manifest.json` parses as UTF-8 JSON.

### A3. Schema rules (contract enforcement)
- Required keys exist: `schemaVersion`, `page`, `assetVersion`
- `schemaVersion` is supported (currently 1)
- `page` value matches its folder name
- Lists use numeric `order` where order matters

### A4. IDs and ordering
- IDs are unique within their dataset (`members[]`, `companies[]`)
- IDs match `^[a-z0-9]+(?:-[a-z0-9]+)*$` (kebab-case)
- `order` is a number
- (recommended) no duplicate `order` values within the same rendering group

### A5. File existence
- Every referenced path in manifest exists on disk.
- No path contains `..`.
- Extensions match expected types (e.g., heroImage `.jpg|.png`).

### A6. Text assets
- Manifests should reference `.txt` files for copy (no `.html` fragments); copy is stored per `texts` slot and paragraphs are separated by blank lines and rendered as text.

### A7. ID-based asset filenames
- Team member portraits: base filename must equal member `id` (extension may vary).
- Portfolio company logos: base filename must equal company `id` (extension may vary).

### A8. Notices (required)
- `assets/notices/notices-manifest.json` exists
- `assets/notices/notices.json` parses and is an array
- every attachment referenced exists in `assets/notices/uploads/`

## B. Deliverables (files to add)

- `tools/validate-assets.mjs` (portable validator)
- `Validate.bat` (Windows wrapper)

## C. Manual smoke checklist (post-build, pre-deploy)

Run with a local HTTP server (not file://):
- Landing loads and CTA works
- Nav highlighting still correct
- Team list/detail renders from manifest, images load
- Portfolio renders from manifest, logos load
- Notice list/detail works, downloads work
- Mobile/tablet/desktop breakpoints look unchanged



