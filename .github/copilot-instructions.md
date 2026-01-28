# Copilot / AI agent instructions — igcs-keyterms

**Purpose:** Actionable guidance for AI agents to become immediately productive in this React + TypeScript IGCSE Computer Science revision tool.

## Quick start
- **Dev:** `npm run dev` → http://localhost:5173/ (Vite, hot reload enabled)
- **Build:** `npm run build` (runs `tsc -b && vite build`) — TypeScript + bundler validation
- **Tests:** `npm test` (Jest); tests in `__tests__/` use `.test.js` or `.interaction.test.js` naming
- **Typecheck:** `npx tsc -b`
- **Lint:** `npm run lint` (ESLint; no lint warnings in PRs)
- **Lang check:** `npm run check:language` (validates US English in src/, scripts/, public/, config files)

## Big picture architecture
**Stack:** React 19 + TypeScript 5 + SCSS. Routing: react-router-dom v7. Tested with Jest + @testing-library/react (jsdom).

**Core module structure:**
- `src/modules/*` — Top-level feature modules (qa, resources, unit, manage, common, games)
  - `qa/QAView.tsx` — Main Q&A search/filter UI; parses URL params via `parseQAUrl()` and canonicalizes with `window.history.replaceState()`
  - `unit/UnitRoute.tsx` — Displays unit terms/definitions; reads from `src/data/units.ts`
  - `resources/` — Quiz and resource views
  - `games/` — Educational mini-games (BreakoutGame, InvadersGame, MemoryGame, MinesweeperGame, PacmanGame, SnakeGame); see `games/types.ts` for game interfaces
  - `common/GenericUnitView.tsx` — Shared term display logic
- `src/components/` — Presentational layout (Header, Layout, Sidebar, shared UI)
- `src/data/*` — Canonical state (immutable at runtime)
  - `units.ts` — Master list of CS units with keyed terms (exports `Unit[]`)
  - `units/unitN.json` — Source unit definitions (not directly imported; units.ts is the build artifact)
  - `qa.ts` — Compiled Q&A (merged from baseQaData + papers via `loadQAFromPapers()`)
  - `papers/` — Past paper JSON exports (25paper1.json, 25paper2.json, etc.)
  - `importer.ts` — Extracts QA from paper JSON files
- `src/config/featureFlags.ts` — Runtime feature gates (e.g., `VISITS_ENABLED`)
- `src/styles/` — SCSS variables and global theming
- `src/types/index.ts` — Core types: `Unit`, `Term`, `Question`, `QAData`, `ViewMode`

**Data flow:** Source files (papers/*.json, units/*.json) → synchronization scripts → canonical `units.ts` and `qa.ts` → React components render via route modules.

**Key architecture decisions:**
- Units and QA data are **stateless, declarative, imported at module load time**. Runtime immutable. Changes require edits to source `.ts` files.
- **Synchronization scripts in `scripts/`** reconcile source data into canonical forms using Node + ES modules; outputs tracked in `*_applied.json` (e.g., `strict_topic_v2_applied.json`).
- **Dynamic routing with version prefixes:** QA URLs support `/qa/v2/unit/:unit/topic/:topic` for backward-compat; regex parser handles both path-based and legacy query params.
- **Dual `.js`/`.ts` helpers:** Some modules export both (e.g., `qaUrl.ts` + `qaUrl.js`) so tests can import `.js` without TSX parsing overhead.

## Project-specific patterns & conventions

**URL handling & QA routing:**
- Always use `buildQAPath()` / `parseQAUrl()` in `src/modules/qa/qaUrl.ts` to form/parse QA URLs
- Supports both path-based (`/qa/unit/:unit/topic/:topic`) and legacy query params (`?unit=...&q=...&kw=...`)
- Parser handles version prefixes (e.g., `/qa/v2/unit/...`); `QAView.tsx` canonicalizes stale URLs via `window.history.replaceState()`
- Keep `.js` and `.ts` versions of helpers in parallel (e.g., `src/modules/qa/qaUrl.js` + `.ts`); export same Named Exports in both
- Test files import from `.js` versions to avoid Jest/TSX parsing overhead

**Feature flags:**
- Define Vite env vars as `VITE_*` (e.g., `VITE_SHOW_VISITS=true` in `.env` or CI)
- Evaluate in `src/config/featureFlags.ts` and export boolean constants (e.g., `VISITS_ENABLED`)
- Gate rendering AND side effects — see `Layout.tsx` for pattern: condition imports and effects on flag, not just JSX rendering
- Feature flags work cross-environment (dev, build, test, production); fallback to `globalThis.process.env` for Node contexts
- Example pattern: `if (VISITS_ENABLED) { ... }` wraps both component imports and `useEffect()` hooks to prevent dead code in builds

**Data synchronization:**
- Critical scripts: `sync_qa_from_units.mjs`, `sync_qa_from_units_relaxed.mjs`, `sync_units_with_papers.mjs`
- Apply scripts track changes: `apply_strict_sync.mjs`, `apply_strict_with_topic_v2.mjs`, `apply_safe_sync.mjs`, `apply_safe_sync_improved.mjs`
- Output logs stored in `*_applied.json` (structured changes) and `*_applied.txt` (human-readable audit trail)
- **Always check `strict_topic_v2_applied.json`** for history of structural QA changes; this is the current canonical sync strategy
- Use `npm run check:language` before committing; language files track standardization
- Note: Multiple `.bak` and `.revert-*` files in `src/data/` are version history artifacts—ignore these for code analysis

**Data type definitions:**
- Core types in `src/types/index.ts`: `Unit` (id, number, title, group, terms[]), `Term` (term, topic, definition, example?, misconception?, contrast?, sourceVerified?), `Question`, `QAData`, `ViewMode`
- `QAData` = `Record<string, Record<string, Question[]>>` (unit ID → topic → questions)
- `units.ts` exports `Unit[]` (immutable, loaded once). Modify via edits, not runtime state.

**Testing patterns:**
- DOM tests in `__tests__/*.test.js` or `.interaction.test.js` (Jest config: jsdom)
- CommonJS *testable* wrappers (`*.testable.js`) workaround TSX parsing: render plain `React.createElement()` structures
- Examples: `src/components/layout/layout.testable.js`, `src/modules/resources/quiz.testable.js`
- Keep tests fast; prefer unit tests over integration when possible
- Vite dev mode: `index.html` uses `/src/main.tsx`; don't include generated `assets/` in dev builds

## Build & debugging gotchas discovered in repo

- **Vite dynamic import warning:** "The above dynamic import cannot be analyzed by Vite" originates from react-router internals (e.g., `import(r.module)`). The repo has a custom Vite plugin that silences this in dev/build (see `vite.config.ts`).
- **TypeScript build fails on missing named exports:** Check that both `.ts` and any `.js` helper files export the same names (common with `qaUrl.ts` + `qaUrl.js` mismatches)
- **Jest TSX parsing failures:** Create a small CommonJS-only test harness (`.testable.js`) that renders plain `React.createElement()` structures instead of JSX
- **Data sync out of sync:** If `units.ts` or `qa.ts` appear stale, check if source files (units/*.json, papers/*.json) were updated without running synchronization scripts

## Testing conventions

- Jest + @testing-library/react (jsdom) used for DOM tests
- Tests in project root `__tests__/*.test.js` or `.interaction.test.js` 
- When DOM tests break due to transform issues, create a `*.testable.js` wrapper that renders plain React.createElement structures
- E2E tests in `e2e/` use Playwright; run with `npm run test:e2e`

## Data & tooling for papers

- Paper JSON under `src/data/papers/` (e.g., `25paper2.json`)
- Synchronization scripts merge paper QA into canonical `qa.ts`:
  - `sync_qa_from_units.mjs` / `sync_qa_from_units_relaxed.mjs` — Merge paper QA
  - `sync_units_with_papers.mjs` — Reconcile unit metadata from papers
  - `apply_*_sync*.mjs` — Apply and track changes; outputs in `*_applied.json`
  - Check `strict_topic_v2_applied.json` for QA structural history

## Quick examples & references

- QA URL routing: `src/modules/qa/qaUrl.ts` — `buildQAPath({unit, topic, q, kw})` forms canonical paths
- Feature flags: `src/config/featureFlags.ts` — Set `VITE_SHOW_VISITS=true` in `.env` to enable Visits UI
- UI gating example: `src/components/layout/Layout.tsx` (gates visits markup & effect on `VISITS_ENABLED`)

## Developer workflow checklist (PRs)

- Run `npx tsc -b` → fix type errors
- Run `npm test` → fix failing tests  
- Run `npm run build` to catch bundler errors (export mismatches, dynamic import warnings)
- Run `npm run check:language` → fix English standardization issues
- For UI changes, test in Chrome + Firefox devtools and mobile sizes
- If data files changed, verify synchronization scripts were run and `*_applied.json` was updated

## Server-side changes & API endpoints

- Document any new env vars and add to `.env.example` (project uses `VITE_*` env convention)