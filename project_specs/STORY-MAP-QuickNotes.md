# STORY-MAP: QuickNotes

| Field | Value |
|-------|-------|
| **Product Name** | QuickNotes |
| **Version** | 1.0 |
| **Date** | 2026-06-17 |
| **Release Model** | Single-release MVP (R1 only) |
| **Related Personas** | PERSONAS-QuickNotes.md |
| **Related Journeys** | JOURNEYS-QuickNotes.md |
| **Related JTBD** | JTBD-QuickNotes.md |
| **Related User Stories** | UserStories-QuickNotes.md |
| **Related PRD** | PRD-QuickNotes.md |
| **Status** | Active |

---

## 1. Overview

This Story Map organizes all 21 user stories (US-0.1 through US-7.3) along two axes:

- **X-axis (columns):** Journey stages drawn from JOURNEYS-QuickNotes.md — the chronological steps each persona takes to accomplish a goal
- **Y-axis (rows):** Activities and their associated user stories, grouped by epic

Each row is annotated with a **Natural Acceptance Criterion (NaC)** — a testable statement derived from the intersection of:
1. A JTBD outcome (the *what matters*)
2. A journey stage (the *when/where*)
3. The user story itself (the *what is built*)

NaC are not invented; they are traced directly from JTBD success measures and hiring criteria.

**Release model:** QuickNotes ships as a single MVP (R1). All P0 and P1 features are in-scope. Authentication, multi-user, sharing, and AI are explicitly out of scope and absent from this map.

**Map entry IDs:** `SM-{Epic}.{NN}` (e.g., SM-0.1 maps Epic 0 / first story on the map)

---

## 2. Journey Stage Reference

The five journeys collapse into eight canonical stages used as column headers in the map matrix.

| Stage ID | Stage Label | Source Journeys | Persona(s) |
|----------|-------------|-----------------|------------|
| S1 | Arrive / Open | JRN-01.1 (Land), JRN-01.2 (Open), JRN-02.1 (Configure/Start) | PER-01, PER-02 |
| S2 | Capture / Create | JRN-01.1 (Create/Save), JRN-02.1 (Smoke Test) | PER-01, PER-02 |
| S3 | Scan / Browse | JRN-01.2 (Scan) | PER-01 |
| S4 | Search / Filter | JRN-01.2 (Search/Locate/Return) | PER-01 |
| S5 | Edit / Manage | JRN-01.3 (Select/Edit/Save/Delete/Verify) | PER-01 |
| S6 | Verify / Trust | JRN-01.1 (Verify), JRN-01.3 (Verify), JRN-02.1 (Restart) | PER-01, PER-02 |
| S7 | Deploy / Operate | JRN-02.1 (Configure/Start/Health Check) | PER-02 |
| S8 | Embed / Script | JRN-02.2 (Embed/Cross-Browser/Iframe Usability/API Script/Validate) | PER-02 |

---

## 3. Story Map Matrix

> Reading guide: Each row is one story map entry (SM-ID). The **Stage** column shows where in the journey this story lives. The **NaC** column is the testable natural acceptance criterion derived from a JTBD outcome applied to that stage.

### Epic 0 — Note List View (F0) | PER-01 primary, PER-02 secondary

| SM-ID | Story ID | Story Title | Persona | Stage | JTBD Ref | NaC | Release |
|-------|----------|-------------|---------|-------|----------|-----|---------|
| SM-0.1 | US-0.1 | View List of Notes | PER-01 | S1 Arrive / S3 Browse | JTBD-01.2 | Given the app URL is opened on mobile, when `/` loads, then all note titles with body snippets and pinned indicators are visible and sorted pinned-first newest-first within 500ms | R1 |
| SM-0.2 | US-0.2 | View Empty State When No Notes Exist | PER-01 | S1 Arrive | JTBD-01.2 | Given no notes exist in the database, when `/` is opened, then "No notes yet" and a visible "New note" button are rendered — confirming the app is working and capture can begin immediately | R1 |

### Epic 1 — Note Search (F1) | PER-01 primary

| SM-ID | Story ID | Story Title | Persona | Stage | JTBD Ref | NaC | Release |
|-------|----------|-------------|---------|-------|----------|-----|---------|
| SM-1.1 | US-1.1 | Filter Notes by Title in Real Time | PER-01 | S4 Search / Filter | JTBD-01.2 | Given 20 notes exist, when one character is typed in the search box, then only title-matching notes are visible — synchronously, with no server round-trip — so the target note is locatable within 30 seconds | R1 |
| SM-1.2 | US-1.2 | Clear Search to Restore Full List | PER-01 | S4 Search / Filter | JTBD-01.2 | Given a search term is active and filtering the list, when the search box is cleared, then the full note list is immediately restored in pinned-first newest-first order with the input remaining visible | R1 |
| SM-1.3 | US-1.3 | See No-Match State When Search Yields No Results | PER-01 | S4 Search / Filter | JTBD-01.2 | Given a non-empty search term matches no notes, when the user views the list, then "No matching notes" is displayed (not a blank page) and the input remains editable so the user can refine their query | R1 |

### Epic 2 — Create Note (F2) | PER-01 primary

| SM-ID | Story ID | Story Title | Persona | Stage | JTBD Ref | NaC | Release |
|-------|----------|-------------|---------|-------|----------|-----|---------|
| SM-2.1 | US-2.1 | Create a New Note with Title and Body | PER-01 | S2 Capture / Create | JTBD-01.1 | Given the app URL is opened on mobile, when the user taps "New note", enters a title, and taps Save, then a `POST /api/notes` 201 response is confirmed and the new note appears in the list — all within 15 seconds of opening the app | R1 |
| SM-2.2 | US-2.2 | Prevent Submission of a Note Without a Title | PER-01 | S2 Capture / Create | JTBD-01.1 | Given the create form is open, when Save is tapped with an empty title field, then no API request is sent, an inline "Title is required" error appears immediately, and all entered values are retained so the thought is not lost | R1 |

### Epic 3 — Edit & Delete Note (F3) | PER-01 primary

| SM-ID | Story ID | Story Title | Persona | Stage | JTBD Ref | NaC | Release |
|-------|----------|-------------|---------|-------|----------|-----|---------|
| SM-3.1 | US-3.1 | Open a Note's Edit Page Pre-Filled with Current Data | PER-01 | S5 Edit / Manage | JTBD-01.3 | Given a note exists, when the user taps its row on `/`, then `/notes/[id]/edit` opens with title, body, and pinned state already populated — no re-entry required — and the pinned toggle is visible without scrolling on a 375px viewport | R1 |
| SM-3.2 | US-3.2 | Edit and Save a Note | PER-01 | S5 Edit / Manage | JTBD-01.3 | Given the edit form is open with a note pre-filled, when any field is changed and Save is tapped, then `PUT /api/notes/[id]` returns 200, the user is redirected to `/`, and the updated title is immediately visible in the list | R1 |
| SM-3.3 | US-3.3 | Delete a Note with Confirmation | PER-01 | S5 Edit / Manage | JTBD-01.4 | Given a stale note's edit page is open, when Delete is tapped and confirmed, then `DELETE /api/notes/[id]` is called and the note is permanently absent from the list on redirect — with no possibility of accidental deletion without confirmation | R1 |

### Epic 4 — Data Persistence (F4) | PER-01 primary, PER-02 primary

| SM-ID | Story ID | Story Title | Persona | Stage | JTBD Ref | NaC | Release |
|-------|----------|-------------|---------|-------|----------|-----|---------|
| SM-4.1 | US-4.1 | Notes Persist Across Page Reloads | PER-01 | S6 Verify / Trust | JTBD-01.4 | Given notes have been created, when the browser tab is closed completely and the app URL is reopened the next day, then every previously created note is present with its original title and body unchanged — confirming PostgreSQL (not localStorage) is the storage layer | R1 |
| SM-4.2 | US-4.2 | Database Schema Auto-Migrates on Startup | PER-02 | S7 Deploy / Operate | JTBD-02.1 | Given a fresh PostgreSQL database and a valid `DATABASE_URL` env var, when the container starts and the first HTTP request hits `/`, then the page renders (empty state or note list) with no 500 error and no manual SQL commands required — startup logs confirm schema creation | R1 |

### Epic 5 — REST API (F5) | PER-02 primary, PER-01 indirect

| SM-ID | Story ID | Story Title | Persona | Stage | JTBD Ref | NaC | Release |
|-------|----------|-------------|---------|-------|----------|-----|---------|
| SM-5.1 | US-5.1 | Health Check Endpoint Always Responds | PER-02 | S7 Deploy / Operate | JTBD-02.2 | Given the app process is running (regardless of database state), when `curl -s http://localhost:3000/api/health` is executed, then the response is `{"status":"ok"}` with HTTP 200 in under 200ms — confirming process health without DB dependency | R1 |
| SM-5.2 | US-5.2 | List All Notes via API | PER-02 | S8 Embed / Script | JTBD-02.4 | Given the app is running with notes in the database, when `GET /api/notes` is called from a script, then a JSON array is returned with each note containing `id`, `title`, `body`, `pinned`, `createdAt` — in pinned-first newest-first order — enabling scriptable data inspection | R1 |
| SM-5.3 | US-5.3 | Create a Note via API | PER-02 | S8 Embed / Script | JTBD-02.4 | Given the app is running, when `POST /api/notes` is called with a JSON body containing a non-empty title, then a 201 response with the full note object (including server-assigned `id` and `createdAt`) is returned — and missing title returns 400 JSON (not HTML) | R1 |
| SM-5.4 | US-5.4 | Fetch, Update, and Delete a Single Note via API | PER-02 | S8 Embed / Script | JTBD-02.4 | Given the app is running, when a shell script calls `GET`, `PUT`, and `DELETE` on `/api/notes/[id]` using only `curl` and `jq`, then each returns the expected status code and consistent JSON shape — completing a full round-trip CRUD cycle with zero UI interaction | R1 |

### Epic 6 — Mobile-First UI & Design System (F6) | PER-01 primary, PER-02 secondary

| SM-ID | Story ID | Story Title | Persona | Stage | JTBD Ref | NaC | Release |
|-------|----------|-------------|---------|-------|----------|-----|---------|
| SM-6.1 | US-6.1 | Use the App Comfortably One-Handed on Mobile | PER-01 | S1–S5 (all user stages) | JTBD-01.1 | Given the app is opened on a 375px-wide mobile viewport, when any page is navigated and any control is interacted with, then there is no horizontal scroll, all tap targets are ≥44×44px, and body text is ≥16px — enabling one-handed note capture in under 15 seconds | R1 |
| SM-6.2 | US-6.2 | See a Visually Consistent Design with Gold Accent | PER-01 | S1–S5 (all user stages) | JTBD-01.1 | Given the app is open on any page, when the user scans the interface, then CTAs ("New note", "Save") are visually dominant using the Gold `#FBCA5C` accent (≤10% of visible area), pinned notes are distinguishable from unpinned, and the high-contrast near-black-on-white palette makes the key actions immediately spottable | R1 |

### Epic 7 — Iframe & Deployment Compatibility (F7) | PER-02 primary

| SM-ID | Story ID | Story Title | Persona | Stage | JTBD Ref | NaC | Release |
|-------|----------|-------------|---------|-------|----------|-----|---------|
| SM-7.1 | US-7.1 | Embed the App in an Iframe Without Errors | PER-02 | S8 Embed / Script | JTBD-02.3 | Given the app URL is set as the `src` of an `<iframe>`, when the containing page is loaded in Chrome, Safari, and Firefox, then the note list renders inside the frame and the browser console shows zero `X-Frame-Options` or `CSP frame-ancestors` errors | R1 |
| SM-7.2 | US-7.2 | Access the App from Outside a Container | PER-02 | S7 Deploy / Operate | JTBD-02.1 | Given the app is started with `npm start` inside a container, when a request is made from the host machine on port 3000, then the app responds — because the server binds to `0.0.0.0:3000`, not `127.0.0.1` | R1 |
| SM-7.3 | US-7.3 | Deploy Successfully with next.config.mjs | PER-02 | S7 Deploy / Operate | JTBD-02.1 | Given the repository is cloned and `npm run build` is executed, when the build completes, then there are no TypeScript config parse errors — because `next.config.mjs` with ES Module syntax is present and no `next.config.ts` file exists | R1 |

---

## 4. NaC Derivation Table

Full traceability: **JTBD outcome → journey stage → NaC → story**

| NaC-ID | JTBD-ID | JTBD Outcome (Success Measure) | Journey Stage | Derived NaC | Story |
|--------|---------|-------------------------------|---------------|-------------|-------|
| NaC-01 | JTBD-01.1 | Note captured and saved in ≤15 seconds from app open | JRN-01.1 S3 Create | Title field auto-focuses on `/notes/new`; full create-to-list flow completes in ≤15 seconds one-handed at 375px | US-2.1 |
| NaC-02 | JTBD-01.1 | Creation flow usable one-handed at 375px viewport | JRN-01.1 S3 Create | All tap targets ≥44×44px; no horizontal scroll; body text ≥16px on 375px viewport | US-6.1 |
| NaC-03 | JTBD-01.1 | CTAs spottable; no friction before typing begins | JRN-01.1 S2 Land | Gold `#FBCA5C` CTA ("New note") is visually dominant above the fold; inline validation retains entered value on error | US-2.2, US-6.2 |
| NaC-04 | JTBD-01.2 | Target note located within 30 seconds from 20-note list | JRN-01.2 S1 Open | `/` renders all notes pinned-first newest-first within 500ms; pinned notes visible without scrolling | US-0.1 |
| NaC-05 | JTBD-01.2 | Empty state confirms app is working | JRN-01.2 S1 Open | "No notes yet" message and "New note" button rendered when database is empty | US-0.2 |
| NaC-06 | JTBD-01.2 | Real-time filtering with no perceptible lag per keypress | JRN-01.2 S3 Search | Notes filter on first keypress; case-insensitive substring match; no server round-trip; no debounce | US-1.1 |
| NaC-07 | JTBD-01.2 | Clearing search restores full list | JRN-01.2 S5 Return | Emptying the search input immediately restores the full sorted list; input remains visible and focused | US-1.2 |
| NaC-08 | JTBD-01.2 | No-match state is unambiguous (not a broken blank) | JRN-01.2 S4 Locate | "No matching notes" text shown when search yields zero results; input remains editable | US-1.3 |
| NaC-09 | JTBD-01.3 | Pinned note visible at list top in under 20 seconds | JRN-01.3 S2 Edit | Pinned toggle visible on edit page without scrolling at 375px; toggling and saving moves note to top immediately | US-3.1, US-3.2 |
| NaC-10 | JTBD-01.3 | Pinned state persists across sessions and reloads | JRN-01.3 S3 Save | After saving pinned=true, note appears as first item on `/` on redirect and remains at top on page reload | US-3.2 |
| NaC-11 | JTBD-01.4 | 100% note retention after browser close and reopen | JRN-01.1 S5 Verify | Every note created before browser tab close is present with original title and body when URL is reopened the next day | US-4.1 |
| NaC-12 | JTBD-01.4 | Confirmed delete is permanent and irreversible | JRN-01.3 S4 Delete | Note is absent from list immediately after confirmed delete; no re-appearance from cache; accidental delete prevented by confirmation step | US-3.3 |
| NaC-13 | JTBD-02.1 | Working UI on first request after `docker run` | JRN-02.1 S2 Start | `CREATE TABLE IF NOT EXISTS` executes automatically; `/` renders empty state or note list with no 500 error; startup logs confirm schema ready | US-4.2 |
| NaC-14 | JTBD-02.1 | Server binds to 0.0.0.0 — accessible from host | JRN-02.1 S2 Start | `npm start` binds to `0.0.0.0:3000`; app reachable from outside the container without network hacks | US-7.2 |
| NaC-15 | JTBD-02.1 | `npm run build` succeeds with no TypeScript config error | JRN-02.1 S1 Configure | `next.config.mjs` present with ES Module syntax; no `next.config.ts` file; build completes clean | US-7.3 |
| NaC-16 | JTBD-02.2 | `GET /api/health` returns 200 in < 200ms regardless of DB state | JRN-02.1 S3 Health Check | `curl http://localhost:3000/api/health` returns `{"status":"ok"}` HTTP 200 in < 200ms even when PostgreSQL is unreachable | US-5.1 |
| NaC-17 | JTBD-02.3 | Zero iframe frame-blocking errors in Chrome, Safari, Firefox | JRN-02.2 S1 Embed | No `X-Frame-Options` or `frame-ancestors` CSP header emitted; note list renders inside `<iframe>` in all three browsers with zero console errors | US-7.1 |
| NaC-18 | JTBD-02.3 | Full app usable within iframe at embedded width | JRN-02.2 S3 Iframe Usability | Create, list, and edit flows all function within the iframe frame at typical dashboard panel widths (350–500px) | US-6.1, US-7.1 |
| NaC-19 | JTBD-02.4 | Full CRUD cycle scriptable with curl and jq only | JRN-02.2 S4 API Script | Shell script using only `curl` and `jq` calls `GET /api/notes`, `POST /api/notes`, `DELETE /api/notes/[id]`; each returns expected status code and consistent JSON with zero UI interaction | US-5.2, US-5.3, US-5.4 |
| NaC-20 | JTBD-02.4 | API error responses are JSON (not HTML) | JRN-02.2 S5 Validate Contract | All 4xx/5xx responses return `{"error":"..."}` JSON shape; never HTML error pages; jq parsing never breaks on error responses | US-5.3, US-5.4 |

---

## 5. Release Planning

### R1 — MVP: "Notes That Work, Zero Setup"

> **Theme:** Deliver a complete, reliable single-user notes experience across all five journeys in one release. Because QuickNotes is a single-release MVP with no post-MVP phases, R1 is both the first and only release.

**Release rationale:** All 21 stories are in R1. The P0 stories (16 stories) are the technical foundation — without any one of them, a journey breaks. The P1 stories (5 stories) complete the usability contract: search, mobile layout, and visual design are not decorative — they are what make the app usable enough to become a primary capture surface.

| Story ID | Title | Persona | Priority | Feature | Journey Stage |
|----------|-------|---------|----------|---------|---------------|
| US-0.1 | View List of Notes | PER-01 | P0 | F0 | S1 Arrive |
| US-0.2 | View Empty State When No Notes Exist | PER-01 | P0 | F0 | S1 Arrive |
| US-1.1 | Filter Notes by Title in Real Time | PER-01 | P1 | F1 | S4 Search |
| US-1.2 | Clear Search to Restore Full List | PER-01 | P1 | F1 | S4 Search |
| US-1.3 | See No-Match State When Search Yields No Results | PER-01 | P1 | F1 | S4 Search |
| US-2.1 | Create a New Note with Title and Body | PER-01 | P0 | F2 | S2 Capture |
| US-2.2 | Prevent Submission of a Note Without a Title | PER-01 | P0 | F2 | S2 Capture |
| US-3.1 | Open a Note's Edit Page Pre-Filled with Current Data | PER-01 | P0 | F3 | S5 Edit |
| US-3.2 | Edit and Save a Note | PER-01 | P0 | F3 | S5 Edit |
| US-3.3 | Delete a Note with Confirmation | PER-01 | P0 | F3 | S5 Edit |
| US-4.1 | Notes Persist Across Page Reloads | PER-01 | P0 | F4 | S6 Verify |
| US-4.2 | Database Schema Auto-Migrates on Startup | PER-02 | P0 | F4 | S7 Deploy |
| US-5.1 | Health Check Endpoint Always Responds | PER-02 | P0 | F5 | S7 Deploy |
| US-5.2 | List All Notes via API | PER-02 | P0 | F5 | S8 Script |
| US-5.3 | Create a Note via API | PER-02 | P0 | F5 | S8 Script |
| US-5.4 | Fetch, Update, and Delete a Single Note via API | PER-02 | P0 | F5 | S8 Script |
| US-6.1 | Use the App Comfortably One-Handed on Mobile | PER-01 | P1 | F6 | S1–S5 |
| US-6.2 | See a Visually Consistent Design with Gold Accent | PER-01 | P1 | F6 | S1–S5 |
| US-7.1 | Embed the App in an Iframe Without Errors | PER-02 | P0 | F7 | S8 Embed |
| US-7.2 | Access the App from Outside a Container | PER-02 | P0 | F7 | S7 Deploy |
| US-7.3 | Deploy Successfully with next.config.mjs | PER-02 | P0 | F7 | S7 Deploy |

**Stories in R1:** 21 of 21  
**P0 stories:** 16 | **P1 stories:** 5

**Journeys enabled by R1:**

| Journey | Stages Covered | JTBD Addressed | All Stories Present? |
|---------|---------------|----------------|---------------------|
| JRN-01.1 Capture a fleeting thought | S1 Arrive → S2 Create → S6 Verify | JTBD-01.1, JTBD-01.4 | Yes |
| JRN-01.2 Find a note by scanning and searching | S1 Arrive → S3 Browse → S4 Search → S5 Locate | JTBD-01.2, JTBD-01.3 | Yes |
| JRN-01.3 Edit a note and delete a stale one | S1 Arrive → S5 Edit → S6 Verify | JTBD-01.3, JTBD-01.4 | Yes |
| JRN-02.1 Deploy, health check, restart | S7 Configure → S7 Start → S7 Health Check → S7 Smoke Test → S6 Restart | JTBD-02.1, JTBD-02.2 | Yes |
| JRN-02.2 Embed in iframe and script the API | S8 Embed → S8 Cross-Browser → S8 Iframe Usability → S8 API Script | JTBD-02.3, JTBD-02.4 | Yes |

**Personas served:** PER-01 (Alex) ✓ and PER-02 (Jordan) ✓

**JTBD addressed:**

| JTBD-ID | Job | Addressed in R1? |
|---------|-----|-----------------|
| JTBD-01.1 | Capture a thought before it evaporates | Yes — US-2.1, US-2.2, US-6.1, US-6.2 |
| JTBD-01.2 | Surface a previously captured note without friction | Yes — US-0.1, US-0.2, US-1.1, US-1.2, US-1.3 |
| JTBD-01.3 | Keep the most important notes always visible | Yes — US-3.1, US-3.2, US-0.1 |
| JTBD-01.4 | Trust notes survive closing the browser | Yes — US-4.1, US-3.3 |
| JTBD-02.1 | Stand up the service once with zero manual database steps | Yes — US-4.2, US-7.2, US-7.3 |
| JTBD-02.2 | Confirm the service is healthy with a single command | Yes — US-5.1 |
| JTBD-02.3 | Embed the running app in a dashboard preview panel | Yes — US-7.1, US-6.1 |
| JTBD-02.4 | Inspect and script the notes data without using the UI | Yes — US-5.2, US-5.3, US-5.4 |

---

## 6. Coverage Analysis

### 6.1 Persona Coverage

| Persona | Stories in R1 | Journeys Completed | JTBD Addressed |
|---------|--------------|-------------------|----------------|
| PER-01 Alex (Daily Note-Taker) | 14 | JRN-01.1, JRN-01.2, JRN-01.3 (all 3) | JTBD-01.1, JTBD-01.2, JTBD-01.3, JTBD-01.4 (all 4) |
| PER-02 Jordan (Developer / Operator) | 7 | JRN-02.1, JRN-02.2 (both) | JTBD-02.1, JTBD-02.2, JTBD-02.3, JTBD-02.4 (all 4) |

*Note: US-6.1, US-6.2 serve both personas (mobile layout = iframe panel width). Cross-counted in PER-01 primary.*

### 6.2 JTBD Coverage

All 8 JTBD outcomes (4 × PER-01, 4 × PER-02) are addressed by at least one story in R1. No JTBD is unaddressed.

| JTBD-ID | Priority | Covering Stories | NaC Count | Gap? |
|---------|----------|-----------------|-----------|------|
| JTBD-01.1 | P0 | US-2.1, US-2.2, US-6.1, US-6.2 | NaC-01, NaC-02, NaC-03 | None |
| JTBD-01.2 | P0 | US-0.1, US-0.2, US-1.1, US-1.2, US-1.3 | NaC-04, NaC-05, NaC-06, NaC-07, NaC-08 | None |
| JTBD-01.3 | P1 | US-3.1, US-3.2, US-0.1 | NaC-09, NaC-10 | None |
| JTBD-01.4 | P0 | US-4.1, US-3.3 | NaC-11, NaC-12 | None |
| JTBD-02.1 | P0 | US-4.2, US-7.2, US-7.3 | NaC-13, NaC-14, NaC-15 | None |
| JTBD-02.2 | P0 | US-5.1 | NaC-16 | None |
| JTBD-02.3 | P1 | US-7.1, US-6.1 | NaC-17, NaC-18 | None |
| JTBD-02.4 | P1 | US-5.2, US-5.3, US-5.4 | NaC-19, NaC-20 | None |

### 6.3 Journey Stage Coverage

| Stage | Stories Mapped | Covered? |
|-------|---------------|----------|
| S1 Arrive / Open | US-0.1, US-0.2, US-6.1, US-6.2 | ✓ |
| S2 Capture / Create | US-2.1, US-2.2 | ✓ |
| S3 Scan / Browse | US-0.1 (list is the browse surface) | ✓ |
| S4 Search / Filter | US-1.1, US-1.2, US-1.3 | ✓ |
| S5 Edit / Manage | US-3.1, US-3.2, US-3.3 | ✓ |
| S6 Verify / Trust | US-4.1 | ✓ |
| S7 Deploy / Operate | US-4.2, US-5.1, US-7.2, US-7.3 | ✓ |
| S8 Embed / Script | US-5.2, US-5.3, US-5.4, US-7.1 | ✓ |

All 8 stages are covered. No journey stage has zero stories.

### 6.4 Gap Analysis

**Orphan stories (not mapped to any journey stage):** None. All 21 stories are placed.

**JTBD outcomes without NaC:** None. All 8 JTBD outcomes have at least one NaC derived.

**Journey stages without stories:** None. All 8 stages have at least one story.

**Stories without JTBD traceability:** None. Every SM entry references a JTBD-ID.

**Out-of-scope concerns (non-gaps — confirmed intentional exclusions):**
- Authentication / login — explicitly out of scope (no story needed)
- Multi-user / sharing — explicitly out of scope
- Tags, folders, pagination — explicitly out of scope
- Search debounce optimization — MVP synchronous filtering is sufficient

---

## 7. NaC-to-Acceptance Criteria Mapping

Verifies that each NaC is grounded in and consistent with the formal acceptance criteria in UserStories-QuickNotes.md.

| NaC-ID | NaC Statement (condensed) | Story | Key Acceptance Criteria (verbatim match) | Aligned? |
|--------|--------------------------|-------|------------------------------------------|----------|
| NaC-01 | Create-to-list in ≤15 seconds, one-handed 375px | US-2.1 | "Submitting the form with a valid title sends `POST /api/notes` … On `201 Created`, the user is redirected to `/`" + US-6.1 tap target / no-scroll criteria | ✓ |
| NaC-02 | All tap targets ≥44×44px; no horizontal scroll at 375px | US-6.1 | "All interactive elements have a computed tap target of at least 44×44px" · "All pages render without horizontal scroll at 375px" | ✓ |
| NaC-03 | Gold CTA dominant; inline validation retains value | US-2.2, US-6.2 | "An inline validation error 'Title is required' appears … The form is not cleared" · "Gold accent color `#FBCA5C` is applied to CTAs" | ✓ |
| NaC-04 | `/` renders pinned-first newest-first in < 500ms | US-0.1 | "Pinned notes appear above non-pinned notes (ORDER BY pinned DESC, created_at DESC)" | ✓ |
| NaC-05 | "No notes yet" + "New note" button when DB empty | US-0.2 | "The empty state displays the exact text 'No notes yet'" · "'New note' button is visible in the empty state" | ✓ |
| NaC-06 | Filters on first keypress; no debounce; no server call | US-1.1 | "Filtering begins on the first character typed" · "No API call or server round-trip is made" · "Filtering is synchronous — no debounce, no setTimeout" | ✓ |
| NaC-07 | Clearing search restores full list; input stays visible | US-1.2 | "Clearing the search input … restores the full, unfiltered note list" · "Search input remains visible and focused after clearing" | ✓ |
| NaC-08 | "No matching notes" shown; input stays editable | US-1.3 | "display the exact text 'No matching notes'" · "The search input remains visible and editable" | ✓ |
| NaC-09 | Pinned toggle visible without scroll; note jumps to top on save | US-3.1, US-3.2 | "The edit form is pre-filled with the note's current `title`, `body`, and `pinned` values" · "On `200 OK`, the user is redirected to `/`" | ✓ |
| NaC-10 | Pinned note at top on redirect and page reload | US-3.2 | "The updated title is visible in the note list on `/` immediately after redirect" (pinned state is part of the PUT payload) | ✓ |
| NaC-11 | 100% note retention after browser close and next-day reopen | US-4.1 | "Notes are present after the browser tab is closed and reopened" · "All notes created via the UI are stored in PostgreSQL, not in browser memory or localStorage" | ✓ |
| NaC-12 | Confirmed delete is permanent; confirmation required | US-3.3 | "Clicking 'Delete' triggers a confirmation prompt before any request is sent" · "On `204 No Content`, the user is redirected to `/` and the deleted note no longer appears" | ✓ |
| NaC-13 | UI functional on first request after docker run; no manual SQL | US-4.2 | "`CREATE TABLE IF NOT EXISTS notes (...)` is executed automatically before any HTTP request" · "No manual SQL scripts, CLI commands, or DBA steps are required" | ✓ |
| NaC-14 | Server binds to 0.0.0.0:3000 | US-7.2 | "The Next.js server binds to `0.0.0.0:3000` (not `127.0.0.1`)" · "`package.json` start script is `'next start -H 0.0.0.0 -p 3000'`" | ✓ |
| NaC-15 | `npm run build` succeeds; no next.config.ts | US-7.3 | "The project contains `next.config.mjs` using ES Module syntax" · "No `next.config.ts` file exists in the project" | ✓ |
| NaC-16 | Health returns 200 JSON in < 200ms; no DB dependency | US-5.1 | "`GET /api/health` returns `200 OK` with body `{'status':'ok'}`" · "The endpoint has no database dependency" | ✓ |
| NaC-17 | Zero frame-blocking errors in Chrome, Safari, Firefox | US-7.1 | "HTTP responses … do NOT include an `X-Frame-Options` header" · "The app renders correctly inside an `<iframe>` in Chrome, Safari, and Firefox" | ✓ |
| NaC-18 | Full app usable in iframe at dashboard panel widths | US-6.1, US-7.1 | "Layout scales up gracefully on wider viewports" · "No middleware or Next.js defaults introduce frame-blocking headers" | ✓ |
| NaC-19 | Full CRUD cycle via curl + jq; correct status codes and JSON | US-5.2, US-5.3, US-5.4 | "`GET /api/notes` returns `200 OK` with a JSON array" · "`DELETE /api/notes/[id]` returns `204 No Content` on success" | ✓ |
| NaC-20 | All error responses are JSON, never HTML | US-5.3, US-5.4 | "`title` is required — missing or empty title returns `400 {'error':'Title is required'}`" · "Non-numeric … `[id]` returns `400 {'error':'Invalid id'}`" | ✓ |

**Result: All 20 NaC are aligned with formal acceptance criteria. Zero mismatches.**

---

## 8. Story Map Completeness Checklist

- [x] Every UserStory (US-0.1 through US-7.3, 21 total) appears in the map
- [x] Every mapped story has a NaC derived from a specific JTBD outcome
- [x] NaC Derivation Table has full traceability chains (JTBD-ID → Journey Stage → NaC → Story)
- [x] Release planning group (R1) is defined with all stories accounted for
- [x] Coverage analysis confirms no orphan stories, no unaddressed JTBD, no empty journey stages
- [x] NaC-to-Acceptance Criteria mapping verifies 20/20 NaC aligned (Section 7)
- [x] Both personas (PER-01, PER-02) served by R1
- [x] R1 enables all five journeys (JRN-01.1 through JRN-02.2) end-to-end
- [x] Out-of-scope items (auth, multi-user, sharing) confirmed absent from map — no gaps created

---

*Document generated: 2026-06-17*
*Sources: PERSONAS-QuickNotes.md, JOURNEYS-QuickNotes.md, JTBD-QuickNotes.md, UserStories-QuickNotes.md, PRD-QuickNotes.md, .planning/PROJECT.md*
*Downstream documents: FRD-QuickNotes.md, TechArch-QuickNotes.md*
