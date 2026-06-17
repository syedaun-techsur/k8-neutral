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
