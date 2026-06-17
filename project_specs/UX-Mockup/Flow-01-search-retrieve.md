## Flow-01: Search & Retrieve

**User Stories:** US-1.1, US-1.2, US-1.3  
**Persona:** Alex Moreno (PER-01)  
**Journey:** JRN-01.2 — Finding a Note by Scanning and Searching  
**Trigger:** User types in the search box on `/`  
**Exit:** User views a note's edit page, or clears search to restore full list  

---

### Flow Diagram

```
[/] Note List (full list rendered server-side)
    │
    ▼ User taps search box
    │
[Search active — client-side only, no API call]
    │
    ├─── Types characters
    │         │
    │         ▼ On every input event (synchronous, no debounce)
    │    Case-insensitive substring match on title only
    │         │
    │    ┌────┴──────────────────────────────────────┐
    │    │ ≥ 1 match found                           │ 0 matches
    │    ▼                                           ▼
    │  Show only matching rows               "No matching notes" message
    │  Preserve pinned-first sort            Search input remains editable
    │  order within visible subset           No note rows shown
    │         │
    │         ▼ User taps a note row
    │    Navigate to /notes/[id]/edit
    │
    └─── User clears search input (backspace or × button)
              │
              ▼
         Full list restored
         Same sort order as initial load
         Search input remains focused
```

---

### Steps

**Step 1 — Initiate Search**
- Search input is always visible on `/`, above the note list
- Search input is visible even when the list is empty (zero notes) or in no-match state
- User taps the search input; keyboard opens on mobile

**Step 2 — Type Filter Term**
- On every `input` event (first character onwards, no minimum threshold):
  - Read current value, trim whitespace for matching
  - If trimmed value is empty → show full list (same as initial state)
  - If trimmed value is non-empty → filter: `title.toLowerCase().includes(term.toLowerCase())`
  - Hide non-matching rows immediately (DOM manipulation or React state update)
  - Visible rows preserve original sort order (pinned first, then newest-first)
- No server request. No debounce. No setTimeout.

**Step 3a — Match Found**
- Only matching note rows are visible
- Each row shows title + body snippet (aids disambiguation when multiple partial matches exist)
- User taps a row → navigate to `/notes/[id]/edit`

**Step 3b — No Match**
- Display exact text: **"No matching notes"**
- Search input remains visible and editable
- No note rows rendered

**Step 4 — Clear Search**
- User deletes typed text (backspace) OR taps the inline `×` clear button
- When input value reaches empty string → full list restored immediately
- Search input remains focused after clearing

---

### UI Elements Involved

| Element | Location | Behaviour |
|---------|----------|-----------|
| Search input | `/`, above note list | Always visible; `type="search"` or `type="text"` with `aria-label="Search notes"`; 44 px tall |
| Search icon | Left inside search input | Decorative magnifier icon, `aria-hidden="true"` |
| Clear (×) button | Right inside search input, appears when non-empty | Clears input, restores full list; min 44 × 44 px tap area |
| Note list rows | Below search input | Filtered in real time; hidden rows removed from display but data remains in DOM/state |
| "No matching notes" message | Replaces note list area | Shown when filter is non-empty and no rows match; `role="status"` for screen readers |

---

### Edge Cases

| Scenario | Behaviour |
|----------|-----------|
| Search box typed while list is empty | Input active, "No matching notes" shown (filter on empty set) |
| Very long search string pasted | Filter runs synchronously; no truncation, no length limit for MVP |
| Pinned note matches search | Pinned row appears first within filtered results, preserving sort order |
| Non-matching pinned note | Hidden like any non-matching row |

---
