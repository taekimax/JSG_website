# 2026-04-03 Landing WebGL Hero Review

## Mission

Implement the spec-driven landing-page modernization as a modular WebGL hero using React, TypeScript, `three`, and `@react-three/fiber`, while keeping the broader site static and preserving the landing page's bilingual copy and `about.html` entry flow.

## Scope

- In scope: `landing.html`, `styles/landing.css`, `tools/landing-page-contract.test.mjs`, toolchain files, new `src/` hero modules, generated landing hero bundle, and supporting verification updates
- Out of scope: interior pages, sitewide routing changes, CMS/backend work, analytics, and unrelated style refactors

## Constraints

- Follow `docs/superpowers/specs/JSG_landingpage_implementation_spec.md` as source-of-truth
- Keep the landing hero isolated so the rest of the site remains static HTML/CSS/JS
- Use `npm` for package management because `pnpm` is unavailable in the current environment
- Preserve reduced-motion handling, a non-WebGL fallback, and CTA navigation to `about.html`
- Keep visual constants centralized and avoid opportunistic refactors outside landing scope

## Success Criteria

1. Landing page mounts a new React/TypeScript/WebGL hero that renders separate `J`, `S`, and `G` glyph objects.
2. The hero preserves readable bilingual copy and a clickable CTA above the canvas.
3. Reduced-motion and non-WebGL fallback behaviors are implemented from the first pass.
4. The landing contract test reflects the new integration and passes.
5. The hero bundle builds successfully with the local toolchain.

## Planning Inputs

| ID | Type | Summary | Verification |
| --- | --- | --- | --- |
| P1 | must-ship | Add a minimal isolated React/Vite/TypeScript toolchain for the landing hero | `npm run build:landing` |
| P2 | must-ship | Replace legacy landing markup/runtime with the new hero mount contract and preserve content/CTA readability | `node --test tools/landing-page-contract.test.mjs` |
| P3 | must-ship | Implement spec-driven glyph geometry, shell materials, shard fields, interaction, quality tiers, and fallback | `npm run build:landing` |
| P4 | must-ship | Verify landing integration without regressing asset contracts | `node --test tools/landing-page-contract.test.mjs && node tools/validate-assets.mjs` |

## P# -> I# Handoff

| P# | I# | Owner | Scope | Verification |
| --- | --- | --- | --- | --- |
| P1 | I1 | codex | Toolchain files, install scripts, build output wiring | `npm run build:landing` |
| P2 | I2 | codex | Landing HTML/CSS contract and content integration | `node --test tools/landing-page-contract.test.mjs` |
| P3 | I3 | codex | React hero modules, config, shaders, interaction, and fallback | `npm run build:landing` |
| P4 | I4 | codex | Final verification and artifact closure | `node --test tools/landing-page-contract.test.mjs && node tools/validate-assets.mjs` |

## Implementation Ledger

| I# | source_ids | owner | status | changed_paths | verify_cmd | verify_result | handoff | handoff_payload |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| I1 | P1 | codex | done | `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `.gitignore` | `npm run build:landing` | pass | none | none |
| I2 | P2 | codex | done | `landing.html`, `styles/landing.css`, `tools/landing-page-contract.test.mjs` | `node --test tools/landing-page-contract.test.mjs` | pass | none | none |
| I3 | P3 | codex | done | `src/**`, `generated/landing-hero/landing-hero.js` | `npm run typecheck:landing && npm run build:landing` | pass | none | none |
| I4 | P4 | codex | done | `docs/reviews/2026-04-03_landing_webgl_hero_review.md` | `npm run verify:landing` | pass | none | none |

## Execution Notes

- Baseline:
  - `node --test tools/landing-page-contract.test.mjs` -> pass against the legacy variant landing contract
  - `node tools/validate-assets.mjs` -> `Validation passed.`
- Environment:
  - `node -v` -> `v25.8.1`
  - `npm -v` -> `11.11.0`
  - `pnpm` -> unavailable
- Toolchain install:
  - initial `npm install` failed with `ETARGET` because the first `@react-three/drei` range was not published
  - `package.json` was corrected to current published versions and `npm install` then succeeded
- Implementation:
  - added an isolated Vite + React + TypeScript landing build path outputting `generated/landing-hero/landing-hero.js`
  - replaced the legacy landing variant markup with a `landingHero` mount root and static HTML fallback structure
  - rebuilt landing styling for canvas layering, content overlay, fallback lockup, and mobile scroll safety
  - implemented spec-scoped hero modules under `src/` for glyph geometry, background shader, shell material patching, shard instancing, pointer interaction, reduced motion, and quality tier selection
  - kept the rest of the site static and left pre-existing unrelated worktree edits untouched
- Verification:
  - `npm run typecheck:landing` -> pass
  - `npm run build:landing` -> pass
  - `node --test tools/landing-page-contract.test.mjs` -> pass
  - `node tools/validate-assets.mjs` -> `Validation passed.`
  - `npm run verify:landing` -> pass
  - `rg -n "build:landing|typecheck:landing|verify:landing|landing-page-contract\.test\.mjs|validate-assets\.mjs|generated/landing-hero/landing-hero\.js" docs/reviews/2026-04-03_landing_webgl_hero_review.md package.json landing.html tools/landing-page-contract.test.mjs` -> references align with live files and commands
  - build output: `generated/landing-hero/landing-hero.js`

## Live Ledger

| Event | Item | Status | Detail | Next Action |
| --- | --- | --- | --- | --- |
| PLAN1 | I1,I2,I3,I4 | in_progress | Approved spec translated into implementation ledger with isolated-toolchain assumption | Add toolchain files and install dependencies |
| EXEC1 | I1 | done | Added package metadata, TypeScript config, Vite config, and ignore rules for an isolated landing build | Install dependencies and typecheck |
| EXEC2 | I2 | done | Replaced legacy landing markup and stylesheet contract with the new hero root, canvas layer, content overlay, and static fallback | Implement React landing entry and hero modules |
| EXEC3 | I3 | done | Implemented the WebGL hero feature set under `src/` and generated the landing build artifact | Run full verification |
| EXEC4 | I4 | done | Verification loop completed green and review artifact updated with final evidence | Browser visual review if further art direction tuning is needed |

## Closure Matrix

| CM# | scenario | criteria | outcome | action |
| --- | --- | --- | --- | --- |
| CM1 | all-green | Build, contract, and asset verification all pass | pass | Landed with automated verification evidence |
| CM2 | env-blocked | Package install or build blocked by environment | no | Initial package-version miss was corrected; environment did not block delivery |
| CM3 | partial-delivery | Spec-compliant hero left incomplete | no | MVP scope delivered |

## Residual Risk

- Automated verification is green, but the hero has not been visually reviewed in a real browser in this turn, so final acceptance still depends on human art-direction review against the spec's qualitative criteria.
- The repo contains unrelated pre-existing worktree changes outside this implementation (`agents.md`, legacy landing scripts, interior-page files, and multiple untracked docs/spec artifacts). They were left untouched to avoid clobbering user work.
