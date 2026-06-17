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
