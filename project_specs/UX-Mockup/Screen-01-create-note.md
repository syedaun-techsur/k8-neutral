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
