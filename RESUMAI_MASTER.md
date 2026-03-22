# ResumAI — Master Build Plan
## Job Search Operating System
### Plug this entire file into Claude Code to begin Phase 1

---

## CLAUDE CODE KICKOFF PROMPT
### Copy everything below the line and paste as your first message in Claude Code

---

You are my technical co-founder and the sole engineer on ResumAI.

ResumAI is a Job Search Operating System — not a resume tool. It answers four questions every morning:
1. What should I apply to?
2. Which version of me should I send?
3. What is holding me back?
4. What should I do next?

You have full context on the system. Build it exactly as specified. Do not improvise architecture. Do not skip steps. Ask before deviating from any spec.

---

## WHO I AM

Marc Lehrmann, 37, Southern California.
Assistant Sales Manager, AVEVA Select CA (exclusive California AVEVA distributor).
Selling SCADA, HMI, PI System, Industrial IoT to enterprise + municipal customers.
10+ years enterprise tech sales. $25M+ career revenue.
Prior: Transcend Information (Channel Account Manager), Dexxxon Digital Storage (Key Account Manager).
BA Economics, UC Riverside 2012.
GitHub: github.com/mlehr001
Email: mlehr001@gmail.com
LinkedIn: linkedin.com/in/marclehrmann

Target roles: Strategic Partnerships, Business Development, Enterprise Sales
Target industries: AI platforms, data infrastructure, cloud/SaaS, AdTech, entertainment tech
Core narrative: "OT → AI bridge"

---

## WHAT WE ARE BUILDING

Five modules, one unified app:

1. PUBLIC PROOF LAYER — landing page, resume versions, proof assets
2. OPPORTUNITY ENGINE — job ingestion, scoring, role clustering, prioritization
3. CAREER CRM — companies, contacts, applications, statuses, follow-ups
4. POSITIONING ENGINE — role strategy briefs, objection radar, resume versioning, proof coverage
5. DECISION ENGINE — command center, daily priorities, experiment tracking, insights

---

## DESIGN SYSTEM (NON-NEGOTIABLE — MATCHES RESUME TEMPLATE)

```
Colors:
  --navy:       #2C3E50  (primary, sidebar, headings)
  --navy-dark:  #1E2C3A  (nav bar)
  --navy-light: #34495E  (secondary)
  --white:      #FFFFFF  (content panels)
  --off-white:  #F5F5F3  (page bg, inputs)
  --border:     #E5E2DD  (dividers, card borders)
  --muted:      #888888  (secondary text)
  --green:      #27AE60  (success, strong match)
  --amber:      #F39C12  (warning, partial)
  --red:        #E74C3C  (error, weak, overdue)
  --blue:       #2980B9  (applied badge, links)

Fonts: Raleway (headings/nav/labels) + Open Sans (body)
Rules: NO border-radius anywhere. Sharp corners throughout.
       Navy sidebar (280px) + white content panel on desktop.
       Sticky nav 56px height, navy-dark background.
```

---

## TECH STACK

```
Framework:    Next.js 14, TypeScript, Tailwind CSS
Database:     Supabase (postgres + pgvector)
Auth:         Clerk
AI:           Anthropic Claude API (claude-sonnet-4-20250514)
Email:        Resend
Background:   Inngest (daily digest 7am PT, job refresh 6hr)
Cache:        Upstash Redis (1hr TTL, rate limiting)
Analytics:    PostHog (product) + GA4 (landing page) + Hotjar (behavior)
Jobs:         Adzuna API + Greenhouse/Lever open boards + SerpAPI
Payments:     Stripe (Phase 7+)
Deploy:       Vercel
```

---

## INSTALL COMMAND

Run this first:

```bash
npx create-next-app@latest resumai --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd resumai
npm install @supabase/supabase-js @clerk/nextjs @anthropic-ai/sdk
npm install resend inngest @upstash/redis @upstash/ratelimit
npm install posthog-js posthog-node
npm install lucide-react recharts
npm install @radix-ui/react-dialog @radix-ui/react-tabs @radix-ui/react-select
```

---

## ENVIRONMENT VARIABLES

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/

# Anthropic
ANTHROPIC_API_KEY=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=resumai@yourdomain.com
RESEND_TO_EMAIL=mlehr001@gmail.com

# Inngest
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# Upstash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# GA4
GA4_PROPERTY_ID=
GA4_CLIENT_EMAIL=
GA4_PRIVATE_KEY=

# Job APIs
ADZUNA_APP_ID=
ADZUNA_APP_KEY=
SERPAPI_KEY=

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## FULL FILE STRUCTURE

Build this exactly:

```
resumai/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    ← Clerk + PostHog + Nav
│   │   ├── page.tsx                      ← Command Center (home)
│   │   ├── opportunities/
│   │   │   └── page.tsx                  ← Job matcher + scoring
│   │   ├── crm/
│   │   │   └── page.tsx                  ← Pipeline + contacts
│   │   ├── positioning/
│   │   │   └── page.tsx                  ← Resume versions + optimizer
│   │   ├── proof/
│   │   │   └── page.tsx                  ← Landing page + assets
│   │   ├── interview/
│   │   │   └── page.tsx                  ← Interview prep + debrief
│   │   ├── sign-in/[[...sign-in]]/
│   │   │   └── page.tsx                  ← Clerk sign in
│   │   └── api/
│   │       ├── inngest/route.ts           ← Background jobs
│   │       ├── rewrite/route.ts           ← Claude section rewrite
│   │       ├── score-jobs/route.ts        ← Claude job scoring
│   │       ├── role-brief/route.ts        ← Claude role strategy brief
│   │       ├── cover-letter/route.ts      ← Claude cover letter
│   │       ├── interview-prep/route.ts    ← Claude interview questions
│   │       ├── debrief/route.ts           ← Claude post-interview analysis
│   │       └── outreach/route.ts          ← Claude outreach messages
│   ├── components/
│   │   ├── Nav.tsx
│   │   ├── CommandCenter/
│   │   │   ├── DailyPriorities.tsx
│   │   │   ├── FunnelMetrics.tsx
│   │   │   ├── TopJobs.tsx
│   │   │   ├── FollowUpsDue.tsx
│   │   │   └── ObjectionAlert.tsx
│   │   ├── Opportunities/
│   │   │   ├── JobCard.tsx
│   │   │   ├── ScoreBar.tsx
│   │   │   └── ClusterBadge.tsx
│   │   ├── CRM/
│   │   │   ├── PipelineBoard.tsx
│   │   │   ├── ContactCard.tsx
│   │   │   └── ApplicationRow.tsx
│   │   ├── Positioning/
│   │   │   ├── ResumeVersionCard.tsx
│   │   │   ├── SectionScoreCard.tsx
│   │   │   ├── ProofCoverageScore.tsx
│   │   │   └── ObjectionRadar.tsx
│   │   ├── Interview/
│   │   │   ├── PrepBrief.tsx
│   │   │   ├── DebriefForm.tsx
│   │   │   └── LiveNoteCapture.tsx
│   │   └── ui/
│   │       ├── StatCard.tsx
│   │       ├── ScoreRing.tsx
│   │       ├── SectionHeader.tsx
│   │       └── Badge.tsx
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── supabase-server.ts             ← server-side client
│   │   ├── anthropic.ts                   ← shared Claude client
│   │   ├── inngest.ts                     ← all background functions
│   │   ├── upstash.ts                     ← cache + rate limit
│   │   ├── posthog.ts                     ← analytics provider
│   │   ├── resume.ts                      ← resume content + scoring
│   │   ├── jobs.ts                        ← job ingestion + normalization
│   │   └── constants.ts                   ← colors, types, nav items
│   ├── types/
│   │   └── index.ts                       ← all shared TypeScript types
│   └── middleware.ts                      ← Clerk auth guard
├── .env.local
├── .env.example
└── package.json
```

---

## DATABASE SCHEMA

Run this entire block in Supabase SQL Editor:

```sql
-- ─── RESUME VERSIONS ──────────────────────────────────────────────
create table resume_versions (
  id              uuid default gen_random_uuid() primary key,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  version_name    text not null,
  role_cluster    text,                    -- e.g. "AI Partnerships", "Enterprise AE"
  target_role     text,
  summary         text,
  sections        jsonb not null,          -- [{id, title, content, weight, score}]
  overall_score   integer,
  proof_coverage  jsonb,                   -- {revenue, strategy, partnerships, technical, domain, product, transition}
  is_active       boolean default false,
  times_sent      integer default 0,
  interview_rate  numeric default 0,       -- % that led to interviews
  notes           text
);

-- ─── COMPANIES ────────────────────────────────────────────────────
create table companies (
  id              uuid default gen_random_uuid() primary key,
  created_at      timestamptz default now(),
  name            text not null unique,
  domain          text,
  industry        text,
  size            text,
  stage           text,                    -- startup/growth/enterprise/public
  is_starred      boolean default false,
  fit_score       integer,                 -- AI-assessed fit 0-100
  notes           text,
  linkedin_url    text,
  website         text,
  last_activity   timestamptz
);

-- ─── CONTACTS ─────────────────────────────────────────────────────
create table contacts (
  id              uuid default gen_random_uuid() primary key,
  created_at      timestamptz default now(),
  company_id      uuid references companies(id) on delete cascade,
  name            text not null,
  title           text,
  linkedin_url    text,
  email           text,
  relationship    text,                    -- cold/warm/referral/alumni
  last_contact    timestamptz,
  notes           text,
  outreach_angle  text                     -- AI-suggested approach
);

-- ─── APPLICATIONS ─────────────────────────────────────────────────
create table applications (
  id                  uuid default gen_random_uuid() primary key,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now(),
  company_id          uuid references companies(id),
  contact_id          uuid references contacts(id),
  resume_version_id   uuid references resume_versions(id),
  title               text not null,
  job_url             text,
  source              text,                -- LinkedIn/Indeed/Greenhouse/Lever/Referral
  role_cluster        text,
  status              text default 'Drafting',
  -- statuses: Drafting/Applied/Recruiter Screen/HM Screen/Interview/Final/Offer/Rejected/Ghosted
  applied_date        date,
  next_action         text,
  next_action_date    date,
  job_score           integer,
  match_reasons       text[],
  red_flags           text[],
  notes               text,
  cover_letter        text,
  salary_range        text,
  location            text,
  tags                text[]
);

-- ─── INTERVIEWS ───────────────────────────────────────────────────
create table interviews (
  id                  uuid default gen_random_uuid() primary key,
  created_at          timestamptz default now(),
  application_id      uuid references applications(id) on delete cascade,
  interview_type      text,               -- recruiter/hm/panel/technical/final
  scheduled_at        timestamptz,
  interviewer_name    text,
  interviewer_title   text,
  prep_brief          jsonb,              -- AI-generated: key_topics, likely_questions, proof_points, avoid
  live_notes          jsonb,              -- [{type: Q|O|S|N, content, timestamp}]
  transcript          text,              -- optional
  debrief_completed   boolean default false,
  debrief             jsonb,             -- AI-generated: summary, objections, signals, sentiment
  follow_up_email     text,              -- AI-generated
  outcome             text,              -- pending/advanced/rejected
  objections_raised   text[]
);

-- ─── JOBS (raw ingest + scoring) ──────────────────────────────────
create table jobs (
  id                  uuid default gen_random_uuid() primary key,
  created_at          timestamptz default now(),
  external_id         text unique,
  title               text not null,
  company             text not null,
  company_id          uuid references companies(id),
  location            text,
  remote              boolean,
  source              text,
  url                 text,
  description         text,
  tags                text[],
  role_cluster        text,              -- normalized cluster
  score               integer,
  match_label         text,
  match_reasons       text[],
  red_flags           text[],
  apply_urgency       text,
  status              text default 'New', -- New/Saved/Applied/Archived
  scored_at           timestamptz,
  expires_at          timestamptz,
  is_duplicate        boolean default false
);

-- ─── OBJECTIONS ───────────────────────────────────────────────────
create table objections (
  id              uuid default gen_random_uuid() primary key,
  created_at      timestamptz default now(),
  interview_id    uuid references interviews(id),
  application_id  uuid references applications(id),
  text            text not null,
  category        text,                  -- background/experience/transition/technical/other
  frequency       integer default 1,
  suggested_fix   text,                  -- AI-generated counter
  addressed       boolean default false
);

-- ─── STORY BANK ───────────────────────────────────────────────────
create table stories (
  id              uuid default gen_random_uuid() primary key,
  created_at      timestamptz default now(),
  title           text not null,
  situation       text,
  task            text,
  action          text,
  result          text,
  competencies    text[],                -- leadership/revenue/partnerships/technical/etc
  role_clusters   text[],               -- which clusters this applies to
  use_cases       text[],               -- interview/cover-letter/outreach/positioning
  strength        integer default 3     -- 1-5 rating
);

-- ─── EXPERIMENTS ──────────────────────────────────────────────────
create table experiments (
  id              uuid default gen_random_uuid() primary key,
  created_at      timestamptz default now(),
  hypothesis      text not null,
  variant_a       text,
  variant_b       text,
  metric          text,
  result          text,
  learning        text,
  status          text default 'running' -- running/complete/abandoned
);

-- ─── TASKS ────────────────────────────────────────────────────────
create table tasks (
  id              uuid default gen_random_uuid() primary key,
  created_at      timestamptz default now(),
  due_date        date,
  title           text not null,
  type            text,                  -- apply/follow-up/reach-out/prep/research
  application_id  uuid references applications(id),
  contact_id      uuid references contacts(id),
  completed       boolean default false,
  priority        text default 'medium'  -- high/medium/low
);

-- ─── ANALYTICS SNAPSHOTS ──────────────────────────────────────────
create table analytics_snapshots (
  id              uuid default gen_random_uuid() primary key,
  captured_at     timestamptz default now(),
  unique_visitors integer,
  total_visits    integer,
  calendly_clicks integer,
  avg_scroll_depth numeric,
  sections        jsonb,
  sources         jsonb,
  devices         jsonb,
  geo             jsonb
);

-- ─── INDEXES ──────────────────────────────────────────────────────
create index applications_status_idx   on applications(status);
create index applications_company_idx  on applications(company_id);
create index jobs_score_idx            on jobs(score desc);
create index jobs_cluster_idx          on jobs(role_cluster);
create index jobs_status_idx           on jobs(status);
create index objections_category_idx   on objections(category);
create index tasks_due_idx             on tasks(due_date);
create index tasks_completed_idx       on tasks(completed);
create index interviews_app_idx        on interviews(application_id);

-- ─── ENABLE PGVECTOR (for semantic job matching) ───────────────────
create extension if not exists vector;
alter table jobs add column if not exists embedding vector(1536);
alter table resume_versions add column if not exists embedding vector(1536);

-- ─── SEED DATA ────────────────────────────────────────────────────
insert into resume_versions (version_name, role_cluster, is_active, sections, proof_coverage) values (
  'Base — OT to AI Bridge',
  'AI Partnerships',
  true,
  '[
    {"id":"summary","title":"Summary","weight":0.2,"content":"Seasoned enterprise sales leader. $25M+ career revenue. 10+ years. Industrial software (AVEVA SCADA/PI System/IIoT), storage, embedded tech. Bridging OT and AI."},
    {"id":"experience","title":"Experience","weight":0.4,"content":"AVEVA Select CA, Assistant Sales Manager, 2018-Present. Transcend Information, Channel Account Manager, 2014-2020. Dexxxon Digital Storage, Key Account Manager, 2020-2021."},
    {"id":"narrative","title":"OT-to-AI Narrative","weight":0.2,"content":"10 years selling to the physical world. Now bridging to AI platforms."},
    {"id":"skills","title":"Core Capabilities","weight":0.1,"content":"Enterprise Sales, Strategic Partnerships, Channel Development, SCADA, HMI, PI System, IIoT, AVEVA, AI literacy, Next.js, React, TypeScript, Supabase, Claude API"},
    {"id":"cta","title":"CTA","weight":0.1,"content":"Let us find 30 minutes. Book via Calendly."}
  ]'::jsonb,
  '{"revenue":85,"strategy":70,"partnerships":75,"technical":60,"domain":90,"product":65,"transition":80}'::jsonb
);
```

---

## TYPESCRIPT TYPES

Create `src/types/index.ts`:

```typescript
export type ResumeSection = {
  id: string;
  title: string;
  content: string;
  weight: number;
  score?: number;
};

export type ResumeVersion = {
  id: string;
  version_name: string;
  role_cluster: string;
  target_role?: string;
  sections: ResumeSection[];
  overall_score?: number;
  proof_coverage?: ProofCoverage;
  is_active: boolean;
  times_sent: number;
  interview_rate: number;
};

export type ProofCoverage = {
  revenue: number;
  strategy: number;
  partnerships: number;
  technical: number;
  domain: number;
  product: number;
  transition: number;
};

export type Job = {
  id: string;
  title: string;
  company: string;
  location?: string;
  remote?: boolean;
  source: string;
  url?: string;
  tags?: string[];
  role_cluster?: string;
  score?: number;
  match_label?: string;
  match_reasons?: string[];
  red_flags?: string[];
  apply_urgency?: string;
  status: string;
};

export type Application = {
  id: string;
  title: string;
  company_id?: string;
  status: string;
  applied_date?: string;
  next_action?: string;
  next_action_date?: string;
  job_score?: number;
  role_cluster?: string;
  notes?: string;
};

export type Interview = {
  id: string;
  application_id: string;
  interview_type: string;
  scheduled_at?: string;
  interviewer_name?: string;
  prep_brief?: PrepBrief;
  live_notes?: LiveNote[];
  debrief_completed: boolean;
  debrief?: Debrief;
  outcome?: string;
  objections_raised?: string[];
};

export type PrepBrief = {
  key_topics: string[];
  likely_questions: string[];
  proof_points: string[];
  avoid: string[];
  role_strategy: string;
};

export type LiveNote = {
  type: "Q" | "O" | "S" | "N";  // Question/Objection/Signal/Note
  content: string;
  timestamp: string;
};

export type Debrief = {
  summary: string;
  objections: string[];
  positive_signals: string[];
  sentiment: "positive" | "neutral" | "negative";
  follow_up_email: string;
  resume_improvements: string[];
};

export type Objection = {
  id: string;
  text: string;
  category: string;
  frequency: number;
  suggested_fix?: string;
};

export type RoleCluster =
  | "AI Partnerships"
  | "Enterprise AE"
  | "Channel Sales"
  | "BD Manager"
  | "Strategic Alliances"
  | "AdTech Sales"
  | "Industrial OT";

export type FunnelMetrics = {
  applied: number;
  recruiter_screen: number;
  hm_screen: number;
  interview: number;
  final: number;
  offer: number;
  response_rate: number;
  interview_rate: number;
};
```

---

## NAVIGATION STRUCTURE

Five modules. Command Center is the home screen.

```typescript
// src/lib/constants.ts
export const NAV_ITEMS = [
  { label: "Command Center", href: "/",              icon: "⚡", description: "Daily priorities" },
  { label: "Opportunities",  href: "/opportunities", icon: "🎯", description: "Jobs + scoring" },
  { label: "CRM",            href: "/crm",           icon: "📋", description: "Pipeline + contacts" },
  { label: "Positioning",    href: "/positioning",   icon: "🧠", description: "Resume + strategy" },
  { label: "Interview",      href: "/interview",     icon: "🎤", description: "Prep + debrief" },
];
```

---

## PAGE SPECS

Build each page exactly as described.

### `/` — COMMAND CENTER

The home screen. Answers the four daily questions immediately.

Layout: 2-column grid on desktop, stacked on mobile.

Left column (priority feed):
- "Today's Moves" — 3 highest-urgency tasks (apply/follow-up/reach-out), each with one-click action
- "Top Matches" — 3 highest-scored new jobs with role cluster badge, score, apply button
- "Follow-ups Due" — applications with next_action_date <= today, sorted by days overdue

Right column (intelligence):
- Funnel Metrics strip — Applied / Screened / Interviewed / Offered with conversion rates
- Objection Alert — most frequent unaddressed objection this week + suggested fix
- Active Resume Version — which version is set to active, its proof coverage score, quick-switch button
- Weekly Experiment — current hypothesis + status

No charts on this page. Pure action items.

---

### `/opportunities` — OPPORTUNITY ENGINE

Three panels:

Panel 1 — Controls:
- Keywords input (comma-separated)
- Role cluster filter (multi-select: AI Partnerships / Enterprise AE / Channel / BD / AdTech)
- Starred companies chips (add/remove)
- "Score & Rank" button
- Source filter tabs (All / LinkedIn / Indeed / Greenhouse / Lever / Google)

Panel 2 — Ranked job list:
- Each card: rank number, score ring, title, company, location, source badge, role cluster badge, tags, match reasons on expand, red flags on expand, apply urgency indicator
- Starred company gets ★
- Already-applied company gets blue "Applied" badge
- Expand for full AI reasoning + Role Strategy Brief link
- Save / Apply buttons

Panel 3 — Role Clusters summary:
- For each cluster: count of matching jobs, avg score, recommended resume version

---

### `/crm` — CAREER CRM

Two views toggled by tab: Pipeline and Contacts.

Pipeline view (default):
- Kanban-style columns: Drafting / Applied / Recruiter Screen / HM Screen / Interview / Final / Offer / Rejected
- Each card: company name, role title, score badge, days in stage, next action chip
- Click card to open full application detail drawer:
  - Status dropdown
  - Resume version used
  - Contact linked
  - Notes textarea
  - Cover letter view
  - Interview history
  - Next action + date picker
  - AI: "What should I do next?" button

Contacts view:
- Table: name, company, title, relationship (cold/warm/referral), last contact date, outreach angle
- Add contact form
- "Generate Outreach Message" button per contact → calls /api/outreach

---

### `/positioning` — POSITIONING ENGINE

Four tabs: Versions / Optimizer / Proof Coverage / Objection Radar

Versions tab:
- Grid of resume version cards
- Each card: version name, role cluster, overall score, times sent, interview rate, active badge
- "Set Active" button
- "Duplicate" button
- "Compare" (select two → side-by-side diff)
- "New Version" button

Optimizer tab (living resume — already built):
- Target role input
- Section score cards (A-D grades)
- Rewrite controls with guardrails:
  - Claude must explain every change
  - No hallucinated metrics
  - Preserves core facts
  - Shows confidence level per rewrite
- Before/after diff
- Accept / Reject / Try Again

Proof Coverage tab:
- Radar chart: 7 dimensions (revenue, strategy, partnerships, technical, domain, product, transition)
- Score per dimension 0-100
- Gap analysis: "Your technical fluency score is 60/100. Add a bullet about your 7 app builds to close this gap."
- AI: "What proof am I missing?" button

Objection Radar tab:
- Ranked list of objections by frequency
- Category badges (background/experience/transition/technical)
- For each: text, frequency count, which interviews it appeared in, AI-suggested counter
- "Mark Addressed" button
- "Add Story to Counter This" → links to Story Bank

---

### `/interview` — INTERVIEW INTELLIGENCE

Three states: Upcoming / Active / Past

Upcoming view:
- List of scheduled interviews from applications with status "Interview" or "Final"
- Each: company, role, type, date/time, interviewer
- "Generate Prep Brief" button → calls /api/interview-prep → returns:
  - Key topics to know
  - 5 likely questions with suggested answers
  - Proof points to lead with
  - Things to avoid
  - Role strategy summary
- "Start Live Notes" button

Active view (live note capture):
- Clean full-screen mode
- Four note type buttons: Q (Question), O (Objection), S (Signal), N (Note)
- Each tap opens a text input, timestamps automatically
- Running note feed below
- "End Interview" button → forces debrief

Debrief view (required — cannot skip):
- Form: Overall sentiment (positive/neutral/negative)
- Objections raised (multi-input)
- Positive signals (multi-input)
- Surprises (free text)
- "Generate Debrief" button → calls /api/debrief → returns:
  - Summary paragraph
  - Objection analysis
  - Signal analysis
  - Follow-up email (ready to send)
  - Resume improvement suggestions
  - Feeds objections back into Objection Radar automatically

Past view:
- Table of completed interviews with outcome, objections, debrief summary

---

## API ROUTES

Build all of these:

### `POST /api/rewrite`
Input: { section, targetRole, analytics, scoreData }
Claude prompt: Aggressive rewrite for target role. Explain every change. No hallucinated metrics. Preserve facts.
Output: { rewrite, changes_explained, confidence }

### `POST /api/score-jobs`
Input: { jobs, resumeContent, appliedHistory, starred, keywords, roleClusters }
Cached: 1hr Upstash cache keyed by job IDs + keywords
Rate limited: 3 runs/hour
Claude prompt: Score against 5 dimensions. Assign role cluster. Flag red flags.
Output: { scores: [{id, score, matchLabel, roleCluster, reasons, redFlags, applyUrgency}] }

### `POST /api/role-brief`
Input: { jobTitle, company, industry, resumeVersion }
Claude prompt: For this specific role — what matters, why Marc fits, likely objections, what proof to lead with, what to avoid.
Output: { whatMatters, whyYouFit, likelyObjections, leadWith, avoid }

### `POST /api/cover-letter`
Input: { application, resumeVersion, roleBrief }
Claude prompt: Write a compelling cover letter. No fluff. Lead with the strongest proof point. OT-to-AI narrative where relevant. Under 250 words.
Output: { coverLetter }

### `POST /api/interview-prep`
Input: { interview, application, resumeVersion }
Claude prompt: Generate prep brief with key topics, 5 likely questions + answers, proof points, avoid list.
Output: { prepBrief: PrepBrief }

### `POST /api/debrief`
Input: { interview, liveNotes, sentiment, objectionsRaised, signals, surprises }
Claude prompt: Analyze this interview. Generate summary, objection analysis, signal analysis, follow-up email, resume improvement suggestions.
Output: { debrief: Debrief }

### `POST /api/outreach`
Input: { contact, company, application, type, resumeVersion }
Types: recruiter-first-touch / hm-direct / follow-up / referral-ask
Claude prompt: Write a specific, non-generic outreach message. Reference the OT-to-AI narrative where relevant. Under 150 words.
Output: { message }

### `GET /api/inngest` + `POST /api/inngest`
Inngest handler serving: dailyDigest (7am PT) + refreshJobs (every 6hr)

---

## INNGEST FUNCTIONS

### dailyDigest — fires 7am PT daily

Steps:
1. Fetch top 5 new jobs scored >= 70 since yesterday
2. Fetch all tasks with due_date <= today and completed = false
3. Fetch latest analytics snapshot
4. Fetch most frequent unaddressed objection
5. Build and send HTML email via Resend to mlehr001@gmail.com

Email sections:
- Landing page metrics (visits delta, Calendly clicks)
- Top new matches (score, company, role, apply link)
- Follow-ups due (company, status, days overdue, suggested action)
- Objection of the week + suggested counter
- "Open ResumAI" CTA button

### refreshJobs — fires every 6 hours

Steps:
1. Fetch from Adzuna API (keywords: "strategic partnerships AI", "enterprise sales data", "business development cloud")
2. Fetch from Greenhouse open boards (target companies list)
3. Normalize + dedupe against existing jobs table
4. Score new jobs via Claude
5. Upsert to jobs table
6. Send Inngest event "new-strong-matches" if any score >= 85

---

## PROOF COVERAGE SCORING

Score 0-100 per dimension. Claude evaluates resume content against criteria.

```
revenue:      Does it quantify revenue impact? ($25M+ career, $3M channel, 30% YoY, 100% YoY)
strategy:     Does it show strategic thinking beyond execution?
partnerships: Does it demonstrate ecosystem/partner/channel motion?
technical:    Does it show technical credibility? (SCADA/PI System/IIoT + 7 apps built)
domain:       Is the OT/industrial/AI domain expertise clear?
product:      Does it show product thinking? (7 apps, roadmapping, user empathy)
transition:   Is the OT→AI narrative credible and explicit?
```

---

## ROLE CLUSTERS

Normalize all jobs into these clusters. One Claude call per job assigns a cluster.

```
AI Partnerships       → Director/VP Strategic Partnerships at AI/ML/LLM companies
Enterprise AE         → Enterprise Account Executive at data/cloud/SaaS
Channel Sales         → Channel Sales Director/Manager at tech companies
BD Manager            → Business Development Manager/Director
Strategic Alliances   → Alliances, ISV, Partner Manager at cloud/platform
AdTech Sales          → Sales/Partnerships at AdTech/media-tech
Industrial OT         → Back to AVEVA/Honeywell/Rockwell type roles (low priority)
```

---

## CLAUDE REWRITE GUARDRAILS

Every rewrite must follow these rules. Bake into every prompt:

```
1. DO NOT invent metrics not present in source material
2. DO NOT upgrade titles or scope beyond what is documented
3. DO NOT add companies, roles, or experiences that don't exist
4. EXPLAIN every material change with a reason
5. PRESERVE: $25M+ revenue, AVEVA/Transcend/Dexxxon company names, UC Riverside, 2012, all dates
6. FLAG if a requested rewrite would require fabrication
7. CONFIDENCE SCORE: Rate your rewrite 1-5 on factual fidelity
```

---

## PHASE BUILD PLAN

### PHASE 1 — Foundation + Command Center
**Goal:** Working app deployed. Daily use possible from day one.

Steps:
1. Scaffold Next.js project with full stack (see INSTALL COMMAND above)
2. Create .env.local with all keys
3. Run full Supabase schema SQL
4. Build shared components: Nav, StatCard, SectionHeader, Badge, ScoreRing
5. Build Command Center home screen (/ route) with sample data first
6. Wire living resume optimizer → /positioning/optimizer
7. Wire job matcher → /opportunities
8. Build basic CRM pipeline view → /crm
9. Add all API routes (rewrite, score-jobs, role-brief)
10. Add Inngest handler + dailyDigest function
11. Add Upstash caching to score-jobs route
12. Add PostHog provider to layout
13. Add Clerk auth + middleware
14. Deploy to Vercel
15. Sync Inngest to production URL

Deliverable: Live app at your domain. Command Center shows sample data. Optimizer rewrites. Job matcher scores. Pipeline tracks applications. Digest fires at 7am.

---

### PHASE 2 — Live Data + CRM Depth
**Goal:** Real job data flowing. CRM fully usable.

Steps:
1. Connect Adzuna API → wire to refreshJobs Inngest function
2. Connect Greenhouse/Lever open boards
3. Add job normalization + deduplication logic
4. Add role cluster assignment to job scoring
5. Build full CRM application detail drawer
6. Add contacts table + contacts view
7. Build "Generate Outreach Message" flow → /api/outreach
8. Add follow-up task creation from application actions
9. Connect GA4 API → populate analytics_snapshots daily
10. Wire Command Center to live Supabase data (replace sample data)
11. Add proof coverage scoring to resume versions
12. Build Objection Radar tab

Deliverable: Real jobs flowing every 6 hours. CRM is your active pipeline. Command Center shows live data. Objections start accumulating.

---

### PHASE 3 — Interview Intelligence + Positioning Depth
**Goal:** Full interview loop. Resume versioning. Story Bank.

Steps:
1. Build Interview module — upcoming/active/past views
2. Build prep brief generator → /api/interview-prep
3. Build live note capture (Q/O/S/N)
4. Build debrief form + generator → /api/debrief
5. Wire debrief objections → objections table → Objection Radar
6. Build resume version lab — grid, compare, duplicate, set active
7. Build Story Bank — STAR format, tag by competency + cluster
8. Add cover letter generator → /api/cover-letter
9. Add role strategy brief on job card expand → /api/role-brief
10. Add experiment tracker
11. Wire interview outcomes → resume version interview_rate field

Deliverable: Full interview intelligence loop closed. Every interview feeds the system. Resume versions have real performance data. Story Bank grows with every debrief.

---

## WHAT TO BUILD FIRST IN THIS SESSION

Start here. In this exact order:

1. Run npm install command
2. Create .env.local (paste keys when prompted)
3. Run Supabase schema SQL
4. Create src/types/index.ts
5. Create src/lib/constants.ts (colors + nav items)
6. Create src/lib/supabase.ts (client + all helper functions)
7. Create src/lib/anthropic.ts (shared client)
8. Create src/middleware.ts (Clerk guard)
9. Create src/app/layout.tsx (Clerk + PostHog + Nav)
10. Create src/components/Nav.tsx
11. Create src/app/page.tsx (Command Center — sample data first)
12. Create src/app/positioning/page.tsx (living resume optimizer)
13. Create src/app/opportunities/page.tsx (job matcher)
14. Create src/app/crm/page.tsx (basic pipeline)
15. Create all API routes
16. Create src/lib/inngest.ts + src/app/api/inngest/route.ts
17. Create src/lib/upstash.ts
18. Create src/lib/posthog.ts
19. git init + push to github.com/mlehr001/resumai
20. Deploy to Vercel

Do not move to the next item until the current one works.
Ask me for any missing keys or credentials before proceeding.
Run `npm run dev` after step 11 and verify the app loads before continuing.

---

## EXISTING FILES TO WIRE IN

These files were already built. Convert and integrate — do not rebuild from scratch:

- `marc-lehrmann.html` → Convert to Next.js page at `/proof` route. Keep HTML/CSS identical. Add to nav as "Proof" module.
- `dashboard.jsx` → Wire into Command Center analytics strip and /positioning analytics. Replace sample data with Supabase + GA4 calls.
- `living-resume.jsx` → Wire as /positioning/optimizer. Change Claude API calls to /api/rewrite. Add Supabase persistence.
- `job-matcher.jsx` → Wire as /opportunities. Change Claude calls to /api/score-jobs. Add Supabase persistence and role cluster display.

---

## CRITICAL REMINDERS

- Sharp corners everywhere. No border-radius.
- Navy sidebar (#2C3E50), white content (#FFFFFF), off-white background (#F5F5F3).
- Raleway for all headings, labels, nav. Open Sans for body text.
- Never auto-deploy landing page changes. Suggest only → user approves → deploy.
- Claude rewrites must explain every change. No hallucinated metrics.
- Role clusters first, individual companies second.
- PostHog is primary product analytics. GA4 is landing page only.
- Debrief is required. Transcript is optional.
- This is a Job Search Operating System, not a resume tool.
