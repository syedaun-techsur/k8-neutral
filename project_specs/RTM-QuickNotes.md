# Requirements Traceability Matrix: QuickNotes

**Document Type:** Requirements Traceability Matrix (RTM)  
**Version:** 1.0  
**Date:** 2026-06-17  
**Status:** Active  
**Project Acronym:** QuickNotes  
**Source Documents:** PRD-QuickNotes.md, FRD-QuickNotes.md, TechArch-QuickNotes.md, UserStories-QuickNotes.md

---

## Table of Contents

1. [Overview](#1-overview)
2. [Requirements Summary](#2-requirements-summary)
3. [Traceability Matrix](#3-traceability-matrix)
4. [Requirements Detail](#4-requirements-detail)
5. [Test Case Coverage](#5-test-case-coverage)
6. [Change Management](#6-change-management)
7. [Approval](#7-approval)

---

## 1. Overview

This Requirements Traceability Matrix (RTM) provides bidirectional traceability between all QuickNotes specification documents. It ensures that every product requirement defined in the PRD is implemented as a functional requirement in the FRD, backed by a concrete technical specification in TechArch, and expressed as a verifiable user story. Every user story maps upward to architecture and downward to acceptance criteria that drive Playwright UAT tests.

QuickNotes is a single-user, mobile-first notes application built on Next.js 14 (App Router) with PostgreSQL persistence. The MVP scope encompasses eight features (F0–F7): note listing, search, creation, editing and deletion, data persistence, REST API, mobile-first UI, and iframe/deployment compatibility. These features produce 21 user stories across 8 epics, 6 UAT acceptance scenarios, and a full REST API surface backed by a single `notes` table.

This RTM is the authoritative traceability record for the QuickNotes MVP. Any change to a PRD feature, FRD requirement, TechArch specification, or user story must be reflected here to maintain end-to-end coverage. The matrix supports forward traceability (PRD → FRD → TechArch → UserStories → Tests) and backward traceability (Tests → UserStories → TechArch → FRD → PRD), enabling impact analysis for any proposed change.

---

## 2. Requirements Summary

### PRD Features (F0–F7)

- **F0 — Note List View (P0):** Home page `/` displays all notes sorted pinned-first then newest-first; empty state shows "No notes yet" with a "New note" CTA; every row links to `/notes/[id]/edit`
- **F1 — Note Search (P1):** Real-time client-side title filter on the list page; case-insensitive substring match; no server round-trip; "No matching notes" state when filter yields zero results
- **F2 — Create Note (P0):** `/notes/new` form with required title, optional body, pinned toggle; `POST /api/notes` on submit; redirect to `/` on `201 Created`
- **F3 — Edit & Delete Note (P0):** `/notes/[id]/edit` pre-filled from DB; `PUT /api/notes/[id]` on save; `DELETE /api/notes/[id]` with `confirm()` prompt; redirect to `/` on success
- **F4 — Data Persistence (P0):** All CRUD operations write to PostgreSQL; `CREATE TABLE IF NOT EXISTS` auto-migration on startup; `DATABASE_URL` from environment only; no data loss on restart
- **F5 — REST API (P0):** Six endpoints — `GET /api/health`, `GET /api/notes`, `POST /api/notes`, `GET /api/notes/[id]`, `PUT /api/notes/[id]`, `DELETE /api/notes/[id]`; standard HTTP status codes; JSON responses
- **F6 — Mobile-First UI (P1):** 375px–428px primary viewport; Gold `#FBCA5C` accent ≤10% per view; near-black `#0A0A0A` text; white `#FFFFFF` surfaces; 44×44px minimum touch targets; 16px minimum body font
- **F7 — Iframe & Deployment Compatibility (P0):** No `X-Frame-Options` header; no restrictive `frame-ancestors` CSP; server binds to `0.0.0.0:3000`; `next.config.mjs` only (never `.ts`)

### FRD Functional Chunks (F00–F07 + Y-series)

- **F00** — Note List View: SSR page, `SELECT … ORDER BY pinned DESC, created_at DESC`, empty state, persistent "New note" link
- **F01** — Note Search: Client-side JS filter, `String.includes()` case-insensitive, synchronous on each keystroke, no API call
- **F02** — Create Note: Client-side + server-side title validation; `POST /api/notes`; `201` → redirect `/`
- **F03** — Edit & Delete Note: Server-side note fetch on page load; `PUT` on save; `DELETE` with `confirm()` step; 404 handling
- **F04** — Data Persistence & Auto-Migration: `CREATE TABLE IF NOT EXISTS` at module init; idempotent; `DATABASE_URL` required; connection pool lifecycle
- **F05** — REST API: All six endpoints with full request/response schemas, validation rules, and error codes
- **F06** — Mobile-First UI & Design System: CSS design tokens, 44×44px touch targets, 10% Gold rule, responsive layout
- **F07** — Iframe & Deployment Compatibility: Header policy, `0.0.0.0:3000` binding, `next.config.mjs` constraint
- **Y0** — Database Schema: Single `notes` table DDL, column definitions, query patterns, JSON serialization mapping
- **Y1** — REST API Endpoint Catalog: Full HTTP request/response schemas for all six endpoints
- **Y2** — Cross-Feature Error Catalog: All error codes, HTTP statuses, UI behaviors, startup errors
- **Y3** — External Integration Points: PostgreSQL connection config, Node.js runtime, browser environment, iframe embedding

### TechArch Specifications

- **ADR-01** — `next.config.mjs` extension (ES Module; `.ts` hard-errors on Next 14)
- **ADR-02** — Direct `pg` pool (no ORM; single table with simple CRUD)
- **ADR-03** — `CREATE TABLE IF NOT EXISTS` in `lib/db.ts` module init (zero external tools)
- **ADR-04** — SSR via Server Components (notes reflect DB state at render time)
- **ADR-05** — Client-side search filter (in-memory; no debounce at MVP scale)
- **ADR-06** — Plain CSS / CSS Modules (no Tailwind required)
- **ADR-07** — No `X-Frame-Options` emitted (app must render in `<iframe>`)
- **ADR-08** — No authentication (single-user operator environment; out of scope for MVP)

### User Story Epics (US-0.x – US-7.x)

- **Epic 0 (F0):** US-0.1 View List of Notes, US-0.2 View Empty State — 2 stories, both P0
- **Epic 1 (F1):** US-1.1 Filter Notes Real Time, US-1.2 Clear Search, US-1.3 No-Match State — 3 stories, all P1
- **Epic 2 (F2):** US-2.1 Create Note, US-2.2 Prevent Empty Title — 2 stories, both P0
- **Epic 3 (F3):** US-3.1 Open Pre-Filled Edit, US-3.2 Edit and Save, US-3.3 Delete with Confirmation — 3 stories, all P0
- **Epic 4 (F4):** US-4.1 Notes Persist Across Reloads, US-4.2 DB Schema Auto-Migrates — 2 stories, both P0
- **Epic 5 (F5):** US-5.1 Health Check, US-5.2 List Notes via API, US-5.3 Create via API, US-5.4 Fetch/Update/Delete via API — 4 stories, all P0
- **Epic 6 (F6):** US-6.1 Mobile One-Handed, US-6.2 Gold Accent Design — 2 stories, both P1
- **Epic 7 (F7):** US-7.1 Iframe Embed, US-7.2 Container Access, US-7.3 next.config.mjs Build — 3 stories, all P0

### UAT Playwright Scenarios (US1–US6)

- **US1** — Opening `/` shows list of notes; empty state shows "No notes yet" and "New note" button
- **US2** — Tap "New note", fill title + body, submit, return to `/` where note appears
- **US3** — Open a note, change the title, save, and the list reflects it
- **US4** — From edit page, tap Delete, confirm, note no longer appears on `/`
- **US5** — Typing in search box narrows the list to matching notes
- **US6** — Data survives a page reload (stored in PostgreSQL, not in memory)

---

## 3. Traceability Matrix

### 3.1 Forward Traceability: PRD → FRD → TechArch → UserStories

| PRD Feature | Priority | FRD Chunk(s) | TechArch Decision(s) | User Stories | UAT |
|-------------|----------|--------------|----------------------|--------------|-----|
| F0: Note List View | P0 | F00 | ADR-04 (SSR Server Components) | US-0.1, US-0.2 | US1 |
| F1: Note Search | P1 | F01 | ADR-05 (Client-side filter) | US-1.1, US-1.2, US-1.3 | US5 |
| F2: Create Note | P0 | F02, Y0, Y1 | ADR-04 (SSR+Client Components) | US-2.1, US-2.2 | US2 |
| F3: Edit & Delete Note | P0 | F03, Y0, Y1 | ADR-04 (SSR+Client Components) | US-3.1, US-3.2, US-3.3 | US3, US4 |
| F4: Data Persistence | P0 | F04, Y0, Y3 | ADR-02 (raw `pg`), ADR-03 (auto-migration) | US-4.1, US-4.2 | US6 |
| F5: REST API | P0 | F05, Y1, Y2 | ADR-02 (raw `pg` Route Handlers) | US-5.1, US-5.2, US-5.3, US-5.4 | US1–US6 (infra) |
| F6: Mobile-First UI | P1 | F06 | ADR-06 (Plain CSS / CSS Modules) | US-6.1, US-6.2 | — |
| F7: Iframe & Deployment | P0 | F07, Y3 | ADR-01 (`next.config.mjs`), ADR-07 (no X-Frame-Options) | US-7.1, US-7.2, US-7.3 | — |

---

### 3.2 Backward Traceability: UserStories → TechArch → FRD → PRD

| User Story | Priority | Feature Ref | FRD Chunk | TechArch Decision | UAT |
|------------|----------|-------------|-----------|-------------------|-----|
| US-0.1: View List of Notes | P0 | F0 | F00 | ADR-04 | US1 |
| US-0.2: View Empty State | P0 | F0 | F00 | ADR-04 | US1 |
| US-1.1: Filter Notes Real Time | P1 | F1 | F01 | ADR-05 | US5 |
| US-1.2: Clear Search Restore List | P1 | F1 | F01 | ADR-05 | — |
| US-1.3: No-Match State | P1 | F1 | F01 | ADR-05 | — |
| US-2.1: Create Note with Title + Body | P0 | F2 | F02, Y0, Y1 | ADR-04 | US2 |
| US-2.2: Prevent Empty Title Submission | P0 | F2 | F02, Y2 | ADR-04 | — |
| US-3.1: Open Pre-Filled Edit Page | P0 | F3 | F03, Y0 | ADR-04 | — |
| US-3.2: Edit and Save Note | P0 | F3 | F03, Y1 | ADR-04 | US3 |
| US-3.3: Delete with Confirmation | P0 | F3 | F03, Y1, Y2 | ADR-04 | US4 |
| US-4.1: Notes Persist Across Reloads | P0 | F4 | F04, Y0 | ADR-02, ADR-03 | US6 |
| US-4.2: DB Schema Auto-Migrates | P0 | F4 | F04, Y3 | ADR-03 | — |
| US-5.1: Health Check Endpoint | P0 | F5 | F05, Y1 | ADR-02 | — |
| US-5.2: List Notes via API | P0 | F5 | F05, Y1 | ADR-02 | — |
| US-5.3: Create Note via API | P0 | F5 | F05, Y1, Y2 | ADR-02 | — |
| US-5.4: Fetch/Update/Delete via API | P0 | F5 | F05, Y1, Y2 | ADR-02 | — |
| US-6.1: Mobile One-Handed Use | P1 | F6 | F06 | ADR-06 | — |
| US-6.2: Gold Accent Design | P1 | F6 | F06 | ADR-06 | — |
| US-7.1: Iframe Embed Without Errors | P0 | F7 | F07, Y3 | ADR-07 | — |
| US-7.2: Container Port Access | P0 | F7 | F07, Y3 | ADR-01, ADR-07 | — |
| US-7.3: Build with next.config.mjs | P0 | F7 | F07 | ADR-01 | — |

---

### 3.3 Schema & API Cross-Reference

| FRD Y-Series Doc | Covers | Referenced by PRD Features | Referenced by User Stories |
|-----------------|--------|---------------------------|---------------------------|
| Y0 — Database Schema | `notes` table DDL, column defs, query patterns | F0, F2, F3, F4, F5 | US-0.1, US-2.1, US-3.1, US-4.1, US-4.2, US-5.2–5.4 |
| Y1 — API Endpoint Catalog | Full HTTP schemas for all 6 endpoints | F5 (primary), F2, F3 | US-5.1, US-5.2, US-5.3, US-5.4, US-2.1, US-3.2, US-3.3 |
| Y2 — Error Catalog | All 4xx/5xx codes, client form errors, startup errors | F2, F3, F4, F5 | US-2.2, US-3.2, US-3.3, US-4.2, US-5.3, US-5.4 |
| Y3 — Integration Points | PostgreSQL config, Node.js binding, browser/iframe | F4, F7 | US-4.2, US-7.1, US-7.2 |

---

## 4. Requirements Detail

This section expands each PRD feature with its corresponding FRD requirements, TechArch decisions, and user story acceptance criteria.

---

### F0: Note List View

**PRD Description:** Home page (`/`) displays all notes sorted pinned-first then newest-first. Renders an empty state when no notes exist. Persistent "New note" CTA always visible.

**FRD Requirements (F00):**
- Server fetches all rows: `SELECT id, title, body, pinned, created_at FROM notes ORDER BY pinned DESC, created_at DESC` at SSR time
- Empty state renders exact text "No notes yet" when `notes` table has zero rows
- "New note" button/link pointing to `/notes/new` is rendered regardless of list contents
- Each note row displays: `title`, body snippet (≤60 chars, truncated with ellipsis), pinned visual indicator
- Each note row is a tappable link to `/notes/[id]/edit`
- Sort order enforced at SQL level, not in application code
- Error state: "Unable to load notes. Please try again." on PostgreSQL failure

**TechArch Implementation:**
- `app/page.tsx` — Server Component; direct DB query via `lib/db.ts`
- `components/NoteList.tsx` — Client Component; receives notes as prop from Server Component
- ADR-04: SSR ensures DB state is reflected at page-load time with no client hydration gap

**User Stories:**
- **US-0.1:** Navigating to `/` renders all notes with title, body snippet, pinned indicator, and "New note" link — P0
- **US-0.2:** Zero-note state shows exactly "No notes yet" and a "New note" button linking to `/notes/new` — P0

**UAT Coverage:** US1

---

### F1: Note Search

**PRD Description:** Search input on the list page filters visible notes in real time by title match. Synchronous client-side filtering. No server round-trip.

**FRD Requirements (F01):**
- Search input visible on `/` at all times, including when the list is empty
- On each `input` event: trim input, filter `notes` by case-insensitive `title.toLowerCase().includes(term.toLowerCase())`
- Filtering begins on the first character typed — no minimum threshold
- Filtered results preserve original sort order (pinned first, then newest-first)
- Clearing the input restores the full, unfiltered list
- No-match state renders exact text "No matching notes" when filter is non-empty and yields zero results
- No API call or `setTimeout` during search interactions — synchronous only

**TechArch Implementation:**
- `components/SearchInput.tsx` — Client Component; search state via `useState`
- `components/NoteList.tsx` — Client Component; filters `notes` prop based on search term
- ADR-05: In-memory client-side filter; avoids server round-trip at MVP note counts

**User Stories:**
- **US-1.1:** Typing narrows list immediately to matching notes; case-insensitive substring; no API call — P1
- **US-1.2:** Clearing search input restores full list with original sort order — P1
- **US-1.3:** Non-empty filter with zero matches displays exactly "No matching notes" — P1

**UAT Coverage:** US5

---

### F2: Create Note

**PRD Description:** `/notes/new` form with required title, optional body, and pinned toggle. Persisted via `POST /api/notes`. Redirects to `/` on `201 Created`.

**FRD Requirements (F02):**
- Form fields: title `<input type="text">` (required), body `<textarea>` (optional), pinned `<input type="checkbox">` (default unchecked), "Save"/"Create" button, "Cancel" link to `/`
- Client-side validation: if `title` is empty or whitespace-only, show "Title is required" inline; do not send request; form values preserved
- On valid submit: `POST /api/notes` with `{ title: trimmed, body: string|null, pinned: boolean }`
- On `201 Created`: redirect to `/`
- On `400` from server: display server error message inline adjacent to title field
- On `500` or network error: display "Failed to save note. Please try again."
- Server-side: `title` non-empty after `trim()` → else `400 {"error":"Title is required"}`; `pinned` defaults to `false`; `body` defaults to `null`
- DB write: `INSERT INTO notes (title, body, pinned) VALUES ($1, $2, $3) RETURNING *`

**TechArch Implementation:**
- `app/notes/new/page.tsx` — Client Component; form with `useState` for field values and error state
- `components/NoteForm.tsx` — shared create/edit form logic
- `app/api/notes/route.ts` — `POST` handler; validation → insert → `201`
- ADR-02: Parameterized `pg` query; no ORM

**User Stories:**
- **US-2.1:** Fill title + body + pinned, submit → `POST /api/notes` → `201` → redirect to `/`; new note visible in list — P0
- **US-2.2:** Empty/whitespace title shows "Title is required" inline; no request sent; form values retained; server `400` also displayed inline — P0

**UAT Coverage:** US2

---

### F3: Edit & Delete Note

**PRD Description:** `/notes/[id]/edit` pre-filled from DB. Save via `PUT`. Delete via `DELETE` with `confirm()`. Both redirect to `/` on success.

**FRD Requirements (F03):**
- **Page load:** `SELECT id, title, body, pinned FROM notes WHERE id = $1`; if no row → 404 "Note not found" state with link to `/`
- **Save:** Client validates non-empty title; `PUT /api/notes/[id]` with `{ title, body, pinned }`; `200 OK` → redirect `/`; `404` → "This note no longer exists." + link to `/`; `500` → "Failed to save note. Please try again."
- **Delete:** `confirm("Delete this note? This cannot be undone.")` → if confirmed: `DELETE /api/notes/[id]`; `204` → redirect `/`; `404` → redirect `/` (treat as success); `500` → "Failed to delete note. Please try again."
- Cancelling confirm → no action; form remains open
- Pre-filled: title, body (may be null/empty), pinned checkbox state
- DB update: `UPDATE notes SET title=$1, body=$2, pinned=$3 WHERE id=$4 RETURNING *`
- DB delete: `DELETE FROM notes WHERE id=$1`

**TechArch Implementation:**
- `app/notes/[id]/edit/page.tsx` — Server Component fetches note; Client Component renders editable form
- `app/api/notes/[id]/route.ts` — `GET`, `PUT`, `DELETE` handlers
- ADR-04: Server-side fetch on page load ensures pre-fill reflects current DB state

**User Stories:**
- **US-3.1:** Tap note → `/notes/[id]/edit`; form pre-filled with current `title`, `body`, `pinned`; non-existent ID shows "Note not found" — P0
- **US-3.2:** Modify fields + "Save" → `PUT` → `200` → redirect `/`; updated title visible; empty title blocked with "Title is required" — P0
- **US-3.3:** "Delete" → `confirm()` → `DELETE` → `204` → redirect `/`; note gone; `404` also redirects; `500` shows error without redirect — P0

**UAT Coverage:** US3, US4

---

### F4: Data Persistence

**PRD Description:** All note data stored in PostgreSQL. Auto-migration on startup. `DATABASE_URL` from environment only. Zero manual steps.

**FRD Requirements (F04):**
- Auto-migration SQL executed before first HTTP request: `CREATE TABLE IF NOT EXISTS notes (id SERIAL PRIMARY KEY, title TEXT NOT NULL, body TEXT, pinned BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`
- Migration is idempotent (`IF NOT EXISTS`); safe across restarts; no data loss
- If `DATABASE_URL` absent: fail with "DATABASE_URL environment variable is required"
- If DB unreachable: log `"[QuickNotes] Database migration failed: <error>"`; error surfaced clearly
- Connection pool: `max: 10`, `idleTimeoutMillis: 30000`, `connectionTimeoutMillis: 10000`
- All CRUD operations use parameterized queries via `pg` pool — no ORM, no string concatenation
- No credentials in source code, build artifacts, or client bundles

**TechArch Implementation:**
- `lib/db.ts` — `pg.Pool` singleton; migration runs at module initialization (before first request)
- ADR-02: Raw `pg` driver; single table makes ORM overhead unjustified
- ADR-03: `CREATE TABLE IF NOT EXISTS` in module init; zero external migration tools

**User Stories:**
- **US-4.1:** Notes created via UI persist in PostgreSQL; survive tab close, browser reopen, server restart — P0
- **US-4.2:** Fresh container with `DATABASE_URL` set → app starts → schema exists → no manual SQL steps needed; idempotent on restart — P0

**UAT Coverage:** US6

---

### F5: REST API

**PRD Description:** Six REST endpoints backing all UI operations. JSON responses. Standard HTTP status codes. No auth.

**FRD Requirements (F05 + Y1 + Y2):**
- **GET /api/health** → `200 {"status":"ok"}` always; no DB dependency; `app/api/health/route.ts`
- **GET /api/notes** → `200 [NoteObject…]`; optional `?q=` for ILIKE title filter; `ORDER BY pinned DESC, created_at DESC`; `[]` if no results; `500` on DB failure
- **POST /api/notes** → validate `title` non-empty; `INSERT … RETURNING *`; `201 NoteObject`; `400 {"error":"Title is required"}` or `{"error":"Invalid request body"}`; `500` on DB failure
- **GET /api/notes/[id]** → parse `id` as positive integer; `SELECT … WHERE id=$1`; `200 NoteObject`; `400 {"error":"Invalid id"}`; `404 {"error":"Note not found"}`; `500` on DB failure
- **PUT /api/notes/[id]** → parse `id`; validate `title`; `UPDATE … RETURNING *`; `200 NoteObject`; errors: `400` (invalid id, title required, malformed JSON), `404`, `500`
- **DELETE /api/notes/[id]** → parse `id`; `DELETE … WHERE id=$1`; rowCount=0 → `404`; rowCount=1 → `204 No Content`; `400 {"error":"Invalid id"}`; `500` on DB failure
- All unsupported methods → `405 {"error":"Method not allowed"}`
- Note object shape: `{ id: number, title: string, body: string|null, pinned: boolean, createdAt: string (ISO 8601) }`
- `snake_case` DB columns mapped to `camelCase` API keys (`created_at` → `createdAt`)

**TechArch Implementation:**
- `app/api/health/route.ts` — exports `GET`
- `app/api/notes/route.ts` — exports `GET`, `POST`
- `app/api/notes/[id]/route.ts` — exports `GET`, `PUT`, `DELETE`
- `lib/db.ts` — `query(text, params)` wrapper used by all Route Handlers
- ADR-02: Direct `pg` parameterized queries; type-safe `toNote(row: NoteRow): Note` serializer

**User Stories:**
- **US-5.1:** `GET /api/health` → `200 {"status":"ok"}`; no DB dependency; any auth state — P0
- **US-5.2:** `GET /api/notes` → `200 [...]`; all fields including `createdAt`; sorted pinned-first; `[]` on empty; `?q=` filter works — P0
- **US-5.3:** `POST /api/notes` → `201` with created note including `id` and `createdAt`; missing title → `400`; malformed JSON → `400` — P0
- **US-5.4:** `GET/PUT/DELETE /api/notes/[id]` all behave per spec; invalid `id` → `400`; missing note → `404`; unsupported method → `405` — P0

**UAT Coverage:** US1–US6 (infrastructure dependency for all UAT scenarios)

---

### F6: Mobile-First UI & Design System

**PRD Description:** Mobile-first layout with Gold accent (`#FBCA5C`), near-black text (`#0A0A0A`), white surfaces, 44×44px touch targets, 16px minimum body font.

**FRD Requirements (F06):**
- Single-column layout; no horizontal scroll at 375px viewport width
- All interactive elements: computed tap target ≥ 44×44px (padding used to expand visually smaller elements)
- Minimum body font size: 16px at 375px viewport
- Gold `#FBCA5C`: applied to "New note" CTA, "Save"/"Create" buttons, pinned indicators; ≤10% visible pixel area per view
- Near-black `#0A0A0A` for all body text, headings, labels
- White `#FFFFFF` for page and card backgrounds
- Layout scales up gracefully on tablet (768px+) and desktop (1024px+) without breaking
- Plain CSS or CSS Modules; no Tailwind required

**TechArch Implementation:**
- `app/globals.css` — CSS custom properties: `--color-accent: #FBCA5C`, `--color-text: #0A0A0A`, `--color-surface: #FFFFFF`, `--touch-target-min: 44px`, `--font-size-body: 16px`, `--max-width: 480px`
- Per-component `.module.css` files
- ADR-06: Plain CSS / CSS Modules; no Tailwind dependency

**User Stories:**
- **US-6.1:** All pages render without horizontal scroll at 375px; all interactive elements ≥44×44px tap target; body text ≥16px; desktop scales without breakage — P1
- **US-6.2:** Text in `#0A0A0A`; backgrounds in `#FFFFFF`; CTAs and pinned indicators in `#FBCA5C` ≤10% per view; pinned notes visually distinct; implemented in plain CSS or CSS Modules — P1

**UAT Coverage:** None (visual/layout; verified by visual inspection or separate automated visual regression)

---

### F7: Iframe & Deployment Compatibility

**PRD Description:** No frame-blocking HTTP headers. Server binds to `0.0.0.0:3000`. Config file is `next.config.mjs` only.

**FRD Requirements (F07 + Y3):**
- `X-Frame-Options` header must NOT appear in HTTP responses for any route
- `Content-Security-Policy` must NOT contain `frame-ancestors 'none'` or `frame-ancestors 'self'`
- `next.config.mjs` `headers()` must explicitly suppress any default `X-Frame-Options` injection by Next.js 14
- No middleware (`middleware.ts`) may add frame-blocking headers
- `package.json` start script: `"next start -H 0.0.0.0 -p 3000"`
- `package.json` dev script: `"next dev -H 0.0.0.0 -p 3000"`
- Config file must be exactly `next.config.mjs` using ES Module `export default` syntax
- No `next.config.ts` may exist in the project root
- Verification: `curl -I http://localhost:3000/` must show absence of `X-Frame-Options`

**TechArch Implementation:**
- `next.config.mjs` — `headers()` async function configured to omit `X-Frame-Options`
- `package.json` scripts with `-H 0.0.0.0 -p 3000` flags on both `dev` and `start`
- ADR-01: `.mjs` extension mandatory; `.ts` causes Next.js 14 hard build error
- ADR-07: No `X-Frame-Options` emission; `frame-ancestors` not set restrictively

**User Stories:**
- **US-7.1:** All routes respond without `X-Frame-Options` header; no restrictive `frame-ancestors`; app renders in `<iframe>` in Chrome, Safari, Firefox — P0
- **US-7.2:** `next start` binds to `0.0.0.0:3000`; app reachable from outside container; `package.json` scripts use `-H 0.0.0.0 -p 3000` — P0
- **US-7.3:** `next.config.mjs` uses ES Module syntax; no `next.config.ts`; `npm run build` completes without error — P0

**UAT Coverage:** None (deployment/infrastructure; verified by `curl -I` and port probe)

---

## 5. Test Case Coverage

### 5.1 UAT Test Case Matrix (Playwright End-to-End)

| UAT ID | Test Scenario | Stories Covered | Feature(s) | API Endpoints Exercised | Pass Criteria |
|--------|---------------|-----------------|------------|------------------------|---------------|
| TEST-UAT-01 | Open `/`; assert note list renders with title, body snippet, pinned indicator | US-0.1, US-0.2 | F0 | SSR direct DB query | Notes visible OR "No notes yet" + "New note" button |
| TEST-UAT-02 | Open `/` with zero notes; assert "No notes yet" text and "New note" button visible | US-0.2 | F0 | SSR direct DB query | Exact text "No notes yet"; "New note" link present |
| TEST-UAT-03 | Tap "New note"; fill `title="Groceries"`, `body="milk, eggs"`; submit; assert redirect to `/` with new note visible | US-2.1 | F2, F5 | `POST /api/notes` | `201 Created`; note "Groceries" appears on `/` |
| TEST-UAT-04 | Open note; change title; click Save; assert `/` reflects updated title | US-3.2 | F3, F5 | `PUT /api/notes/[id]` | `200 OK`; updated title in list |
| TEST-UAT-05 | Open note edit page; click Delete; confirm; assert note no longer on `/` | US-3.3 | F3, F5 | `DELETE /api/notes/[id]` | `204 No Content`; note absent from list |
| TEST-UAT-06 | On `/` with multiple notes; type partial title in search; assert list narrows to matches | US-1.1 | F1 | None (client-side only) | Matching notes visible; non-matching hidden |
| TEST-UAT-07 | Create note; reload page; assert note still present | US-4.1 | F4 | SSR direct DB query | Note persists across full page reload |

### 5.2 API Test Case Matrix

| Test ID | Endpoint | Scenario | Expected Status | Expected Response | Stories |
|---------|----------|----------|-----------------|-------------------|---------|
| TEST-API-01 | `GET /api/health` | Process alive | 200 | `{"status":"ok"}` | US-5.1 |
| TEST-API-02 | `GET /api/notes` | Notes exist | 200 | Array of note objects, sorted | US-5.2 |
| TEST-API-03 | `GET /api/notes` | Empty table | 200 | `[]` | US-5.2 |
| TEST-API-04 | `GET /api/notes?q=groc` | Matching notes exist | 200 | Filtered array (ILIKE) | US-5.2 |
| TEST-API-05 | `POST /api/notes` | Valid title + body | 201 | Created note with `id`, `createdAt` | US-5.3, US-2.1 |
| TEST-API-06 | `POST /api/notes` | Missing title | 400 | `{"error":"Title is required"}` | US-5.3, US-2.2 |
| TEST-API-07 | `POST /api/notes` | Malformed JSON | 400 | `{"error":"Invalid request body"}` | US-5.3 |
| TEST-API-08 | `GET /api/notes/[id]` | Note exists | 200 | Full note object | US-5.4 |
| TEST-API-09 | `GET /api/notes/[id]` | Note not found | 404 | `{"error":"Note not found"}` | US-5.4 |
| TEST-API-10 | `GET /api/notes/[id]` | Non-integer `id` | 400 | `{"error":"Invalid id"}` | US-5.4 |
| TEST-API-11 | `PUT /api/notes/[id]` | Valid update | 200 | Updated note object | US-5.4, US-3.2 |
| TEST-API-12 | `PUT /api/notes/[id]` | Empty title | 400 | `{"error":"Title is required"}` | US-5.4, US-3.2 |
| TEST-API-13 | `PUT /api/notes/[id]` | Note not found | 404 | `{"error":"Note not found"}` | US-5.4, US-3.2 |
| TEST-API-14 | `DELETE /api/notes/[id]` | Note exists | 204 | No body | US-5.4, US-3.3 |
| TEST-API-15 | `DELETE /api/notes/[id]` | Note not found | 404 | `{"error":"Note not found"}` | US-5.4, US-3.3 |
| TEST-API-16 | `DELETE /api/notes/[id]` | Non-integer `id` | 400 | `{"error":"Invalid id"}` | US-5.4 |
| TEST-API-17 | Any route | Unsupported method (e.g., PATCH) | 405 | `{"error":"Method not allowed"}` | US-5.4 |

### 5.3 Infrastructure & Deployment Test Case Matrix

| Test ID | Check | Tool | Expected Outcome | Story |
|---------|-------|------|-----------------|-------|
| TEST-INF-01 | `curl -I http://localhost:3000/` — no `X-Frame-Options` header | curl | Header absent from response | US-7.1 |
| TEST-INF-02 | `curl -I http://localhost:3000/` — no restrictive `Content-Security-Policy: frame-ancestors` | curl | Header absent or unrestricted | US-7.1 |
| TEST-INF-03 | `ss -tlnp \| grep 3000` — server bound to `0.0.0.0` | ss / netstat | `0.0.0.0:3000` in listening state | US-7.2 |
| TEST-INF-04 | `ls next.config.*` — only `next.config.mjs` present | ls | Exactly one file: `next.config.mjs` | US-7.3 |
| TEST-INF-05 | `npm run build` — no TypeScript config parse error | npm | Exit code 0; no `next.config.ts` error | US-7.3 |
| TEST-INF-06 | Server startup with valid `DATABASE_URL` — schema exists without manual SQL | App startup | `notes` table present after cold start | US-4.2 |
| TEST-INF-07 | Server startup without `DATABASE_URL` — clear error message | App startup | Log: "DATABASE_URL environment variable is required" | US-4.2 |

### 5.4 Coverage Summary by PRD Feature

| Feature | User Stories | UAT Tests | API Tests | Infra Tests | Total Test Cases | Coverage |
|---------|-------------|-----------|-----------|-------------|-----------------|----------|
| F0: Note List View | US-0.1, US-0.2 | TEST-UAT-01, TEST-UAT-02 | — | — | 2 | 100% |
| F1: Note Search | US-1.1, US-1.2, US-1.3 | TEST-UAT-06 | — | — | 1 | 100% |
| F2: Create Note | US-2.1, US-2.2 | TEST-UAT-03 | TEST-API-05, 06, 07 | — | 4 | 100% |
| F3: Edit & Delete | US-3.1, US-3.2, US-3.3 | TEST-UAT-04, TEST-UAT-05 | TEST-API-11–16 | — | 8 | 100% |
| F4: Data Persistence | US-4.1, US-4.2 | TEST-UAT-07 | — | TEST-INF-06, 07 | 3 | 100% |
| F5: REST API | US-5.1–5.4 | TEST-UAT-01–07 (infra) | TEST-API-01–17 | — | 17 | 100% |
| F6: Mobile-First UI | US-6.1, US-6.2 | — | — | — | 0 | Visual/manual |
| F7: Iframe & Deployment | US-7.1, US-7.2, US-7.3 | — | — | TEST-INF-01–05 | 5 | 100% |
| **Total** | **21 stories** | **7** | **17** | **7** | **31** | **All functional: 100%** |

> **Note on F6 coverage:** Mobile-First UI requirements (touch targets, viewport layout, Gold accent coverage) are verified by manual QA or a dedicated visual regression suite (not included in Playwright UAT). All functional requirements are covered at 100%.

---

## 6. Change Management

### 6.1 Change Log

| Version | Date | Author | Section Changed | Description | Impact |
|---------|------|--------|-----------------|-------------|--------|
| 1.0 | 2026-06-17 | QuickNotes Team | All | Initial RTM created from PRD 1.0, FRD 1.0, TechArch 1.0, UserStories 1.0 | Baseline established |

### 6.2 Change Impact Guidelines

When a change is proposed to any source document, the following RTM sections must be reviewed and updated:

| Source Change | RTM Sections to Update |
|---------------|----------------------|
| New or modified PRD feature (F0–F7) | §3.1, §3.2, §4 (affected feature detail), §5.4 coverage summary |
| New or modified FRD requirement (F00–F07, Y0–Y3) | §3.1, §3.2, §4 (affected feature detail), §5 test cases |
| New or modified TechArch decision (ADR-01–08) | §3.1, §3.2, §4 (affected feature detail) |
| New or modified user story | §3.2, §4 (affected feature detail), §5 test cases, §5.4 summary |
| New test case | §5 test matrices, §5.4 coverage summary |
| Out-of-scope item promoted to MVP | All sections; full retracing required |

### 6.3 Traceability Integrity Rules

- Every PRD feature must have at least one FRD chunk, one TechArch decision, and one user story
- Every user story must trace to exactly one PRD feature
- Every API test case must reference at least one user story
- No user story may be added without a corresponding entry in §3.2
- No FRD chunk may be added without a corresponding PRD feature reference
- RTM version must increment whenever any source document version increments

---

## 7. Approval

### 7.1 Document Sign-Off

| Role | Name | Signature | Date | Status |
|------|------|-----------|------|--------|
| Product Owner | — | ___________________________ | 2026-06-17 | Pending |
| Tech Lead / Architect | — | ___________________________ | 2026-06-17 | Pending |
| QA Lead | — | ___________________________ | 2026-06-17 | Pending |
| Project Manager | — | ___________________________ | 2026-06-17 | Pending |

### 7.2 Traceability Completeness Checklist

| Check | Status |
|-------|--------|
| All 8 PRD features (F0–F7) have FRD traceability | ✅ Complete |
| All 8 PRD features have TechArch decision traceability | ✅ Complete |
| All 8 PRD features have at least one user story | ✅ Complete |
| All 21 user stories map to exactly one PRD feature | ✅ Complete |
| All 12 FRD chunks (F00–F07 + Y0–Y3) mapped to PRD features | ✅ Complete |
| All 8 TechArch ADRs mapped to PRD features | ✅ Complete |
| All 6 UAT scenarios (US1–US6) mapped to user stories | ✅ Complete |
| All 17 API test cases mapped to user stories | ✅ Complete |
| All 7 infra test cases mapped to user stories | ✅ Complete |
| F6 (Mobile UI) visual coverage gap acknowledged | ✅ Documented in §5.4 |
| No orphaned user stories (without PRD feature) | ✅ Confirmed |
| No orphaned PRD features (without user stories) | ✅ Confirmed |

### 7.3 Source Document Versions

| Document | Version | Date | Status |
|----------|---------|------|--------|
| PRD-QuickNotes.md | 1.0 | 2026-06-17 | Active |
| FRD-QuickNotes.md | 1.0 | 2026-06-17 | Active |
| TechArch-QuickNotes.md | 1.0 | 2026-06-17 | Active |
| UserStories-QuickNotes.md | 1.0 | 2026-06-17 | Active |
| RTM-QuickNotes.md | 1.0 | 2026-06-17 | Active (this document) |

---

*Document generated: 2026-06-17*  
*Source: PRD-QuickNotes.md, FRD-QuickNotes.md, TechArch-QuickNotes.md, UserStories-QuickNotes.md, .planning/PROJECT.md*
