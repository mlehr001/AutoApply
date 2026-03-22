# ResumAI — Full Context Dump
## Paste this at the start of any Claude chat or Claude Code session to get full context instantly.

---

## Who I Am

**Marc Lehrmann**, 37, Southern California.
Assistant Sales Manager at AVEVA Select CA — exclusive AVEVA distributor for California.
Selling SCADA, HMI, PI System, and industrial IoT to enterprise and municipal customers.
10+ years enterprise tech sales. $25M+ career revenue.
Prior roles: Channel Account Manager at Transcend Information (2014–2020), Key Account Manager at Dexxxon Digital Storage (2020–2021).
Education: BA Economics, UC Riverside 2012.
Contact: mlehr001@gmail.com | 909-573-5840 | linkedin.com/in/marclehrmann | github.com/mlehr001

**Actively transitioning** toward Strategic Partnerships, Business Development, or Enterprise Sales at AI, data platform, cloud, AdTech, or entertainment tech companies.
Core positioning angle: **"OT to AI bridge"** — 10 years selling to industrial enterprises, now targeting companies selling to those same enterprises.

---

## Tech Setup

- **Machine**: Lenovo ThinkPad L13 Yoga Gen 2, Windows, VS Code
- **Secondary**: Replit / phone when away from desk
- **Stack**: Next.js 14, TypeScript, Supabase, Clerk, Anthropic Claude API, Tailwind, Vercel
- **GitHub**: github.com/mlehr001
- **Supabase projects**: marc-ai-apps-main (US East), marc-ai-apps-secondary (US West)

---

## ResumAI — What It Is

A personal job search command center that productizes into a SaaS tool.
Currently private, built for Marc's own job search, with a clear path to multi-tenant product.
Housed in: **github.com/mlehr001/resumai** (create this repo)
Deployed to: Vercel + custom domain

**The core loop:**
Landing page collects visitor data → Analytics dashboard reads it → Living Resume Optimizer feeds that data to Claude to rewrite underperforming sections → Job Matcher scores and ranks open roles → Daily digest sends a morning summary → CRM tracks the pipeline.

---

## Design System

Matches Marc's resume template exactly — must stay consistent across all screens.

```
Colors:
  --navy:      #2C3E50   (primary, sidebar background, headings)
  --navy-dark: #1E2C3A   (nav bar)
  --navy-light:#34495E   (secondary elements)
  --white:     #FFFFFF   (main content background)
  --off-white: #F5F5F3   (page background, input fields)
  --border:    #E5E2DD   (dividers, card borders)
  --muted:     #888888   (secondary text)
  --green:     #27AE60   (success, strong match, accepted)
  --amber:     #F39C12   (warning, partial match)
  --red:       #E74C3C   (error, weak match, needs rewrite)
  --blue:      #2980B9   (applied badge)

Fonts:
  Raleway (headings, nav, labels) — weights 300, 400, 600, 700, 800
  Open Sans (body text) — weights 300, 400, 600

Layout pattern:
  - 280px dark navy sidebar (left) + white content panel (right) on desktop
  - Sticky nav at 56px height, navy-dark background
  - Section titles: Raleway 800, navy, border-bottom 2px solid navy
  - Cards: white background, 1px solid border, no border-radius (sharp corners throughout)
  - Buttons: sharp corners, navy background / white text for primary, offWhite/border for secondary
```

---

## App Architecture

```
resumai/
├── src/
│   ├── app/
│   │   ├── layout.tsx              ← Clerk + Nav wrapper
│   │   ├── page.tsx                ← redirects to /dashboard
│   │   ├── dashboard/page.tsx      ← analytics dashboard
│   │   ├── optimize/page.tsx       ← living resume optimizer
│   │   ├── jobs/page.tsx           ← job matcher
│   │   └── api/
│   │       ├── rewrite/route.ts    ← Claude rewrite endpoint
│   │       └── score-jobs/route.ts ← Claude job scoring endpoint
│   ├── components/
│   │   ├── Nav.tsx
│   │   ├── StatCard.tsx
│   │   ├── ScoreRing.tsx
│   │   └── JobCard.tsx
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── resume.ts
│   │   └── constants.ts
│   └── middleware.ts               ← Clerk auth guard
├── .env.local                      ← never commit
├── .env.example                    ← commit this
└── package.json
```

**Routes:**
| Route | Access | Description |
|-------|--------|-------------|
| / | Public | Landing page (marclehrmann.com) |
| /dashboard | Auth | Analytics dashboard |
| /optimize | Auth | Living resume optimizer |
| /jobs | Auth | Job matcher |

---

## Supabase Schema

```sql
-- Three tables, already defined:
resume_versions   -- versioned resume content, active flag, target role, score
jobs              -- scored job listings, status, contact, next action date
analytics_snapshots -- daily GA4 pulls, per-section scroll/time data
```

Full schema SQL is in RESUMAI_PHASE1.md.

---

## Full Stack

```
Core:         Next.js 14, TypeScript, Tailwind
Database:     Supabase (postgres + pgvector)
Auth:         Clerk
AI:           Anthropic Claude API
Email:        Resend
Jobs:         Adzuna API, Greenhouse/Lever open boards, SerpAPI (Phase 2)
Analytics:    GA4 (landing page) + Hotjar (behavior) + Posthog (product)
Background:   Inngest (daily digest at 7am PT + job refresh every 6hrs)
Caching:      Upstash Redis (job score cache 1hr + rate limiting)
Payments:     Stripe (Phase 7+)
Deploy:       Vercel
```

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
ANTHROPIC_API_KEY
RESEND_API_KEY
RESEND_FROM_EMAIL
GA4_PROPERTY_ID
GA4_CLIENT_EMAIL
GA4_PRIVATE_KEY
```

---

## Files Already Built (attach these to the session)

| File | What it is | Goes to |
|------|-----------|---------|
| marc-lehrmann.html | Landing page | src/app/page.tsx (convert) |
| dashboard.jsx | Analytics dashboard | src/app/dashboard/page.tsx |
| living-resume.jsx | Resume optimizer | src/app/optimize/page.tsx |
| job-matcher.jsx | Job matcher | src/app/jobs/page.tsx |
| RESUMAI_PHASE1.md | Full build guide | Reference throughout |

**When converting JSX files to Next.js pages:**
1. Add `"use client"` at the top
2. Change Anthropic API calls from direct `https://api.anthropic.com/v1/messages` to internal routes `/api/rewrite` or `/api/score-jobs`
3. Add Supabase persistence calls on save/accept actions
4. Remove mock data arrays and replace with Supabase fetches

---

## 7-Phase Build Roadmap

| Phase | What ships | Status |
|-------|-----------|--------|
| 1 | Foundation — Next.js app, Supabase, Clerk, all 4 tools wired, deployed | **Build next session** |
| 2 | CRM layer — job pipeline, contact tracking, next action dates, nudges | Queued |
| 3 | Daily digest — morning email with new matches + analytics changes | Queued |
| 4 | Resume versioning — named versions, side-by-side compare, instant switch | Queued |
| 5 | Cover letter generator — pulls from active resume + matched job | Queued |
| 6 | Interview prep mode — question generation + answer scoring | Queued |
| 7 | Competitor intelligence + application success prediction | Queued |

---

## Phase 1 — Exact Build Sequence

```bash
# 1. Scaffold
npx create-next-app@latest resumai --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd resumai
npm install @supabase/supabase-js @clerk/nextjs resend lucide-react recharts @anthropic-ai/sdk

# 2. Create .env.local with all keys above

# 3. Run Supabase schema SQL in Supabase dashboard

# 4. Create file structure (see architecture above)

# 5. Wire existing JSX files as Next.js pages

# 6. Deploy
git init && git add . && git commit -m "ResumAI Phase 1"
gh repo create resumai --private && git push origin main
npx vercel --prod
```

Full step-by-step with all file contents is in RESUMAI_PHASE1.md.

---

## Resume Content (source of truth)

```
SUMMARY:
Seasoned enterprise sales leader. $25M+ career revenue. 10+ years. 
Industrial software (AVEVA SCADA/PI System/IIoT), storage, embedded tech.
Now bridging OT and AI — bringing industrial enterprise credibility to AI/data/cloud sales.

EXPERIENCE:
- AVEVA Select CA, Assistant Sales Manager, 2018–Present
  California-exclusive AVEVA distributor. SCADA, HMI, PI System, IIoT.
  Enterprise + municipal. Energy, water, manufacturing verticals.
  Complex multi-stakeholder procurement. Executive, OT, IT trust-building.

- Dexxxon Digital Storage, Key Account Manager, 2020–2021
  Flash memory + LTO-Tape brands (EMTEC, Kodak, IBM, Quantum, HP).
  Account expansion, strategic initiatives, long-term partnerships.

- Transcend Information, Channel Account Manager, 2014–2020
  Ingram Micro + Synnex partnerships. $3M annual revenue.
  30% YoY growth. 100% YoY on Apple embedded + military body cameras.
  200+ reseller/channel partner network.

SKILLS:
Enterprise Sales, Strategic Partnerships, Channel Development,
SCADA, HMI, PI System, Industrial IoT, AVEVA, OT/IT convergence,
CRM, Negotiation, Solution Selling, AI literacy,
Next.js, React, TypeScript, Supabase, Claude API, Product Development

EDUCATION: BA Economics, UC Riverside 2012
```

---

## Other Active Projects (for broader context)

Marc is building 7 apps total under two Supabase projects:

**marc-ai-apps-main (US East):**
- **ResumAI** — this project (first priority)
- **Turnip** — AI micro-investing app for teens 13–24

**marc-ai-apps-secondary (US West):**
- **StageTime** — Bandsintown-style stand-up comedy event tracker (stagetime.ai / stagetime.app)
- **ViceGrip** — Virtual wallet for adult recreational spending
- **Matrix Breaker** — Adult companion platform (stocks, DFS, dark pool data)
- **Reddit YouTube Empire** — 4-channel AI-automated YouTube pipeline (github.com/mlehr001/RedditYouTubeEmpire)
- **Sunday** — Tithing/donations sister app to ViceGrip (post-ViceGrip)

Holding company: **Spare Change Co.** (ViceGrip + Turnip + Sunday)

---

## Writing Preferences

- No bullet points in emails or prose — paragraph form only
- No em dashes (AI writing tell)
- Light proofreading when Marc provides a draft, not full rewrites
- Preserve natural voice
- Structured info with clear milestones for technical work
- Consistency over perfection mindset
