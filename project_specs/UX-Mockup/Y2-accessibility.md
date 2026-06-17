## Accessibility Notes

**User Stories:** US-6.1, US-6.2  
**Feature Ref:** F6  
**Standard:** WCAG 2.1 Level AA (target)  

---

### Colour Contrast

| Pair | Foreground | Background | Ratio | WCAG AA |
|------|-----------|------------|-------|---------|
| Body text on white | `#0A0A0A` | `#FFFFFF` | ~21:1 | ✅ Pass |
| Button text on Gold | `#0A0A0A` | `#FBCA5C` | ~7.2:1 | ✅ Pass |
| Muted text on white | `#757575` | `#FFFFFF` | ~4.6:1 | ✅ Pass (AA Normal) |
| Error text on white | `#D32F2F` | `#FFFFFF` | ~5.9:1 | ✅ Pass |
| Error text on error banner | `#0A0A0A` | `#FDECEA` | ~20:1 | ✅ Pass |
| Placeholder text on white | `#9E9E9E` | `#FFFFFF` | ~2.85:1 | ⚠ Placeholder only (not user-entered text) — acceptable per WCAG exception |
| Delete button text | `#D32F2F` | `#FFFFFF` | ~5.9:1 | ✅ Pass |

**10% Gold rule:** The Gold accent (`#FBCA5C`) covers ≤ 10% of any view surface, so it never becomes a large background area. High-contrast body text (`#0A0A0A`) is always on white.

---

### Keyboard Navigation

All pages must be fully operable via keyboard alone (Tab, Shift+Tab, Enter, Space, Escape):

**Screen-00 (Note List):**
| Order | Element | Key | Action |
|-------|---------|-----|--------|
| 1 | "New note" nav button | Enter / Space | Navigate to `/notes/new` |
| 2 | Search input | Type | Filter list |
| 3 | Search clear (×) | Enter / Space | Clear input |
| 4 | Note row 1 | Enter | Navigate to `/notes/[id]/edit` |
| 5 | Note row 2… | Enter | Navigate to respective edit page |

**Screen-01 (Create Note):**
| Order | Element | Key | Action |
|-------|---------|-----|--------|
| 1 | Title input | Auto-focused | Type title |
| 2 | Body textarea | Tab | Type body |
| 3 | Pinned checkbox | Tab + Space | Toggle checked state |
| 4 | "Create note" button | Tab + Enter | Submit form |
| 5 | "Cancel" link | Tab + Enter | Navigate to `/` |

**Screen-02 (Edit / Delete Note):**
| Order | Element | Key | Action |
|-------|---------|-----|--------|
| 1 | Back link `‹ Notes` | Enter | Navigate to `/` |
| 2 | Title input | Tab | Edit title |
| 3 | Body textarea | Tab | Edit body |
| 4 | Pinned checkbox | Tab + Space | Toggle |
| 5 | "Save" button | Tab + Enter | Submit PUT |
| 6 | "Cancel" link | Tab + Enter | Navigate to `/` |
| 7 | "Delete note" button | Tab + Enter | Trigger `confirm()` |

**`confirm()` dialog keyboard support:** Browser native `confirm()` is keyboard-accessible by default (Tab between buttons, Enter to confirm, Escape to cancel). This is one reason it is preferred for MVP.

---

### Screen Reader Considerations

**Page titles:**
- `/` → `<title>QuickNotes</title>` or `<title>Notes — QuickNotes</title>`
- `/notes/new` → `<title>New note — QuickNotes</title>`
- `/notes/[id]/edit` → `<title>Edit note — QuickNotes</title>` (or include note title: `"Edit: Groceries — QuickNotes"`)

**Landmark regions:**
- `<header>` wrapping nav
- `<main>` wrapping page content
- `<nav>` for navigation links

**Note list:**
- Wrap the note list in `<ul>` with `<li>` per row, or `<section>` with appropriate `aria-label`
- Each row `<a>` has accessible text: the note title (e.g., `aria-label="Edit: Groceries"` if the row content is ambiguous with the `›` icon)
- Section separators: `<h2>` or `<p role="separator">` with text "Pinned" / "Notes"

**Search:**
- `<input type="search" aria-label="Search notes" aria-controls="note-list">`
- When "No matching notes" appears: `<p role="status">No matching notes</p>` (not `role="alert"` — it is a non-urgent status update, not an error)
- Note list container: `id="note-list"` (referenced by `aria-controls`)

**Forms:**
- All inputs have `<label>` elements associated via `for` / `id`
- Required fields: `<input required aria-required="true">`
- Error messages: `<span role="alert" aria-live="assertive">Title is required</span>`, rendered only when error is present
- Associate error with input: `<input aria-describedby="title-error">` where `id="title-error"` is on the error span
- Server error banners: `<div role="alert">Failed to save note. Please try again.</div>`

**Loading states:**
- `<form aria-busy="true">` when a request is in flight
- Disabled inputs during loading: `<input disabled>` — screen readers announce "dimmed" or "unavailable"

**Empty states:**
- "No notes yet" and "No matching notes" should be inside `<main>` — they are not errors, just informational states
- Use `<p>` elements, not headings

---

### ARIA Labels Reference

| Element | ARIA attribute | Value |
|---------|---------------|-------|
| Search input | `aria-label` | `"Search notes"` |
| Search input | `aria-controls` | `"note-list"` (id of the note list container) |
| Search clear button | `aria-label` | `"Clear search"` |
| Note list container | `id` | `"note-list"` |
| "No matching notes" message | `role` | `"status"` |
| Title input | `aria-required` | `"true"` |
| Title input | `aria-describedby` | `"title-error"` (when error present) |
| Title error span | `id` | `"title-error"` |
| Title error span | `role` | `"alert"` |
| Form (during submit) | `aria-busy` | `"true"` |
| Error banners (500/network) | `role` | `"alert"` |
| Pin icon in note row | `aria-hidden` | `"true"` (decorative) |
| `›` arrow in note row | `aria-hidden` | `"true"` (decorative) |
| Magnifier icon in search | `aria-hidden` | `"true"` (decorative) |

---

### Focus Management

| Scenario | Focus behaviour |
|----------|----------------|
| Page load on `/notes/new` | Focus moves to title input (via `autoFocus`) |
| Validation error on submit | Focus returns to title input |
| Error banner appears | Focus remains on form; banner announced via `role="alert"` |
| Search input cleared | Focus remains on search input |
| Redirect to `/` | Focus resets to top of page (new page load) |
| `confirm()` dialog opens | Focus is captured by browser dialog |
| `confirm()` dialog dismissed | Focus returns to the element that triggered it ("Delete note" button) |

---

### Reduced Motion

Not required for MVP — there are no animations in the baseline design. If a subtle fade-in is added to newly created notes on the list (delight opportunity per JRN-01.1), it must respect `prefers-reduced-motion: reduce`:

```css
@media (prefers-reduced-motion: reduce) {
  .note-row--new {
    animation: none;
  }
}
```

---
