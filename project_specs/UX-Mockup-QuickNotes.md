# UX Mockup: QuickNotes

**Project:** QuickNotes  
**Version:** 1.0  
**Generated:** 2026-06-17  
**Based on:** UserStories-QuickNotes.md, PRD-QuickNotes.md, FRD-QuickNotes.md, JOURNEYS-QuickNotes.md  

---

## Overview

QuickNotes is a three-screen, single-entity CRUD application optimised for **one-handed mobile capture**. The design philosophy mirrors the product vision: every pixel serves speed and trust. There is no onboarding, no modals, no sidebars — just the list, the create form, and the edit form.

### Design Principles

| # | Principle | Rationale |
|---|-----------|-----------|
| 1 | **Mobile-first at 360 px** | Primary persona (Alex Moreno) captures notes one-handed on a phone during commutes. 360 px is the narrowest common Android viewport. |
| 2 | **Gold sparingly** | `#FBCA5C` signals "do something" — it lives only on primary CTAs and pinned indicators. Never used as decoration. ≤ 10% of any view surface. |
| 3 | **No dead links, no orphan states** | Nav contains exactly two items: Home (`/`) and New (`/notes/new`). Every error state has a recovery path back to `/`. |
| 4 | **Inline errors, no toasts for failures** | Validation errors appear adjacent to the failing field. Success is implicit (redirect + updated list). |
| 5 | **List is the source of truth** | Every write action (create, save, delete) ends with a redirect to `/` where the updated state is visible immediately — no stale cache, no optimistic UI. |
| 6 | **44 × 44 px minimum touch targets** | All tappable elements meet Apple HIG / WCAG 2.5.5 guidelines. Enforced via padding, not by enlarging visual elements. |

### Design Token Summary

| Token | Value | Usage |
|-------|-------|-------|
| `--color-accent` | `#FBCA5C` | CTA buttons, pinned indicator |
| `--color-text` | `#0A0A0A` | All body text, headings, labels |
| `--color-surface` | `#FFFFFF` | Page background, card background |
| `--color-border` | `#E0E0E0` | Input borders, dividers |
| `--color-error` | `#D32F2F` | Inline error messages |
| `--color-muted` | `#757575` | Placeholder text, secondary metadata |
| `--font-size-body` | `16px` | Minimum body text size |
| `--font-size-title` | `18px` | Note titles in list rows |
| `--touch-target` | `44px` | Minimum height/width for interactive elements |
| `--radius` | `8px` | Input and button border-radius |
| `--spacing-page` | `16px` | Horizontal page padding on mobile |

### Screen Inventory

| Screen | Route | User Stories |
|--------|-------|-------------|
| Note List | `/` | US-0.1, US-0.2, US-1.1, US-1.2, US-1.3, US-6.1, US-6.2 |
| Create Note | `/notes/new` | US-2.1, US-2.2, US-6.1, US-6.2 |
| Edit / Delete Note | `/notes/[id]/edit` | US-3.1, US-3.2, US-3.3, US-6.1, US-6.2 |

### Flow Inventory

| Flow | Trigger | Primary Stories |
|------|---------|----------------|
| Flow-00: Capture Note | Tap "New note" | US-2.1, US-2.2 |
| Flow-01: Search & Retrieve | Type in search box | US-1.1, US-1.2, US-1.3 |
| Flow-02: Edit & Delete | Tap note row | US-3.1, US-3.2, US-3.3 |

---
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
## Screen-00: Note List (`/`)

**Purpose:** Primary screen. Displays all notes sorted pinned-first then newest-first. Entry point for search, create, and edit flows.  
**User Stories:** US-0.1, US-0.2, US-1.1, US-1.2, US-1.3, US-6.1, US-6.2  
**Feature Refs:** F0, F1, F6  

---

### Layout — Mobile (360 px baseline)

```
┌─────────────────────────────────────┐  ← 360 px wide
│ ┌─────────────────────────────────┐ │
│ │  QuickNotes          [+ New]    │ │  ← Nav header, 56 px tall
│ │                      ─────────  │ │    [+ New] = Gold #FBCA5C bg button
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🔍 Search notes...          [×] │ │  ← Search bar, 44 px tall
│ └─────────────────────────────────┘ │
│                                     │
│ ─── Pinned ──────────────────────── │  ← Section separator (only if pinned notes exist)
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📌  Meeting prep           ›    │ │  ← Pinned note row
│ │     Agenda: standup, retro...   │ │    56+ px tall, full-width tap target
│ └─────────────────────────────────┘ │
│                                     │
│ ─── Notes ───────────────────────── │  ← Section separator (only if both sections exist)
│                                     │
│ ┌─────────────────────────────────┐ │
│ │     Groceries               ›   │ │  ← Regular note row, 56+ px tall
│ │     milk, eggs, oat milk...     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │     Thai Place on 5th       ›   │ │
│ │     Corner of 5th and Main...   │ │
│ └─────────────────────────────────┘ │
│                                     │
│  · · ·  (more rows)                 │
│                                     │
└─────────────────────────────────────┘
```

**Nav header spec:**
- Height: 56 px
- Left: "QuickNotes" logotype / app name in `#0A0A0A`, 18 px semi-bold
- Right: `[+ New]` button — Gold `#FBCA5C` background, `#0A0A0A` text, 8 px border-radius, min 44 × 36 px, label "+ New note" (or icon + label)
- Sticky (position: sticky; top: 0) so the New button is always reachable

**Search bar spec:**
- Full-width minus 16 px padding each side
- Height: 44 px
- Left: magnifier icon (decorative)
- Placeholder: "Search notes…"
- Right: `×` clear button — only visible when input is non-empty; min 44 × 44 px tap area
- `type="search"` or `type="text"` with `aria-label="Search notes"`

**Note row spec:**
- Full-width tappable link (`<a>` wrapping row content), navigates to `/notes/[id]/edit`
- Min height: 56 px (padding: 12 px 16 px)
- Title: 18 px, `#0A0A0A`, semi-bold, single line truncated with ellipsis if overflow
- Body snippet: 14 px, `#757575`, single line, max ~50 chars, truncated
- Right arrow `›` — decorative affordance indicating tappability
- Pinned note: pin icon 📌 (or small Gold `#FBCA5C` left border, 4 px wide) prepended to title area
- Bottom border: 1 px `#E0E0E0` divider between rows

**Section separators:**
- "Pinned" separator only rendered if `notes.some(n => n.pinned)`
- "Notes" separator only rendered if both pinned AND non-pinned notes exist
- If all notes are pinned or all are unpinned, no separator needed

---

### Layout — Desktop (≥ 768 px)

```
┌─────────────────────────────────────────────────────────────┐
│  QuickNotes                                    [+ New note]  │  ← Nav, max-width container centred
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  🔍 Search notes...                              [×]  │ │  ← Max width 640 px, centred
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ─── Pinned ─────────────────────────────────────────────  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 📌  Meeting prep                                  ›   │ │
│  │     Agenda: standup, retro...                         │ │
│  └───────────────────────────────────────────────────────┘ │
│  ─── Notes ──────────────────────────────────────────────  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │     Groceries                                     ›   │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```
Content column: max-width 640 px, centred with auto horizontal margins. Same single-column layout — no grid/multi-column on desktop for MVP.

---

### Information Hierarchy

| Priority | Content | Placement | Styling |
|----------|---------|-----------|---------|
| Primary | Note title | Row, top line | 18 px semi-bold `#0A0A0A` |
| Primary | "New note" CTA | Nav header, top-right | Gold `#FBCA5C` button, always visible |
| Secondary | Body snippet | Row, second line | 14 px `#757575` |
| Secondary | Search box | Below nav header | Always visible |
| Tertiary | Pinned indicator | Left of title / left border | Small pin icon or Gold accent border |
| Tertiary | Section labels "Pinned" / "Notes" | Between sections | 12 px uppercase `#757575`, conditional |

---

### States

| State | Trigger | Appearance | User Feedback |
|-------|---------|------------|---------------|
| **Default (notes exist)** | Page load with notes | List of rows, pinned first | N/A |
| **Empty** (US-0.2) | Zero notes in DB | "No notes yet" centred, "New note" button below | "No notes yet" (exact text) + Gold "New note" button |
| **Loading** | Server fetch in-flight | Skeleton rows (3 grey placeholder blocks, 56 px each) | Implicit — no spinner text |
| **Search active — matches** (US-1.1) | Search input non-empty, ≥1 match | Only matching rows visible | — |
| **Search active — no match** (US-1.3) | Search input non-empty, 0 matches | All rows hidden; "No matching notes" centred | "No matching notes" (exact text) |
| **Search cleared** (US-1.2) | Input emptied | Full list restored | — |
| **DB error on load** | PostgreSQL unavailable | Error message: "Unable to load notes. Please try again." | Full-page error message |

**Empty State Wireframe:**
```
┌─────────────────────────────────────┐
│  QuickNotes          [+ New]        │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │  🔍 Search notes...    [×]  │    │
│  └─────────────────────────────┘    │
│                                     │
│                                     │
│         No notes yet                │  ← centred, 16 px #757575
│                                     │
│    ┌───────────────────────┐        │
│    │     + New note        │        │  ← Gold CTA button, centred
│    └───────────────────────┘        │
│                                     │
└─────────────────────────────────────┘
```

---

### Interactive Elements

| Element | Type | Min Size | Behaviour |
|---------|------|----------|-----------|
| "New note" button (nav) | Primary CTA | 44 × 44 px | Navigate to `/notes/new` |
| "New note" button (empty state) | Primary CTA | 44 × 44 px | Navigate to `/notes/new` |
| Search input | Text input | 44 px tall | Client-side filter on every `input` event |
| Search clear (×) | Icon button | 44 × 44 px | Clear input value; restore full list |
| Note row | Full-width link | 56 px tall | Navigate to `/notes/[id]/edit` |

---
## Screen-01: Create Note (`/notes/new`)

**Purpose:** Form for capturing a new note with title, optional body, and pinned toggle. Submits to `POST /api/notes`. On success redirects to `/`.  
**User Stories:** US-2.1, US-2.2, US-6.1, US-6.2  
**Feature Refs:** F2, F6  

---

### Layout — Mobile (360 px baseline)

```
┌─────────────────────────────────────┐  ← 360 px wide
│ ┌─────────────────────────────────┐ │
│ │  ‹ Notes         New note       │ │  ← Nav header, 56 px tall
│ └─────────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  Title *                      │  │  ← Label, 14 px #0A0A0A
│  │ ┌───────────────────────────┐ │  │
│  │ │                           │ │  │  ← Title input, 44 px tall
│  │ │  Note title...            │ │  │    Auto-focused on mount
│  │ └───────────────────────────┘ │  │
│  │  ⚠ Title is required          │  │  ← Error: hidden by default, 14 px #D32F2F
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  Body (optional)              │  │  ← Label, 14 px #0A0A0A
│  │ ┌───────────────────────────┐ │  │
│  │ │                           │ │  │
│  │ │                           │ │  │  ← Body textarea, min 120 px tall
│  │ │  Add a note body...       │ │  │    resize: vertical only
│  │ └───────────────────────────┘ │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  ☐  Pin this note             │  │  ← Pinned checkbox row, 44 px tall
│  └───────────────────────────────┘  │    Entire row is tappable (label wraps checkbox)
│                                     │
│  ┌───────────────────────────────┐  │
│  │        Create note            │  │  ← Submit button, Gold #FBCA5C bg, 48 px tall
│  └───────────────────────────────┘  │
│                                     │
│         Cancel                      │  ← Text link, centred below button, 44 px tap height
│                                     │
└─────────────────────────────────────┘
```

**Nav header spec:**
- Left: `‹ Notes` back link → navigates to `/` (same as Cancel)
- Centre/Right: "New note" page title, 16 px semi-bold `#0A0A0A`
- Height: 56 px

**Title input spec:**
- Label: "Title" with asterisk (*) required indicator, 14 px
- Input: `type="text"`, `placeholder="Note title…"`, `required`, `autoFocus`
- Height: 44 px, border `1px #E0E0E0`, border-radius 8 px
- Focus ring: 2 px solid `#FBCA5C` offset 2 px (Gold focus indicator)
- Error state: border turns `#D32F2F`; error message below input

**Body textarea spec:**
- Label: "Body (optional)", 14 px
- Textarea: `placeholder="Add a note body…"`, no `required`, `rows="5"`
- Min height: 120 px; `resize: vertical`
- Same border/focus styles as title

**Pinned checkbox row spec:**
- `<label>` wraps `<input type="checkbox">` + text "Pin this note"
- Label is the full-width tap target, min 44 px tall
- Checkbox: default system checkbox style; `id="pinned"`, `name="pinned"`
- Unchecked by default

**Submit button spec:**
- Full width (minus 16 px side padding)
- Height: 48 px, border-radius 8 px
- Background: `#FBCA5C`, text: `#0A0A0A`, font-weight: 600
- Label: "Create note"
- Disabled state: opacity 0.5, cursor not-allowed
- Loading state: label changes to "Saving…", `aria-busy="true"`

**Cancel link:**
- Plain text link, centred below button
- Label: "Cancel"
- Navigates to `/` via Next.js `<Link>` — no API call
- Min 44 px tall tap area (via padding)

---

### Layout — Desktop (≥ 768 px)

Same single-column layout. Form content column: max-width 480 px, centred. The form does not expand to multi-column on desktop — single-column forms are easier to read and fill on all sizes.

---

### Information Hierarchy

| Priority | Content | Placement | Styling |
|----------|---------|-----------|---------|
| Primary | Title field | Top of form, auto-focused | Large input, immediate focus |
| Primary | Submit button | Bottom of form | Gold CTA, full width |
| Secondary | Body field | Below title | Tall textarea |
| Secondary | Pinned toggle | Below body | Full-row checkbox label |
| Tertiary | Cancel link | Below submit | Plain text link |
| Tertiary | Validation error | Below title field | Red `#D32F2F`, `role="alert"` |

---

### States

| State | Trigger | Appearance | User Feedback |
|-------|---------|------------|---------------|
| **Default** | Page mount | Empty form, title auto-focused | — |
| **Title validation error** | Submit with empty title | Red border on title input; "Title is required" below input | "Title is required" (exact text), `role="alert"` |
| **Submitting** | Valid form submitted | Submit button disabled, label "Saving…", inputs disabled | `aria-busy="true"` on form |
| **400 server error** | `POST` returns 400 | Server error message below title (same position as client error) | Server error string (e.g. "Title is required") |
| **500 / network error** | `POST` returns 500 or fails | Error banner at top of form: "Failed to save note. Please try again." | Banner with `role="alert"` |
| **Success** | `POST` returns 201 | Redirect to `/` | New note visible in list |

**Validation Error Wireframe (title empty):**
```
┌─────────────────────────────────────┐
│ ‹ Notes          New note           │
├─────────────────────────────────────┤
│                                     │
│  Title *                            │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │  ← Red border
│ └─────────────────────────────────┘ │
│  ⚠ Title is required               │  ← #D32F2F, 14 px, role="alert"
│                                     │
│  Body (optional)                    │
│ ┌─────────────────────────────────┐ │
│ │  milk, eggs, oat milk           │ │  ← Value retained
│ └─────────────────────────────────┘ │
│                                     │
│  ☐  Pin this note                   │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │        Create note              │ │  ← Gold button, enabled again
│ └─────────────────────────────────┘ │
│         Cancel                      │
└─────────────────────────────────────┘
```

---

### Interactive Elements

| Element | Type | Min Size | Behaviour |
|---------|------|----------|-----------|
| Back link `‹ Notes` | Navigation link | 44 × 44 px | Navigate to `/` |
| Title input | Text input | Full width × 44 px | `required`, auto-focused |
| Body textarea | Textarea | Full width × 120 px | Optional, vertical resize |
| Pinned checkbox label | Checkbox row | Full width × 44 px | Toggles `pinned` boolean |
| "Create note" button | Submit | Full width × 48 px | Validates → `POST /api/notes` |
| "Cancel" link | Text link | Full width × 44 px | Navigate to `/`, no API call |

---
## Screen-02: Edit / Delete Note (`/notes/[id]/edit`)

**Purpose:** Form pre-filled with an existing note's data. Allows editing and saving via `PUT /api/notes/[id]`, or deleting with confirmation via `DELETE /api/notes/[id]`. Both actions redirect to `/` on success.  
**User Stories:** US-3.1, US-3.2, US-3.3, US-6.1, US-6.2  
**Feature Refs:** F3, F6  

---

### Layout — Mobile (360 px baseline)

```
┌─────────────────────────────────────┐  ← 360 px wide
│ ┌─────────────────────────────────┐ │
│ │  ‹ Notes         Edit note      │ │  ← Nav header, 56 px tall
│ └─────────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  Title *                      │  │
│  │ ┌───────────────────────────┐ │  │
│  │ │  Groceries                │ │  │  ← Pre-filled with current title
│  │ └───────────────────────────┘ │  │
│  │  ⚠ Title is required          │  │  ← Hidden by default
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  Body (optional)              │  │
│  │ ┌───────────────────────────┐ │  │
│  │ │  milk, eggs, oat milk     │ │  │  ← Pre-filled with current body
│  │ │                           │ │  │
│  │ └───────────────────────────┘ │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  ☑  Pin this note             │  │  ← Pre-filled (checked if note.pinned = true)
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │           Save                │  │  ← Gold #FBCA5C bg, 48 px tall
│  └───────────────────────────────┘  │
│                                     │
│         Cancel                      │  ← Text link back to /
│                                     │
│  ─────────────────────────────────  │  ← Visual separator (margin-top: 32 px)
│                                     │
│  ┌───────────────────────────────┐  │
│  │         Delete note           │  │  ← Destructive button, 48 px tall
│  └───────────────────────────────┘  │    Outlined, border: 1px #D32F2F, text: #D32F2F
│                                     │    NOT Gold — visually distinct from Save
└─────────────────────────────────────┘
```

**Nav header spec:**
- Left: `‹ Notes` back link → navigates to `/`
- Centre/Right: "Edit note" page title, 16 px semi-bold `#0A0A0A`
- Height: 56 px

**Pre-filled fields spec:**
- Title: `defaultValue={note.title}`, same input styles as Screen-01
- Body: `defaultValue={note.body ?? ''}`, same textarea styles as Screen-01
- Pinned: `defaultChecked={note.pinned}`, same checkbox row styles as Screen-01
- All fields editable on mount — no read-only initial state

**Save button spec:**
- Full width, 48 px, Gold `#FBCA5C` background — identical to Screen-01's "Create note"
- Label: "Save"
- Disabled + "Saving…" during `PUT` request

**Delete button spec:**
- Full width, 48 px
- Background: `#FFFFFF` (white), border: `1px solid #D32F2F`, text: `#D32F2F`
- Label: "Delete note"
- Visually separated from the Save/Cancel group by a `<hr>` or `margin-top: 32px`
- Placement: below Cancel, at the bottom of the form — requires intentional scroll on longer notes, reducing accidental tap risk
- Disabled + "Deleting…" during `DELETE` request

---

### Layout — Desktop (≥ 768 px)

Same single-column layout as Screen-01. Max-width 480 px, centred. Delete button remains at bottom.

---

### Information Hierarchy

| Priority | Content | Placement | Styling |
|----------|---------|-----------|---------|
| Primary | Title field (pre-filled) | Top of form | Large input |
| Primary | Save button | Below pinned toggle | Gold CTA, full width |
| Secondary | Body field (pre-filled) | Below title | Tall textarea |
| Secondary | Pinned toggle (pre-filled) | Below body | Full-row checkbox label |
| Tertiary | Cancel link | Below Save | Plain text link |
| Tertiary | Delete button | Below separator | Outlined destructive style, red |
| Tertiary | Validation errors | Below title / top banner | Red inline or banner |

---

### States

| State | Trigger | Appearance | User Feedback |
|-------|---------|------------|---------------|
| **Default (pre-filled)** | Page load, note found | Form with current note values | — |
| **404 on page load** | Note ID not in DB | "Note not found" message + link to `/` | "Note not found" |
| **Title validation error** | Save with empty title | Red border + "Title is required" below title | `role="alert"` |
| **Saving** | Valid save in progress | Save button disabled, "Saving…" | `aria-busy="true"` |
| **Save success** | `PUT` returns 200 | Redirect to `/` | Updated note in list |
| **Save 404** | `PUT` returns 404 | "This note no longer exists." + link to `/` | Inline message |
| **Save 500 / network** | `PUT` fails | "Failed to save note. Please try again." banner | `role="alert"` |
| **Delete confirm pending** | "Delete note" tapped | Browser `confirm()` dialog | "Delete this note? This cannot be undone." |
| **Deleting** | Confirmed, DELETE in flight | Delete button disabled, "Deleting…" | `aria-busy="true"` |
| **Delete success** | `DELETE` returns 204 or 404 | Redirect to `/` | Note absent from list |
| **Delete 500 / network** | `DELETE` fails | "Failed to delete note. Please try again." banner | `role="alert"` |
| **Delete cancelled** | User dismisses confirm | Form stays open, no change | — |

**404 Not Found Wireframe (note doesn't exist):**
```
┌─────────────────────────────────────┐
│ ‹ Notes          Edit note          │
├─────────────────────────────────────┤
│                                     │
│                                     │
│         Note not found              │  ← centred, 16 px #757575
│                                     │
│    ┌───────────────────────┐        │
│    │    ‹ Back to notes    │        │  ← Link to /
│    └───────────────────────┘        │
│                                     │
└─────────────────────────────────────┘
```

**Delete Confirmation (browser `confirm()` dialog):**
```
┌───────────────────────────────────────┐
│  [Browser dialog]                     │
│                                       │
│  Delete this note?                    │
│  This cannot be undone.               │
│                                       │
│           [Cancel]    [OK]            │
└───────────────────────────────────────┘
```
- "Cancel" → dismiss; form stays open; no request sent
- "OK" → send `DELETE /api/notes/[id]`

---

### Interactive Elements

| Element | Type | Min Size | Behaviour |
|---------|------|----------|-----------|
| Back link `‹ Notes` | Navigation link | 44 × 44 px | Navigate to `/` |
| Title input | Text input | Full width × 44 px | Pre-filled; `required` |
| Body textarea | Textarea | Full width × 120 px | Pre-filled; optional; vertical resize |
| Pinned checkbox label | Checkbox row | Full width × 44 px | Pre-filled; toggles `pinned` |
| "Save" button | Submit | Full width × 48 px | Validates → `PUT /api/notes/[id]` |
| "Cancel" link | Text link | Full width × 44 px | Navigate to `/`, no API call |
| "Delete note" button | Destructive action | Full width × 48 px | `confirm()` → `DELETE /api/notes/[id]` |

---

### Placement of Delete vs. Save

The Delete button is intentionally placed **below a visual separator and below the Cancel link**, at the bottom of the form. This layout serves two goals:

1. **Reduces accidental deletion:** On a mobile screen, a user saving a note must tap "Save" which is above the fold. Delete requires scrolling or intentional downward action, reducing fat-finger risk.
2. **Visual distinction:** Gold (Save) vs. red outline (Delete) ensures the two actions are never confused at a glance.

On 360 px with a short title and short body, the delete button may be visible without scrolling. This is acceptable — the `confirm()` dialog remains the last line of defence.

---
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
## Responsive Considerations

**User Stories:** US-6.1, US-6.2  
**Feature Ref:** F6  

QuickNotes is designed mobile-first. The 360 px layout is the canonical design; wider viewports receive the same layout with generous horizontal margins.

---

### Breakpoint Strategy

| Breakpoint | Width | Strategy |
|------------|-------|----------|
| Mobile baseline | 360 px | Single column, 16 px horizontal page padding, full-width elements |
| Mobile standard | 375 px – 428 px | Same as baseline; primary design target |
| Tablet | 600 px – 1024 px | Single column, auto horizontal margin, max-width container |
| Desktop | > 1024 px | Single column, max-width 640 px (list) / 480 px (forms), centred |

No layout breakage is permitted at any width ≥ 360 px. Below 360 px the layout may be suboptimal but must not crash or produce JS errors.

---

### Mobile (360 px — baseline)

**Screen-00 (Note List):**
- Page padding: `16px` left and right
- Nav header: full width, 56 px tall, logo left, "New note" button right
- Search bar: full width, 44 px tall
- Note rows: full width, min 56 px tall, `padding: 12px 16px`
- Section labels: full width, 12 px uppercase
- No horizontal scroll (verified: all elements use `box-sizing: border-box`, no fixed widths exceeding viewport)

**Screen-01 (Create Note):**
- Nav header: full width, 56 px tall
- Form fields: full width, `margin-bottom: 16px`
- Title input: 44 px tall
- Body textarea: min 120 px tall
- Pinned checkbox row: full width, 44 px tall
- Submit button: full width, 48 px tall
- Cancel link: centred, 44 px tap height via `padding: 12px 0`

**Screen-02 (Edit / Delete Note):**
- Same as Screen-01 plus:
- Delete button: full width, 48 px tall
- Visual separator (`<hr>` or `margin-top: 32px`) before Delete

**Key constraint:** No element may have a fixed `width` value greater than `calc(100vw - 32px)` at 360 px. All inputs and buttons use `width: 100%` within the padded container.

---

### Tablet (600 px – 1024 px)

- Page container: `max-width: 640px; margin: 0 auto; padding: 0 24px`
- All three screens use the same single-column layout
- Forms: `max-width: 480px; margin: 0 auto`
- Note rows gain slightly more padding: `16px 24px`
- Nav header height remains 56 px
- No multi-column layout introduced

---

### Desktop (≥ 1024 px)

- Page container: `max-width: 640px; margin: 0 auto; padding: 0 32px`
- Forms: `max-width: 480px; margin: 0 auto`
- Note rows: same single-column layout
- Nav header: max-width matches page container, centred
- Body font: remains 16 px (no scaling up for desktop — this is a capture tool, not a reading tool)

**Rationale for no desktop-specific layout:** QuickNotes is a personal capture tool. Alex primarily uses it on mobile. Jordan embeds it in an iframe at ~375–500 px wide. A wide desktop layout would be wasted effort for MVP scope.

---

### Iframe Compatibility (CP-4 Cross-Journey Pattern)

The mobile-first 360–428 px design is specifically compatible with iframe embeds, which are typically 350–500 px wide in dashboard panels. The responsive container ensures the app functions correctly at any iframe width ≥ 360 px.

Key requirements:
- No fixed-width elements wider than the viewport
- `box-sizing: border-box` on all elements
- `max-width: 100%` on all media elements (none in MVP, but defensive)
- `overflow-x: hidden` on `<body>` as a safety net

---

### Touch Target Verification Checklist (US-6.1)

All interactive elements must meet 44 × 44 px minimum at 375 px viewport:

| Element | Visual Size | Tap Area | Method |
|---------|------------|----------|--------|
| "New note" nav button | ~36 px tall | 44 px tall | `min-height: 44px; padding: 4px 12px` |
| "New note" empty state button | 48 px tall | 48 px | Natural height |
| Search input | 44 px tall | 44 px | `height: 44px` |
| Search clear (×) | ~20 px icon | 44 × 44 px | `padding: 12px` on button |
| Note row | 56+ px tall | 56+ px | `min-height: 56px` |
| Title input | 44 px tall | 44 px | `height: 44px` |
| Body textarea | 120+ px tall | 120+ px | `min-height: 120px` |
| Pinned checkbox row | 44 px tall | 44 px | `<label>` with `min-height: 44px; display: flex; align-items: center` |
| Submit button | 48 px tall | 48 px | `height: 48px` |
| Cancel link | 44 px tap area | 44 px | `padding: 12px 0; display: block` |
| Delete button | 48 px tall | 48 px | `height: 48px` |
| Back link `‹ Notes` | 44 px tall | 44 px | `min-height: 44px` |

---

### Font Size Verification (US-6.1)

| Element | Min Size | Where Used |
|---------|----------|-----------|
| Body text / note snippet | 14 px | Note row body snippet |
| Input / textarea text | 16 px | All form inputs (prevents iOS auto-zoom) |
| Note title in list | 18 px | Note row title |
| Labels | 14 px | Form field labels |
| Error messages | 14 px | Inline validation errors |
| Section separators | 12 px | "Pinned" / "Notes" labels (decorative, not body text) |
| Button labels | 16 px | All CTA buttons |

> **iOS auto-zoom note:** Inputs with `font-size < 16px` cause iOS Safari to auto-zoom the viewport on focus. All `<input>` and `<textarea>` elements must have `font-size: 16px` minimum to prevent this.

---
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
