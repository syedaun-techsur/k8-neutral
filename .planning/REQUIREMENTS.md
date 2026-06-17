# Requirements: QuickNotes

**Defined:** 2026-06-17
**Core Value:** A user can capture a note and reliably find it again — fast, on any mobile device, with no setup.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Data & Persistence (F4)

- [ ] **F4-01**: Auto-migration runs `CREATE TABLE IF NOT EXISTS notes (...)` on app startup — schema exists on first request with zero manual steps
- [ ] **F4-02**: All notes are stored in PostgreSQL; data survives a page reload (not in-memory)
- [ ] **F4-03**: DB connection is read from environment variables (`DATABASE_URL`); no hard-coded credentials

### API Layer (F5)

- [ ] **F5-01**: `GET /api/health` returns `200 {"status":"ok"}`
- [ ] **F5-02**: `GET /api/notes` returns all notes (newest first); supports optional `?q=` title filter
- [ ] **F5-03**: `POST /api/notes` creates a note; validates `title` non-empty; returns `201` with created note
- [ ] **F5-04**: `GET /api/notes/[id]` returns one note; returns `404` if not found
- [ ] **F5-05**: `PUT /api/notes/[id]` updates a note; validates `title` non-empty; returns `404` if not found
- [ ] **F5-06**: `DELETE /api/notes/[id]` deletes a note; returns `204` on success; returns `404` if not found

### Note List View (F0)

- [ ] **F0-01**: `/` displays all notes sorted newest-first, with pinned notes at the top of the list
- [ ] **F0-02**: Each note row shows title, a snippet of body text, and a pinned indicator
- [ ] **F0-03**: When no notes exist, `/` shows an empty-state message ("No notes yet") and a "New note" button

### Note Search (F1)

- [ ] **F1-01**: A search box on `/` filters the visible note list by title in real time (client-side; no server round-trip)
- [ ] **F1-02**: When the search matches no notes, a "No matching notes" state is shown

### Create Note (F2)

- [ ] **F2-01**: `/notes/new` presents a form with fields: title (required), body (optional), pinned toggle
- [ ] **F2-02**: Submitting the form creates the note and redirects back to `/` where the new note appears
- [ ] **F2-03**: Submitting with an empty title shows a validation error; no note is created

### Edit & Delete Note (F3)

- [ ] **F3-01**: Each note on `/` links to `/notes/[id]/edit` (pre-filled with current values)
- [ ] **F3-02**: Saving the edit form updates the note and returns the user to `/` where the change is reflected
- [ ] **F3-03**: The edit page has a Delete action; the user must confirm before deletion; after deletion the note no longer appears on `/`

### Deployment & Iframe Compatibility (F7)

- [ ] **F7-01**: The app binds to port `3000` on host `0.0.0.0`
- [ ] **F7-02**: `next.config.mjs` (or `.js`) is used — never `next.config.ts` (Next 14 hard-errors on `.ts` config)
- [ ] **F7-03**: No `X-Frame-Options` or restrictive `Content-Security-Policy: frame-ancestors` headers are emitted — the app renders in an embedded preview iframe

### Mobile-First UI (F6)

- [ ] **F6-01**: The UI is mobile-first (baseline: 360px viewport); all touch targets ≥ 44×44px
- [ ] **F6-02**: Color scheme: Gold `#FBCA5C` accent (≤10% of any view), near-black `#0A0A0A` text, white surfaces
- [ ] **F6-03**: Navigation includes Home (`/`) and New (`/notes/new`); every nav link resolves — no dead links

## v2 Requirements

Deferred to a future release.

### Enhancements

- **V2-01**: Pagination or infinite scroll for large note sets
- **V2-02**: Tags and folders for note organization
- **V2-03**: Note attachments (images, files)
- **V2-04**: Import / export (markdown, JSON)
- **V2-05**: Full-text search (body as well as title)
- **V2-06**: Keyboard shortcuts

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Authentication / login | Single-user MVP — no auth layer |
| Multi-user / sharing | MVP exclusion per spec |
| Tags, folders | MVP exclusion per spec |
| AI features | MVP exclusion per spec |
| Real-time collaboration | Out of scope |
| Mobile native app | Web-first MVP |
| OAuth / SSO | No auth in MVP |
| Notifications | No users to notify |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| F4-01 | Phase 1 | Pending |
| F4-02 | Phase 1 | Pending |
| F4-03 | Phase 1 | Pending |
| F5-01 | Phase 2 | Pending |
| F5-02 | Phase 2 | Pending |
| F5-03 | Phase 2 | Pending |
| F5-04 | Phase 2 | Pending |
| F5-05 | Phase 2 | Pending |
| F5-06 | Phase 2 | Pending |
| F0-01 | Phase 3 | Pending |
| F0-02 | Phase 3 | Pending |
| F0-03 | Phase 3 | Pending |
| F1-01 | Phase 3 | Pending |
| F1-02 | Phase 3 | Pending |
| F2-01 | Phase 3 | Pending |
| F2-02 | Phase 3 | Pending |
| F2-03 | Phase 3 | Pending |
| F3-01 | Phase 3 | Pending |
| F3-02 | Phase 3 | Pending |
| F3-03 | Phase 3 | Pending |
| F7-01 | Phase 1 | Pending |
| F7-02 | Phase 1 | Pending |
| F7-03 | Phase 1 | Pending |
| F6-01 | Phase 3 | Pending |
| F6-02 | Phase 3 | Pending |
| F6-03 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 26 total
- Mapped to phases: 26
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-17*
*Last updated: 2026-06-17 after roadmap creation — all 26 requirements mapped to phases*
