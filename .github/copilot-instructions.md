# Copilot / AI agent instructions — igcs-keyterms

Purpose: short, actionable guidance to help an AI coding agent become productive in this repo quickly.

Quick start
- Dev: `npm run dev` → open http://localhost:5173/ (index.html imports `/src/main.tsx` in dev)
- Build: `npm run build` (runs `tsc -b && vite build`) — run this to catch TypeScript / bundling errors.
- Tests: `npm test` (Jest + @testing-library/jsdom) — unit + DOM tests live in `__tests__/`.
- Typecheck only: `npx tsc -b`

Big picture
- Frontend single-page app (React 19 + TypeScript + SCSS). Routing via `react-router-dom` (v7).
- Major surface:
  - `src/components` — presentational layout pieces (Header/Layout/Sidebar/shared components)
  - `src/modules/*` — top-level feature modules (qa, resources, unit, manage)
  - `src/data/*` — canonical dataset (syllabus, unit metadata, paper QA JSON files)
  - `src/styles` — global styles & variables (SASS)
- Data flow: JSON under `src/data` (paper / qa entries) → components read from `src/data/*` → rendered by route modules.

Project-specific patterns & conventions
- Canonical QA URLs: use `buildQAPath` / `parseQAUrl` in `src/modules/qa/qaUrl.ts` for path-based (`/qa/unit/:unit`) and legacy query support; `QAView.tsx` canonicalizes URLs using `window.history.replaceState`.
- Feature flags: use Vite env var convention and `src/config/featureFlags.ts` (e.g., `VITE_SHOW_VISITS`) — check `VISITS_ENABLED` before rendering or running side effects.
- Tests that touch DOM sometimes use CommonJS *testable* wrappers (`*.testable.js`) to avoid Jest/TSX parsing issues; see `src/components/layout/layout.testable.js` and `src/modules/resources/quiz.testable.js` for examples.
- Keep runtime JS helpers in parallel `.js` files for tests when necessary (e.g., `src/modules/qa/qaUrl.js` + `qaUrl.ts`). If you update exports, ensure Named Exports exist in both `.ts` and `.js` helpers.
- Avoid including generated `assets/` built bundles in dev flow — `index.html` points to `/src/main.tsx` for development.

Build & debugging gotchas discovered in repo
- Vite "The above dynamic import cannot be analyzed by Vite" warning originates from dynamic-route loading (react-router internals). Options:
  - Annotate specific import() calls with `/* @vite-ignore */` if it's intended to remain dynamic, or
  - Suppress in `vite.config.ts` (the repo contains a small plugin which silences this particular message during dev/build).
- If TypeScript build fails about missing named exports, check that both `.ts` and any `.js` helper files export the same names (seen with `qaUrl.ts` + `qaUrl.js` mismatch earlier).
- Jest can fail to parse TSX files; creating a small CommonJS-only test harness is the pragmatic fix used here.

Testing conventions
- Jest + @testing-library/react (jsdom) used for DOM tests. Setup installed in `package.json` dev deps.
- Tests live in project root `__tests__/*.test.js` or `.interaction.test.js`. Keep tests fast; prefer small focused unit tests.
- When DOM tests break due to transform issues, create a `*.testable.js` wrapper that renders plain React.createElement structures.

Data & tooling for papers
- Paper JSON under `src/data/papers/` (e.g., `25paper2.json`). Raw PDFs and extraction artifacts under `src/data/papers/raw_2025_test/`.
- Conversion / parsing utilities live in `scripts/` (Node + Python scripts used for PDF extraction). Use these scripts to regenerate data if needed.

Quick examples & references
- Add or canonicalize QA URLs: `src/modules/qa/qaUrl.ts` — call `buildQAPath({unit, topic, q, kw})` to form canonical path.
- Feature flags: `src/config/featureFlags.ts` — set `VITE_SHOW_VISITS=true` in `.env` or CI env to enable Visits UI.
- Hiding UI behind flag: see `src/components/layout/Layout.tsx` (gates visits markup & effect on `VISITS_ENABLED`).

Developer workflow checklist (PRs)
- Run `npx tsc -b` → fix type errors.
- Run `npm test` → fix failing tests.
- Run `npm run build` to catch bundler errors (named export mismatches, dynamic import warnings).
- For UI changes, verify in Chrome + Firefox devtools and mobile sizes.

If you add features that require server-side changes or API endpoints
- Document any new env vars & add them to `.env.example` (project currently uses `VITE_*` env convention).

If anything is unclear or you want me to expand a section (examples, patterns, or a checklist), tell me which area to improve and I will iterate.