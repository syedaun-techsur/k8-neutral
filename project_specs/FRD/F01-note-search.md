---

## F01: Note Search

**PRD Reference:** F1 | **Priority:** P1 — High | **User Story:** US3

**Description:** A search input rendered on the `/` list page filters visible note rows in real time as the user types. Filtering is performed client-side against the already-loaded list — no server round-trip or API call is made during search. Matching is case-insensitive substring matching on the note title. When the search input is cleared, the full list is restored.

---

### Terminology

- **Search input:** A text `<input>` element visible on the `/` list page, above or adjacent to the note list.
- **Filter term:** The current value of the search input, trimmed of leading/trailing whitespace for matching.
- **Matching note:** A note whose `title` contains the filter term as a case-insensitive substring.
- **No-match state:** The UI rendered when the filter term is non-empty but zero notes match.

---

### Sub-features

- Search input visible on `/` list page at all times (even when note list is empty)
- Real-time client-side filtering by title as user types
- Case-insensitive substring match
- Clearing the input restores full list
- "No matching notes" empty state when filter yields zero results

---

### Process

1. The search input is rendered as part of the `/` page, above the note list.
2. The full list of notes is loaded server-side at page render time (see F00 §Process).
3. On each `input` event on the search field:
   a. Read the current input value and trim whitespace.
   b. If the trimmed value is empty, show all notes (full list restored).
   c. If the trimmed value is non-empty, filter the rendered list: show only notes whose `title` contains the trimmed value as a case-insensitive substring (e.g., `title.toLowerCase().includes(term.toLowerCase())`).
   d. Hide (or remove from DOM) any note rows that do not match.
4. If the filtered result is empty and the search input is non-empty, render the **no-match state** (see Outputs).
5. Filtering happens synchronously on each keystroke — no debounce, no setTimeout, no API call.

---

### Inputs

- **Search input value** (string): User-typed text. May be any Unicode string. Empty string means "show all".

---

### Outputs

**Matching results visible:** Only note rows whose title matches the filter term are shown. Sort order of the visible subset is preserved from the original list (pinned first, then newest-first).

**No-match state (non-empty filter, zero matches):**
- A message: "No matching notes" (exact string)
- Search input remains visible and editable

**Search cleared (empty input):** Full note list restored exactly as in F00 §Outputs.

---

### Validation

- Matching uses `String.prototype.includes()` after both the title and the filter term are lowercased — no regex, no diacritics normalization required for MVP.
- Filter operates only on the `title` field — the `body` field is not searched.
- Filtering is purely client-side. The server is not called during a search interaction.
- The search input does not submit a form; it has no `name` attribute that would appear in query strings.
- There is no minimum character threshold — filtering begins on the first character typed.

---

### Error States

| Scenario | Behavior |
|----------|----------|
| Note list failed to load (DB error) | Search input may still render but list is empty; error message from F00 takes precedence |
| User pastes very long string | Filter runs synchronously; no truncation or length limit on the filter term for MVP |

---

### API Surface (this feature)

None. Search is entirely client-side JavaScript operating on the DOM or React state of the already-rendered note list.

---

### Schema Surface (this feature)

None at search time. Note data is already in the page from the F00 server-side fetch. See `Y0-schema.md §notes table` for the source data shape.
