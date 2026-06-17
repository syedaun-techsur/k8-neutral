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
