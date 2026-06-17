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
