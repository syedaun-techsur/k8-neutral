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
