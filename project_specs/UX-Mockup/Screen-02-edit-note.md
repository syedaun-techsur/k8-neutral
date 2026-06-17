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
