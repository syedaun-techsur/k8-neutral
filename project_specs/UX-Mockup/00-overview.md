# UX Mockup: QuickNotes

**Project:** QuickNotes  
**Version:** 1.0  
**Generated:** 2026-06-17  
**Based on:** UserStories-QuickNotes.md, PRD-QuickNotes.md, FRD-QuickNotes.md, JOURNEYS-QuickNotes.md  

---

## Overview

QuickNotes is a three-screen, single-entity CRUD application optimised for **one-handed mobile capture**. The design philosophy mirrors the product vision: every pixel serves speed and trust. There is no onboarding, no modals, no sidebars — just the list, the create form, and the edit form.

### Design Principles

| # | Principle | Rationale |
|---|-----------|-----------|
| 1 | **Mobile-first at 360 px** | Primary persona (Alex Moreno) captures notes one-handed on a phone during commutes. 360 px is the narrowest common Android viewport. |
| 2 | **Gold sparingly** | `#FBCA5C` signals "do something" — it lives only on primary CTAs and pinned indicators. Never used as decoration. ≤ 10% of any view surface. |
| 3 | **No dead links, no orphan states** | Nav contains exactly two items: Home (`/`) and New (`/notes/new`). Every error state has a recovery path back to `/`. |
| 4 | **Inline errors, no toasts for failures** | Validation errors appear adjacent to the failing field. Success is implicit (redirect + updated list). |
| 5 | **List is the source of truth** | Every write action (create, save, delete) ends with a redirect to `/` where the updated state is visible immediately — no stale cache, no optimistic UI. |
| 6 | **44 × 44 px minimum touch targets** | All tappable elements meet Apple HIG / WCAG 2.5.5 guidelines. Enforced via padding, not by enlarging visual elements. |

### Design Token Summary

| Token | Value | Usage |
|-------|-------|-------|
| `--color-accent` | `#FBCA5C` | CTA buttons, pinned indicator |
| `--color-text` | `#0A0A0A` | All body text, headings, labels |
| `--color-surface` | `#FFFFFF` | Page background, card background |
| `--color-border` | `#E0E0E0` | Input borders, dividers |
| `--color-error` | `#D32F2F` | Inline error messages |
| `--color-muted` | `#757575` | Placeholder text, secondary metadata |
| `--font-size-body` | `16px` | Minimum body text size |
| `--font-size-title` | `18px` | Note titles in list rows |
| `--touch-target` | `44px` | Minimum height/width for interactive elements |
| `--radius` | `8px` | Input and button border-radius |
| `--spacing-page` | `16px` | Horizontal page padding on mobile |

### Screen Inventory

| Screen | Route | User Stories |
|--------|-------|-------------|
| Note List | `/` | US-0.1, US-0.2, US-1.1, US-1.2, US-1.3, US-6.1, US-6.2 |
| Create Note | `/notes/new` | US-2.1, US-2.2, US-6.1, US-6.2 |
| Edit / Delete Note | `/notes/[id]/edit` | US-3.1, US-3.2, US-3.3, US-6.1, US-6.2 |

### Flow Inventory

| Flow | Trigger | Primary Stories |
|------|---------|----------------|
| Flow-00: Capture Note | Tap "New note" | US-2.1, US-2.2 |
| Flow-01: Search & Retrieve | Type in search box | US-1.1, US-1.2, US-1.3 |
| Flow-02: Edit & Delete | Tap note row | US-3.1, US-3.2, US-3.3 |

---
