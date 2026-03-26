# ResumAI

A personal job search operating system built for Marc Lehrmann's own search. The core idea: the resume is a living document that should be rewritten against each target role, not polished once and sent everywhere.

---

## What It Is

ResumAI is a targeted resume positioning engine. It analyzes a base resume, recommends the strongest-fit roles from the candidate's history, and rewrites each resume section specifically for the selected target role using Claude.

The output is not a generic improved resume. It is a role-specific version — where every bullet, every section, and the positioning statement are calibrated to the traits a specific hiring manager screens for.

---

## Phase 2 Architecture

Phase 2 is the Positioning Optimizer: the full loop from resume analysis through role-targeted rewrite and persistence.

**Flow:**

```
Resume (Supabase or base fallback)
  → /api/analyze_roles       Claude reads the resume and recommends target roles
  → Role selected             User picks a role; traits and fit reasoning are set
  → Section scoring           Each section is scored against analytics signals
  → /api/rewrite              Claude rewrites each section against the target role
  → Accept / Reject           Accepted rewrites persist back to Supabase
```

**Prompt architecture (`src/lib/anthropic.ts`):**
- `inferRoleType` — classifies the target role (executive, AI/data platform, industrial/OT, channel, technical, enterprise) and uses that classification to adapt system framing, tone, and section rules throughout the prompt
- `buildSectionTypeRules` — per-section rules that are role-type-aware, not generic
- `buildRewritePrompt` — assembles the full prompt including resume context (other sections for coherence), performance directive (derived from score + issues), targeting lens (role traits), and fit reasoning

**Scoring:** Each section is scored (0–100) from three signals — scroll reach, average read time, and Calendly conversion proxy. The score and flagged issues are passed directly into the rewrite prompt as a performance directive.

**Persistence:** Accepted rewrites are saved or updated in Supabase via `saveResumeVersion` / `updateResumeVersion`. The active version is loaded on page mount.

**Tracking:** PostHog captures `role_selected` (with company), `rewrite_ran`, `rewrite_accepted`, and `rewrite_rejected` (both with target role) for outcome analysis.

---

## Current Features

**Positioning Optimizer (`/positioning`)**
- Claude-powered role recommendation from resume content
- Role-type inference with adaptive prompt tone and section rules
- Per-section scoring against analytics signals
- Side-by-side before/after diff view
- Role comparison view (rewrite same section against two different roles)
- Accept/reject per section with Supabase persistence

**Opportunities Board (`/opportunities`)**
- Job list with Claude-powered match scoring
- Match label and apply urgency per listing
- Status tracking (saved, applied, archived)
- Supabase persistence

**CRM (`/crm`)**
- Application tracking (company, title, status, contact, notes)
- Contact management

**API Routes**
- `/api/analyze_roles` — role recommendation from resume
- `/api/rewrite` — role-targeted section rewrite
- `/api/score-jobs` — job match scoring
- `/api/cover-letter`, `/api/outreach`, `/api/role-brief`, `/api/interview-prep`, `/api/debrief` — supporting generation endpoints (early stage)

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14, TypeScript |
| AI | Anthropic Claude (claude-sonnet-4-6) |
| Database | Supabase (Postgres + pgvector) |
| Auth | Clerk |
| Tracking | PostHog |
| Background jobs | Inngest |
| Hosting | Vercel |

---

## Not in Scope

- **Multi-tenant / SaaS** — single-user by design; no account management or billing
- **Automated job ingestion** — jobs are manually added or seeded; no scraper
- **Real-time analytics pipeline** — analytics signals are currently seeded sample data, not live instrumentation
- **Email / digest automation** — Inngest infrastructure exists but digest features are not built out
- **Mobile** — desktop-first layout throughout
