# FRD: QuickNotes

**Document Type:** Functional Requirements Document  
**Version:** 1.0  
**Date:** 2026-06-17  
**Status:** Active  
**Project Acronym:** QuickNotes  
**Source PRD:** `project_specs/PRD-QuickNotes.md`

---

## Scope

This document specifies the functional behavior of all QuickNotes features in enough detail for a developer to implement the application without ambiguity. It covers the eight features defined in PRD-QuickNotes.md (F0–F7), the single `notes` database table, the complete REST API surface, and all error states. QuickNotes is a single-user, no-auth, mobile-first notes application built on Next.js 14 (App Router) with PostgreSQL persistence.

---

## Conventions

- **Feature IDs** match the PRD: F0 (Note List View), F1 (Note Search), F2 (Create Note), F3 (Edit & Delete Note), F4 (Data Persistence), F5 (REST API), F6 (Mobile-First UI), F7 (Iframe & Deployment Compatibility).
- **HTTP status codes** are canonical (200 OK, 201 Created, 204 No Content, 400 Bad Request, 404 Not Found, 405 Method Not Allowed, 500 Internal Server Error).
- **JSON payloads** use camelCase keys in API responses even though PostgreSQL columns use snake_case. Column names map: `created_at` → `createdAt`.
- **`[id]`** in route notation refers to a PostgreSQL `serial` integer value.
- **"redirect"** means a Next.js server-side redirect (via `redirect()`) or client-side navigation — whichever is appropriate to the rendering strategy used.
- **"pre-filled"** means the form field's initial value is set from the database record before the page renders.
- **Cross-references** use the format `see F03 §Process` or `see Y1-api.md §Notes`.

---

## Table of Contents

| Chunk | Description |
|-------|-------------|
| `F00-note-list-view.md` | F0: Note List View (`/`) |
| `F01-note-search.md` | F1: Note Search |
| `F02-create-note.md` | F2: Create Note (`/notes/new`) |
| `F03-edit-delete-note.md` | F3: Edit & Delete Note (`/notes/[id]/edit`) |
| `F04-data-persistence.md` | F4: Data Persistence & Auto-Migration |
| `F05-rest-api.md` | F5: REST API |
| `F06-mobile-ui.md` | F6: Mobile-First UI & Design System |
| `F07-iframe-deployment.md` | F7: Iframe & Deployment Compatibility |
| `Y0-schema.md` | Database Schema (DDL) |
| `Y1-api.md` | REST API Endpoint Catalog |
| `Y2-errors.md` | Cross-Feature Error Catalog |
| `Y3-integrations.md` | External Integration Points |

---

## Cross-Cutting Terminology

| Term | Definition |
|------|------------|
| **Note** | The single data entity: a user-authored text record with a title, optional body, pinned flag, and creation timestamp |
| **Pinned** | A boolean flag on a note that promotes it to the top of all sorted lists |
| **Auto-migration** | Execution of `CREATE TABLE IF NOT EXISTS notes (...)` at application startup before any request is served |
| **App Router** | Next.js 14's file-system routing convention using the `app/` directory |
| **Route Handler** | Next.js App Router API file (`app/api/.../route.ts` or `route.js`) that exports named HTTP method functions |
| **Server Action** | Next.js App Router mechanism for calling server-side functions from a form without a client-side fetch |
| **`[id]`** | Dynamic route segment representing the integer primary key of a note |
| **Empty state** | The UI rendered when a list has zero items |
| **Confirmation step** | A prompt (browser `confirm()` dialog or equivalent inline UI) that requires explicit user acknowledgment before a destructive action executes |
| **DB URL** | The PostgreSQL connection string read from the `DATABASE_URL` environment variable (or equivalent; see Y3-integrations.md) |
| **`next.config.mjs`** | The required Next.js 14 configuration file. Must use `.mjs` extension — `.ts` causes a hard build error on Next 14 |

---

## Shared Constraints (apply to all features)

- No authentication layer. All routes are publicly accessible.
- No hard-coded database credentials. All DB connection parameters come from environment variables.
- No `X-Frame-Options` header. No `Content-Security-Policy: frame-ancestors` restrictive directive.
- Server must bind to `0.0.0.0:3000`.
- Config file must be `next.config.mjs` — never `next.config.ts`.
- All API responses are `Content-Type: application/json` unless the response has no body (204).
- The `notes` table must exist before any API or page handler queries PostgreSQL.
