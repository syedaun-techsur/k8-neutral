## Flow-02: Edit & Delete Note

**User Stories:** US-3.1, US-3.2, US-3.3  
**Persona:** Alex Moreno (PER-01)  
**Journey:** JRN-01.3 — Editing a Note and Deleting a Stale One  
**Trigger:** User taps a note row on `/`  
**Exit:** Redirect to `/` with updated list state  

---

### Flow Diagram

```
[/] Note List
    │
    ▼ Tap a note row (full-width tappable area)
    │
[/notes/[id]/edit] Edit Form (pre-filled from DB)
    │
    ├──── Note not found (404 on page load)
    │          ▼
    │     "Note not found" message
    │     Link back to /
    │
    ├──── [SAVE PATH]
    │     User modifies fields → taps "Save"
    │          │
    │     Client validates title
    │          │
    │     ┌────┴──────────────────────────────────────┐
    │     │ Title empty                               │ Title valid
    │     ▼                                           ▼
    │  "Title is required" inline error          PUT /api/notes/[id]
    │  No API request                                 │
    │                                   ┌─────────────┼──────────────────┐
    │                                   │ 200 OK      │ 404              │ 500/net
    │                                   ▼             ▼                  ▼
    │                              Redirect to /  "This note no     "Failed to save
    │                                            longer exists."    note. Please try
    │                                            + link to /        again."
    │
    └──── [DELETE PATH]
          User taps "Delete" button
               │
               ▼
          Confirmation prompt:
          "Delete this note? This cannot be undone."
               │
          ┌────┴──────────────────┐
          │ Confirm               │ Cancel
          ▼                       ▼
     DELETE /api/notes/[id]   Form stays open
          │                   No change
     ┌────┴────────────────────────────────────┐
     │ 204 / 404              │ 500 / network error
     ▼                        ▼
  Redirect to /          "Failed to delete note.
  Note absent from list   Please try again."
                          No redirect
```

---

### Steps

**Step 1 — Open Edit Page**
- User taps a note row on `/` (full-width row is the tap target, ≥ 44 px tall)
- Server fetches `SELECT id, title, body, pinned FROM notes WHERE id = $1`
- If found: render form pre-filled with current `title`, `body`, `pinned`
- If not found (404): render "Note not found" message with link to `/` — no form shown

**Step 2 — Review Pre-filled Form**
- Title input contains current note title
- Body textarea contains current body (may be empty)
- Pinned checkbox reflects current pinned state
- All three fields are editable immediately on page load

**Step 3a — Save Edits**
- User modifies any field(s); taps "Save"
- Client validates title — if empty/whitespace: inline error, no API call
- If valid → `PUT /api/notes/[id] { title, body, pinned }` with `Content-Type: application/json`
- Save button disabled + "Saving…" during request
- On `200 OK` → redirect to `/`; updated note title visible in list
- On `404` → "This note no longer exists." message with link to `/`; no redirect
- On `500` or network error → "Failed to save note. Please try again." inline; no redirect

**Step 4 — Delete**
- User taps "Delete" button (visually distinct from Save — outlined/secondary style, not Gold CTA)
- Confirmation prompt presented: **"Delete this note? This cannot be undone."**
  - Browser `confirm()` dialog is acceptable for MVP
- **Cancel:** form stays open, no request sent
- **Confirm:** `DELETE /api/notes/[id]` sent
  - Delete button disabled + "Deleting…" during request
  - On `204 No Content` → redirect to `/`; note absent from list
  - On `404` → redirect to `/` (note already gone; treat as success)
  - On `500` or network error → "Failed to delete note. Please try again." inline; no redirect

---

### UI Elements Involved

| Element | Location | Behaviour |
|---------|----------|-----------|
| Note row | `/` list | Full-width link to `/notes/[id]/edit`; min 56 px tall |
| Title input | Edit form, top | Pre-filled; `required`; min 44 px tall |
| Body textarea | Edit form, below title | Pre-filled; optional; min 88 px tall |
| Pinned checkbox + label | Edit form, below body | Pre-filled; 44 × 44 px tap area; visible without scrolling on 360 px |
| "Save" button | Edit form, bottom | Gold bg; disabled + "Saving…" during PUT |
| "Delete" button | Edit form, below Save | Outlined/destructive style; triggers confirmation |
| "Cancel" / back link | Edit form, beside Save | Returns to `/`, no API call |
| Inline title error | Below title field | Red `#D32F2F`; `role="alert"` |
| "404 not found" state | Full page body | Replaces form; includes link to `/` |
| Generic error banner | Top of form area | Shown on 500 / network failure |
| "Note not found" (404 on load) | Full page | "Note not found" + link to `/` |

---
