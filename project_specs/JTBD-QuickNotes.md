# JTBD: QuickNotes

| Field | Value |
|-------|-------|
| **Product Name** | QuickNotes |
| **Version** | 1.0 |
| **Date** | 2026-06-17 |
| **Related Personas** | PERSONAS-QuickNotes.md |
| **Related PRD** | PRD-QuickNotes.md |
| **Status** | Active |

---

## JTBD Summary

| JTBD-ID | Persona | Job Statement (abbreviated) | Priority |
|---------|---------|----------------------------|----------|
| JTBD-01.1 | PER-01 Alex — Daily Note-Taker | Capture a thought before it evaporates | P0 |
| JTBD-01.2 | PER-01 Alex — Daily Note-Taker | Surface a previously captured note without friction | P0 |
| JTBD-01.3 | PER-01 Alex — Daily Note-Taker | Keep the most important notes always visible | P1 |
| JTBD-01.4 | PER-01 Alex — Daily Note-Taker | Trust notes will survive closing the browser tab | P0 |
| JTBD-02.1 | PER-02 Jordan — Developer / Operator | Stand up the service once with zero manual database steps | P0 |
| JTBD-02.2 | PER-02 Jordan — Developer / Operator | Confirm the service is healthy with a single command | P0 |
| JTBD-02.3 | PER-02 Jordan — Developer / Operator | Embed the running app in a dashboard preview panel | P1 |
| JTBD-02.4 | PER-02 Jordan — Developer / Operator | Inspect and script the notes data without using the UI | P1 |

---

## PER-01: Alex Moreno — Daily Note-Taker

---

### JTBD-01.1: Capture a Thought Before It Evaporates

**Job Statement:**
When a thought, task, or piece of information strikes me during a commute, meeting, or moment of inspiration, I want to open the app and get the note saved without friction or login, so I can act on the thought later without it disappearing.

**Current Alternatives:**
- Types the thought into an SMS draft to self — drafts vanish unpredictably and are hard to scan later
- Uses the default phone notes app — requires account sync that breaks; notes lost after OS update
- Relies on memory — thoughts evaporate within minutes, especially in high-stimulus environments

**Hiring Criteria:**
- App is reachable at a stable URL with zero login prompt or onboarding gate
- Title field is focused immediately on `/notes/new` — single tap to start typing
- Note is saved and confirmed in under 15 seconds from opening the app
- Full creation flow works one-handed at 375px viewport with no horizontal scroll

**Success Measure:** A new note is captured and persisted to PostgreSQL in under 15 seconds from the moment the app URL is opened on mobile.

**Related Features:** F2, F4, F6
**Priority:** P0

---

### JTBD-01.2: Surface a Previously Captured Note Without Friction

**Job Statement:**
When I need to find something I wrote down days or hours ago, I want to either scan a clean title list or type a few letters into a search box and see results instantly, so I can retrieve the information without hunting through menus or waiting for a sync.

**Current Alternatives:**
- Scrolls through SMS drafts in reverse chronological order — no search, titles not visible
- Opens multiple notes apps and checks each separately — time-consuming and unreliable
- Relies on approximate memory of when the note was created to narrow the scroll position

**Hiring Criteria:**
- Home screen (`/`) shows all note titles sorted newest-first, pinned notes at top, rendering in under 500ms
- Search box on `/` filters note titles in real time with no perceptible lag on every keypress
- Filtered results appear without a page reload or server round-trip
- Clearing the search box instantly restores the full list

**Success Measure:** The user locates a target note (by scan or by typing a partial title) within 30 seconds of opening the app, starting from a list of 20 notes.

**Related Features:** F0, F1
**Priority:** P0

---

### JTBD-01.3: Keep the Most Important Notes Always Visible

**Job Statement:**
When I have two or three notes that are perpetually relevant — a grocery list, a running todo, a key piece of info — I want to pin them so they appear at the top of the list every time I open the app, so I can skip scrolling past dozens of older captures to find what I always need.

**Current Alternatives:**
- Creates folders or tags in heavier apps — organizational overhead not worth it for 1–3 notes
- Renames note titles with a prefix like "!!" to sort them to the top — brittle and ugly
- Keeps these notes as pinned browser tabs — breaks when tabs are closed or the browser restarts

**Hiring Criteria:**
- Edit page for any note exposes a pinned toggle (checkbox or switch) with no additional menu navigation
- Saving the pinned state moves the note to the top of the list on `/` immediately
- Pinned notes remain at the top across sessions, page reloads, and server restarts
- Unpinning a note moves it back into chronological order without requiring a separate action

**Success Measure:** A user can pin a note and verify it appears at the top of the list in under 20 seconds from tapping the note title on the home screen.

**Related Features:** F0, F3
**Priority:** P1

---

### JTBD-01.4: Trust That Notes Survive Closing the Browser

**Job Statement:**
When I close the browser tab, switch apps, or put my phone down for the night, I want to know with certainty that every note I captured is still exactly where I left it when I come back, so I can rely on QuickNotes as my primary capture surface instead of treating it as a temporary scratchpad.

**Current Alternatives:**
- Uses phone notes app but loses data after OS update wipes localStorage — switched away after one incident
- Keeps a physical notebook for "important" items — redundant effort; not available during commutes
- Accepts data loss as a known risk with current tools — results in occasional critical information loss

**Hiring Criteria:**
- Notes are stored in PostgreSQL, not browser localStorage or sessionStorage
- Reopening the app after closing the tab returns the same full note list — no re-capture required
- Server restart does not trigger data loss or require the user to reinitialize anything
- No "reconnecting…" banner, sync delay, or loading spinner on return to the app

**Success Measure:** 100% of notes created before closing the browser tab are present and unmodified when the same URL is opened again the next day.

**Related Features:** F4
**Priority:** P0

---

## PER-02: Jordan Kim — Developer / Operator

---

### JTBD-02.1: Stand Up the Service Once With Zero Manual Database Steps

**Job Statement:**
When I deploy the QuickNotes container for the first time by pointing it at a PostgreSQL instance via environment variable, I want the app to create its own schema and be immediately functional, so I can start using it without writing SQL, running migration scripts, or consulting a setup guide.

**Current Alternatives:**
- Manually runs `CREATE TABLE` from a SQL file before starting the app — breaks silently in CI/CD pipelines when forgotten
- Uses an ORM with a separate migration step (`prisma migrate deploy`) — another command to remember and another failure mode
- Copies schema from a README and pastes into a DB client — error-prone and requires the README to stay in sync

**Hiring Criteria:**
- `docker run` with a valid `DATABASE_URL` environment variable results in a working UI on first HTTP request — no additional steps
- `CREATE TABLE IF NOT EXISTS` runs automatically before the server handles its first request
- Restarting the container does not re-run a destructive migration or lose existing data
- Startup logs clearly indicate whether the migration succeeded or failed — no silent errors

**Success Measure:** A fresh container start against an empty PostgreSQL database produces a fully functional UI (list page loads, create form works) with zero operator commands beyond `docker run`.

**Related Features:** F4, F5
**Priority:** P0

---

### JTBD-02.2: Confirm the Service Is Healthy With a Single Command

**Job Statement:**
When I want to verify the service came up correctly after a deploy or restart, I want to curl a single unauthenticated endpoint and receive an unambiguous healthy/unhealthy signal, so I can script uptime monitoring and diagnose failures without reading application logs.

**Current Alternatives:**
- Loads the UI in a browser and checks if the list page renders — slow and requires a visual inspection
- Curls the homepage and checks for a non-5xx status — can return 200 even if the DB is down and the app is broken
- Reads Docker container logs for a "ready" message — log format varies and cannot be reliably parsed by a script

**Hiring Criteria:**
- `GET /api/health` returns `200 {"status":"ok"}` while the app process is running
- The health endpoint does not depend on database connectivity — isolates process health from database health
- No authentication token or header required to call the endpoint
- Response time under 200ms under normal conditions

**Success Measure:** `curl -s http://localhost:3000/api/health` returns `{"status":"ok"}` with HTTP 200 within 200ms on every call while the process is running.

**Related Features:** F5
**Priority:** P0

---

### JTBD-02.3: Embed the Running App in a Dashboard Preview Panel

**Job Statement:**
When I include the QuickNotes URL in an iframe inside my personal dashboard or development preview panel, I want the app to render without browser console errors or blank frames, so I can access my notes inline without switching browser tabs.

**Current Alternatives:**
- Opens QuickNotes in a separate browser tab — context switching disrupts workflow
- Receives a blank iframe with a browser console error (`X-Frame-Options: SAMEORIGIN`) — no clear path to fix without changing Next.js config
- Embeds a different (non-Next.js) notes tool that doesn't block framing — workaround, not the preferred tool

**Hiring Criteria:**
- No `X-Frame-Options` header emitted by the server under any response
- No `Content-Security-Policy: frame-ancestors` directive that restricts embedding
- The app renders fully (list, create, edit flows all work) within the iframe at the dashboard's embedded width
- Confirmed working in Chrome, Safari, and Firefox without per-browser workarounds

**Success Measure:** QuickNotes URL embedded in an `<iframe>` renders the full note list with zero browser console errors related to frame-blocking in Chrome, Safari, and Firefox.

**Related Features:** F6, F7
**Priority:** P1

---

### JTBD-02.4: Inspect and Script the Notes Data Without Using the UI

**Job Statement:**
When I need to audit note contents, debug an unexpected state, or automate a data export, I want to call the REST API directly from curl or a script and receive predictable JSON responses, so I can operate on note data without depending on a browser or the React frontend.

**Current Alternatives:**
- Queries the PostgreSQL database directly with `psql` — works but bypasses application logic and response formatting
- Uses the UI to manually inspect notes one at a time — not scriptable; slow for bulk inspection
- Has no documented API contract to rely on — improvises SQL queries each time

**Hiring Criteria:**
- `GET /api/notes` returns a JSON array of all notes with consistent field names (`id`, `title`, `body`, `pinned`, `createdAt`)
- `POST /api/notes` accepts a JSON body, validates that `title` is non-empty, and returns the created note
- `DELETE /api/notes/[id]` returns `204` or `200` on success; `404` on unknown ID
- All error responses return a consistent JSON shape (not HTML error pages)
- No authentication header required for any endpoint

**Success Measure:** A shell script using only `curl` and `jq` can list all notes, create a new note, and delete it — with zero UI interaction and zero manual steps beyond running the script.

**Related Features:** F5
**Priority:** P1

---

## Outcome-to-Feature Traceability

| JTBD-ID | Feature ID | Feature Name | Expected Outcome |
|---------|-----------|--------------|-----------------|
| JTBD-01.1 | F2 | Create Note | Note captured and persisted in ≤ 15 seconds from app open |
| JTBD-01.1 | F4 | Data Persistence | Saved note survives tab close immediately after creation |
| JTBD-01.1 | F6 | Mobile-First UI | Creation flow usable one-handed at 375px viewport |
| JTBD-01.2 | F0 | Note List View | Full title list renders in < 500ms; newest-first with pinned at top |
| JTBD-01.2 | F1 | Note Search | Real-time title filtering with no perceptible lag per keypress |
| JTBD-01.3 | F0 | Note List View | Pinned notes appear at top of list across all sessions |
| JTBD-01.3 | F3 | Edit & Delete Note | Pinned toggle accessible on edit page; state persists on save |
| JTBD-01.4 | F4 | Data Persistence | 100% of notes present after browser close and reopen next day |
| JTBD-02.1 | F4 | Data Persistence & Auto-Migration | UI functional after `docker run` with no SQL steps |
| JTBD-02.1 | F5 | REST API | First request succeeds without requiring schema pre-creation |
| JTBD-02.2 | F5 | REST API | `GET /api/health` returns `200 {"status":"ok"}` in < 200ms |
| JTBD-02.3 | F6 | Mobile-First UI | App renders in iframe at embedded width |
| JTBD-02.3 | F7 | Iframe & Deployment Compatibility | Zero X-Frame-Options or CSP frame-ancestors errors in all three browsers |
| JTBD-02.4 | F5 | REST API | All CRUD endpoints return consistent JSON; scriptable via curl |

---

## NaC Preview

> These candidate Natural Acceptance Criteria are derived from each job's success measure. They will be refined into formal acceptance criteria in the STORY-MAP and FRD documents.

| JTBD-ID | Outcome (from Success Measure) | Candidate NaC |
|---------|-------------------------------|---------------|
| JTBD-01.1 | Note captured and saved in ≤ 15 seconds | Given I open the app and navigate to `/notes/new`, when I enter a title and tap Save, then the note appears on `/` and network tab confirms a `POST /api/notes` 201 response — all within 15 seconds of the app loading |
| JTBD-01.2 | Target note located within 30 seconds from a 20-note list | Given 20 notes exist, when I type a partial title into the search box, then only matching notes are visible within one keypress and the target note is identifiable in under 30 seconds |
| JTBD-01.3 | Note pinned and visible at list top in under 20 seconds | Given I open a note's edit page, when I toggle Pinned and save, then the note appears as the first item on `/` immediately and remains there on page reload |
| JTBD-01.4 | 100% note retention after browser close and reopen | Given notes exist, when I close the browser tab completely and reopen the app URL the next day, then every previously created note is present with its original title and body unchanged |
| JTBD-02.1 | Working UI on first request after `docker run` | Given a fresh PostgreSQL database and a valid `DATABASE_URL` env var, when the container starts and the first HTTP request hits `/`, then the page renders (empty state or note list) with no 500 error and no manual SQL required |
| JTBD-02.2 | `GET /api/health` returns 200 in < 200ms | Given the app process is running, when `curl -s http://localhost:3000/api/health` is executed, then the response is `{"status":"ok"}` with HTTP 200 and response time under 200ms — regardless of database state |
| JTBD-02.3 | Zero iframe frame-blocking errors in Chrome, Safari, Firefox | Given the app URL is in an `<iframe src="...">`, when the page containing the iframe is loaded in Chrome, Safari, and Firefox latest, then the note list renders inside the frame and the browser console shows zero X-Frame-Options or CSP frame-ancestors errors |
| JTBD-02.4 | Full CRUD cycle scriptable with curl and jq only | Given the app is running, when a shell script calls `GET /api/notes`, `POST /api/notes`, and `DELETE /api/notes/[id]` using only curl and jq, then each call returns the expected status code and JSON shape with zero manual browser interaction |

---

*Document generated: 2026-06-17*
*Sources: PERSONAS-QuickNotes.md, PRD-QuickNotes.md, .planning/PROJECT.md*
*Downstream documents: UserStories-QuickNotes.md, FRD-QuickNotes.md, STORY-MAP-QuickNotes.md*
