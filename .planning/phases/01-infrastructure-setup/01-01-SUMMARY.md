---
phase: 01-infrastructure-setup
plan: "01"
subsystem: infra
tags: [nextjs, typescript, pg, app-router, iframe]

# Dependency graph
requires: []
provides:
  - Next.js 14 App Router scaffold with package.json, tsconfig.json
  - next.config.mjs with iframe-safe async headers() returning empty array
  - app/layout.tsx, app/globals.css, app/page.tsx minimal App Router files
  - .gitignore excluding .env and node_modules
  - .env.example documenting DATABASE_URL placeholder
  - pg dependency installed for PostgreSQL support
  - node_modules via npm install
affects:
  - 01-infrastructure-setup
  - 02-api-routes
  - 03-ui

# Tech tracking
tech-stack:
  added: [next@14.2.29, react@18, react-dom@18, pg@8, typescript@5, @types/pg]
  patterns:
    - "App Router with app/layout.tsx and app/page.tsx"
    - "next.config.mjs (ESM, never .ts) for Next.js 14"
    - "async headers() returning [] to suppress X-Frame-Options"
    - "npm scripts with -H 0.0.0.0 -p 3000 for sandbox binding"

key-files:
  created:
    - package.json
    - tsconfig.json
    - next.config.mjs
    - .gitignore
    - .env.example
    - app/layout.tsx
    - app/globals.css
    - app/page.tsx
  modified: []

key-decisions:
  - "next.config.mjs must use ESM (not .ts or .js) — Next.js 14 hard-errors on TypeScript config"
  - "async headers() returns [] (empty array) not a source/headers route entry — Next.js 14 rejects empty headers array in a route"
  - "Dev/start scripts bind to 0.0.0.0:3000 via -H 0.0.0.0 -p 3000 flags (mandatory for sandbox proxy)"
  - "No X-Frame-Options header emitted — required for iframe preview embedding"

patterns-established:
  - "next.config.mjs: use async headers() returning [] to suppress frame blocking"
  - "package.json scripts: always include -H 0.0.0.0 -p 3000 for Next.js dev/start"
  - "DB_CONTRACT=native-sidecar: use DATABASE_URL env var, no docker-compose"

# Metrics
duration: 5min
completed: 2026-06-17
---

# Phase 1 Plan 01: Next.js 14 App Router Scaffold Summary

**Next.js 14 App Router scaffold with iframe-safe headers, PostgreSQL pg dependency, and 0.0.0.0:3000 binding — zero manual setup required**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-06-17T13:57:00Z
- **Completed:** 2026-06-17T13:58:10Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Scaffolded Next.js 14 App Router project (package.json, tsconfig.json, app/ files) without running create-next-app
- Created next.config.mjs using ESM export with iframe-safe async headers() returning empty array
- Configured npm scripts to bind to 0.0.0.0:3000 — mandatory for sandbox proxy routing
- npm install completed — node_modules ready with pg@8 for database access

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Next.js 14 project files** - `9b9b113` (feat)
2. **Task 2: Create next.config.mjs with iframe-safe headers** - `f50edb0` (feat)

## Files Created/Modified
- `package.json` - npm scripts with -H 0.0.0.0 -p 3000, pg@8 dependency
- `tsconfig.json` - Standard Next.js 14 TypeScript config, moduleResolution: bundler
- `next.config.mjs` - ESM config with async headers() returning [] (suppresses X-Frame-Options)
- `.gitignore` - Excludes .env, .env.local, node_modules, .next
- `.env.example` - Documents DATABASE_URL placeholder (no real credentials)
- `app/layout.tsx` - Root App Router layout with QuickNotes metadata
- `app/globals.css` - Minimal reset styles (Phase 3 will expand)
- `app/page.tsx` - Placeholder home page (required for npm run build)

## Decisions Made
- `next.config.mjs` must use ESM — Next.js 14 hard-errors on TypeScript config files
- `async headers()` returns `[]` (empty array at top level), NOT an empty `headers: []` inside a route entry — Next.js 14 rejects route entries with empty headers arrays

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed empty headers route entry causing Next.js build error**
- **Found during:** Task 2 (Create next.config.mjs with iframe-safe headers)
- **Issue:** Plan specified `headers: []` inside a `source: '/(.*)'` route entry, but Next.js 14 rejects routes with empty headers arrays with "Invalid header found" error
- **Fix:** Changed `headers()` to return `[]` (empty array at the top level) instead of a route entry with empty headers, which correctly suppresses X-Frame-Options while passing Next.js validation
- **Files modified:** next.config.mjs
- **Verification:** `npm run build` completed successfully after fix
- **Committed in:** f50edb0 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Auto-fix necessary for build to succeed. Empty array approach achieves the same iframe-safe outcome as planned.

## Issues Encountered
None beyond the auto-fixed deviation above.

## Next Phase Readiness
- Next.js 14 project builds successfully (`npm run build` exits 0)
- node_modules installed with pg@8 — ready for lib/db.ts implementation
- next.config.mjs emits no X-Frame-Options — iframe embedding works
- Ready for Plan 02: PostgreSQL db module (lib/db.ts)

---
*Phase: 01-infrastructure-setup*
*Completed: 2026-06-17*
