## Flow-00: Capture Note

**User Stories:** US-2.1, US-2.2  
**Persona:** Alex Moreno (PER-01)  
**Journey:** JRN-01.1 — Capturing a Fleeting Thought on Mobile  
**Trigger:** User taps "New note" button on `/` (or navigates directly to `/notes/new`)  
**Exit:** Redirect to `/` with new note visible at top of appropriate section  

---

### Flow Diagram

```
[/] Note List
    │
    ▼ Tap "New note" (Gold CTA, always visible)
    │
[/notes/new] Create Form
    │  Title field auto-focused on mount
    │
    ├─── Submit with empty/whitespace title
    │         │
    │         ▼
    │    Inline error "Title is required"
    │    Form retains all values
    │    No API request sent
    │         │
    │         ▼ User corrects title
    │    ─────────────────────────────┐
    │                                 │
    ├─── Submit with valid title ─────┘
    │         │
    │         ▼ POST /api/notes
    │         │
    │    ┌────┴──────────────────────────────────────┐
    │    │ 201 Created                               │ 400 / 500 / Network error
    │    ▼                                           ▼
    │  Redirect to /                         Inline error message
    │  New note at top of list               Form retains values
    │  (pinned section or non-pinned)        No redirect
    │
    └─── Tap "Cancel"
              │
              ▼
         Navigate to /
         No data saved
```

---

### Steps

**Step 1 — Navigate to Create Form**
- User is on `/`; taps "New note" button (Gold `#FBCA5C` background, always visible in nav header or as sticky CTA)
- OR navigates directly to `/notes/new`
- Page renders with title `<input>` auto-focused (`autoFocus` attribute) — no extra tap needed

**Step 2 — Fill In Form**
- Types note title (required)
- Optionally fills body textarea
- Optionally checks "Pinned" checkbox (defaults unchecked)
- A "Cancel" link is visible; tapping it returns to `/` with no changes

**Step 3 — Submit**
- Client validates: if title is empty/whitespace → show "Title is required" inline; do not call API
- If valid → `POST /api/notes { title, body, pinned }`
- Loading state: Save button shows disabled + "Saving…" label during request

**Step 4 — Outcome**
- **201 Created:** Redirect to `/`; new note visible at top of its section
- **400 Bad Request:** Server error message shown inline adjacent to title field; form retains values
- **500 / network error:** Generic message "Failed to save note. Please try again." shown; form retains values; no redirect

---

### UI Elements Involved

| Element | Location | Behaviour |
|---------|----------|-----------|
| "New note" button | `/` nav header / hero CTA | Gold bg, navigates to `/notes/new` |
| Title input | Create form, top | Auto-focused, `required`, min 44 px tall |
| Body textarea | Create form, below title | Optional, no min length, resizable vertically |
| Pinned checkbox + label | Create form, below body | 44 × 44 px tap area via label padding |
| "Create note" submit button | Create form, bottom | Gold bg; disabled + "Saving…" during request |
| "Cancel" link/button | Create form, beside submit | Navigates to `/`, no API call |
| Inline error | Below title field | Red `#D32F2F`, 14 px, role="alert" |
| Generic error banner | Top of form | Red background strip for 500/network errors |

---
