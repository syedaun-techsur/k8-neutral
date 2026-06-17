# PERSONAS: QuickNotes

| Field | Value |
|-------|-------|
| **Product Name** | QuickNotes |
| **Version** | 1.0 |
| **Date** | 2026-06-17 |
| **Related PRD** | PRD-QuickNotes.md |
| **Status** | Active |

---

## Persona Summary

| PER-ID | Name | Role | Primary Goal |
|--------|------|------|--------------|
| PER-01 | Alex Moreno | Daily Note-Taker (App Owner) | Capture fleeting thoughts on mobile instantly and retrieve them without friction |
| PER-02 | Jordan Kim | Developer / Operator (Self-Hoster) | Deploy and run a reliable personal notes service with zero ongoing maintenance burden |

> **Note on scope:** QuickNotes is a single-user personal app. PER-01 and PER-02 may be the same individual wearing different hats — the person capturing notes on their phone (PER-01) and the same person who set up the server (PER-02). They are split here to isolate distinct need-sets: *using* the app versus *operating* it.

---

## PER-01: Alex Moreno

**Role & Context:**
Alex is the sole user and owner of the QuickNotes instance — the person the entire product exists to serve. Alex uses a smartphone as the primary computing device throughout the day, relying on it for everything from navigation to communication. Notes are captured during commutes, meetings, grocery runs, and late-night bursts of inspiration. Alex currently uses a mix of SMS drafts, the default phone notes app, and mental reminders, all of which fail in different ways: SMS drafts disappear, the phone notes app requires an account sync that breaks, and mental reminders simply evaporate. Alex needs a frictionless, always-there surface to capture a thought in under 10 seconds and find it again minutes or days later — with no account, no password, and no setup ritual.

**Goals:**
- Capture a note one-handed in under 10 seconds, from any screen, without logging in (F2, F6)
- Find a previously captured note quickly by scanning titles or typing a few letters (F0, F1)
- Know that notes will still be there after closing the browser tab or rebooting the phone (F4)
- Pin the two or three most important notes so they're always visible at the top of the list (F0, F3)
- Edit or delete notes that are out of date without navigating through menus (F3)

**Pain Points:**
- Existing notes tools require creating an account before capturing a single note — by which time the thought is gone
- Local-only apps (phone notes, browser localStorage) silently lose data after OS updates, app reinstalls, or browser clears
- Most mobile note UIs have tiny tap targets and require zooming or precise tapping
- Searching across notes requires loading a separate screen or a sync delay
- No way to surface "always relevant" notes without creating folders or tags — organizational overhead they don't want

**Technical Expertise:** Low-to-Moderate — comfortable with mobile web apps and browsers; does not interact with servers, environment variables, or configuration files; expects the app to "just work" at a URL.

**Top Tasks:**
1. **Create a new note** — opens the app, taps "New note," types a title and optional body, saves (daily, critical)
2. **Scan the note list for a recent capture** — opens the app, scrolls or skims titles on the home screen (daily, high)
3. **Search for a specific note by keyword** — types a partial title into the search box to narrow the list (several times/week, high)
4. **Pin a note** — opens a note's edit page, toggles the pinned flag so it stays at the top (as-needed, medium)
5. **Delete a stale note** — opens the edit page, taps delete, confirms, verifies it's gone from the list (weekly, medium)

**Success Criteria:**
- A new note is captured and saved to the server in under 15 seconds from opening the app
- The note list loads in under 500ms on a standard mobile connection
- Searching by title shows filtered results within one keypress with no perceptible lag
- Notes are still present after the browser tab is closed and reopened the next day
- The entire app is usable one-handed at 375px viewport width with no horizontal scroll

---

## PER-02: Jordan Kim

**Role & Context:**
Jordan is the developer and operator who deployed the QuickNotes instance — likely the same person as Alex, but operating in a different context: a laptop or desktop, a terminal, environment variable files, and a container runtime. Jordan set up the app once (pulled the repo, configured a `.env` with the database URL, ran the container) and wants to never think about it again. Jordan monitors that the service is healthy through an occasional curl to `/api/health` and expects the app to self-heal schema changes across restarts without requiring manual database migrations. Jordan may also embed the app in a broader dashboard or preview panel via iframe. Any operational failure — a missing schema, a broken config, or a frame-blocking header — is a blocker that Jordan must diagnose and fix personally.

**Goals:**
- Deploy the app once from a container with environment variables — no manual SQL, no migration scripts (F4, F5)
- Confirm the service is healthy with a single HTTP check, no authentication required (F5)
- Embed the running app in an iframe preview panel without header-related rendering failures (F7)
- Trust that a server restart will not lose any notes or require schema re-initialization (F4)
- Consume the REST API directly if needed for scripting or quick data inspection (F5)

**Pain Points:**
- Apps that require manual `CREATE TABLE` steps break silently in container environments — Jordan finds out only when the UI crashes
- Next.js configuration mistakes (e.g., `.ts` config file on Next 14) produce cryptic hard build errors with no clear fix
- Frame-blocking HTTP headers in Next.js defaults silently prevent iframe embedding — hard to diagnose
- Hard-coded database credentials in source require a code change to deploy on a different host
- Health endpoints that depend on the database make it impossible to distinguish "app up, DB down" from "app down"

**Technical Expertise:** High — comfortable with terminal, Docker/containers, environment variables, REST APIs, and reading server logs; can read Next.js config and PostgreSQL schema definitions; does not want to debug framework internals.

**Top Tasks:**
1. **Verify the service is running** — `curl http://localhost:3000/api/health` returns `{"status":"ok"}` (post-deploy and periodic, critical)
2. **Start the app in a container with a `.env` file** — no other setup required before the UI is functional (deploy-time, critical)
3. **Embed the app in an iframe** — include the URL in a dashboard or preview panel and confirm it renders without errors (setup-time, high)
4. **Inspect or script the REST API** — use `GET /api/notes` or `POST /api/notes` directly from a script or curl (as-needed, medium)
5. **Restart the server and verify data integrity** — kill and restart the process; confirm all notes still appear in the UI (maintenance, medium)

**Success Criteria:**
- A fresh container start results in a working UI with no manual database steps
- `GET /api/health` returns `200 {"status":"ok"}` regardless of database state
- The app renders correctly inside an `<iframe>` in Chrome, Safari, and Firefox without CSP or `X-Frame-Options` errors
- Notes created before a server restart are present and unmodified after restart
- No credentials appear in source files or build artifacts

---

## Persona Relationships

| Interaction | PER-01 (Alex — User) | PER-02 (Jordan — Operator) |
|-------------|----------------------|---------------------------|
| **Who they are** | End user capturing and retrieving notes | Developer deploying and maintaining the service |
| **Likely same person?** | Yes — same individual, different context | Yes — wears both hats for a personal app |
| **When they interact with the app** | Mobile browser, throughout the day | Desktop/terminal, at deploy time and during maintenance |
| **What breaks their experience** | Slow load, data loss, tiny tap targets, no search | Failed migration, frame-block headers, hard-coded config, opaque startup errors |
| **Dependency** | Depends on Jordan to keep the service running | Builds for Alex — if Alex can't capture notes fast, the app has failed |

---

## Feature-Persona Matrix

| Feature ID | Feature Name | PER-01 (Alex — Daily User) | PER-02 (Jordan — Operator) |
|------------|--------------|---------------------------|---------------------------|
| F0 | Note List View | **Primary** — core daily surface | Secondary — validates deploy worked |
| F1 | Note Search | **Primary** — frequent retrieval task | None — not an operator concern |
| F2 | Create Note | **Primary** — most frequent action | None — not an operator concern |
| F3 | Edit & Delete Note | **Primary** — regular maintenance of note list | None — not an operator concern |
| F4 | Data Persistence & Auto-Migration | **Primary** — trusts notes survive tab close | **Primary** — zero manual migration steps on deploy |
| F5 | REST API | Secondary — benefits indirectly via UI | **Primary** — health check, scripting, direct inspection |
| F6 | Mobile-First UI & Design System | **Primary** — usability depends entirely on this | Secondary — confirms readable in iframe preview |
| F7 | Iframe & Deployment Compatibility | None — not embedding the app | **Primary** — required for dashboard embedding and container runtime |

**Matrix Key:** Primary = core need, failure blocks this persona's goals · Secondary = supporting benefit · None = not relevant to this persona

---

*Document generated: 2026-06-17*
*Source: PRD-QuickNotes.md, .planning/PROJECT.md*
*Downstream documents: JTBD-QuickNotes.md, UserStories-QuickNotes.md, FRD-QuickNotes.md*
