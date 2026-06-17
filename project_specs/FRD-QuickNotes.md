# FRD: QuickNotes

**Document Type:** Functional Requirements Document  
**Version:** 1.0  
**Date:** 2026-06-17  
**Status:** Active  
**Project Acronym:** QuickNotes  
**Source PRD:** `project_specs/PRD-QuickNotes.md`

---

## Scope

This document specifies the functional behavior of all QuickNotes features in enough detail for a developer to implement the application without ambiguity. It covers the eight features defined in PRD-QuickNotes.md (F0–F7), the single `notes` database table, the complete REST API surface, and all error states. QuickNotes is a single-user, no-auth, mobile-first notes application built on Next.js 14 (App Router) with PostgreSQL persistence.

---

## Conventions

- **Feature IDs** match the PRD: F0 (Note List View), F1 (Note Search), F2 (Create Note), F3 (Edit & Delete Note), F4 (Data Persistence), F5 (REST API), F6 (Mobile-First UI), F7 (Iframe & Deployment Compatibility).
- **HTTP status codes** are canonical (200 OK, 201 Created, 204 No Content, 400 Bad Request, 404 Not Found, 405 Method Not Allowed, 500 Internal Server Error).
- **JSON payloads** use camelCase keys in API responses even though PostgreSQL columns use snake_case. Column names map: `created_at` → `createdAt`.
- **`[id]`** in route notation refers to a PostgreSQL `serial` integer value.
- **"redirect"** means a Next.js server-side redirect (via `redirect()`) or client-side navigation — whichever is appropriate to the rendering strategy used.
- **"pre-filled"** means the form field's initial value is set from the database record before the page renders.
- **Cross-references** use the format `see F03 §Process` or `see Y1-api.md §Notes`.

---

## Table of Contents

| Chunk | Description |
|-------|-------------|
| `F00-note-list-view.md` | F0: Note List View (`/`) |
| `F01-note-search.md` | F1: Note Search |
| `F02-create-note.md` | F2: Create Note (`/notes/new`) |
| `F03-edit-delete-note.md` | F3: Edit & Delete Note (`/notes/[id]/edit`) |
| `F04-data-persistence.md` | F4: Data Persistence & Auto-Migration |
| `F05-rest-api.md` | F5: REST API |
| `F06-mobile-ui.md` | F6: Mobile-First UI & Design System |
| `F07-iframe-deployment.md` | F7: Iframe & Deployment Compatibility |
| `Y0-schema.md` | Database Schema (DDL) |
| `Y1-api.md` | REST API Endpoint Catalog |
| `Y2-errors.md` | Cross-Feature Error Catalog |
| `Y3-integrations.md` | External Integration Points |

---

## Cross-Cutting Terminology

| Term | Definition |
|------|------------|
| **Note** | The single data entity: a user-authored text record with a title, optional body, pinned flag, and creation timestamp |
| **Pinned** | A boolean flag on a note that promotes it to the top of all sorted lists |
| **Auto-migration** | Execution of `CREATE TABLE IF NOT EXISTS notes (...)` at application startup before any request is served |
| **App Router** | Next.js 14's file-system routing convention using the `app/` directory |
| **Route Handler** | Next.js App Router API file (`app/api/.../route.ts` or `route.js`) that exports named HTTP method functions |
| **Server Action** | Next.js App Router mechanism for calling server-side functions from a form without a client-side fetch |
| **`[id]`** | Dynamic route segment representing the integer primary key of a note |
| **Empty state** | The UI rendered when a list has zero items |
| **Confirmation step** | A prompt (browser `confirm()` dialog or equivalent inline UI) that requires explicit user acknowledgment before a destructive action executes |
| **DB URL** | The PostgreSQL connection string read from the `DATABASE_URL` environment variable (or equivalent; see Y3-integrations.md) |
| **`next.config.mjs`** | The required Next.js 14 configuration file. Must use `.mjs` extension — `.ts` causes a hard build error on Next 14 |

---

## Shared Constraints (apply to all features)

- No authentication layer. All routes are publicly accessible.
- No hard-coded database credentials. All DB connection parameters come from environment variables.
- No `X-Frame-Options` header. No `Content-Security-Policy: frame-ancestors` restrictive directive.
- Server must bind to `0.0.0.0:3000`.
- Config file must be `next.config.mjs` — never `next.config.ts`.
- All API responses are `Content-Type: application/json` unless the response has no body (204).
- The `notes` table must exist before any API or page handler queries PostgreSQL.
---

## F00: Note List View

**PRD Reference:** F0 | **Priority:** P0 — Critical | **User Story:** US1

**Description:** The home page (`/`) is the application's primary screen. It fetches all notes from PostgreSQL and renders them in a sorted list — pinned notes first, then remaining notes ordered by `created_at` descending (newest first). When no notes exist, an empty state is displayed. A persistent "New note" button/link is always visible. Each note row is a tappable target that navigates to the note's edit page.

---

### Terminology

- **List row:** A single note rendered as a tappable item in the list, showing at minimum the note's title.
- **Pinned section:** The subset of list rows where `pinned = true`, always rendered above non-pinned rows.
- **Empty state:** The UI shown when the `notes` table has zero rows.
- **Sort order:** `ORDER BY pinned DESC, created_at DESC` — equivalent to pinned notes at top, then newest-first within each group.

---

### Sub-features

- Display all notes in sort order (pinned first, then newest-first)
- Render empty state when no notes exist
- Provide a persistent "New note" CTA (button or link to `/notes/new`)
- Each note row navigates to `/notes/[id]/edit` on tap/click

---

### Process

1. On page load, the server fetches all rows from the `notes` table: `SELECT id, title, pinned, created_at FROM notes ORDER BY pinned DESC, created_at DESC`.
2. If the result set is empty, render the **empty state** (see Outputs).
3. If the result set is non-empty, render each row as a list item (see Outputs).
4. The "New note" button/link is rendered regardless of list contents.
5. User taps/clicks a list row → client navigates to `/notes/[id]/edit`.
6. User taps/clicks "New note" → client navigates to `/notes/new`.

> **Note:** The `body` column is not fetched or displayed on the list page — only `id`, `title`, `pinned`, and `created_at` are needed.

---

### Inputs

- None from the user on this page (read-only view).
- **Database query result:** All rows from `notes` table ordered by `pinned DESC, created_at DESC`.

---

### Outputs

**Non-empty list state:**
- A list of note rows, each containing:
  - Note `title` (text)
  - A visual distinction for pinned notes (e.g., pin icon, label, or highlighted row)
  - A tappable/clickable link to `/notes/[id]/edit`
- A "New note" button or link pointing to `/notes/new`

**Empty state (zero notes):**
- A message: "No notes yet" (exact string)
- A "New note" button or link pointing to `/notes/new`

---

### Validation

- No user-submitted input on this page; no form validation required.
- Sort order must be stable: `pinned DESC, created_at DESC` — enforced at the SQL query level, not in application code.
- The list must reflect the current database state at page-load time (server-side render).

---

### Error States

| Scenario | HTTP Status | Behavior |
|----------|-------------|----------|
| PostgreSQL unavailable at page load | 500 | Render an error page or message: "Unable to load notes. Please try again." |
| Query returns unexpected shape | 500 | Log error server-side; render generic error message to user |

---

### API Surface (this feature)

This page does **not** call a REST API from the client. It performs a direct server-side database query during SSR (Server-Side Rendering). See `Y0-schema.md` for the `notes` table DDL used by this query.

---

### Schema Surface (this feature)

Uses table `notes` — columns: `id`, `title`, `pinned`, `created_at`. See `Y0-schema.md §notes table`.
---

## F01: Note Search

**PRD Reference:** F1 | **Priority:** P1 — High | **User Story:** US3

**Description:** A search input rendered on the `/` list page filters visible note rows in real time as the user types. Filtering is performed client-side against the already-loaded list — no server round-trip or API call is made during search. Matching is case-insensitive substring matching on the note title. When the search input is cleared, the full list is restored.

---

### Terminology

- **Search input:** A text `<input>` element visible on the `/` list page, above or adjacent to the note list.
- **Filter term:** The current value of the search input, trimmed of leading/trailing whitespace for matching.
- **Matching note:** A note whose `title` contains the filter term as a case-insensitive substring.
- **No-match state:** The UI rendered when the filter term is non-empty but zero notes match.

---

### Sub-features

- Search input visible on `/` list page at all times (even when note list is empty)
- Real-time client-side filtering by title as user types
- Case-insensitive substring match
- Clearing the input restores full list
- "No matching notes" empty state when filter yields zero results

---

### Process

1. The search input is rendered as part of the `/` page, above the note list.
2. The full list of notes is loaded server-side at page render time (see F00 §Process).
3. On each `input` event on the search field:
   a. Read the current input value and trim whitespace.
   b. If the trimmed value is empty, show all notes (full list restored).
   c. If the trimmed value is non-empty, filter the rendered list: show only notes whose `title` contains the trimmed value as a case-insensitive substring (e.g., `title.toLowerCase().includes(term.toLowerCase())`).
   d. Hide (or remove from DOM) any note rows that do not match.
4. If the filtered result is empty and the search input is non-empty, render the **no-match state** (see Outputs).
5. Filtering happens synchronously on each keystroke — no debounce, no setTimeout, no API call.

---

### Inputs

- **Search input value** (string): User-typed text. May be any Unicode string. Empty string means "show all".

---

### Outputs

**Matching results visible:** Only note rows whose title matches the filter term are shown. Sort order of the visible subset is preserved from the original list (pinned first, then newest-first).

**No-match state (non-empty filter, zero matches):**
- A message: "No matching notes" (exact string)
- Search input remains visible and editable

**Search cleared (empty input):** Full note list restored exactly as in F00 §Outputs.

---

### Validation

- Matching uses `String.prototype.includes()` after both the title and the filter term are lowercased — no regex, no diacritics normalization required for MVP.
- Filter operates only on the `title` field — the `body` field is not searched.
- Filtering is purely client-side. The server is not called during a search interaction.
- The search input does not submit a form; it has no `name` attribute that would appear in query strings.
- There is no minimum character threshold — filtering begins on the first character typed.

---

### Error States

| Scenario | Behavior |
|----------|----------|
| Note list failed to load (DB error) | Search input may still render but list is empty; error message from F00 takes precedence |
| User pastes very long string | Filter runs synchronously; no truncation or length limit on the filter term for MVP |

---

### API Surface (this feature)

None. Search is entirely client-side JavaScript operating on the DOM or React state of the already-rendered note list.

---

### Schema Surface (this feature)

None at search time. Note data is already in the page from the F00 server-side fetch. See `Y0-schema.md §notes table` for the source data shape.
---

## F02: Create Note

**PRD Reference:** F2 | **Priority:** P0 — Critical | **User Story:** US2

**Description:** The `/notes/new` page presents a form with a required title field, an optional body textarea, and a pinned toggle. On valid submission, the note is persisted to PostgreSQL via `POST /api/notes` and the user is redirected to `/`. If the title is empty, the form displays an inline validation error without navigating away. A cancel/back action returns to `/` without saving.

---

### Terminology

- **Title field:** A text `<input>` (type="text") bound to the note's `title` column. Required.
- **Body field:** A `<textarea>` bound to the note's `body` column. Optional — may be left empty.
- **Pinned toggle:** A checkbox (`<input type="checkbox">`) or equivalent toggle control bound to the note's `pinned` column. Defaults to unchecked (false).
- **Inline validation error:** An error message rendered adjacent to the invalid field, visible without a page reload.

---

### Sub-features

- Title input (required, non-empty)
- Body textarea (optional)
- Pinned toggle (checkbox, default unchecked)
- Submit: persists note, redirects to `/`
- Cancel/back: returns to `/` without saving
- Client-side and server-side title validation

---

### Process

1. User navigates to `/notes/new` (via "New note" link on `/` or direct URL).
2. Page renders a form with:
   - Title `<input type="text">` — empty initial value, `required` attribute set.
   - Body `<textarea>` — empty initial value.
   - Pinned `<input type="checkbox">` — unchecked by default.
   - A "Save" (or "Create") submit button.
   - A "Cancel" link or button pointing to `/`.
3. **On submit:**
   a. **Client-side validation:** If `title` is empty or contains only whitespace, display an inline error message (e.g., "Title is required") adjacent to the title field. Do not submit the request. Stop here.
   b. If validation passes, send `POST /api/notes` with JSON body `{ "title": "<trimmed title>", "body": "<body or empty string>", "pinned": <true|false> }`.
   c. On `201 Created` response: redirect to `/`.
   d. On `400 Bad Request` response (server-side validation failure): display the server-returned error message inline adjacent to the title field.
   e. On `500` or network error: display a generic error message (e.g., "Failed to save note. Please try again.").
4. **On cancel:** Navigate to `/` without sending any request.

---

### Inputs

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `title` | string (text input) | Yes | Non-empty after trimming whitespace; max length not enforced by MVP but PostgreSQL `text` is unbounded |
| `body` | string (textarea) | No | May be empty string or null; PostgreSQL `text` nullable |
| `pinned` | boolean (checkbox) | No | Defaults to `false` when unchecked |

---

### Outputs

- On success: HTTP `201 Created` from `POST /api/notes`, followed by client redirect to `/`.
- On validation error: Inline error message displayed. Form retains all entered values (no reset).
- The newly created note appears at the top of the non-pinned section (or at the very top if pinned) of the list on `/`.

---

### Validation

**Client-side (before API call):**
- `title` trimmed of whitespace must be non-empty. If empty, show "Title is required" and abort submission.
- No other client-side validation required for MVP.

**Server-side (in `POST /api/notes` handler — see F05):**
- `title` after trimming must be non-empty. Return `400` with `{ "error": "Title is required" }` if violated.
- `pinned` must be boolean. If omitted, default to `false`.
- `body` may be null, undefined, or any string — stored as-is (null if omitted).

---

### Error States

| Scenario | HTTP Status | User-Visible Behavior |
|----------|-------------|----------------------|
| Empty title submitted | 400 | Inline error: "Title is required"; form not cleared |
| `POST /api/notes` returns 500 | 500 | Generic error message: "Failed to save note. Please try again." |
| Network failure during POST | — (no response) | Generic error message; form retains values |
| User navigates directly to `/notes/new` with no DB | — | Page loads (no DB query on GET); error occurs only on submit |

---

### API Surface (this feature)

Calls `POST /api/notes`. See `Y1-api.md §POST /api/notes` for full request/response schema.

---

### Schema Surface (this feature)

Inserts one row into `notes` table — columns written: `title`, `body`, `pinned`. Columns auto-populated: `id` (serial), `created_at` (default now()). See `Y0-schema.md §notes table`.
---

## F03: Edit & Delete Note

**PRD Reference:** F3 | **Priority:** P0 — Critical | **User Stories:** US4, US5

**Description:** Clicking a note row on the list page opens `/notes/[id]/edit`, a form page pre-populated with the note's current `title`, `body`, and `pinned` state. The user may modify any field and save the changes, or delete the note after confirming via a prompt. Saving calls `PUT /api/notes/[id]`; deleting calls `DELETE /api/notes/[id]`. Both actions redirect to `/` on success. If the note does not exist (e.g., deleted from another tab), the page renders a 404 state.

---

### Terminology

- **Pre-filled form:** A form whose input values are initialised from the fetched note record before the page is painted.
- **Save action:** Submission of the edit form, triggering `PUT /api/notes/[id]`.
- **Delete action:** User-initiated deletion of the current note, requiring a confirmation step before calling `DELETE /api/notes/[id]`.
- **Confirmation step:** A browser `confirm()` dialog (or equivalent inline UI) that requires the user to explicitly confirm before the delete request is sent.

---

### Sub-features

- Fetch and display the note's current data on page load
- Pre-filled title, body, and pinned inputs
- Save button persists changes via PUT
- Delete button with confirmation prompt
- Redirect to `/` on successful save or delete
- 404 handling when the note `[id]` does not exist

---

### Process — Page Load

1. User arrives at `/notes/[id]/edit` (from list row click or direct URL).
2. Server fetches the note: `SELECT id, title, body, pinned FROM notes WHERE id = $1`.
3. If no row is returned → render 404 state (see Error States).
4. If row is found → render the edit form pre-filled with the note's `title`, `body`, and `pinned` values.

---

### Process — Save (Edit)

1. User modifies one or more fields in the pre-filled form.
2. User clicks "Save."
3. **Client-side validation:** If `title` is empty or whitespace-only, show inline error "Title is required". Abort. (Same rule as F02.)
4. Send `PUT /api/notes/[id]` with JSON body `{ "title": "<trimmed title>", "body": "<body>", "pinned": <true|false> }`.
5. On `200 OK` response: redirect to `/`.
6. On `404 Not Found`: display error "This note no longer exists." Offer a link back to `/`.
7. On `400 Bad Request`: display server error message inline.
8. On `500` or network error: display "Failed to save note. Please try again."

---

### Process — Delete

1. User clicks "Delete" button on the edit page.
2. A confirmation step is presented: `confirm("Delete this note? This cannot be undone.")` (exact wording may vary; must be a genuine confirmation, not bypassed).
3. If the user cancels the confirmation → no action taken; form remains visible.
4. If the user confirms:
   a. Send `DELETE /api/notes/[id]`.
   b. On `204 No Content` response: redirect to `/`.
   c. On `404 Not Found`: note was already deleted — redirect to `/` (note is gone; treat as success).
   d. On `500` or network error: display "Failed to delete note. Please try again."

---

### Inputs

| Field | Type | Required | Source |
|-------|------|----------|--------|
| `title` | string (text input) | Yes | Pre-filled from DB; user-editable |
| `body` | string (textarea) | No | Pre-filled from DB (may be null/empty); user-editable |
| `pinned` | boolean (checkbox) | No | Pre-filled from DB; user-editable |

---

### Outputs

- **Successful save:** `200 OK` from PUT, followed by redirect to `/`. The note's updated values are immediately visible on the list.
- **Successful delete:** `204 No Content` from DELETE, followed by redirect to `/`. The note no longer appears in the list.
- **404 on page load:** A "Note not found" message with a link back to `/`.
- **Validation error:** Inline error message; form retains all entered values.

---

### Validation

**Client-side (before PUT call):**
- `title` trimmed of whitespace must be non-empty. Show "Title is required" if violated.

**Server-side (in `PUT /api/notes/[id]` handler — see F05):**
- Note with the given `id` must exist. Return `404` with `{ "error": "Note not found" }` if not.
- `title` after trimming must be non-empty. Return `400` with `{ "error": "Title is required" }` if violated.
- `pinned` must be boolean or omitted (default: retain existing value if not provided; or require explicit value — see Y1-api.md).
- `body` may be null or any string.

**Delete:**
- No field validation for DELETE.
- If the note does not exist, `DELETE /api/notes/[id]` returns `404` — the UI treats this as a successful deletion and redirects to `/`.

---

### Error States

| Scenario | HTTP Status | User-Visible Behavior |
|----------|-------------|----------------------|
| Note not found on page load | 404 | "Note not found" message with link to `/` |
| Empty title on save | 400 | Inline error "Title is required"; form not cleared |
| PUT returns 404 (race: deleted elsewhere) | 404 | "This note no longer exists." + link to `/` |
| PUT returns 500 | 500 | "Failed to save note. Please try again." |
| DELETE returns 500 | 500 | "Failed to delete note. Please try again." |
| Network error on PUT or DELETE | — | Generic error message; no redirect |
| User dismisses delete confirmation | — | No action; form remains open |

---

### API Surface (this feature)

- Calls `GET /api/notes/[id]` (or direct DB query on SSR) to load the note.
- Calls `PUT /api/notes/[id]` on save.
- Calls `DELETE /api/notes/[id]` on confirmed delete.

See `Y1-api.md §GET /api/notes/[id]`, `§PUT /api/notes/[id]`, and `§DELETE /api/notes/[id]` for full schemas.

---

### Schema Surface (this feature)

- **Read:** `SELECT id, title, body, pinned FROM notes WHERE id = $1`
- **Update (PUT):** `UPDATE notes SET title=$1, body=$2, pinned=$3 WHERE id=$4 RETURNING *`
- **Delete:** `DELETE FROM notes WHERE id=$1`

See `Y0-schema.md §notes table`.
---

## F04: Data Persistence & Auto-Migration

**PRD Reference:** F4 | **Priority:** P0 — Critical | **User Story:** US6

**Description:** All note data is stored durably in a PostgreSQL database. Notes survive page reloads, browser closes, and server restarts. The database schema is automatically created on application startup using `CREATE TABLE IF NOT EXISTS` — no manual migration steps, no CLI commands, no DBA intervention. The database connection string is read exclusively from environment variables; no credentials appear in source code.

---

### Terminology

- **Auto-migration:** Execution of `CREATE TABLE IF NOT EXISTS notes (...)` at startup — before any route handler runs — so the schema is always present when the first request arrives.
- **Idempotent migration:** The migration SQL can be run any number of times without error and without data loss. `CREATE TABLE IF NOT EXISTS` satisfies this.
- **DB URL:** The PostgreSQL connection string. Sourced from the environment variable `DATABASE_URL` (standard `postgresql://user:password@host:port/dbname` format).
- **Connection pool:** A reusable set of database connections managed by the application to avoid opening a new connection per request.

---

### Sub-features

- Auto-migration on startup (`CREATE TABLE IF NOT EXISTS`)
- Durable PostgreSQL storage for all CRUD operations
- Environment-variable-only database credentials
- Connection pool lifecycle management
- Startup health check verifying DB connectivity (see F05 §GET /api/health)

---

### Process — Startup Migration

1. At application startup (before the HTTP server begins accepting requests, or at latest before the first DB query executes):
   a. Read `DATABASE_URL` from environment variables.
   b. Open a database connection (or initialize the connection pool).
   c. Execute the migration SQL:
      ```sql
      CREATE TABLE IF NOT EXISTS notes (
        id         SERIAL PRIMARY KEY,
        title      TEXT NOT NULL,
        body       TEXT,
        pinned     BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      ```
   d. If the SQL succeeds → proceed to serve requests normally.
   e. If the SQL fails (e.g., DB unreachable) → log the error to stdout/stderr with a clear message (e.g., `"[QuickNotes] Database migration failed: <error>"`). The application should not silently swallow the error. The behavior on failure (crash vs. retry) is implementation-defined, but the error must be clearly surfaced.

2. Subsequent startups: `CREATE TABLE IF NOT EXISTS` is a no-op if the table already exists. No data is lost.

---

### Process — CRUD Persistence

All create, read, update, and delete operations performed by the REST API (see F05) and by page-level SSR queries (see F00, F03) read from and write to PostgreSQL exclusively. There is no in-memory cache layer in MVP.

| Operation | SQL Pattern |
|-----------|------------|
| List all notes | `SELECT id, title, pinned, created_at FROM notes ORDER BY pinned DESC, created_at DESC` |
| Fetch one note | `SELECT id, title, body, pinned, created_at FROM notes WHERE id = $1` |
| Create note | `INSERT INTO notes (title, body, pinned) VALUES ($1, $2, $3) RETURNING *` |
| Update note | `UPDATE notes SET title=$1, body=$2, pinned=$3 WHERE id=$4 RETURNING *` |
| Delete note | `DELETE FROM notes WHERE id=$1` |

---

### Inputs

- `DATABASE_URL` environment variable (string): PostgreSQL connection string in standard `postgresql://` URI format.

---

### Outputs

- Database schema present and queryable after startup.
- All write operations are immediately durable (standard PostgreSQL ACID guarantees).
- Read operations reflect the latest committed state.

---

### Validation

- `DATABASE_URL` must be set. If absent, the application must fail with a clear error message rather than using a default or fallback.
- The migration SQL must be `CREATE TABLE IF NOT EXISTS` — not `CREATE TABLE` (which would fail on the second startup) and not `DROP TABLE IF EXISTS; CREATE TABLE` (which would destroy data).
- Connection pool must be initialized once and reused across requests — not opened/closed per request.
- No database credentials may appear in source code, committed `.env` files, or build artifacts.

---

### Error States

| Scenario | Behavior |
|----------|----------|
| `DATABASE_URL` not set | Application fails to start; logs: "DATABASE_URL environment variable is required" |
| Database unreachable at startup | Migration fails; error logged; app behavior on continued start is implementation-defined but error must be surfaced |
| Database unreachable during a request | API returns `500` with `{ "error": "Database error" }`; page renders generic error message |
| Migration SQL fails (unexpected DB state) | Error logged; app may crash to prevent serving requests against a broken schema |
| Connection pool exhaustion | Query fails; API returns `500`; error logged |

---

### API Surface (this feature)

No dedicated API endpoint for migration. Migration is a startup side-effect. The `GET /api/health` endpoint (see F05) verifies DB connectivity post-migration.

---

### Schema Surface (this feature)

**Full DDL — single authoritative definition:**

```sql
CREATE TABLE IF NOT EXISTS notes (
  id         SERIAL PRIMARY KEY,
  title      TEXT NOT NULL,
  body       TEXT,
  pinned     BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

See `Y0-schema.md` for the canonical DDL.
---

## F05: REST API

**PRD Reference:** F5 | **Priority:** P0 — Critical | **User Stories:** US1–US6 (infrastructure)

**Description:** A complete REST API backs all UI operations and is independently usable by external clients. All endpoints are implemented as Next.js App Router Route Handlers (`app/api/.../route.ts` or `.js`). The API follows resource-oriented conventions, returns JSON, and uses standard HTTP status codes. `GET /api/health` has no database dependency; all other endpoints require the `notes` table to exist (ensured by F04 auto-migration).

---

### Terminology

- **Route Handler:** A Next.js App Router file exporting named async functions (`GET`, `POST`, `PUT`, `DELETE`) mapped to HTTP methods.
- **Request body:** JSON-encoded payload sent by the client in `POST` and `PUT` requests. `Content-Type: application/json` expected.
- **`[id]`:** Dynamic route segment, integer string. Must be parseable as a positive integer.
- **`?q=`:** Optional query parameter on `GET /api/notes` for server-side title filtering (in addition to client-side filtering in F01).

---

### Sub-features

- `GET /api/health` — health check (no DB dependency)
- `GET /api/notes` — list all notes, optional `?q=` filter
- `POST /api/notes` — create a note
- `GET /api/notes/[id]` — fetch one note
- `PUT /api/notes/[id]` — update one note
- `DELETE /api/notes/[id]` — delete one note

---

### Process — GET /api/health

1. Receive request.
2. Return immediately with `200 OK` and body `{"status":"ok"}`.
3. No database query. No authentication. This endpoint must always respond as long as the process is alive.

---

### Process — GET /api/notes

1. Receive request. Read optional `?q=` query parameter.
2. If `?q=` is absent or empty: `SELECT id, title, body, pinned, created_at FROM notes ORDER BY pinned DESC, created_at DESC`.
3. If `?q=` is present and non-empty: `SELECT id, title, body, pinned, created_at FROM notes WHERE title ILIKE $1 ORDER BY pinned DESC, created_at DESC` with `$1 = '%' + q + '%'`.
4. Return `200 OK` with JSON array of note objects (see Y1-api.md for schema). Empty array `[]` if no results.

---

### Process — POST /api/notes

1. Receive request. Parse JSON body.
2. Validate `title` is present and non-empty after trimming. If invalid → `400 Bad Request` with `{"error":"Title is required"}`.
3. Coerce `pinned` to boolean. If absent → default `false`.
4. Coerce `body` to string or `null`. If absent → `null`.
5. Execute: `INSERT INTO notes (title, body, pinned) VALUES ($1, $2, $3) RETURNING *`.
6. Return `201 Created` with the inserted note object as JSON.

---

### Process — GET /api/notes/[id]

1. Receive request. Parse `[id]` segment as integer. If not a valid positive integer → `400 Bad Request`.
2. Execute: `SELECT id, title, body, pinned, created_at FROM notes WHERE id = $1`.
3. If no row found → `404 Not Found` with `{"error":"Note not found"}`.
4. If row found → `200 OK` with note object as JSON.

---

### Process — PUT /api/notes/[id]

1. Receive request. Parse `[id]` as integer. If invalid → `400 Bad Request`.
2. Parse JSON body.
3. Validate `title` is present and non-empty after trimming. If invalid → `400 Bad Request` with `{"error":"Title is required"}`.
4. Verify note exists: `SELECT id FROM notes WHERE id = $1`. If not found → `404 Not Found` with `{"error":"Note not found"}`.
5. Execute: `UPDATE notes SET title=$1, body=$2, pinned=$3 WHERE id=$4 RETURNING *`.
   - `body`: use provided value or `null` if absent.
   - `pinned`: use provided boolean value; if absent, use existing value from the SELECT above.
6. Return `200 OK` with the updated note object as JSON.

---

### Process — DELETE /api/notes/[id]

1. Receive request. Parse `[id]` as integer. If invalid → `400 Bad Request`.
2. Execute: `DELETE FROM notes WHERE id = $1`.
3. If zero rows deleted (note did not exist) → `404 Not Found` with `{"error":"Note not found"}`.
4. If one row deleted → `204 No Content` (empty body).

---

### Inputs

| Endpoint | Input | Type | Required |
|----------|-------|------|----------|
| POST /api/notes | `title` | string | Yes |
| POST /api/notes | `body` | string | No (null if absent) |
| POST /api/notes | `pinned` | boolean | No (default false) |
| PUT /api/notes/[id] | `title` | string | Yes |
| PUT /api/notes/[id] | `body` | string | No (null if absent) |
| PUT /api/notes/[id] | `pinned` | boolean | No (retain existing if absent) |
| GET /api/notes | `?q=` | string (query param) | No |

---

### Outputs (Response Shapes)

**Note object (returned by GET /api/notes, GET /api/notes/[id], POST, PUT):**
```json
{
  "id": 1,
  "title": "My note",
  "body": "Optional content",
  "pinned": false,
  "createdAt": "2026-06-17T12:00:00.000Z"
}
```

**GET /api/notes — success:**
```json
[{ "id": 1, "title": "...", "body": "...", "pinned": false, "createdAt": "..." }]
```

**GET /api/health — success:**
```json
{ "status": "ok" }
```

**Error response shape (all 4xx/5xx):**
```json
{ "error": "<human-readable error message>" }
```

---

### Validation

- `[id]` must parse as a positive integer. Non-numeric or negative → `400`.
- `title` must be non-empty after `String.prototype.trim()`. Whitespace-only → treated as empty → `400`.
- `body` is always optional; null and empty string are both valid stored values.
- `pinned` must be boolean if provided. Non-boolean values should be coerced or rejected (implementation choice; true/false strings from form submits should be handled).
- HTTP method not allowed on a route → `405 Method Not Allowed`.
- Malformed JSON in request body → `400 Bad Request`.

---

### Error States

| Scenario | HTTP Status | Response Body |
|----------|-------------|---------------|
| `title` missing or empty | 400 | `{"error":"Title is required"}` |
| `[id]` not a valid integer | 400 | `{"error":"Invalid id"}` |
| Note not found | 404 | `{"error":"Note not found"}` |
| Method not allowed | 405 | `{"error":"Method not allowed"}` |
| Malformed JSON body | 400 | `{"error":"Invalid request body"}` |
| Database error | 500 | `{"error":"Database error"}` |
| Unexpected server error | 500 | `{"error":"Internal server error"}` |

---

### API Surface (this feature)

This feature IS the API. Full request/response schemas with headers and examples in `Y1-api.md`.

---

### Schema Surface (this feature)

All endpoints read/write the `notes` table. See `Y0-schema.md §notes table`.
---

## F06: Mobile-First UI & Design System

**PRD Reference:** F6 | **Priority:** P1 — High | **User Stories:** All

**Description:** The application is designed mobile-first with a minimal, high-contrast visual language. A Gold accent color (`#FBCA5C`) is used sparingly as an accent on CTAs and highlights, covering at most 10% of any view's surface area. Body text uses near-black (`#0A0A0A`) on white (`#FFFFFF`) surfaces. All interactive elements meet a minimum 44×44px touch target size. The layout must not break on desktop — the mobile design scales up gracefully.

---

### Terminology

- **Viewport width:** The rendered width of the browser window. Primary target: 375px–428px (iPhone SE to iPhone Pro Max).
- **Touch target:** The tappable/clickable area of an interactive element. Must be at least 44×44px even if the visual element is smaller (use padding to expand).
- **Gold accent (`#FBCA5C`):** The brand accent color used on CTAs (e.g., "New note" button background, "Save" button), highlights, and pinned indicators.
- **Near-black (`#0A0A0A`):** The primary text color used for all body text, headings, and labels.
- **Surface white (`#FFFFFF`):** The background color of all page surfaces and cards.
- **10% rule:** Gold accent must not occupy more than 10% of the total visible pixel area of any single view.

---

### Sub-features

- Mobile-first responsive layout (375px–428px primary)
- Gold `#FBCA5C` accent on CTAs and highlights (≤10% of any view surface)
- Near-black `#0A0A0A` body text on white surfaces
- Minimum 44×44px touch targets for all interactive elements
- Minimum 16px font size for body text on mobile
- No horizontal scroll at 375px viewport width
- No layout breakage on desktop (graceful scale-up)
- Plain CSS or CSS Modules (no required Tailwind or CSS-in-JS)

---

### Process

1. All pages use a single-column mobile-first layout. No horizontal scroll at 375px.
2. Interactive elements (buttons, links, checkboxes, inputs) have a minimum tap target of 44×44px, enforced via padding if the visual size is smaller.
3. The "New note" button/CTA uses Gold `#FBCA5C` as its background or prominent accent color.
4. The "Save"/"Create" button on forms uses Gold `#FBCA5C` as its primary color.
5. Pinned notes may be visually distinguished with a Gold accent (icon, border, or badge) — provided total Gold surface area on the view stays ≤10%.
6. Body text, titles, and labels render in `#0A0A0A` at a minimum of 16px on mobile viewports.
7. Page backgrounds and card/list-item backgrounds are white (`#FFFFFF`).
8. On wider viewports (tablet/desktop), the layout may widen or add horizontal padding — it must not break or overflow.

---

### Inputs

- No user-submitted input specific to this feature.
- Viewport width (browser environment): determines responsive layout breakpoints.

---

### Outputs

- Rendered pages that are visually consistent with the design system.
- No horizontal scroll at 375px viewport width.
- All interactive elements reachable and tappable on a mobile device.

---

### Validation

- Gold `#FBCA5C` surface coverage ≤ 10% per view.
- All `<button>`, `<a>`, `<input>`, `<textarea>`, `<label for checkbox>` elements: computed height ≥ 44px AND computed width ≥ 44px (or accessible tap area ≥ 44×44px).
- Body text: `font-size` ≥ 16px at 375px viewport width.
- No `overflow-x: scroll` or horizontal overflow at 375px viewport width.
- CSS file extension: `.css` or CSS Modules (`.module.css`). No Tailwind required (but not prohibited if team chooses it).

---

### Error States

| Scenario | Behavior |
|----------|----------|
| CSS fails to load | Page degrades to unstyled HTML — content must remain accessible |
| Viewport narrower than 375px | Layout may not be optimized but must not crash or produce JS errors |

---

### API Surface (this feature)

None. This feature is purely front-end styling and layout.

---

### Schema Surface (this feature)

None. No database queries specific to UI styling.
---

## F07: Iframe & Deployment Compatibility

**PRD Reference:** F7 | **Priority:** P0 — Critical | **User Stories:** —

**Description:** The application must render correctly when embedded in an `<iframe>` (e.g., a preview panel or dashboard widget) and must not emit HTTP response headers that prevent framing. The server must bind to `0.0.0.0:3000` to be accessible in containerized or reverse-proxied environments. The Next.js config file must use the `.mjs` extension — never `.ts` — because Next.js 14 cannot parse TypeScript config files and will hard-error at build time.

---

### Terminology

- **`X-Frame-Options`:** An HTTP response header that prevents a page from being embedded in an `<iframe>`. Must NOT be emitted.
- **`frame-ancestors` directive:** A `Content-Security-Policy` directive that restricts which origins can embed the page in a frame. Must NOT be set to a restrictive value (e.g., `'none'` or `'self'`).
- **`0.0.0.0`:** Wildcard bind address — the server listens on all network interfaces, making it accessible from outside the container.
- **`next.config.mjs`:** The required Next.js configuration file. Must be `.mjs` (ES Module) or `.js` (CommonJS). TypeScript extension `.ts` causes a hard build/startup error on Next.js 14.
- **Hard-error:** A Next.js build or startup failure that prevents the application from running entirely.

---

### Sub-features

- Omit `X-Frame-Options` header from all responses
- Omit or leave unrestricted the `Content-Security-Policy: frame-ancestors` directive
- Server listens on `0.0.0.0:3000`
- Config file is `next.config.mjs` (never `next.config.ts`)
- No other frame-blocking mechanisms introduced by middleware or custom headers

---

### Process — Header Configuration

1. In `next.config.mjs`, configure the `headers()` async function to explicitly **not** set `X-Frame-Options` on any route.
2. Do not set `Content-Security-Policy` headers with `frame-ancestors 'none'` or `frame-ancestors 'self'`. If a CSP is needed in future, it must allow framing.
3. Next.js 14 may set `X-Frame-Options: SAMEORIGIN` by default in some versions. Explicitly override with an empty or no-op configuration if needed to ensure the header is absent.
4. Verify no middleware (`middleware.ts`) adds frame-blocking headers.

---

### Process — Port & Host Binding

1. The `next start` command (or custom server) must bind to host `0.0.0.0` and port `3000`.
2. In `package.json`, the start script must be: `"start": "next start -H 0.0.0.0 -p 3000"`.
3. The dev script should also use: `"dev": "next dev -H 0.0.0.0 -p 3000"` for consistency.
4. No environment variable should override the port unless explicitly designed to do so.

---

### Process — Config File

1. The Next.js configuration file must be named exactly `next.config.mjs`.
2. The file must use ES Module syntax (`export default { ... }`).
3. Do NOT create `next.config.ts` — even if the rest of the project uses TypeScript, the config file must be `.mjs`.
4. If the project were to be moved to a newer Next.js version that supports `.ts`, migration to `.ts` is explicitly deferred — not a risk to take during MVP.

---

### Inputs

- HTTP request to any route (determines whether frame-blocking headers are present in the response).
- `package.json` start script (determines bind address and port).
- `next.config.mjs` (determines header policy and any Next.js-level overrides).

---

### Outputs

- HTTP responses with NO `X-Frame-Options` header.
- HTTP responses with NO `Content-Security-Policy` header containing a restrictive `frame-ancestors` directive.
- Server process listening on `0.0.0.0:3000` after `npm start`.
- Successful Next.js build and startup with `next.config.mjs` present.

---

### Validation

- **Required absence check:** `X-Frame-Options` must not appear in response headers for any route (verify with `curl -I http://localhost:3000/`).
- **Required absence check:** `Content-Security-Policy` header, if present, must not contain `frame-ancestors 'none'` or `frame-ancestors 'self'`.
- **Port check:** `ss -tlnp | grep 3000` or equivalent shows the process listening on `0.0.0.0:3000` after startup.
- **Config file check:** `ls next.config.*` shows exactly `next.config.mjs` — no `.ts`, no `.js` duplicate.
- **Build check:** `npm run build` completes without error (no TypeScript config parse error).

---

### Error States

| Scenario | Impact | Resolution |
|----------|--------|------------|
| `next.config.ts` used instead of `.mjs` | Hard build/startup error; app cannot start | Delete `.ts` file; create `next.config.mjs` with identical config using ES Module syntax |
| `X-Frame-Options` header present in responses | App fails to render in iframe | Remove header configuration from `next.config.mjs` and any middleware |
| Server bound to `127.0.0.1` instead of `0.0.0.0` | App inaccessible from outside the container | Update start script to use `-H 0.0.0.0` |
| Port conflict on 3000 | App fails to start | Resolve port conflict; the target port is non-negotiable for MVP |

---

### API Surface (this feature)

No dedicated API endpoints. Applies to all HTTP responses across all routes and API endpoints.

---

### Schema Surface (this feature)

None. No database interaction specific to this feature.
---

## Y0: Database Schema

**Scope:** All entities used by QuickNotes MVP. The application has exactly one table: `notes`.

---

### notes Table

**Purpose:** Stores all user-created notes. Single entity, four operations (CRUD). No foreign keys, no joins.

#### DDL — Canonical Auto-Migration SQL

```sql
CREATE TABLE IF NOT EXISTS notes (
  id         SERIAL PRIMARY KEY,
  title      TEXT        NOT NULL,
  body       TEXT,
  pinned     BOOLEAN     NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

This SQL is executed at application startup before the first request is served (see F04 §Process — Startup Migration). It is safe to run multiple times (`IF NOT EXISTS` makes it idempotent).

---

#### Column Definitions

| Column | PostgreSQL Type | Nullable | Default | Notes |
|--------|----------------|----------|---------|-------|
| `id` | `SERIAL` | NO | Auto-increment (sequence) | Primary key. Integer, auto-incremented. Exposed in API as `"id"`. |
| `title` | `TEXT` | NO | — (required) | Note title. Must be non-empty (enforced in application layer). No max length in DB. |
| `body` | `TEXT` | YES | NULL | Note body/content. Optional. Stored as NULL if not provided. |
| `pinned` | `BOOLEAN` | NO | `false` | Pin flag. When true, note is sorted to the top of all lists. |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | Creation timestamp with timezone. Set by DB on INSERT; never updated. |

---

#### Indexes

No additional indexes for MVP. The full table scan is acceptable for a personal single-user application with a small row count.

**Future consideration (not MVP):** `CREATE INDEX idx_notes_created_at ON notes (created_at DESC);` if list query performance degrades.

---

#### Constraints Summary

| Constraint | Type | Definition |
|------------|------|------------|
| `notes_pkey` | PRIMARY KEY | `id` |
| `title NOT NULL` | NOT NULL | `title` must always have a value |
| `pinned NOT NULL` | NOT NULL | `pinned` must always have a value |
| `created_at NOT NULL` | NOT NULL | `created_at` must always have a value |

---

#### Standard Query Patterns

```sql
-- List all notes (home page, F00)
SELECT id, title, pinned, created_at
FROM notes
ORDER BY pinned DESC, created_at DESC;

-- List with server-side title filter (GET /api/notes?q=, F05)
SELECT id, title, body, pinned, created_at
FROM notes
WHERE title ILIKE $1
ORDER BY pinned DESC, created_at DESC;
-- $1 = '%' || search_term || '%'

-- Fetch one note (edit page load, GET /api/notes/[id], F03/F05)
SELECT id, title, body, pinned, created_at
FROM notes
WHERE id = $1;

-- Create note (POST /api/notes, F02/F05)
INSERT INTO notes (title, body, pinned)
VALUES ($1, $2, $3)
RETURNING id, title, body, pinned, created_at;

-- Update note (PUT /api/notes/[id], F03/F05)
UPDATE notes
SET title = $1, body = $2, pinned = $3
WHERE id = $4
RETURNING id, title, body, pinned, created_at;

-- Delete note (DELETE /api/notes/[id], F03/F05)
DELETE FROM notes
WHERE id = $1;
-- Check affected row count: 0 = not found (404), 1 = success (204)
```

---

#### JSON Serialization Mapping

PostgreSQL column names use `snake_case`; API responses use `camelCase`:

| DB Column | API JSON Key | Example Value |
|-----------|-------------|---------------|
| `id` | `id` | `1` |
| `title` | `title` | `"My note"` |
| `body` | `body` | `"Optional content"` or `null` |
| `pinned` | `pinned` | `false` |
| `created_at` | `createdAt` | `"2026-06-17T12:00:00.000Z"` |

---

#### Future Schema Evolution

Per the PRD, schema changes after MVP must use additive `ALTER TABLE` statements — never destructive changes. No existing columns may be dropped or renamed in production without a migration plan. New columns must have defaults or be nullable to avoid breaking the auto-migration idempotency guarantee.
---

## Y1: REST API Endpoint Catalog

**Base URL:** `http://0.0.0.0:3000` (or the deployed hostname)  
**Content-Type:** All request bodies and responses are `application/json` unless the response has no body (204).  
**Authentication:** None — all endpoints are publicly accessible.  
**Implementation:** Next.js 14 App Router Route Handlers in `app/api/`.

---

### Shared Response Conventions

**Success note object schema** (returned by GET list item, GET single, POST, PUT):
```json
{
  "id":        1,
  "title":     "My note title",
  "body":      "Optional body content or null",
  "pinned":    false,
  "createdAt": "2026-06-17T12:00:00.000Z"
}
```

**Error response schema** (all 4xx and 5xx responses):
```json
{ "error": "Human-readable error message" }
```

---

### GET /api/health

**Purpose:** Health check. Verifies the process is alive. No database dependency.  
**File:** `app/api/health/route.ts` (or `.js`)

**Request:**
```
GET /api/health HTTP/1.1
```
No headers, body, or parameters required.

**Response — 200 OK:**
```json
{ "status": "ok" }
```

**Error responses:** None expected. If the process is alive, this endpoint always returns 200.

---

### GET /api/notes

**Purpose:** Returns all notes, newest first with pinned notes promoted to top. Optional title filter via `?q=`.  
**File:** `app/api/notes/route.ts`

**Request:**
```
GET /api/notes HTTP/1.1
GET /api/notes?q=groceries HTTP/1.1
```

| Query Parameter | Type | Required | Description |
|----------------|------|----------|-------------|
| `q` | string | No | Case-insensitive substring filter on `title`. If omitted or empty, all notes are returned. |

**Response — 200 OK:**
```json
[
  {
    "id": 2,
    "title": "Pinned note",
    "body": null,
    "pinned": true,
    "createdAt": "2026-06-17T10:00:00.000Z"
  },
  {
    "id": 3,
    "title": "Recent note",
    "body": "Some content",
    "pinned": false,
    "createdAt": "2026-06-17T09:00:00.000Z"
  }
]
```

Returns `[]` (empty array) if no notes exist or no notes match the filter.

**Error responses:**

| Status | Body | Condition |
|--------|------|-----------|
| 500 | `{"error":"Database error"}` | PostgreSQL query failure |

---

### POST /api/notes

**Purpose:** Creates a new note. Returns the created note with its assigned `id` and `createdAt`.  
**File:** `app/api/notes/route.ts`

**Request:**
```
POST /api/notes HTTP/1.1
Content-Type: application/json

{
  "title":  "My new note",
  "body":   "Optional body text",
  "pinned": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Non-empty after trimming. |
| `body` | string \| null | No | Note body. Null or omitted → stored as NULL. |
| `pinned` | boolean | No | Defaults to `false` if omitted. |

**Response — 201 Created:**
```json
{
  "id": 4,
  "title": "My new note",
  "body": "Optional body text",
  "pinned": false,
  "createdAt": "2026-06-17T12:30:00.000Z"
}
```

**Error responses:**

| Status | Body | Condition |
|--------|------|-----------|
| 400 | `{"error":"Title is required"}` | `title` missing, null, or empty/whitespace |
| 400 | `{"error":"Invalid request body"}` | Malformed JSON |
| 500 | `{"error":"Database error"}` | PostgreSQL insert failure |

---

### GET /api/notes/[id]

**Purpose:** Fetches a single note by its integer primary key.  
**File:** `app/api/notes/[id]/route.ts`

**Request:**
```
GET /api/notes/42 HTTP/1.1
```

**Path Parameter:** `id` — positive integer string.

**Response — 200 OK:**
```json
{
  "id": 42,
  "title": "Shopping list",
  "body": "Milk, eggs, bread",
  "pinned": false,
  "createdAt": "2026-06-15T08:00:00.000Z"
}
```

**Error responses:**

| Status | Body | Condition |
|--------|------|-----------|
| 400 | `{"error":"Invalid id"}` | `id` is not a valid positive integer |
| 404 | `{"error":"Note not found"}` | No note with that `id` exists |
| 500 | `{"error":"Database error"}` | PostgreSQL query failure |

---

### PUT /api/notes/[id]

**Purpose:** Replaces the `title`, `body`, and `pinned` fields of an existing note. Returns the updated note.  
**File:** `app/api/notes/[id]/route.ts`

**Request:**
```
PUT /api/notes/42 HTTP/1.1
Content-Type: application/json

{
  "title":  "Updated title",
  "body":   "Updated body",
  "pinned": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Non-empty after trimming. |
| `body` | string \| null | No | Updated body. Null or omitted → stored as NULL. |
| `pinned` | boolean | No | If omitted, existing value is retained. |

**Response — 200 OK:**
```json
{
  "id": 42,
  "title": "Updated title",
  "body": "Updated body",
  "pinned": true,
  "createdAt": "2026-06-15T08:00:00.000Z"
}
```

> `createdAt` is never changed by a PUT — it reflects the original creation time.

**Error responses:**

| Status | Body | Condition |
|--------|------|-----------|
| 400 | `{"error":"Invalid id"}` | `id` is not a valid positive integer |
| 400 | `{"error":"Title is required"}` | `title` missing, null, or empty/whitespace |
| 400 | `{"error":"Invalid request body"}` | Malformed JSON |
| 404 | `{"error":"Note not found"}` | No note with that `id` exists |
| 500 | `{"error":"Database error"}` | PostgreSQL update failure |

---

### DELETE /api/notes/[id]

**Purpose:** Permanently deletes a note. Returns no body on success.  
**File:** `app/api/notes/[id]/route.ts`

**Request:**
```
DELETE /api/notes/42 HTTP/1.1
```

**Path Parameter:** `id` — positive integer string.

**Response — 204 No Content:**
```
HTTP/1.1 204 No Content
```
No response body.

**Error responses:**

| Status | Body | Condition |
|--------|------|-----------|
| 400 | `{"error":"Invalid id"}` | `id` is not a valid positive integer |
| 404 | `{"error":"Note not found"}` | No note with that `id` exists (zero rows deleted) |
| 500 | `{"error":"Database error"}` | PostgreSQL delete failure |

---

### Method Not Allowed

Any HTTP method not defined on a route returns:

```
HTTP/1.1 405 Method Not Allowed
Content-Type: application/json

{ "error": "Method not allowed" }
```

---

### File Layout (Next.js App Router)

```
app/
  api/
    health/
      route.ts         ← exports GET
    notes/
      route.ts         ← exports GET, POST
      [id]/
        route.ts       ← exports GET, PUT, DELETE
```
---

## Y2: Cross-Feature Error Catalog

**Scope:** All error scenarios across QuickNotes features, with HTTP status codes, error response bodies, and user-visible behaviors.

---

### Error Response Shape

All API errors return JSON with a single `error` key:
```json
{ "error": "Human-readable error message" }
```

Page-level errors (SSR failures) render an appropriate UI state (error message, 404 page, etc.) rather than returning raw JSON.

---

### HTTP Status Code Reference

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, successful PUT |
| 201 | Created | Successful POST (note created) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input (missing title, non-integer id, malformed JSON) |
| 404 | Not Found | Note with given `id` does not exist |
| 405 | Method Not Allowed | HTTP method not supported on the route |
| 500 | Internal Server Error | Database error, unexpected exception |

---

### Validation Errors (400)

| Error Code | HTTP | API Response Body | Trigger |
|------------|------|-------------------|---------|
| TITLE_REQUIRED | 400 | `{"error":"Title is required"}` | `POST /api/notes` or `PUT /api/notes/[id]` called with missing, null, or whitespace-only `title` |
| INVALID_ID | 400 | `{"error":"Invalid id"}` | `[id]` segment in path is not a valid positive integer |
| INVALID_BODY | 400 | `{"error":"Invalid request body"}` | Request body is not valid JSON |

---

### Not Found Errors (404)

| Error Code | HTTP | API Response Body | Trigger |
|------------|------|-------------------|---------|
| NOTE_NOT_FOUND | 404 | `{"error":"Note not found"}` | `GET /api/notes/[id]`, `PUT /api/notes/[id]`, or `DELETE /api/notes/[id]` called with an `id` that has no matching row |

**Page behavior for 404:** When `/notes/[id]/edit` is accessed and the note does not exist, the page renders a "Note not found" message with a link back to `/`. The HTTP status of the page response should also be 404.

---

### Method Not Allowed (405)

| HTTP | API Response Body | Trigger |
|------|-------------------|---------|
| 405 | `{"error":"Method not allowed"}` | HTTP method not defined for the requested route (e.g., DELETE on `/api/notes`, PATCH on any route) |

---

### Server Errors (500)

| Error Code | HTTP | API Response Body | Trigger |
|------------|------|-------------------|---------|
| DB_ERROR | 500 | `{"error":"Database error"}` | PostgreSQL query throws an exception (connection refused, query syntax error, constraint violation) |
| INTERNAL_ERROR | 500 | `{"error":"Internal server error"}` | Unexpected exception in route handler not related to DB |

**Page behavior for 500:** SSR pages that fail due to a database error render a generic error message: "Unable to load notes. Please try again." The raw error is logged server-side; the stack trace is never exposed to the client.

---

### Client-Side Form Validation Errors (Not HTTP)

These errors are caught before any API call is made and displayed inline in the UI:

| Scenario | Field | Inline Message |
|----------|-------|----------------|
| Submit with empty title | Title input | "Title is required" |
| Submit with whitespace-only title | Title input | "Title is required" |

---

### Startup Errors (Not HTTP)

These errors occur before the HTTP server is ready and are surfaced in process logs only:

| Scenario | Log Message | Behavior |
|----------|-------------|----------|
| `DATABASE_URL` not set | `"DATABASE_URL environment variable is required"` | Process exits or refuses to serve requests |
| Auto-migration SQL fails | `"[QuickNotes] Database migration failed: <pg error message>"` | Error surfaced; behavior (crash vs. degraded mode) is implementation-defined |
| DB unreachable at startup | `"[QuickNotes] Failed to connect to database: <error>"` | Error surfaced; retry logic optional for MVP |

---

### Error Handling Rules

1. **Never expose stack traces** or raw PostgreSQL error messages to API clients or page users.
2. **Always log** unexpected errors (500-level) to stdout/stderr with sufficient context for debugging.
3. **4xx errors** are expected and should not be logged as errors — they indicate client mistakes.
4. **Idempotency:** `DELETE /api/notes/[id]` returns 404 if the note is already gone. The UI (F03) treats a 404 on delete as a successful deletion and redirects to `/`.
5. **Network errors** (no response from server) on form submissions display a generic retry message; form values are preserved.
---

## Y3: External Integration Points

**Scope:** All external systems and environment dependencies that QuickNotes relies on at runtime.

---

### 1. PostgreSQL Database

**Type:** External relational database  
**Dependency level:** Critical — all CRUD operations require PostgreSQL  
**Connection mechanism:** Standard TCP connection via `pg` (node-postgres) or compatible driver  

#### Environment Variables

| Variable | Required | Format | Example |
|----------|----------|--------|---------|
| `DATABASE_URL` | Yes | `postgresql://user:password@host:port/dbname` | `postgresql://postgres:secret@localhost:5432/quicknotes` |

Alternative split-variable approach (implementation may choose either):

| Variable | Required | Example |
|----------|----------|---------|
| `PGHOST` | Yes | `localhost` |
| `PGPORT` | No (default 5432) | `5432` |
| `PGUSER` | Yes | `postgres` |
| `PGPASSWORD` | Yes | `secret` |
| `PGDATABASE` | Yes | `quicknotes` |

**Recommendation:** Use `DATABASE_URL` as the single source of truth for simplicity.

#### Connection Pool Configuration

| Parameter | Recommended Value | Notes |
|-----------|------------------|-------|
| Max connections | 10 | Suitable for single-user MVP |
| Idle timeout | 30 seconds | Return idle connections to pool |
| Connection timeout | 10 seconds | Surface DB unavailability quickly |

#### Startup Behavior

- The connection pool is initialized once at application startup (or on first request).
- Auto-migration (`CREATE TABLE IF NOT EXISTS`) is executed once before serving any requests.
- If PostgreSQL is unavailable at startup, the error is logged and the application must surface it clearly (see Y2-errors.md §Startup Errors).

#### Security Constraints

- `DATABASE_URL` (or equivalent variables) must NEVER be hard-coded in source files.
- `.env` files containing credentials must be listed in `.gitignore`.
- Credentials must not appear in build artifacts, Docker image layers, or Next.js client bundles.
- The database connection is server-side only — credentials are never sent to the browser.

---

### 2. Node.js Runtime / Container Environment

**Type:** Process environment  
**Dependency level:** Required — Next.js runs on Node.js  

#### Port Binding

| Property | Value |
|----------|-------|
| Host | `0.0.0.0` (all interfaces) |
| Port | `3000` |
| Protocol | HTTP |

#### Required npm Scripts

```json
{
  "scripts": {
    "dev":   "next dev -H 0.0.0.0 -p 3000",
    "build": "next build",
    "start": "next start -H 0.0.0.0 -p 3000"
  }
}
```

#### Config File Constraint

The Next.js configuration must be at `next.config.mjs` in the project root. No other extension is acceptable for Next.js 14.

---

### 3. Browser Environment (Client-Side)

**Type:** Web browser  
**Dependency level:** Required — UI is browser-rendered  

#### Supported Browsers (MVP)

- Chrome (latest stable) — mobile and desktop
- Safari (latest stable) — mobile and desktop
- Firefox (latest stable) — mobile and desktop

#### Viewport Targets

| Target | Width | Notes |
|--------|-------|-------|
| Primary (mobile) | 375px–428px | iPhone SE to iPhone 14 Pro Max |
| Secondary (tablet) | 768px+ | Must not break; layout may expand |
| Desktop | 1024px+ | Must not break; mobile design scales up |

#### iframe Embedding

The application must render correctly when embedded via `<iframe src="http://...">`. The host page's origin may differ from the app's origin. No `X-Frame-Options` or restrictive `frame-ancestors` CSP may be emitted (see F07).

---

### 4. No Other External Integrations (MVP)

QuickNotes MVP has no integrations with:

- Authentication providers (no OAuth, no SAML, no Azure AD)
- Email or notification services
- Analytics or telemetry platforms
- CDN or object storage
- AI/ML services
- Third-party APIs of any kind

All functionality is self-contained within the Next.js application and its PostgreSQL database.
