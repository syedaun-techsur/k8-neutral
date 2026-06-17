# Roadmap: QuickNotes

## Overview

QuickNotes ships as three coherent phases. Phase 1 establishes the project scaffold — PostgreSQL auto-migration, environment config, Next.js 14 setup, port/host binding, and iframe-safe headers. Phase 2 delivers the complete REST API: six endpoints with proper status codes, validation, and the health check. Phase 3 builds the full user-facing application: the note list with search, the create form, the edit/delete form, and mobile-first styling. When Phase 3 is done, every user story (US1–US6) is satisfied and the app is deployable.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Infrastructure & Setup** - PostgreSQL persistence, auto-migration, env config, Next.js 14 scaffold, port binding, iframe-safe headers (Complete 2026-06-17)
- [ ] **Phase 2: REST API** - All 6 REST endpoints with validation, proper status codes, and health check
- [ ] **Phase 3: Frontend UI** - Note list (pinned, newest-first), real-time search, create/edit/delete forms, mobile-first design system

## Phase Details

### Phase 1: Infrastructure & Setup
**Status**: Complete (2026-06-17)
**Goal**: The project runs, connects to PostgreSQL automatically on first startup, and emits no frame-blocking headers
**Depends on**: Nothing (first phase)
**Requirements**: F4-01, F4-02, F4-03, F7-01, F7-02, F7-03
**Success Criteria** (what must be TRUE):
  1. `npm run dev` starts successfully and binds to `0.0.0.0:3000`
  2. `next.config.mjs` (not `.ts`) exists; `npm run build` completes without error
  3. The `notes` table is created automatically on first startup — no manual SQL steps required
  4. DB connection reads from `DATABASE_URL` env var; no credentials appear in source code
  5. `curl -I http://localhost:3000/` shows no `X-Frame-Options` header in the response
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md — Project scaffold + iframe-safe headers (next.config.mjs, package.json scripts, App Router files, X-Frame-Options suppression)
- [x] 01-02-PLAN.md — Database module (lib/db.ts with pg Pool, DATABASE_URL validation, CREATE TABLE IF NOT EXISTS auto-migration)

### Phase 2: REST API
**Goal**: All six REST endpoints behave per spec — correct status codes, validation, and JSON response shapes
**Depends on**: Phase 1
**Requirements**: F5-01, F5-02, F5-03, F5-04, F5-05, F5-06
**Success Criteria** (what must be TRUE):
  1. `GET /api/health` returns `200 {"status":"ok"}` with no database dependency
  2. `GET /api/notes` returns all notes newest-first, pinned first; supports `?q=` title filter
  3. `POST /api/notes` creates a note and returns `201`; rejects empty title with `400`
  4. `GET /api/notes/[id]` returns the note or `404` if not found
  5. `PUT /api/notes/[id]` updates the note and returns `200`; returns `404` if not found; rejects empty title with `400`
  6. `DELETE /api/notes/[id]` deletes the note and returns `204`; returns `404` if not found
**Plans**: TBD

Plans:
- [ ] 02-01: Health endpoint — `app/api/health/route.ts` returning `200 {"status":"ok"}`
- [ ] 02-02: Notes collection endpoints — `app/api/notes/route.ts` with `GET` (list + `?q=` filter) and `POST` (create with title validation)
- [ ] 02-03: Notes item endpoints — `app/api/notes/[id]/route.ts` with `GET`, `PUT`, `DELETE` (id validation, 404 handling, title validation on PUT)

### Phase 3: Frontend UI
**Goal**: A user can list, search, create, edit, and delete notes on a mobile-first interface, and all data persists in PostgreSQL
**Depends on**: Phase 2
**Requirements**: F0-01, F0-02, F0-03, F1-01, F1-02, F2-01, F2-02, F2-03, F3-01, F3-02, F3-03, F6-01, F6-02, F6-03
**Success Criteria** (what must be TRUE):
  1. `/` shows all notes sorted newest-first with pinned notes at the top; each row shows title, body snippet, and pinned indicator
  2. When no notes exist, `/` shows "No notes yet" message and a "New note" button
  3. Typing in the search box on `/` immediately filters notes by title; "No matching notes" appears when no notes match
  4. `/notes/new` lets a user create a note with title (required), body (optional), and pinned toggle; empty title shows inline "Title is required" error; success redirects to `/`
  5. Clicking a note opens `/notes/[id]/edit` pre-filled; saving updates the note and returns to `/`; deleting (with confirmation) removes the note and returns to `/`
  6. All pages render correctly at 375px viewport with no horizontal scroll, gold `#FBCA5C` accent, near-black `#0A0A0A` text, and all touch targets ≥ 44×44px
**Plans**: TBD

Plans:
- [ ] 03-01: Global layout & design system — `app/layout.tsx`, `globals.css` with CSS variables (`--color-accent`, `--color-text`, `--color-surface`), nav links
- [ ] 03-02: Note list page — `app/page.tsx` (Server Component, SSR query), `NoteList.tsx` (Client Component with search filter), empty state
- [ ] 03-03: Create note page — `app/notes/new/page.tsx` (Client Component), `NoteForm.tsx`, title validation, `POST /api/notes`, redirect on success
- [ ] 03-04: Edit/delete note page — `app/notes/[id]/edit/page.tsx`, SSR prefetch, `PUT`/`DELETE` calls, confirmation dialog, 404 state

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Infrastructure & Setup | 2/2 | Complete | 2026-06-17 |
| 2. REST API | 0/3 | Not started | - |
| 3. Frontend UI | 0/4 | Not started | - |