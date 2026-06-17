# QuickNotes

## What This Is

QuickNotes is a personal, single-user, mobile-first notes app built on Next.js 14 (App Router) with PostgreSQL. It lets a user jot a note, find it later, edit it, or delete it — four operations on one entity. MVP only: no auth, no sharing, no AI.

## Core Value

A user can capture a note and reliably find it again — fast, on any mobile device, with no setup.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User can view a list of all notes on `/`, newest first, pinned notes at the top
- [ ] Empty state on `/` shows "No notes yet" message and a "New note" button
- [ ] User can search notes by title using a search box that filters in real time
- [ ] User can navigate to `/notes/new` and create a note with title (required), body (optional), and pinned flag
- [ ] User can click a note on `/` to open `/notes/[id]/edit` and edit it
- [ ] User can delete a note from its edit page (with confirmation), and it disappears from the list
- [ ] All note data persists in PostgreSQL (survives page reload)
- [ ] Database schema auto-migrates on app startup — no manual steps required
- [ ] `GET /api/health` returns `200 {"status":"ok"}`
- [ ] REST API: GET/POST `/api/notes`, GET/PUT/DELETE `/api/notes/[id]` all behave per spec
- [ ] App runs on port 3000 bound to 0.0.0.0
- [ ] No frame-blocking headers (X-Frame-Options or CSP frame-ancestors) so app renders in iframe
- [ ] `next.config.mjs` (or `.js`) — never `next.config.ts`
- [ ] Mobile-first UI: Gold `#FBCA5C` accent (≤10% of any view), near-black `#0A0A0A` text, white surfaces

### Out of Scope

- Authentication — MVP is single-user, no login needed
- Multi-user / sharing — out of scope per spec
- Tags, folders, attachments — MVP exclusions
- Import/export, pagination, AI — deferred
- Infinite scroll or search-as-you-type debounce optimization — MVP filters synchronously

## Context

- **Stack:** Next.js 14 (App Router), PostgreSQL, Plain CSS / CSS Modules
- **Runtime config:** DB connection read from environment variables — no hard-coded credentials
- **Migration strategy:** `CREATE TABLE IF NOT EXISTS` executed automatically before the server handles its first request
- **Port/host:** `0.0.0.0:3000`
- **Iframe compatibility:** Do not emit `X-Frame-Options` or `frame-ancestors` restrictive headers
- **Config file:** `next.config.mjs` (Next 14 cannot parse `next.config.ts`)
- **User stories US1–US6** drive Playwright UAT and must be literally true in implementation

## Constraints

- **Tech stack:** Next.js 14 (App Router) + PostgreSQL — no substitutes
- **Config file:** `next.config.mjs` or `.js` — TypeScript config (`next.config.ts`) hard-errors on Next 14
- **Port:** 3000, host `0.0.0.0`
- **Auto-migration:** Schema must exist on first request with zero manual steps
- **No frame-blocking headers:** Required for embedded preview iframe
- **No auth:** Single-user, no authentication layer whatsoever
- **Plain CSS:** CSS Modules or plain CSS — no Tailwind or CSS-in-JS required (but not prohibited)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js 14 App Router | Specified in requirements | — Pending |
| PostgreSQL for persistence | Specified; notes must survive page reload | — Pending |
| `next.config.mjs` | Next 14 cannot parse `.ts` config — hard-error | — Pending |
| Auto-migration on startup | Zero manual setup required by spec | — Pending |
| No frame-blocking headers | App renders in embedded preview iframe | — Pending |
| Single `notes` table | One entity, four operations — MVP simplicity | — Pending |
| Gold `#FBCA5C` on near-black `#0A0A0A` | UI spec; ≤10% accent coverage | — Pending |

---
*Last updated: 2026-06-17 after initialization*
