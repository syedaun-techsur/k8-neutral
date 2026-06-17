---

## F06: Mobile-First UI & Design System

**PRD Reference:** F6 | **Priority:** P1 — High | **User Stories:** All

**Description:** The application is designed mobile-first with a minimal, high-contrast visual language. A Gold accent color (`#FBCA5C`) is used sparingly as an accent on CTAs and highlights, covering at most 10% of any view's surface area. Body text uses near-black (`#0A0A0A`) on white (`#FFFFFF`) surfaces. All interactive elements meet a minimum 44×44px touch target size. The layout must not break on desktop — the mobile design scales up gracefully.

---

### Terminology

- **Viewport width:** The rendered width of the browser window. Primary target: 375px–428px (iPhone SE to iPhone Pro Max).
- **Touch target:** The tappable/clickable area of an interactive element. Must be at least 44×44px even if the visual element is smaller (use padding to expand).
- **Gold accent (`#FBCA5C`):** The brand accent color used on CTAs (e.g., "New note" button background, "Save" button), highlights, and pinned indicators.
- **Near-black (`#0A0A0A`):** The primary text color used for all body text, headings, and labels.
- **Surface white (`#FFFFFF`):** The background color of all page surfaces and cards.
- **10% rule:** Gold accent must not occupy more than 10% of the total visible pixel area of any single view.

---

### Sub-features

- Mobile-first responsive layout (375px–428px primary)
- Gold `#FBCA5C` accent on CTAs and highlights (≤10% of any view surface)
- Near-black `#0A0A0A` body text on white surfaces
- Minimum 44×44px touch targets for all interactive elements
- Minimum 16px font size for body text on mobile
- No horizontal scroll at 375px viewport width
- No layout breakage on desktop (graceful scale-up)
- Plain CSS or CSS Modules (no required Tailwind or CSS-in-JS)

---

### Process

1. All pages use a single-column mobile-first layout. No horizontal scroll at 375px.
2. Interactive elements (buttons, links, checkboxes, inputs) have a minimum tap target of 44×44px, enforced via padding if the visual size is smaller.
3. The "New note" button/CTA uses Gold `#FBCA5C` as its background or prominent accent color.
4. The "Save"/"Create" button on forms uses Gold `#FBCA5C` as its primary color.
5. Pinned notes may be visually distinguished with a Gold accent (icon, border, or badge) — provided total Gold surface area on the view stays ≤10%.
6. Body text, titles, and labels render in `#0A0A0A` at a minimum of 16px on mobile viewports.
7. Page backgrounds and card/list-item backgrounds are white (`#FFFFFF`).
8. On wider viewports (tablet/desktop), the layout may widen or add horizontal padding — it must not break or overflow.

---

### Inputs

- No user-submitted input specific to this feature.
- Viewport width (browser environment): determines responsive layout breakpoints.

---

### Outputs

- Rendered pages that are visually consistent with the design system.
- No horizontal scroll at 375px viewport width.
- All interactive elements reachable and tappable on a mobile device.

---

### Validation

- Gold `#FBCA5C` surface coverage ≤ 10% per view.
- All `<button>`, `<a>`, `<input>`, `<textarea>`, `<label for checkbox>` elements: computed height ≥ 44px AND computed width ≥ 44px (or accessible tap area ≥ 44×44px).
- Body text: `font-size` ≥ 16px at 375px viewport width.
- No `overflow-x: scroll` or horizontal overflow at 375px viewport width.
- CSS file extension: `.css` or CSS Modules (`.module.css`). No Tailwind required (but not prohibited if team chooses it).

---

### Error States

| Scenario | Behavior |
|----------|----------|
| CSS fails to load | Page degrades to unstyled HTML — content must remain accessible |
| Viewport narrower than 375px | Layout may not be optimized but must not crash or produce JS errors |

---

### API Surface (this feature)

None. This feature is purely front-end styling and layout.

---

### Schema Surface (this feature)

None. No database queries specific to UI styling.
