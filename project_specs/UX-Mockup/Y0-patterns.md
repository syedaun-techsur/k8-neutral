## Interaction Patterns

---

### Pattern 1: Inline Field Validation

**When to use:** Any form field with a `required` constraint — specifically the `title` field on Screen-01 and Screen-02.  
**Trigger:** Form submit attempt with an empty or whitespace-only title.  
**Behaviour:**
1. Client reads field value and trims whitespace
2. If empty → abort submission (no API call)
3. Apply error state to field: red border (`#D32F2F`), show error message below
4. Error message: exact text **"Title is required"** in 14 px `#D32F2F`
5. Set `role="alert"` on the error element so screen readers announce it
6. Focus moves back to the title field
7. When user begins typing again → error is cleared (on first `input` event OR on next submit attempt)
8. Form retains all other values — nothing is reset

**Examples in app:** Screen-01 (create), Screen-02 (edit/save)

---

### Pattern 2: Submit Button Loading State

**When to use:** Any form that makes an async API call (create, save, delete).  
**Behaviour:**
1. On submit (after client validation passes): button becomes disabled immediately
2. Button label changes: "Create note" → "Saving…" | "Save" → "Saving…" | "Delete note" → "Deleting…"
3. All form inputs become `disabled` (prevents double-submit and accidental edits during flight)
4. Set `aria-busy="true"` on the `<form>` element
5. On response (success or error): re-enable button and inputs; update label back
6. On success: redirect happens before re-enable is visible

**Examples in app:** Screen-01 submit, Screen-02 save, Screen-02 delete

---

### Pattern 3: Client-Side List Filtering

**When to use:** Search input on Screen-00 (`/`).  
**Behaviour:**
1. Listen to `input` event on the search field (fires on every character change)
2. Read `event.target.value`, trim whitespace → `term`
3. If `term === ''` → show all notes (restore full list)
4. If `term !== ''` → filter: `note.title.toLowerCase().includes(term.toLowerCase())`
5. Update visible rows synchronously — no `setTimeout`, no `requestAnimationFrame`, no debounce
6. If zero rows match → show "No matching notes" (`role="status"`)
7. If rows match → hide non-matching rows; preserve DOM order (sort unchanged)
8. The search `×` clear button appears only when input is non-empty

**Performance note:** For MVP (personal use, ≤ 200 notes), synchronous DOM updates are imperceptible. If the note count grew to thousands, `requestAnimationFrame` batching would be the first optimisation.

**Examples in app:** Screen-00 search box

---

### Pattern 4: Confirmation Before Destructive Action

**When to use:** Delete note on Screen-02.  
**Behaviour:**
1. User taps "Delete note"
2. `window.confirm("Delete this note? This cannot be undone.")` fires
3. If user taps "Cancel" (returns `false`) → no action; form stays open; no request sent
4. If user taps "OK" (returns `true`) → proceed with `DELETE /api/notes/[id]`
5. Button enters loading state (see Pattern 2)

**MVP note:** Browser `confirm()` is acceptable. It is synchronous, accessible (keyboard-operable), and requires zero UI implementation. A custom inline confirmation UI is a post-MVP enhancement.

**Examples in app:** Screen-02 Delete button

---

### Pattern 5: Navigation After Write Operation

**When to use:** After successful create, save, or delete.  
**Behaviour:**
1. On `201 Created` from POST → redirect to `/`
2. On `200 OK` from PUT → redirect to `/`
3. On `204 No Content` (or `404`) from DELETE → redirect to `/`
4. Redirect is via Next.js `router.push('/')` (client-side) or `redirect('/')` (server action)
5. The `/` page re-fetches from the server → list reflects the latest DB state
6. No optimistic UI, no local state cache — the redirect-to-list pattern guarantees correctness

**Examples in app:** Screen-01 (post-create), Screen-02 (post-save, post-delete)

---

### Pattern 6: Error Banner for Server / Network Failures

**When to use:** When a write API call returns 500 or the network fails entirely.  
**Behaviour:**
1. After the response (or lack of response), show a banner at the top of the form
2. Banner text: **"Failed to save note. Please try again."** (create/edit) or **"Failed to delete note. Please try again."** (delete)
3. Banner style: `background: #FDECEA`, border-left `4px solid #D32F2F`, text `#0A0A0A`
4. `role="alert"` on the banner element
5. Form retains all entered values — nothing is reset
6. No redirect — user stays on the current page to try again

**Examples in app:** Screen-01 (create 500), Screen-02 (save 500, delete 500)

---

### Pattern 7: "Note Not Found" Fallback State

**When to use:** When `/notes/[id]/edit` is loaded but the note ID does not exist in the DB.  
**Behaviour:**
1. Server query returns no rows
2. Page renders a full-page fallback (not an error banner — the form itself is absent)
3. Content: heading "Note not found", secondary text "This note may have been deleted.", link "‹ Back to notes" → `/`
4. No form fields are rendered
5. HTTP status: page should return 404 (not 200 with error content)

**Examples in app:** Screen-02 (page-load 404)

---
