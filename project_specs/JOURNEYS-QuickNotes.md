# JOURNEYS: QuickNotes

| Field | Value |
|-------|-------|
| **Product Name** | QuickNotes |
| **Version** | 1.0 |
| **Date** | 2026-06-17 |
| **Related Personas** | PERSONAS-QuickNotes.md |
| **Related JTBD** | JTBD-QuickNotes.md |
| **Related PRD** | PRD-QuickNotes.md |
| **Status** | Active |

---

## Journey Index

| JRN-ID | Persona | Scenario | Key JTBD | Stages |
|--------|---------|----------|----------|--------|
| JRN-01.1 | PER-01 Alex Moreno | Capturing a fleeting thought on mobile | JTBD-01.1, JTBD-01.4 | 5 |
| JRN-01.2 | PER-01 Alex Moreno | Finding a note by scanning and searching | JTBD-01.2, JTBD-01.3 | 5 |
| JRN-01.3 | PER-01 Alex Moreno | Editing a note and deleting a stale one | JTBD-01.3, JTBD-01.4 | 5 |
| JRN-02.1 | PER-02 Jordan Kim | First-time deploy, health check, and restart verification | JTBD-02.1, JTBD-02.2 | 5 |
| JRN-02.2 | PER-02 Jordan Kim | Embedding the app in a dashboard iframe and scripting the API | JTBD-02.3, JTBD-02.4 | 5 |

---

## PER-01: Alex Moreno — Daily Note-Taker

---

### JRN-01.1: Capturing a Fleeting Thought on Mobile

**Persona:** PER-01 (Alex Moreno)

**Scenario:** Alex is standing in line at the grocery store when a name they've been trying to remember suddenly surfaces. They have about 20 seconds before the thought vanishes and the line moves. They need to open QuickNotes, create a note, and get a confirmation that it's saved — all one-handed, without any login or onboarding interruption.

**Related Jobs:** JTBD-01.1 (Capture a thought before it evaporates), JTBD-01.4 (Trust notes survive closing the browser)

**User Stories Covered:** US2 (create note), US6 (persistence)

---

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|-------|--------|------------|----------|---------|------------|-------------|
| **1. Trigger** | Remembers a piece of info; grabs phone and opens browser to the QuickNotes URL (saved as home screen shortcut or bookmark) | Mobile browser / Home screen shortcut | "I need to write this down RIGHT NOW before the line moves" | Urgent, anxious | Fumbling to locate the bookmark while balancing bags | Home screen PWA shortcut or prominent bookmark prompt on first visit |
| **2. Land** | App loads at `/`; scans the note list briefly; spots "New note" button immediately | Note List page (F0, F6) | "Okay it loaded — where's the button to add a note?" | Slightly relieved, still rushed | If load is slow (>500ms) anxiety spikes; if button is not prominent, wastes precious seconds | Sub-500ms list load; "New note" button visually dominant (Gold `#FBCA5C` CTA above the fold) |
| **3. Create** | Taps "New note"; is taken to `/notes/new`; title field is auto-focused; types the note title one-handed | Create Note form (F2, F6) | "Title field is ready — just type. Don't need to tap anything first." | Focused, racing the clock | Field not auto-focused forces an extra tap; tiny keyboard target on 375px viewport | Auto-focus title field on page mount; 44×44px minimum tap targets; large readable font (≥16px) |
| **4. Save** | Taps "Save"; sees a redirect back to `/` with the new note appearing at the top of the list | Note List page (F0, F4, F5) | "Is it actually saved? I see it in the list — yes, it's there." | Relieved, satisfied | No visible save confirmation before redirect creates momentary doubt | New note appears at top of list immediately after redirect, confirming persistence visually |
| **5. Verify** | Closes the browser tab; reopens the app URL later from their phone | Note List page (F0, F4) | "Did it actually save or will it be gone like the phone notes app?" | Cautiously optimistic → relieved | Prior trauma from localStorage apps losing data; any blank list triggers panic | Notes load from PostgreSQL without delay or "reconnecting" banner; note is exactly as typed |

---

#### Key Moments

- **Decision Point — Stage 2 (Land):** If the page takes more than ~1 second to load or the "New note" button is hard to find, Alex abandons the app and falls back to an SMS draft to self. This is the single highest drop-off risk.
- **Risk of Abandonment — Stage 3 (Create):** If the title field is not auto-focused, Alex must tap twice instead of once — a significant friction increase when they're rushed. Any extra step here loses the thought.
- **Delight Opportunity — Stage 4 (Save):** The instant the new note appears at the top of the list after redirect is a micro-moment of satisfaction — the equivalent of pressing "send" on a message. A subtle animation (fade-in or slide-down) on the new note row turns this into a trust signal.
- **Critical Trust Moment — Stage 5 (Verify):** The first time Alex successfully closes and reopens the app and sees their note still there, they graduate from "trial user" to "primary capture surface user." This moment converts them.

#### Success Outcome

Alex captures a new note and sees it confirmed in the list in under 15 seconds from opening the app, and finds it intact the next time they open the URL. *(JTBD-01.1 success measure: ≤15 seconds from app open to persisted note; JTBD-01.4 success measure: 100% retention after browser close.)*

#### Feature Touchpoints

| Stage | Features |
|-------|----------|
| Land | F0 (Note List View), F6 (Mobile-First UI) |
| Create | F2 (Create Note), F6 (Mobile-First UI) |
| Save | F0 (Note List View), F4 (Data Persistence), F5 (REST API — POST /api/notes) |
| Verify | F0 (Note List View), F4 (Data Persistence) |

---

### JRN-01.2: Finding a Note by Scanning and Searching

**Persona:** PER-01 (Alex Moreno)

**Scenario:** Alex captured a note three days ago with the name of a restaurant a colleague recommended. They don't remember the exact title but know it had the word "Thai" in it. They open QuickNotes during their lunch break, glance at the list, don't see it immediately in the top 5 notes, and then use the search box to type "Thai" — expecting to see the note instantly.

**Related Jobs:** JTBD-01.2 (Surface a previously captured note without friction), JTBD-01.3 (Keep the most important notes always visible)

**User Stories Covered:** US1 (view notes), US3 (search notes)

---

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|-------|--------|------------|----------|---------|------------|-------------|
| **1. Open** | Opens QuickNotes URL during lunch break; list loads showing 15–20 note titles | Note List page (F0, F6) | "Let me see if I can spot it quickly by scanning" | Neutral, mildly hopeful | If load is slow the whole retrieval task is already frustrating before it begins | < 500ms load; newest-first sort means recent notes are immediately visible at top |
| **2. Scan** | Scrolls through the note list visually reading titles; doesn't find the restaurant note in the first 5 entries | Note List page (F0, F6) | "I don't see it — it must be buried further down. Let me search." | Mildly frustrated, shifting strategy | If there are no pinned notes and 20+ notes must be scrolled, scanning fails; no visual hierarchy | Pinned notes anchored at top give high-priority notes guaranteed visibility; clean title typography for fast scanning |
| **3. Search** | Taps the search box; types "Thai"; watches the list filter in real time | Search box (F1, F6) | "Typing 'T'… 'Th'… 'Thai' — there it is, I see it filtering already" | Engaged, expectant | If search requires a page reload or a submit button, the flow breaks; lag of even 200ms feels wrong on mobile | Synchronous in-memory filter; visible result on first keypress; case-insensitive match |
| **4. Locate** | Sees the restaurant note appear as the only result; reads the title to confirm it's the right one | Filtered Note List (F1) | "Yes — 'Thai Place on 5th' — that's the one" | Satisfied, relieved | If a similarly-named note is also returned, needs to open both to distinguish — no preview of body | Show a brief body excerpt (first 40 chars) below the title in search results to aid disambiguation |
| **5. Return** | Taps note title to open the edit page; reads the body; taps back to list; clears search | Edit Note page (F3), Note List (F0) | "Got what I needed. Back to the list — and the full list is back when I clear the search" | Satisfied, task complete | If clearing search requires a manual delete of typed text (no clear button), minor friction | Inline "×" clear button in the search field; clearing restores full list instantly |

---

#### Key Moments

- **Decision Point — Stage 2 (Scan):** Alex decides whether to scroll further or switch to search. If the list has no visual hierarchy (all notes look identical, no pinning visible), scanning is slower and the switch to search comes sooner — but search must then work perfectly.
- **Delight Opportunity — Stage 3 (Search):** Real-time filtering that visibly responds to the first typed character is the single biggest "this app is fast" signal. Even one character filtering to a shorter list feels magical and builds trust.
- **Risk of Abandonment — Stage 4 (Locate):** If the correct note isn't found because the search is case-sensitive or doesn't match substrings, Alex concludes the note was lost and loses faith in the app. This is a trust-breaking moment.

#### Success Outcome

Alex locates the restaurant note by typing a partial title within 30 seconds of opening the app, starting from a 20-note list. *(JTBD-01.2 success measure: target note located within 30 seconds.)*

#### Feature Touchpoints

| Stage | Features |
|-------|----------|
| Open | F0 (Note List View), F6 (Mobile-First UI) |
| Scan | F0 (Note List View) |
| Search | F1 (Note Search), F6 (Mobile-First UI) |
| Locate | F1 (Note Search) |
| Return | F3 (Edit Note), F0 (Note List View) |

---

### JRN-01.3: Editing a Note and Deleting a Stale One

**Persona:** PER-01 (Alex Moreno)

**Scenario:** Alex has two tasks: (1) update their grocery list note to add "oat milk," and (2) delete a note about a meeting from two weeks ago that is now irrelevant. They also want to pin the grocery list so it stays at the top of the list permanently.

**Related Jobs:** JTBD-01.3 (Keep most important notes always visible), JTBD-01.4 (Trust notes survive closing the browser)

**User Stories Covered:** US4 (edit note), US5 (delete note)

---

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|-------|--------|------------|----------|---------|------------|-------------|
| **1. Select** | Opens QuickNotes; taps "Groceries" note title from the list | Note List (F0), tap target | "I need to edit the grocery list — I can see it in the list, let me tap it" | Neutral, purposeful | If the tap target is too small (< 44px height), misfire opens wrong note; annoying on mobile | Full-width tappable row with generous padding; note title is the primary tap target |
| **2. Edit** | Edit page opens pre-filled with current title, body, pinned state; taps into body field; adds "oat milk" to the list; also toggles "Pinned" checkbox to true | Edit Note page (F3, F6) | "Title's there, body's there — I just need to add to the body and check the Pinned box" | Focused | If the form is not pre-filled and Alex must retype everything, this is a dealbreaker; if pinned toggle is hidden or requires extra navigation, they won't find it | Form pre-filled on load; pinned toggle visible without scrolling on mobile viewport; inline editing without page reload |
| **3. Save (Edit)** | Taps "Save"; is redirected to `/`; sees "Groceries" note now appears at the top of the list (pinned) | Note List (F0, F4) | "It moved to the top — that means it's pinned. Good." | Satisfied | If pinned notes don't visually distinguish from regular notes, Alex isn't sure the pin worked | Pinned notes shown with a visual indicator (e.g., pin icon or Gold accent bar); note jumps to top immediately on redirect |
| **4. Delete** | Scrolls to find the old meeting note; taps it; on the edit page taps "Delete"; sees a confirmation prompt | Edit Note page (F3) | "Delete… it's asking me to confirm — okay, yes, delete it." | Confident, slightly cautious | If there is no confirmation, accidental deletions are unrecoverable; if the confirmation is a browser `alert()` it feels archaic | Native browser confirm() is acceptable for MVP; clear language: "Delete this note? This cannot be undone." |
| **5. Confirm & Verify** | Confirms the delete; is redirected to `/`; scans the list to confirm the meeting note is gone and the grocery list is still pinned at top | Note List (F0, F4) | "Meeting note is gone. Grocery list is still at the top. Perfect." | Relieved, trusting | If the deleted note flickers back for a moment (stale cache), or if the pinned note moved out of position, trust breaks | Immediate redirect to fresh list from server; deleted note absent; pinned note anchored at top |

---

#### Key Moments

- **Risk of Abandonment — Stage 2 (Edit):** If the edit form is not pre-filled with the existing note content, Alex must retype everything. This is an immediate abandon trigger — they will not re-enter a long note body.
- **Decision Point — Stage 2 (Pin):** The pinned toggle must be visible without scrolling on a 375px viewport. If Alex must scroll down past the body textarea to find it, most users will miss it.
- **Delight Opportunity — Stage 3 (Save/Pin):** Watching the grocery list jump to the top of the list immediately after saving the pinned state is a "this works exactly as I expected" moment — a rare and satisfying UX beat.
- **Trust Signal — Stage 5 (Verify):** Seeing the correct state (deleted note gone, pinned note at top) after redirect is confirmation that the app's state is reliable and predictable. This reinforces daily habit formation.

#### Success Outcome

Alex pins the grocery list note and verifies it at the top within 20 seconds of tapping its title on the home screen; the deleted meeting note is permanently gone with no possibility of accidental data loss. *(JTBD-01.3 success measure: pinned and at top in under 20 seconds.)*

#### Feature Touchpoints

| Stage | Features |
|-------|----------|
| Select | F0 (Note List View), F6 (Mobile-First UI) |
| Edit | F3 (Edit Note), F6 (Mobile-First UI) |
| Save (Edit) | F3 (Edit Note), F0 (Note List), F4 (Data Persistence), F5 (REST API — PUT) |
| Delete | F3 (Edit Note / Delete) |
| Confirm & Verify | F0 (Note List), F4 (Data Persistence), F5 (REST API — DELETE) |

---

## PER-02: Jordan Kim — Developer / Operator

---

### JRN-02.1: First-Time Deploy, Health Check, and Restart Verification

**Persona:** PER-02 (Jordan Kim)

**Scenario:** Jordan has cloned the repo onto a new VPS. They create a `.env` file with the PostgreSQL connection string, run `docker run` with that env file, and expect the app to be immediately usable — no SQL files, no migration scripts, no manual setup. They then verify health with `curl`, create a test note through the UI, kill and restart the container, and confirm the note survived.

**Related Jobs:** JTBD-02.1 (Stand up the service once with zero manual database steps), JTBD-02.2 (Confirm the service is healthy with a single command)

**User Stories Covered:** US6 (persistence — operator angle), US1 (list after restart)

---

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|-------|--------|------------|----------|---------|------------|-------------|
| **1. Configure** | Creates `.env` file with `DATABASE_URL=postgresql://...`; reviews README for any required steps | `.env` file, README | "Is there anything else I need to do beyond setting the env var? Please say no." | Cautiously optimistic | If README lists manual SQL steps or a separate migration command, trust immediately drops | Single-sentence deploy instruction: "Set DATABASE_URL, run the container, done." No prerequisites listed |
| **2. Start** | Runs `docker run --env-file .env -p 3000:3000 quicknotes`; watches container logs | Terminal, Docker, container logs | "Starting… what am I looking for in the logs to know it worked? Is there a 'ready' message?" | Attentive, slightly tense | Cryptic log output (Next.js build logs) makes it hard to identify the moment the app is ready; silent migration failure is the worst case | Startup log line: `"[QuickNotes] Schema ready. Listening on 0.0.0.0:3000"` — unambiguous ready signal |
| **3. Health Check** | Runs `curl -s http://localhost:3000/api/health`; expects `{"status":"ok"}` | Terminal, REST API (F5) | "If this returns 200, I know the process is up. DB state doesn't matter here." | Methodical, analytical | Health endpoint that depends on DB makes it impossible to distinguish app-down from DB-down | Process-only health check returns 200 regardless of DB state; Jordan can then separately probe DB if needed |
| **4. Smoke Test** | Opens browser to `http://localhost:3000`; creates a test note through the UI; confirms it appears in the list | Browser, Note List (F0), Create Note (F2) | "If I can create a note and see it in the list, the whole stack is working — DB included." | Confident, systematic | If the list page returns a 500 error (schema missing), Jordan knows the migration failed — but now they must debug without clear guidance | List page either shows empty state or notes — never a 500 if migration ran correctly; empty state with "No notes yet" confirms schema exists |
| **5. Restart Verification** | Kills the container; restarts it; reopens the UI; confirms the test note is still present | Terminal, Docker, Browser, Note List (F0, F4) | "Note is still there — data survived the restart. This is a real database, not in-memory." | Satisfied, trusting | If any notes are missing after restart (in-memory DB or lost connection), the app fails the most basic reliability requirement | PostgreSQL persistence guarantees note survival; `CREATE TABLE IF NOT EXISTS` on restart is idempotent — no data loss |

---

#### Key Moments

- **Decision Point — Stage 1 (Configure):** Jordan reads the README for setup steps. If there are more than 2 steps (set env var + run container), confidence drops. Any mention of "run migrations separately" is an immediate red flag.
- **Risk of Abandonment — Stage 2 (Start):** Silent startup failure (container starts, no 500 errors, but schema was never created) is the hardest failure mode to diagnose. Jordan may spend 30+ minutes debugging before realizing the migration didn't run.
- **Delight Opportunity — Stage 3 (Health Check):** A clean `{"status":"ok"}` response from `curl` in under 200ms is a moment of professional satisfaction — "this is a well-built service."
- **Trust Signal — Stage 5 (Restart):** Data surviving a container restart is the operational equivalent of Alex's data surviving a browser close. It confirms PostgreSQL is doing its job and the app is production-grade.

#### Success Outcome

A fresh `docker run` with only a `DATABASE_URL` env var results in a fully functional UI with zero additional operator steps; `GET /api/health` returns `200 {"status":"ok"}` in < 200ms; notes survive a container kill-and-restart. *(JTBD-02.1 success measure: working UI on first request after docker run; JTBD-02.2 success measure: health check returns 200 in < 200ms.)*

#### Feature Touchpoints

| Stage | Features |
|-------|----------|
| Configure | F4 (Data Persistence — env var config), F7 (Deployment Compatibility) |
| Start | F4 (Data Persistence — auto-migration), F5 (REST API), F7 (Deployment Compatibility) |
| Health Check | F5 (REST API — GET /api/health) |
| Smoke Test | F0 (Note List View), F2 (Create Note), F5 (REST API) |
| Restart Verification | F0 (Note List View), F4 (Data Persistence) |

---

### JRN-02.2: Embedding the App in a Dashboard Iframe and Scripting the API

**Persona:** PER-02 (Jordan Kim)

**Scenario:** Jordan wants to access QuickNotes inline within their personal developer dashboard without switching browser tabs. They add the QuickNotes URL as an `<iframe>` in the dashboard HTML, load it in Chrome, then Safari, then Firefox, and verify there are no console errors. They also write a short shell script using `curl` and `jq` to list all notes, create a new one, and delete it — to validate the API contract.

**Related Jobs:** JTBD-02.3 (Embed the running app in a dashboard preview panel), JTBD-02.4 (Inspect and script the notes data without using the UI)

**User Stories Covered:** REST API coverage for US1, US2, US5

---

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|-------|--------|------------|----------|---------|------------|-------------|
| **1. Embed** | Adds `<iframe src="http://localhost:3000" width="400" height="600"></iframe>` to dashboard HTML; loads the dashboard in Chrome | Dashboard HTML, Browser, App (F7) | "I've been burned before by X-Frame-Options. Let me check the console immediately." | Wary, experienced | The most common failure: blank iframe with a browser console error; no visible indication of why | No `X-Frame-Options` header emitted; no `frame-ancestors` CSP directive; iframe renders note list immediately |
| **2. Cross-Browser Verify** | Opens the same dashboard in Safari and Firefox; checks browser console in each for frame-related errors | Browser (Safari, Firefox), App (F7) | "Safari is always the tricky one. If it works in Safari it'll work everywhere." | Methodical, thorough | Safari may handle CSP differently; Firefox may enforce stricter frame policies depending on header combinations | Consistent header omission across all responses means all three browsers behave identically |
| **3. Iframe Usability** | Within the iframe, creates a note using the create form; verifies it appears in the list within the iframe frame | App inside iframe (F2, F0, F6) | "Can I actually use the app inside the frame — or does it break at the form page?" | Pleasantly surprised (if it works) | Navigation inside iframe may resize poorly if viewport width changes; mobile layout at iframe width may need to be responsive | Responsive layout works at 375px–428px — same widths common in iframe panels; full CRUD usable without escaping the frame |
| **4. API Script** | Opens terminal; writes a shell script: `curl GET /api/notes`, `curl POST /api/notes` with JSON body, `curl DELETE /api/notes/[id]`; runs it | Terminal, REST API (F5) | "I want to verify the field names, status codes, and that I can do a full round-trip without touching the UI." | Analytical, precise | Inconsistent field names between POST response and GET response; HTML error pages instead of JSON on validation failure | Consistent JSON shape on all responses; `POST` validates title is non-empty and returns 400 JSON (not HTML) if missing; `DELETE` returns 204 |
| **5. Validate Contract** | Reviews script output; confirms: GET returns array with `id`, `title`, `body`, `pinned`, `created_at`; POST returns the created note; DELETE returns 204; no HTML error pages | Terminal, REST API (F5) | "Field names are consistent, status codes are correct, errors are JSON — I can rely on this API." | Confident, satisfied | Any HTML error response or inconsistent field casing breaks `jq` parsing and requires manual investigation | API contract documented and enforced; all 4xx/5xx responses return `{"error": "..."}` JSON, never HTML |

---

#### Key Moments

- **Risk of Abandonment — Stage 1 (Embed):** A blank iframe with a browser console error (`Refused to display in a frame because it set 'X-Frame-Options' to 'SAMEORIGIN'`) is an immediate blocker. Jordan knows how to fix it but must modify Next.js config — friction that destroys the "zero ongoing maintenance" goal.
- **Decision Point — Stage 2 (Cross-Browser):** If Chrome works but Safari shows an error, Jordan must decide whether to debug Next.js header configuration or abandon the iframe approach. Safari compatibility is the higher bar.
- **Delight Opportunity — Stage 3 (Iframe Usability):** The full app being usable — including create and navigate — within the iframe is a pleasant surprise. Most embedded apps break on navigation. This is a "wow, it actually works" moment.
- **Trust Signal — Stage 5 (Validate Contract):** A consistent, predictable API contract is professional-grade. If Jordan can write a `curl`+`jq` script in under 5 minutes that works first try, the app earns high operator trust.

#### Success Outcome

QuickNotes renders without any frame-blocking browser console errors in Chrome, Safari, and Firefox; a shell script using only `curl` and `jq` successfully lists all notes, creates a new note, and deletes it with zero manual steps. *(JTBD-02.3 success measure: zero frame-blocking errors in all three browsers; JTBD-02.4 success measure: full CRUD scriptable with curl and jq only.)*

#### Feature Touchpoints

| Stage | Features |
|-------|----------|
| Embed | F7 (Iframe & Deployment Compatibility) |
| Cross-Browser Verify | F7 (Iframe & Deployment Compatibility) |
| Iframe Usability | F2 (Create Note), F0 (Note List), F6 (Mobile-First UI — iframe width) |
| API Script | F5 (REST API — GET, POST, DELETE) |
| Validate Contract | F5 (REST API) |

---

## Cross-Journey Patterns

### CP-1: Trust Through Instant Feedback
**Appears in:** JRN-01.1 (Stage 4 — note appears in list after save), JRN-01.3 (Stage 3 — pinned note jumps to top), JRN-02.1 (Stage 3 — health check responds immediately), JRN-02.2 (Stage 1 — iframe renders without error)

Both personas need immediate, unambiguous confirmation that their action worked. Alex needs visual feedback (note in list). Jordan needs machine-readable feedback (JSON response, no console errors). The common design principle: **no silent success and no silent failure** — every action produces an observable outcome within one interaction cycle.

### CP-2: Zero-Setup Assumption (No Manual Steps)
**Appears in:** JRN-01.1 (Stage 1 — no login gate), JRN-02.1 (Stages 1–2 — no SQL steps), JRN-02.2 (Stage 4 — no auth header required for API)

Both personas have been burned by tools that require setup before the first use. Alex was burned by account-gated apps and localStorage loss. Jordan was burned by missing `CREATE TABLE` steps. The entire QuickNotes design philosophy — auto-migration, no auth, no config ritual — exists to serve this shared zero-setup expectation.

### CP-3: Data Durability as the Baseline Expectation
**Appears in:** JRN-01.1 (Stage 5 — notes survive browser close), JRN-01.3 (Stage 5 — deleted note stays gone, pinned state persists), JRN-02.1 (Stage 5 — notes survive container restart)

Both personas depend on the system's state being reliable and predictable. Alex needs to trust that captures are permanent. Jordan needs to trust that restarts are non-destructive. PostgreSQL with idempotent `CREATE TABLE IF NOT EXISTS` on startup is the single architectural decision that satisfies both.

### CP-4: Mobile Viewport = Iframe Width
**Appears in:** JRN-01.1 (Stages 2–3 — 375px one-handed capture), JRN-01.2 (Stage 3 — search on 375px), JRN-02.2 (Stage 3 — iframe at similar width)

The mobile-first 375px design that serves Alex's one-handed capture use case is the same constraint that makes the app usable when Jordan embeds it in an iframe panel (typically 350–500px wide). F6 (Mobile-First UI) and F7 (Iframe Compatibility) are complementary requirements serving different personas.

### CP-5: REST API as the Shared Foundation
**Appears in:** JRN-01.1 (Stage 4 — POST /api/notes), JRN-01.3 (Save/Delete stages — PUT, DELETE), JRN-02.1 (Stage 3 — GET /api/health), JRN-02.2 (Stages 4–5 — scripted API calls)

Every user-visible action in Alex's journeys is powered by an API call. Every operational task in Jordan's journeys depends on the same API being predictable. F5 (REST API) is not just Jordan's concern — it is the invisible layer that determines whether Alex's experience is fast, reliable, and consistent.

---

## Journey-to-JTBD Traceability

| JRN-ID | Stage | JTBD-ID | Expected Outcome |
|--------|-------|---------|-----------------|
| JRN-01.1 | 1. Trigger | JTBD-01.1 | App reachable at URL with no login prompt — thought capture begins immediately |
| JRN-01.1 | 3. Create | JTBD-01.1 | Title field auto-focused on `/notes/new`; one-handed typing begins without extra tap |
| JRN-01.1 | 4. Save | JTBD-01.1 | Note appears in list within 15 seconds of opening the app; `POST /api/notes` returns 201 |
| JRN-01.1 | 5. Verify | JTBD-01.4 | 100% of notes present and unmodified after browser close and reopen |
| JRN-01.2 | 1. Open | JTBD-01.2 | List page renders all note titles in < 500ms; pinned notes at top |
| JRN-01.2 | 3. Search | JTBD-01.2 | Real-time title filtering with no perceptible lag on every keypress; no server round-trip |
| JRN-01.2 | 4. Locate | JTBD-01.2 | Target note identifiable within 30 seconds from a 20-note list |
| JRN-01.2 | 2. Scan | JTBD-01.3 | Pinned notes always visible at top of list; no scrolling required to find them |
| JRN-01.3 | 2. Edit | JTBD-01.3 | Pinned toggle accessible on edit page without additional menu navigation |
| JRN-01.3 | 3. Save (Edit) | JTBD-01.3 | Pinned state persists immediately; note moves to top on redirect; survives page reload |
| JRN-01.3 | 4. Delete | JTBD-01.4 | Confirmed delete permanently removes note; appears gone from list immediately |
| JRN-01.3 | 5. Verify | JTBD-01.4 | Correct list state (deleted note gone, pinned note at top) confirmed after redirect |
| JRN-02.1 | 1. Configure | JTBD-02.1 | Single env var (`DATABASE_URL`) is the only required configuration step |
| JRN-02.1 | 2. Start | JTBD-02.1 | `CREATE TABLE IF NOT EXISTS` runs automatically; startup logs confirm schema ready |
| JRN-02.1 | 3. Health Check | JTBD-02.2 | `GET /api/health` returns `200 {"status":"ok"}` in < 200ms; no DB dependency |
| JRN-02.1 | 4. Smoke Test | JTBD-02.1 | UI functional (list + create) on first HTTP request; no 500 error |
| JRN-02.1 | 5. Restart | JTBD-02.1 | Container restart is non-destructive; `CREATE TABLE IF NOT EXISTS` is idempotent |
| JRN-02.2 | 1. Embed | JTBD-02.3 | No `X-Frame-Options` or `frame-ancestors` CSP header emitted; iframe renders note list |
| JRN-02.2 | 2. Cross-Browser | JTBD-02.3 | Zero frame-blocking errors in Chrome, Safari, and Firefox latest |
| JRN-02.2 | 3. Iframe Usability | JTBD-02.3 | Full create/list/edit flow usable within iframe at dashboard-embedded width |
| JRN-02.2 | 4. API Script | JTBD-02.4 | `GET /api/notes`, `POST /api/notes`, `DELETE /api/notes/[id]` return correct status codes and consistent JSON |
| JRN-02.2 | 5. Validate Contract | JTBD-02.4 | Shell script using only `curl` and `jq` completes full CRUD cycle with zero manual steps |

---

## Validation Checklist

- [x] Every persona has at least 1 journey (PER-01: 3 journeys; PER-02: 2 journeys)
- [x] Every journey maps to at least 1 JTBD
- [x] All stages have all columns populated (Action, Touchpoint, Thinking, Feeling, Pain Point, Opportunity)
- [x] Success outcomes trace to JTBD success measures (with explicit measures cited)
- [x] Key moments identified for every journey (Decision Point, Risk of Abandonment, Delight/Trust Opportunity)
- [x] Cross-journey patterns documented (5 patterns: CP-1 through CP-5)
- [x] Feature touchpoints reference valid PRD feature IDs (F0–F7)
- [x] Journey-to-JTBD traceability table is complete (22 rows covering all JTBD-IDs)
- [x] User stories US1–US6 covered across journeys

---

*Document generated: 2026-06-17*
*Sources: PERSONAS-QuickNotes.md, JTBD-QuickNotes.md, PRD-QuickNotes.md, .planning/PROJECT.md*
*Downstream documents: STORY-MAP-QuickNotes.md, FRD-QuickNotes.md*
