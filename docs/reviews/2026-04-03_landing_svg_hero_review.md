# 2026-04-03 Landing SVG Hero Review

## Mission

Replace the landing-page WebGL hero with a simpler SVG-based hero using the user-provided reference files, preserve the current art direction, remove hover/pointer interaction, and keep the bilingual copy plus `about.html` entry CTA intact.

## Scope

- In scope: `landing.html`, `src/components/hero/LandingHeroSection.tsx`, `src/components/hero/LandingHeroSvg.tsx`, `src/lib/heroBuild.ts`, `styles/landing.css`, `tools/landing-page-contract.test.mjs`, and the generated landing bundle
- Out of scope: interior pages, legacy landing scripts, unrelated worktree changes, and any broader site refactor

## Source Inputs

| ID | Type | Summary | Verification |
| --- | --- | --- | --- |
| F1 | user-request | Replace the current hero with SVG using `/Users/tk/Downloads/svg-hero-integration-notes.md`, `/Users/tk/Downloads/landingHeroSvg.css`, and `/Users/tk/Downloads/LandingHeroSvg.tsx`; keep the direction, remove mouseover, and simplify the scene | `npm run verify:landing` |

## Implementation Ledger

| I# | source_ids | owner | status | changed_paths | verify_cmd | verify_result | handoff | handoff_payload |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| I1 | F1 | codex | done | `src/components/hero/LandingHeroSection.tsx`, `src/components/hero/LandingHeroSvg.tsx` | `node --test tools/landing-page-contract.test.mjs` | pass | none | none |
| I2 | F1 | codex | done | `styles/landing.css`, `landing.html`, `src/lib/heroBuild.ts` | `npm run verify:landing` | pass | none | none |
| I3 | F1 | codex | done | `tools/landing-page-contract.test.mjs`, `generated/landing-hero/landing-hero.js` | `npm run verify:landing` | pass | none | none |

## Execution Notes

- Integrated the supplied SVG approach as a new `LandingHeroSvg` component and swapped the landing hero section from `HeroCanvas` to passive SVG rendering.
- Removed hero pointer/hover interaction from the React entry path while preserving manifest-driven copy hydration and CTA navigation.
- Added a new build identifier, ending at `2026-04-03-svg-hero-03`, so stale-bundle checks remain explicit in the DOM, console, and local preview badge.
- Tightened responsive SVG sizing for mobile and reordered the landing media queries so the mobile scene rule is not overridden by the tablet rule.
- Centered the copy column as the explicit horizontal reference for the lower composition, re-centered the CTA within that column, tightened `J/S/G` spacing, and applied a small rightward optical shift to the lockup/glow so the wordmark reads centered in manual review.
- Rebuilt `generated/landing-hero/landing-hero.js` after the SVG transition.

## Verification

- `npm run verify:landing` -> pass
- `node --test tools/landing-page-contract.test.mjs` -> pass
- Headless Chrome screenshots captured at `1440x1024` and `390x844` against `http://127.0.0.1:3000/landing.html` show the SVG lockup rendering without WebGL and with the CTA still centered horizontally beneath the copy

## Closure Matrix

| CM# | scenario | criteria | outcome | action |
| --- | --- | --- | --- | --- |
| CM1 | all-green | Landing typecheck, build, contract tests, and asset validation pass after the SVG swap | pass | SVG hero is ready for browser review |
| CM2 | partial-delivery | Hover interaction remains, or the bundle still points to the old WebGL path | no | The React section now mounts `LandingHeroSvg` and the built bundle includes the SVG path |

## Residual Risk

- Automated verification is green, but final visual acceptance still depends on a human browser review on the target machine, especially for exact mobile framing and copy balance.
- The repo still contains unrelated modified and untracked files outside this landing SVG scope; they were left untouched.
