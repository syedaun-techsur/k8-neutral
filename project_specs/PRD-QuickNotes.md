# PRD: QuickNotes
**Version:** 1.0  
**Date:** 2026-06-17  
**Status:** Active  
**Project Acronym:** QuickNotes

---

## 1. Executive Summary

QuickNotes is a personal, single-user, mobile-first notes application built on Next.js 14 (App Router) with PostgreSQL persistence. It provides a fast, zero-setup experience for capturing, finding, editing, and deleting notes — four operations on one entity — accessible on any mobile device without authentication or configuration. The MVP ships with no auth, no sharing, and no AI features; its sole purpose is reliable note capture and retrieval.

---

## 2. Problem Statement

People need a lightweight, instantly accessible place to capture thoughts and find them again later. Existing tools are either too heavy (requiring account creation, onboarding, or complex UI), too fragile (local storage that gets wiped), or too slow on mobile. There is no friction-free option that:

- Works immediately without sign-up or login
- Persists reliably across page reloads and sessions
- Loads fast and is usable one-handed on a phone
- Stays simple — notes only, no folders, tags, or attachments

QuickNotes solves this by providing a minimal, database-backed notes surface that prioritizes speed and simplicity over feature breadth.

---

## 3. Product Vision

**Vision Statement:** A user can capture a note and reliably find it again — fast, on any mobile device, with no setup.

**Strategic Goals:**
- Deliver a working CRUD notes experience in the fewest possible screens
- Guarantee data persistence through PostgreSQL — notes survive restarts and reloads
- Achieve mobile-first usability: touch-friendly targets, readable typography, clean layout
- Maintain zero-friction access: no login, no onboarding, no configuration required
- Enable embedded preview via iframe by omitting all frame-blocking headers
- Establish a clean REST API contract that supports future feature expansion without breaking changes

---

## 4. Target Users

**Primary User:** A single individual (the app owner/operator) who wants a fast, private place to jot notes on a mobile device.

**User Characteristics:**
- Uses a smartphone as primary device
- Wants to capture notes in seconds, not minutes
- Does not want to create an account or remember a password
- Expects notes to persist indefinitely until explicitly deleted
- May want to pin important notes to keep them visible at the top

---

## 5. Technical Architecture

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 14 (App Router) | Hard requirement; no substitutes |
| Database | PostgreSQL | Single `notes` table; survives restarts |
| Styling | Plain CSS / CSS Modules | No Tailwind or CSS-in-JS required |
| Config | `next.config.mjs` | `.ts` config hard-errors on Next 14 |
| Runtime | Node.js on port 3000, host `0.0.0.0` | Required for container/iframe use |
| DB Credentials | Environment variables only | No hard-coded credentials |
| Migration | `CREATE TABLE IF NOT EXISTS` on first request | Zero manual setup |

**Database Schema — `notes` table:**

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `serial` | Primary key |
| `title` | `text` | NOT NULL |
| `body` | `text` | Nullable |
| `pinned` | `boolean` | NOT NULL, DEFAULT false |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() |

**Pages:**
- `/` — Note list (newest first, pinned at top)
- `/notes/new` — Create note form
- `/notes/[id]/edit` — Edit and delete note

**API Endpoints:**
- `GET /api/health` — Health check, returns `{"status":"ok"}`
- `GET /api/notes` — List all notes
- `POST /api/notes` — Create a note
- `GET /api/notes/[id]` — Fetch a single note
- `PUT /api/notes/[id]` — Update a note
- `DELETE /api/notes/[id]` — Delete a note

---

## 6. Feature Requirements

### F0: Note List View (`/`)
**Description:** The home page displays all notes sorted newest-first, with pinned notes promoted to the top of the list. Each note shows its title and provides a tap/click target to navigate to its edit page. When no notes exist, an empty state is rendered.

**Capabilities:**
- Display all notes ordered: pinned first, then by `created_at` descending
- Render an empty state with "No notes yet" message and "New note" button when the list is empty
- Provide a prominent "New note" button/link visible at all times
- Each note row is tappable and navigates to `/notes/[id]/edit`

**Priority:** P0 (Critical — MVP core screen)

---

### F1: Note Search
**Description:** A search input on the list page filters visible notes in real time by title match. Filtering is synchronous (no debounce required for MVP). No server round-trip is needed — filtering operates on the already-loaded list.

**Capabilities:**
- Search box visible on the `/` list page
- Filters notes by title as the user types (case-insensitive substring match)
- Notes not matching the query are hidden immediately
- Clearing the search restores the full list
- Empty search results show a "No matching notes" state

**Priority:** P1 (High — US3 user story requirement)

---

### F2: Create Note (`/notes/new`)
**Description:** A form page where the user enters a title (required), an optional body, and toggles a "pinned" flag before saving. On submit, the note is persisted to PostgreSQL via `POST /api/notes` and the user is redirected to the list.

**Capabilities:**
- Title field (text input, required — form validation prevents empty submit)
- Body field (textarea, optional)
- Pinned toggle (checkbox or switch, defaults to unchecked)
- Submit button creates the note and redirects to `/`
- Cancel/back navigation returns to `/` without saving

**Priority:** P0 (Critical — US2 user story requirement)

---

### F3: Edit Note (`/notes/[id]/edit`)
**Description:** Clicking a note from the list opens its edit page, pre-populated with current title, body, and pinned state. The user can modify any field and save, or delete the note with a confirmation step.

**Capabilities:**
- Form pre-filled with the note's existing title, body, and pinned state
- Save button persists changes via `PUT /api/notes/[id]` and redirects to `/`
- Delete button triggers a confirmation prompt (browser `confirm()` or inline UI)
- Confirmed delete calls `DELETE /api/notes/[id]` and redirects to `/`
- Note disappears from the list immediately after deletion

**Priority:** P0 (Critical — US4/US5 user story requirement)

---

### F4: Data Persistence
**Description:** All note data is stored in PostgreSQL. Notes survive page reloads, browser closes, and server restarts. The database schema is auto-created on first request with no manual migration steps required.

**Capabilities:**
- `notes` table is created via `CREATE TABLE IF NOT EXISTS` before the first request is handled
- All CRUD operations read from and write to PostgreSQL
- DB connection string is read from environment variables (no hard-coded credentials)
- No data loss on server restart

**Priority:** P0 (Critical — US6 user story requirement)

---

### F5: REST API
**Description:** A complete REST API backs all UI operations and is independently usable. The API follows predictable resource-oriented conventions and returns JSON.

**Capabilities:**
- `GET /api/health` — returns `200 {"status":"ok"}` with no database dependency
- `GET /api/notes` — returns array of all notes (newest first, pinned first)
- `POST /api/notes` — creates a note; validates title is non-empty; returns the created note
- `GET /api/notes/[id]` — returns a single note or `404`
- `PUT /api/notes/[id]` — updates title, body, and/or pinned; returns updated note
- `DELETE /api/notes/[id]` — deletes the note; returns `204` or `200`

**Priority:** P0 (Critical — infrastructure for all UI features)

---

### F6: Mobile-First UI & Design System
**Description:** The application is designed mobile-first with a minimal, high-contrast visual language. A Gold accent color (`#FBCA5C`) is used sparingly (≤10% of any view surface). Text uses near-black (`#0A0A0A`) on white surfaces.

**Capabilities:**
- Responsive layout that works on 375px–428px mobile viewport widths
- Touch-friendly tap targets (minimum 44×44px)
- Gold `#FBCA5C` used as accent on CTAs and highlights, ≤10% of any screen
- Near-black `#0A0A0A` for body text; white (`#FFFFFF`) for surfaces
- No layout breakage on desktop — mobile design scales up gracefully
- Readable font sizes: minimum 16px for body text on mobile

**Priority:** P1 (High — core UX requirement)

---

### F7: Iframe & Deployment Compatibility
**Description:** The app must render correctly when embedded in an iframe (e.g., a preview panel) and must not emit HTTP headers that block framing. The app binds to `0.0.0.0:3000` to be accessible in containerized or proxied environments.

**Capabilities:**
- No `X-Frame-Options` header emitted
- No `Content-Security-Policy: frame-ancestors` restrictive directive
- Server listens on `0.0.0.0:3000`
- Config uses `next.config.mjs` (never `.ts`)

**Priority:** P0 (Critical — runtime constraint)

---

## 7. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Performance | List page loads and renders all notes in < 500ms on a standard connection |
| Performance | Search filtering responds within one animation frame (no perceptible lag on ≤200 notes) |
| Reliability | PostgreSQL auto-migration runs idempotently — safe to restart the server multiple times |
| Reliability | API returns consistent JSON error shapes for 4xx/5xx responses |
| Usability | All interactive elements meet 44×44px minimum touch target size |
| Usability | Forms display inline validation errors without a page reload |
| Compatibility | App renders correctly in latest Chrome, Safari, and Firefox mobile browsers |
| Compatibility | App is embeddable in an iframe without header-based restrictions |
| Security | No credentials hard-coded in source; DB URL sourced from environment only |
| Security | No authentication layer — single-user, operator-trusted environment |
| Maintainability | `next.config.mjs` only; no TypeScript config file for Next 14 compatibility |
| Maintainability | Single `notes` table; schema changes via additive `ALTER TABLE` if needed in future |

---

## 8. User Stories

| ID | Story | Feature |
|----|-------|---------|
| US1 | As a user, I can view a list of all my notes on `/`, newest first, pinned notes at the top | F0 |
| US2 | As a user, I can navigate to `/notes/new` and create a note with title (required), body (optional), and pinned flag | F2 |
| US3 | As a user, I can search notes by title using a search box that filters in real time | F1 |
| US4 | As a user, I can click a note to open `/notes/[id]/edit` and edit its title, body, or pinned state | F3 |
| US5 | As a user, I can delete a note from its edit page (with confirmation), and it disappears from the list | F3 |
| US6 | As a user, all my notes persist in PostgreSQL and survive a page reload | F4 |

---

## 9. Success Metrics

- **US1–US6 all pass** Playwright UAT end-to-end tests against the running application
- **`GET /api/health` returns 200** — server is up and responsive
- **Zero manual migration steps** — fresh container startup results in a working schema without DBA intervention
- **Notes survive server restart** — data persists across process kills and restarts
- **Iframe renders without errors** — app loads cleanly in an embedded preview panel
- **Mobile viewport usable** — no horizontal scroll, no overlapping elements at 375px width
- **Search filters correctly** — typing in the search box shows only matching notes within one keypress latency

---

## 10. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| `next.config.ts` used instead of `.mjs` causing hard build error | Medium | High | Enforce `.mjs` in project setup; linter/CI check |
| Frame-blocking headers added by Next.js defaults or middleware | Low | High | Explicitly configure headers in `next.config.mjs` to omit X-Frame-Options |
| Auto-migration fails silently — app starts but schema missing | Low | High | Wrap migration in startup check; health endpoint verifies DB connectivity |
| PostgreSQL not available at startup — app crashes | Medium | High | Implement retry logic or clear startup error with actionable message |
| Hard-coded DB credentials committed to source | Low | High | `.env` in `.gitignore`; document env var requirements in README |
| Empty title bypasses validation — blank notes created | Medium | Medium | Server-side validation on `POST /api/notes` rejects missing/empty title |
| Search performance degrades with large note counts | Low | Low | MVP syncs over in-memory list; acceptable for personal single-user use |

---

## 11. Out of Scope (MVP)

The following are explicitly excluded from this release:

- **Authentication** — no login, sessions, or user accounts
- **Multi-user / sharing** — single operator only
- **Tags, folders, categories** — flat list only
- **File or image attachments** — text-only notes
- **Import / export** — no bulk operations
- **Pagination or infinite scroll** — full list rendered synchronously
- **Search debounce optimization** — synchronous filtering is acceptable for MVP scale
- **AI features** — no summarization, suggestions, or auto-tagging
- **Dark mode** — single light theme only
- **Offline support / PWA** — no service worker

---

## 12. Feature Index

| ID | Feature | Priority | User Stories | Status |
|----|---------|----------|-------------|--------|
| F0 | Note List View | P0 — Critical | US1 | Pending |
| F1 | Note Search | P1 — High | US3 | Pending |
| F2 | Create Note | P0 — Critical | US2 | Pending |
| F3 | Edit & Delete Note | P0 — Critical | US4, US5 | Pending |
| F4 | Data Persistence & Auto-Migration | P0 — Critical | US6 | Pending |
| F5 | REST API | P0 — Critical | US1–US6 (infra) | Pending |
| F6 | Mobile-First UI & Design System | P1 — High | All | Pending |
| F7 | Iframe & Deployment Compatibility | P0 — Critical | — | Pending |

**Priority Summary:**
- **P0 (Critical / MVP blockers):** F0, F2, F3, F4, F5, F7 — 6 features
- **P1 (High / MVP scope):** F1, F6 — 2 features
- **P2/P3 (Deferred):** See Out of Scope section

---

*Document generated: 2026-06-17*  
*Source: `.planning/PROJECT.md`*  
*Downstream documents: FRD-QuickNotes.md, TechArch-QuickNotes.md, UserStories-QuickNotes.md*
