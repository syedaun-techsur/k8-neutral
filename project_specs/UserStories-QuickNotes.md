# User Stories: QuickNotes

| Field | Value |
|-------|-------|
| **Product Name** | QuickNotes |
| **Version** | 1.0 |
| **Date** | 2026-06-17 |
| **Status** | Active |
| **Source PRD** | PRD-QuickNotes.md |
| **Source FRD** | FRD-QuickNotes.md |
| **Personas** | PERSONAS-QuickNotes.md |

---

## Priority Definitions

| Priority | Label | Description |
|----------|-------|-------------|
| P0 | Critical | MVP blocker — app cannot ship without this |
| P1 | High | MVP scope — included in first release |
| P2 | Medium | Deferred — post-MVP enhancement |
| P3 | Low | Nice-to-have — out of scope for now |

---

## Personas

| ID | Name | Role |
|----|------|------|
| PER-01 | Alex Moreno | Daily Note-Taker (App Owner / primary end user) |
| PER-02 | Jordan Kim | Developer / Operator (self-hoster, deployer) |

---

## Epic 0: Note List View (F0)

> The home page (`/`) is the application's primary screen. It displays all notes sorted pinned-first then newest-first, with an empty state when no notes exist.

### US-0.1: View List of Notes
**As** Alex Moreno, **I want to** open `/` and see all my notes listed with their title, a snippet of the body, and a pinned indicator, **so that** I can quickly scan what I've captured and navigate to the one I need.

**Acceptance Criteria:**
- [ ] Navigating to `/` renders a list of all notes from the database
- [ ] Each note row displays the note's title
- [ ] Each note row displays a snippet (partial content) of the body
- [ ] Pinned notes display a visual pinned indicator (icon, badge, or highlight)
- [ ] Pinned notes appear above non-pinned notes (`ORDER BY pinned DESC, created_at DESC`)
- [ ] Non-pinned notes appear newest-first within their group
- [ ] Each note row is tappable and navigates to `/notes/[id]/edit`
- [ ] A "New note" button or link is always visible regardless of list contents

**UAT Reference:** US1 — *Opening `/` shows list of notes (title, snippet of body, pinned indicator).*

**Priority:** P0 | **Feature Ref:** F0

---

### US-0.2: View Empty State When No Notes Exist
**As** Alex Moreno, **I want to** see a clear message and a call-to-action when I have no notes yet, **so that** I know the app is working and I can immediately create my first note.

**Acceptance Criteria:**
- [ ] When the `notes` table has zero rows, `/` renders an empty state
- [ ] The empty state displays the exact text "No notes yet"
- [ ] A "New note" button is visible in the empty state and navigates to `/notes/new`
- [ ] No note list rows are rendered when the database is empty

**UAT Reference:** US1 — *With none, "No notes yet" and a "New note" button appear.*

**Priority:** P0 | **Feature Ref:** F0

---

## Epic 1: Note Search (F1)

> A search input on the list page filters visible notes in real time by case-insensitive title match, entirely client-side with no server round-trip.

### US-1.1: Filter Notes by Title in Real Time
**As** Alex Moreno, **I want to** type part of a title in the search box on `/` and have the list narrow immediately to matching notes, **so that** I can find a specific note quickly without scrolling through the full list.

**Acceptance Criteria:**
- [ ] A search input is visible on the `/` list page at all times, including when the list is empty
- [ ] As the user types, note rows not matching the input are hidden immediately (no page navigation)
- [ ] Matching is case-insensitive substring match on the `title` field only (body is not searched)
- [ ] Filtering begins on the first character typed — no minimum character threshold
- [ ] Sort order of visible results is preserved (pinned first, then newest-first)
- [ ] No API call or server round-trip is made during search interactions
- [ ] Filtering is synchronous — no debounce, no setTimeout

**UAT Reference:** US5 — *With several notes, typing part of a title in the search box narrows the list to matches.*

**Priority:** P1 | **Feature Ref:** F1

---

### US-1.2: Clear Search to Restore Full List
**As** Alex Moreno, **I want to** clear the search box and have all my notes reappear, **so that** I can browse the full list again after searching.

**Acceptance Criteria:**
- [ ] Clearing the search input (emptying it to an empty string) restores the full, unfiltered note list
- [ ] The restored list uses the same sort order as the initial page load (pinned first, then newest-first)
- [ ] Search input remains visible and focused after clearing

**Priority:** P1 | **Feature Ref:** F1

---

### US-1.3: See No-Match State When Search Yields No Results
**As** Alex Moreno, **I want to** see a clear message when my search matches nothing, **so that** I know the app is working and my search term simply has no results.

**Acceptance Criteria:**
- [ ] When the search input is non-empty and zero notes match, display the exact text "No matching notes"
- [ ] The search input remains visible and editable in the no-match state
- [ ] No note rows are rendered in the no-match state
- [ ] Modifying the search input immediately re-evaluates and updates the displayed state

**Priority:** P1 | **Feature Ref:** F1

---

## Epic 2: Create Note (F2)

> The `/notes/new` page presents a form to capture a new note with a required title, optional body, and pinned toggle. On success the note is persisted to PostgreSQL and the user is redirected to `/`.

### US-2.1: Create a New Note with Title and Body
**As** Alex Moreno, **I want to** tap "New note," fill in a title and optional body, and submit, **so that** my note is saved and immediately appears in the list.

**Acceptance Criteria:**
- [ ] Navigating to `/notes/new` renders a form with a title text input, a body textarea, and a pinned checkbox
- [ ] The title field is empty by default and marked as required
- [ ] The body textarea is empty by default and optional
- [ ] The pinned checkbox defaults to unchecked
- [ ] Submitting the form with a valid title sends `POST /api/notes` with `{ title, body, pinned }`
- [ ] On `201 Created`, the user is redirected to `/`
- [ ] The newly created note appears in the list on `/` (at the top of pinned or non-pinned section as appropriate)
- [ ] A "Cancel" link or button navigates back to `/` without saving any data

**UAT Reference:** US2 — *Tap "New note", fill title="Groceries", body="milk, eggs", submit, return to `/` where new note appears.*

**Priority:** P0 | **Feature Ref:** F2

---

### US-2.2: Prevent Submission of a Note Without a Title
**As** Alex Moreno, **I want to** be told immediately if I forget to enter a title, **so that** I don't accidentally save a blank note.

**Acceptance Criteria:**
- [ ] Submitting the form with an empty or whitespace-only title does not send an API request
- [ ] An inline validation error "Title is required" appears adjacent to the title field
- [ ] The form is not cleared — all entered values are retained after the validation error
- [ ] If the server returns a `400` with `{"error":"Title is required"}`, the error is displayed inline
- [ ] If the server returns a `500` or the request fails, a generic error "Failed to save note. Please try again." is shown

**Priority:** P0 | **Feature Ref:** F2

---

## Epic 3: Edit & Delete Note (F3)

> Tapping a note from the list opens `/notes/[id]/edit`, pre-populated with current data. The user can save edits or delete the note with confirmation. Both actions redirect to `/` on success.

### US-3.1: Open a Note's Edit Page Pre-Filled with Current Data
**As** Alex Moreno, **I want to** tap a note from the list and see its current title, body, and pinned state already filled in, **so that** I can edit only what needs changing without re-entering everything.

**Acceptance Criteria:**
- [ ] Tapping a note row on `/` navigates to `/notes/[id]/edit`
- [ ] The edit form is pre-filled with the note's current `title`, `body`, and `pinned` values from the database
- [ ] All three fields are editable
- [ ] If the note `id` does not exist, the page renders a "Note not found" message with a link back to `/`

**Priority:** P0 | **Feature Ref:** F3

---

### US-3.2: Edit and Save a Note
**As** Alex Moreno, **I want to** change a note's title (or body or pinned state) and save it, **so that** the list immediately reflects the updated information.

**Acceptance Criteria:**
- [ ] Modifying any field and clicking "Save" sends `PUT /api/notes/[id]` with `{ title, body, pinned }`
- [ ] On `200 OK`, the user is redirected to `/`
- [ ] The updated title is visible in the note list on `/` immediately after redirect
- [ ] Saving with an empty or whitespace-only title shows inline error "Title is required" and does not send the request
- [ ] On `404` from PUT (note deleted elsewhere), display "This note no longer exists." with a link to `/`
- [ ] On `500` or network error, display "Failed to save note. Please try again."

**UAT Reference:** US3 — *Open a note, change the title, save, and the list reflects it.*

**Priority:** P0 | **Feature Ref:** F3

---

### US-3.3: Delete a Note with Confirmation
**As** Alex Moreno, **I want to** delete an outdated note from its edit page after confirming, **so that** my list stays clean and the deleted note is gone immediately.

**Acceptance Criteria:**
- [ ] A "Delete" button is visible on `/notes/[id]/edit`
- [ ] Clicking "Delete" triggers a confirmation prompt before any request is sent (browser `confirm()` or equivalent inline UI)
- [ ] Cancelling the confirmation leaves the form open with no changes
- [ ] Confirming sends `DELETE /api/notes/[id]`
- [ ] On `204 No Content`, the user is redirected to `/` and the deleted note no longer appears in the list
- [ ] On `404` (note already deleted), the user is redirected to `/` (treated as successful deletion)
- [ ] On `500` or network error, display "Failed to delete note. Please try again." without redirecting

**UAT Reference:** US4 — *From a note edit page, tap Delete, confirm, and it no longer appears on `/`.*

**Priority:** P0 | **Feature Ref:** F3

---

## Epic 4: Data Persistence (F4)

> All notes are stored durably in PostgreSQL. The database schema is auto-created at startup with no manual steps. Notes survive page reloads, browser closes, and server restarts.

### US-4.1: Notes Persist Across Page Reloads
**As** Alex Moreno, **I want to** close my browser tab and reopen the app later to find all my notes still there, **so that** I can trust the app as a reliable capture tool.

**Acceptance Criteria:**
- [ ] All notes created via the UI are stored in PostgreSQL, not in browser memory or localStorage
- [ ] Reloading `/` after creating or editing notes shows the current database state
- [ ] Notes are present after the browser tab is closed and reopened
- [ ] Notes survive a server process restart (data is not held in-memory)

**UAT Reference:** US6 — *Data survives a page reload (stored in PostgreSQL, not in memory).*

**Priority:** P0 | **Feature Ref:** F4

---

### US-4.2: Database Schema Auto-Migrates on Startup
**As** Jordan Kim, **I want to** start the app in a fresh container with only a `DATABASE_URL` environment variable set, and have the app work immediately without running any SQL commands manually, **so that** I can deploy and forget without DBA intervention.

**Acceptance Criteria:**
- [ ] On application startup, `CREATE TABLE IF NOT EXISTS notes (...)` is executed automatically before any HTTP request is served
- [ ] The migration is idempotent — running it multiple times (server restarts) produces no errors and no data loss
- [ ] If `DATABASE_URL` is not set, the application fails with a clear error message: "DATABASE_URL environment variable is required"
- [ ] If the database is unreachable at startup, the error is logged to stdout/stderr with a clear message
- [ ] No manual SQL scripts, CLI commands, or DBA steps are required for a fresh deployment

**Priority:** P0 | **Feature Ref:** F4

---

## Epic 5: REST API (F5)

> A complete REST API backs all UI operations and is independently usable. All endpoints return JSON and use standard HTTP status codes.

### US-5.1: Health Check Endpoint Always Responds
**As** Jordan Kim, **I want to** curl `GET /api/health` and get `{"status":"ok"}` regardless of database state, **so that** I can confirm the app process is alive without needing a working database connection.

**Acceptance Criteria:**
- [ ] `GET /api/health` returns `200 OK` with body `{"status":"ok"}`
- [ ] The endpoint has no database dependency — it responds even if PostgreSQL is down
- [ ] No authentication is required
- [ ] Response `Content-Type` is `application/json`

**Priority:** P0 | **Feature Ref:** F5

---

### US-5.2: List All Notes via API
**As** Jordan Kim, **I want to** call `GET /api/notes` and receive a JSON array of all notes sorted pinned-first then newest-first, **so that** I can inspect or script against the data without using the UI.

**Acceptance Criteria:**
- [ ] `GET /api/notes` returns `200 OK` with a JSON array of note objects
- [ ] Each note object contains: `id`, `title`, `body`, `pinned`, `createdAt` (camelCase)
- [ ] Notes are ordered: `pinned DESC, created_at DESC`
- [ ] Returns an empty array `[]` when no notes exist (not a 404)
- [ ] Optional `?q=` query parameter filters by case-insensitive title substring (ILIKE on server)
- [ ] Returns `500 {"error":"Database error"}` on PostgreSQL failure

**Priority:** P0 | **Feature Ref:** F5

---

### US-5.3: Create a Note via API
**As** Jordan Kim, **I want to** `POST /api/notes` with a JSON body and receive the created note back, **so that** I can script note creation without using the browser UI.

**Acceptance Criteria:**
- [ ] `POST /api/notes` with `{ "title": "...", "body": "...", "pinned": false }` returns `201 Created` with the full note object
- [ ] `title` is required — missing or empty title returns `400 {"error":"Title is required"}`
- [ ] `body` defaults to `null` if omitted; `pinned` defaults to `false` if omitted
- [ ] Malformed JSON body returns `400 {"error":"Invalid request body"}`
- [ ] Returned note object includes server-assigned `id` and `createdAt`

**Priority:** P0 | **Feature Ref:** F5

---

### US-5.4: Fetch, Update, and Delete a Single Note via API
**As** Jordan Kim, **I want to** use `GET`, `PUT`, and `DELETE` on `/api/notes/[id]` to read, modify, and remove individual notes, **so that** I have full programmatic control over note data.

**Acceptance Criteria:**
- [ ] `GET /api/notes/[id]` returns `200 OK` with the full note object, or `404 {"error":"Note not found"}` if not found
- [ ] `PUT /api/notes/[id]` with `{ title, body, pinned }` returns `200 OK` with the updated note object
- [ ] `PUT` with empty title returns `400 {"error":"Title is required"}`
- [ ] `PUT` on a non-existent note returns `404 {"error":"Note not found"}`
- [ ] `DELETE /api/notes/[id]` returns `204 No Content` on success
- [ ] `DELETE` on a non-existent note returns `404 {"error":"Note not found"}`
- [ ] Non-numeric or negative `[id]` returns `400 {"error":"Invalid id"}` for all three methods
- [ ] Unsupported HTTP methods on any route return `405 {"error":"Method not allowed"}`

**Priority:** P0 | **Feature Ref:** F5

---

## Epic 6: Mobile-First UI & Design System (F6)

> The application is designed mobile-first with a Gold accent (`#FBCA5C`), near-black text (`#0A0A0A`), white surfaces, and minimum 44×44px touch targets. No horizontal scroll at 375px viewport width.

### US-6.1: Use the App Comfortably One-Handed on Mobile
**As** Alex Moreno, **I want to** navigate, read, and tap all controls on a 375px phone screen with one hand and no zooming, **so that** I can capture and find notes during commutes and busy moments.

**Acceptance Criteria:**
- [ ] All pages render without horizontal scroll at 375px viewport width
- [ ] All interactive elements (buttons, links, inputs, checkboxes) have a computed tap target of at least 44×44px
- [ ] Body text renders at a minimum font size of 16px at 375px viewport width
- [ ] Layout scales up gracefully on wider viewports (tablet/desktop) without breaking or overflowing
- [ ] No layout breakage or JS errors at viewports narrower than 375px (degraded but not crashed)

**Priority:** P1 | **Feature Ref:** F6

---

### US-6.2: See a Visually Consistent Design with Gold Accent
**As** Alex Moreno, **I want to** see a clean, high-contrast UI with a consistent color palette, **so that** the app feels polished and the key actions (New note, Save) are easy to spot.

**Acceptance Criteria:**
- [ ] Primary text and headings render in near-black `#0A0A0A`
- [ ] Page and card backgrounds are white `#FFFFFF`
- [ ] The Gold accent color `#FBCA5C` is applied to CTAs ("New note" button, "Save"/"Create" button) and pinned indicators
- [ ] Gold accent coverage does not exceed 10% of total visible pixel area on any single view
- [ ] Pinned notes are visually distinguished from non-pinned notes (icon, border, badge, or color)
- [ ] CSS is implemented with plain CSS or CSS Modules (no Tailwind required)

**Priority:** P1 | **Feature Ref:** F6

---

## Epic 7: Iframe & Deployment Compatibility (F7)

> The app must render in an `<iframe>` without frame-blocking headers, bind to `0.0.0.0:3000`, and use `next.config.mjs` (never `.ts`).

### US-7.1: Embed the App in an Iframe Without Errors
**As** Jordan Kim, **I want to** include the QuickNotes URL in a dashboard `<iframe>` and have it render fully without CSP or `X-Frame-Options` errors, **so that** I can use it as an embedded preview panel in a broader tool.

**Acceptance Criteria:**
- [ ] HTTP responses for all routes do NOT include an `X-Frame-Options` header
- [ ] HTTP responses do NOT include a `Content-Security-Policy` header with `frame-ancestors 'none'` or `frame-ancestors 'self'`
- [ ] The app renders correctly inside an `<iframe>` in Chrome, Safari, and Firefox
- [ ] No middleware or Next.js defaults introduce frame-blocking headers

**Priority:** P0 | **Feature Ref:** F7

---

### US-7.2: Access the App from Outside a Container
**As** Jordan Kim, **I want to** start the app in a container and reach it from my host machine on port 3000, **so that** the app is accessible in containerized or reverse-proxied environments without network configuration hacks.

**Acceptance Criteria:**
- [ ] The Next.js server binds to `0.0.0.0:3000` (not `127.0.0.1`)
- [ ] The `package.json` start script is `"next start -H 0.0.0.0 -p 3000"`
- [ ] The dev script also uses `-H 0.0.0.0 -p 3000` for consistency
- [ ] The app is reachable from outside the container on port 3000 after a standard `npm start`

**Priority:** P0 | **Feature Ref:** F7

---

### US-7.3: Deploy Successfully with next.config.mjs
**As** Jordan Kim, **I want to** run `npm run build` and have it complete without errors, **so that** I don't waste time debugging cryptic Next.js config parse failures.

**Acceptance Criteria:**
- [ ] The project contains `next.config.mjs` using ES Module syntax (`export default { ... }`)
- [ ] No `next.config.ts` file exists in the project
- [ ] `npm run build` completes without a TypeScript config parse error
- [ ] The config file correctly omits frame-blocking header configuration

**Priority:** P0 | **Feature Ref:** F7

---

## Story Index

| Story ID | Title | Persona | Priority | Feature Ref |
|----------|-------|---------|----------|-------------|
| US-0.1 | View List of Notes | Alex Moreno | P0 | F0 |
| US-0.2 | View Empty State When No Notes Exist | Alex Moreno | P0 | F0 |
| US-1.1 | Filter Notes by Title in Real Time | Alex Moreno | P1 | F1 |
| US-1.2 | Clear Search to Restore Full List | Alex Moreno | P1 | F1 |
| US-1.3 | See No-Match State When Search Yields No Results | Alex Moreno | P1 | F1 |
| US-2.1 | Create a New Note with Title and Body | Alex Moreno | P0 | F2 |
| US-2.2 | Prevent Submission of a Note Without a Title | Alex Moreno | P0 | F2 |
| US-3.1 | Open a Note's Edit Page Pre-Filled with Current Data | Alex Moreno | P0 | F3 |
| US-3.2 | Edit and Save a Note | Alex Moreno | P0 | F3 |
| US-3.3 | Delete a Note with Confirmation | Alex Moreno | P0 | F3 |
| US-4.1 | Notes Persist Across Page Reloads | Alex Moreno | P0 | F4 |
| US-4.2 | Database Schema Auto-Migrates on Startup | Jordan Kim | P0 | F4 |
| US-5.1 | Health Check Endpoint Always Responds | Jordan Kim | P0 | F5 |
| US-5.2 | List All Notes via API | Jordan Kim | P0 | F5 |
| US-5.3 | Create a Note via API | Jordan Kim | P0 | F5 |
| US-5.4 | Fetch, Update, and Delete a Single Note via API | Jordan Kim | P0 | F5 |
| US-6.1 | Use the App Comfortably One-Handed on Mobile | Alex Moreno | P1 | F6 |
| US-6.2 | See a Visually Consistent Design with Gold Accent | Alex Moreno | P1 | F6 |
| US-7.1 | Embed the App in an Iframe Without Errors | Jordan Kim | P0 | F7 |
| US-7.2 | Access the App from Outside a Container | Jordan Kim | P0 | F7 |
| US-7.3 | Deploy Successfully with next.config.mjs | Jordan Kim | P0 | F7 |

**Total:** 21 stories across 8 epics

---

## UAT Traceability (Playwright Tests)

The following UAT user stories drive Playwright end-to-end tests and are represented literally in the acceptance criteria above:

| UAT ID | Literal Statement | Story Mapping |
|--------|-------------------|---------------|
| US1 | Opening `/` shows list of notes (title, snippet of body, pinned indicator). With none, "No notes yet" and a "New note" button appear. | US-0.1, US-0.2 |
| US2 | From `/`, tap "New note", fill title="Groceries", body="milk, eggs", submit, return to `/` where new note appears. | US-2.1 |
| US3 | Open a note, change the title, save, and the list reflects it. | US-3.2 |
| US4 | From a note edit page, tap Delete, confirm, and it no longer appears on `/`. | US-3.3 |
| US5 | With several notes, typing part of a title in the search box narrows the list to matches. | US-1.1 |
| US6 | Data survives a page reload (stored in PostgreSQL, not in memory). | US-4.1 |

---

*Document generated: 2026-06-17*
*Source: PRD-QuickNotes.md, FRD-QuickNotes.md, PERSONAS-QuickNotes.md, .planning/PROJECT.md*
