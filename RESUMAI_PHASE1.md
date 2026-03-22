# ResumAI — Phase 1 Setup Guide
## One session. Working app at the end.

---

## What Phase 1 delivers
- Next.js 14 app running locally on your ThinkPad
- Supabase database connected (resume, jobs, analytics tables)
- All three existing tools wired as real pages (landing page, dashboard, living resume, job matcher)
- Unified nav so it feels like one app
- Deployed to Vercel with your domain pointing at it
- Auth via Clerk so it's private (only you can access /dashboard, /optimize, /jobs)

---

## Step 1 — Prerequisites (do this first, ~15 mins)

Create free accounts if you don't have them:
- github.com
- vercel.com
- supabase.com
- clerk.com
- resend.com (for Phase 3 digest — free to set up now)

---

## Step 2 — Scaffold the project (~5 mins)

Open VS Code terminal on your ThinkPad and run:

```bash
npx create-next-app@latest resumai --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd resumai
npm install @supabase/supabase-js @clerk/nextjs resend lucide-react recharts
npm install @radix-ui/react-dialog @radix-ui/react-tabs
npm install inngest @upstash/redis @upstash/ratelimit
npm install posthog-js posthog-node
npm install @anthropic-ai/sdk
```

---

## Step 3 — File structure

Create this exact structure (files provided below):

```
resumai/
├── src/
│   ├── app/
│   │   ├── layout.tsx              ← root layout with Clerk + nav + Posthog
│   │   ├── page.tsx                ← redirects to /dashboard
│   │   ├── dashboard/
│   │   │   └── page.tsx            ← analytics dashboard
│   │   ├── optimize/
│   │   │   └── page.tsx            ← living resume optimizer
│   │   ├── jobs/
│   │   │   └── page.tsx            ← job matcher
│   │   └── api/
│   │       ├── rewrite/
│   │       │   └── route.ts        ← Claude rewrite endpoint
│   │       ├── score-jobs/
│   │       │   └── route.ts        ← Claude job scoring endpoint (Upstash cached)
│   │       └── inngest/
│   │           └── route.ts        ← Inngest event handler (digest + job refresh)
│   ├── components/
│   │   ├── Nav.tsx                 ← shared navigation
│   │   ├── StatCard.tsx
│   │   ├── ScoreRing.tsx
│   │   └── JobCard.tsx
│   ├── lib/
│   │   ├── supabase.ts             ← db client
│   │   ├── resume.ts               ← resume content + versioning
│   │   ├── constants.ts            ← shared types + colors
│   │   ├── inngest.ts              ← Inngest client + functions
│   │   ├── upstash.ts              ← Redis cache client
│   │   └── posthog.ts              ← analytics client
│   └── middleware.ts               ← Clerk auth guard
├── .env.local                      ← your keys (never commit this)
├── .env.example                    ← committed template
└── package.json
```

---

## Step 4 — Environment variables

Create `.env.local` in project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clerk (auth)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_key

# Resend (email)
RESEND_API_KEY=your_resend_key
RESEND_FROM_EMAIL=resumai@yourdomain.com
RESEND_TO_EMAIL=mlehr001@gmail.com

# Inngest (background jobs + digest)
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key

# Upstash Redis (caching + rate limiting)
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

# Posthog (product analytics)
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# GA4 (landing page analytics — Phase 2)
GA4_PROPERTY_ID=
GA4_CLIENT_EMAIL=
GA4_PRIVATE_KEY=

# Job APIs (Phase 2)
ADZUNA_APP_ID=
ADZUNA_APP_KEY=
SERPAPI_KEY=
```

Create `.env.example` (commit this, no real values):

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
ANTHROPIC_API_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_TO_EMAIL=
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
GA4_PROPERTY_ID=
GA4_CLIENT_EMAIL=
GA4_PRIVATE_KEY=
ADZUNA_APP_ID=
ADZUNA_APP_KEY=
SERPAPI_KEY=
```

---

## Step 5 — Supabase schema

Run this SQL in your Supabase SQL editor (Dashboard → SQL Editor → New Query):

```sql
-- Resume versions table
create table resume_versions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  version_name text not null,          -- e.g. "Databricks pitch", "Base"
  target_role text,
  summary text,
  sections jsonb not null,             -- array of {id, title, content, weight}
  score integer,
  is_active boolean default false
);

-- Jobs table
create table jobs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  external_id text,
  title text not null,
  company text not null,
  location text,
  source text,
  url text,
  tags text[],
  score integer,
  match_label text,
  reasons text[],
  red_flags text[],
  apply_urgency text,
  status text default 'New',           -- New / Saved / Applied / Phone Screen / Interview / Offer / Rejected
  notes text,
  contact_name text,
  contact_url text,
  next_action_date date,
  scored_at timestamptz
);

-- Analytics snapshots (daily pull from GA4)
create table analytics_snapshots (
  id uuid default gen_random_uuid() primary key,
  captured_at timestamptz default now(),
  total_visits integer,
  unique_visitors integer,
  calendly_clicks integer,
  avg_scroll_depth numeric,
  sections jsonb,                      -- per-section scroll/time data
  sources jsonb,
  devices jsonb,
  geo jsonb
);

-- Create indexes
create index jobs_status_idx on jobs(status);
create index jobs_score_idx on jobs(score desc);
create index resume_versions_active_idx on resume_versions(is_active);

-- Seed with your base resume version
insert into resume_versions (version_name, is_active, sections) values (
  'Base',
  true,
  '[
    {"id":"experience","title":"Experience","weight":0.5,"content":"AVEVA Select CA content here"},
    {"id":"about","title":"OT-to-AI Narrative","weight":0.25,"content":"Your narrative here"},
    {"id":"skills","title":"Core Capabilities","weight":0.15,"content":"Your skills here"},
    {"id":"contact","title":"Contact / CTA","weight":0.1,"content":"Your CTA here"}
  ]'::jsonb
);
```

---

## Step 6 — Key files to create

### `src/middleware.ts`
```typescript
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Landing page is public, everything else requires auth
  publicRoutes: ["/", "/sign-in", "/sign-up"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$)|/)", "/(api|trpc)(.*)"],
};
```

### `src/lib/supabase.ts`
```typescript
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Resume helpers
export async function getActiveResume() {
  const { data } = await supabase
    .from("resume_versions")
    .select("*")
    .eq("is_active", true)
    .single();
  return data;
}

export async function saveResumeVersion(version: any) {
  const { data } = await supabase
    .from("resume_versions")
    .insert(version)
    .select()
    .single();
  return data;
}

// Jobs helpers
export async function getJobs(status?: string) {
  let query = supabase.from("jobs").select("*").order("score", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data } = await query;
  return data || [];
}

export async function upsertJobs(jobs: any[]) {
  const { data } = await supabase
    .from("jobs")
    .upsert(jobs, { onConflict: "external_id" })
    .select();
  return data;
}

export async function updateJobStatus(id: string, status: string, notes?: string) {
  await supabase.from("jobs").update({ status, notes }).eq("id", id);
}

// Analytics helpers
export async function getLatestAnalytics() {
  const { data } = await supabase
    .from("analytics_snapshots")
    .select("*")
    .order("captured_at", { ascending: false })
    .limit(1)
    .single();
  return data;
}
```

### `src/lib/constants.ts`
```typescript
export const COLORS = {
  navy:     "#2C3E50",
  navyL:    "#34495E",
  navyDark: "#1E2C3A",
  offWhite: "#F5F5F3",
  white:    "#FFFFFF",
  border:   "#E5E2DD",
  muted:    "#888888",
  green:    "#27AE60",
  amber:    "#F39C12",
  red:      "#E74C3C",
  blue:     "#2980B9",
} as const;

export const NAV_ITEMS = [
  { label: "Dashboard",  href: "/dashboard",  icon: "📊" },
  { label: "Optimizer",  href: "/optimize",   icon: "⚡" },
  { label: "Jobs",       href: "/jobs",       icon: "🎯" },
] as const;

export const JOB_STATUSES = [
  "New", "Saved", "Applied", "Phone Screen", 
  "Interview", "Offer", "Rejected"
] as const;
```

### `src/app/api/rewrite/route.ts`
```typescript
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { section, analytics, targetRole, scoreData } = await req.json();

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [{
      role: "user",
      content: buildPrompt(section, analytics, targetRole, scoreData)
    }]
  });

  const text = message.content.find(b => b.type === "text")?.text || "";
  return NextResponse.json({ rewrite: text });
}

function buildPrompt(section: any, analytics: any, targetRole: string, scoreData: any) {
  return `You are an expert resume writer. Aggressively rewrite this section for the target role.
TARGET ROLE: ${targetRole}
SECTION: ${section.title}
CURRENT CONTENT: ${section.content}
PERFORMANCE: Score ${scoreData.score}/100. Issues: ${scoreData.issues?.join("; ")}
ANALYTICS: Calendly rate ${analytics.calendlyRate}%, avg scroll ${analytics.avgScrollDepth}%
Return ONLY the rewritten content. No preamble.`;
}
```

### `src/app/api/score-jobs/route.ts`
```typescript
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { jobs, resume, appliedJobs, starred, keywords } = await req.json();

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [{
      role: "user",
      content: `Score these jobs for this candidate. Return ONLY a JSON array.
RESUME: ${resume}
APPLIED HISTORY: ${appliedJobs}
STARRED COMPANIES: ${starred}
KEYWORDS: ${keywords}
JOBS: ${jobs.map((j: any) => `ID:${j.id} | "${j.title}" at ${j.company}`).join("\n")}
Return JSON array: [{id, score, matchLabel, reasons, redFlags, applyUrgency}]`
    }]
  });

  const text = message.content.find(b => b.type === "text")?.text || "[]";
  try {
    const clean = text.replace(/\`\`\`json|\`\`\`/g, "").trim();
    return NextResponse.json({ scores: JSON.parse(clean) });
  } catch {
    return NextResponse.json({ scores: [] });
  }
}
```

---

## Step 7 — Wire your existing JSX files

Take the three files we already built (dashboard.jsx, living-resume.jsx, job-matcher.jsx) and:

1. Rename them to `page.tsx`
2. Move them into their respective `src/app/[route]/` folders
3. Change the fetch URL from the Anthropic API directly to your internal API routes:
   - `https://api.anthropic.com/v1/messages` → `/api/rewrite` or `/api/score-jobs`
4. Add Supabase calls to persist jobs and resume versions on save

The UI code stays identical — you're just changing where the API calls go and adding persistence.

---

## Step 8 — Add the shared Nav

### `src/components/Nav.tsx`
```typescript
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { NAV_ITEMS, COLORS } from "@/lib/constants";

export default function Nav() {
  const path = usePathname();
  return (
    <nav style={{ background: COLORS.navyDark, height: 56, display: "flex", 
      alignItems: "center", justifyContent: "space-between", padding: "0 32px",
      borderBottom: "2px solid rgba(255,255,255,0.1)", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <Link href="/dashboard" style={{ fontWeight: 800, fontSize: 15, color: "#fff", 
          textDecoration: "none", letterSpacing: "-0.01em" }}>
          ResumAI
        </Link>
        <div style={{ display: "flex", gap: 4 }}>
          {NAV_ITEMS.map(item => (
            <Link key={item.href} href={item.href} style={{
              padding: "6px 14px", fontSize: 12, fontWeight: 700,
              letterSpacing: "0.06em", textTransform: "uppercase",
              color: path.startsWith(item.href) ? "#fff" : "rgba(255,255,255,0.45)",
              textDecoration: "none",
              borderBottom: path.startsWith(item.href) ? "2px solid #fff" : "2px solid transparent",
              transition: "all 0.15s"
            }}>
              {item.icon} {item.label}
            </Link>
          ))}
        </div>
      </div>
      <UserButton afterSignOutUrl="/" />
    </nav>
  );
}
```

### `src/app/layout.tsx`
```typescript
import { ClerkProvider } from "@clerk/nextjs";
import Nav from "@/components/Nav";
import { PosthogProvider } from "@/lib/posthog";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <PosthogProvider>
            <Nav />
            <main>{children}</main>
          </PosthogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

---

## Step 9 — Wire up Inngest

Inngest handles all background jobs — the daily digest, scheduled job refreshes, and anything else that shouldn't block the UI. Free tier is more than enough for personal use.

**Create account:** inngest.com → grab your Event Key and Signing Key → add to .env.local

### `src/lib/inngest.ts`
```typescript
import { Inngest } from "inngest";
import { Resend } from "resend";
import { supabase } from "./supabase";

export const inngest = new Inngest({ id: "resumai" });

const resend = new Resend(process.env.RESEND_API_KEY);

// ── DAILY DIGEST ──────────────────────────────────────────────────
// Fires every morning at 7am PT. Sends you a summary of:
// - New strong job matches since yesterday
// - Landing page analytics changes
// - Any jobs with overdue next action dates
export const dailyDigest = inngest.createFunction(
  { id: "daily-digest", name: "Daily Job Search Digest" },
  { cron: "0 14 * * *" }, // 7am PT = 14:00 UTC
  async ({ step }) => {

    const jobs = await step.run("fetch-new-jobs", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const { data } = await supabase
        .from("jobs")
        .select("*")
        .gte("created_at", yesterday.toISOString())
        .gte("score", 70)
        .order("score", { ascending: false })
        .limit(5);
      return data || [];
    });

    const overdueJobs = await step.run("fetch-overdue", async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("jobs")
        .select("*")
        .lte("next_action_date", today)
        .not("status", "in", '("Offer","Rejected")')
        .order("next_action_date", { ascending: true });
      return data || [];
    });

    const analytics = await step.run("fetch-analytics", async () => {
      const { data } = await supabase
        .from("analytics_snapshots")
        .select("*")
        .order("captured_at", { ascending: false })
        .limit(2);
      return data || [];
    });

    await step.run("send-email", async () => {
      const strongMatches  = jobs.filter(j => j.score >= 85);
      const goodMatches    = jobs.filter(j => j.score >= 70 && j.score < 85);
      const latestAnalytics = analytics[0];
      const prevAnalytics  = analytics[1];

      const visitDelta = latestAnalytics && prevAnalytics
        ? latestAnalytics.unique_visitors - prevAnalytics.unique_visitors
        : 0;

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: process.env.RESEND_TO_EMAIL!,
        subject: `ResumAI Digest — ${strongMatches.length} strong matches, ${overdueJobs.length} follow-ups due`,
        html: buildDigestEmail({ strongMatches, goodMatches, overdueJobs, latestAnalytics, visitDelta }),
      });
    });

    return { jobsFound: jobs.length, overdueCount: overdueJobs.length };
  }
);

// ── JOB REFRESH ───────────────────────────────────────────────────
// Fires every 6 hours. Re-scores any jobs added in the last 24 hrs
// that don't have a score yet. Queued for Phase 2 when real APIs connect.
export const refreshJobs = inngest.createFunction(
  { id: "refresh-jobs", name: "Refresh Job Scores" },
  { cron: "0 */6 * * *" },
  async ({ step }) => {
    // Phase 2: fetch from Adzuna + Greenhouse, score via Claude, upsert to Supabase
    return { status: "ready for Phase 2" };
  }
);

// ── EMAIL TEMPLATE ─────────────────────────────────────────────────
function buildDigestEmail({ strongMatches, goodMatches, overdueJobs, latestAnalytics, visitDelta }: any) {
  const navy = "#2C3E50";
  const green = "#27AE60";
  const amber = "#F39C12";

  return `
    <div style="font-family:'Open Sans',Arial,sans-serif;max-width:600px;margin:0 auto;background:#F5F5F3;">
      <div style="background:${navy};padding:24px 32px;">
        <h1 style="color:#fff;margin:0;font-size:20px;font-weight:800;letter-spacing:-0.01em;">ResumAI</h1>
        <p style="color:rgba(255,255,255,0.5);margin:4px 0 0;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Daily Digest — ${new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</p>
      </div>

      ${latestAnalytics ? `
      <div style="background:#fff;padding:24px 32px;border-bottom:1px solid #E5E2DD;">
        <h2 style="color:${navy};font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 16px;">Landing Page</h2>
        <div style="display:flex;gap:24px;">
          <div><div style="font-size:28px;font-weight:700;color:${navy};">${latestAnalytics.unique_visitors}</div><div style="font-size:11px;color:#888;text-transform:uppercase;">Unique Visitors</div></div>
          <div><div style="font-size:28px;font-weight:700;color:${visitDelta >= 0 ? green : "#E74C3C"};">${visitDelta >= 0 ? "+" : ""}${visitDelta}</div><div style="font-size:11px;color:#888;text-transform:uppercase;">vs Yesterday</div></div>
          <div><div style="font-size:28px;font-weight:700;color:${navy};">${latestAnalytics.calendly_clicks || 0}</div><div style="font-size:11px;color:#888;text-transform:uppercase;">Calendly Clicks</div></div>
        </div>
      </div>` : ""}

      ${strongMatches.length > 0 ? `
      <div style="background:#fff;padding:24px 32px;border-bottom:1px solid #E5E2DD;margin-top:2px;">
        <h2 style="color:${green};font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 16px;">⚡ ${strongMatches.length} Strong Match${strongMatches.length > 1 ? "es" : ""} Today</h2>
        ${strongMatches.map((j: any) => `
          <div style="padding:12px 0;border-bottom:1px solid #E5E2DD;">
            <div style="font-weight:700;color:${navy};font-size:14px;">${j.title}</div>
            <div style="color:#888;font-size:12px;margin-top:3px;">${j.company} · ${j.location} · Score: <strong style="color:${green};">${j.score}</strong></div>
            ${j.url ? `<a href="${j.url}" style="display:inline-block;margin-top:8px;background:${navy};color:#fff;font-size:11px;font-weight:700;padding:6px 14px;text-decoration:none;text-transform:uppercase;letter-spacing:0.06em;">Apply →</a>` : ""}
          </div>
        `).join("")}
      </div>` : ""}

      ${goodMatches.length > 0 ? `
      <div style="background:#fff;padding:24px 32px;border-bottom:1px solid #E5E2DD;margin-top:2px;">
        <h2 style="color:${navy};font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 16px;">👍 ${goodMatches.length} Good Match${goodMatches.length > 1 ? "es" : ""}</h2>
        ${goodMatches.map((j: any) => `
          <div style="padding:10px 0;border-bottom:1px solid #E5E2DD;">
            <span style="font-weight:700;color:${navy};">${j.title}</span>
            <span style="color:#888;font-size:12px;"> — ${j.company} (${j.score})</span>
          </div>
        `).join("")}
      </div>` : ""}

      ${overdueJobs.length > 0 ? `
      <div style="background:#fff;padding:24px 32px;margin-top:2px;">
        <h2 style="color:${amber};font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 16px;">⚠ ${overdueJobs.length} Follow-Up${overdueJobs.length > 1 ? "s" : ""} Due</h2>
        ${overdueJobs.map((j: any) => `
          <div style="padding:10px 0;border-bottom:1px solid #E5E2DD;">
            <span style="font-weight:700;color:${navy};">${j.title}</span>
            <span style="color:#888;font-size:12px;"> — ${j.company} · ${j.status} · Due ${j.next_action_date}</span>
          </div>
        `).join("")}
      </div>` : ""}

      <div style="padding:20px 32px;text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com"}/dashboard" style="background:${navy};color:#fff;font-size:12px;font-weight:700;padding:12px 24px;text-decoration:none;text-transform:uppercase;letter-spacing:0.08em;">Open ResumAI →</a>
      </div>
    </div>
  `;
}
```

### `src/app/api/inngest/route.ts`
```typescript
import { serve } from "inngest/next";
import { inngest, dailyDigest, refreshJobs } from "@/lib/inngest";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [dailyDigest, refreshJobs],
});
```

**To test the digest locally:**
```bash
npx inngest-cli@latest dev
# In another terminal:
npx inngest-cli@latest send --event "inngest/scheduled.timer" --data '{}'
```

---

## Step 10 — Wire up Upstash Redis

Upstash caches job scoring results so Claude isn't called twice for the same batch of jobs within an hour. Also rate-limits the rewrite endpoint so you can't accidentally hammer the API.

**Create account:** upstash.com → Create Database → REST API → grab URL and Token → add to .env.local

### `src/lib/upstash.ts`
```typescript
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Rate limit: 10 rewrite requests per minute
export const rewriteRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "resumai:rewrite",
});

// Rate limit: 3 full job score runs per hour
export const scoringRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  analytics: true,
  prefix: "resumai:scoring",
});

// Cache helpers
export async function getCachedScores(cacheKey: string) {
  return redis.get<any[]>(cacheKey);
}

export async function setCachedScores(cacheKey: string, scores: any[]) {
  // Cache for 1 hour
  await redis.setex(cacheKey, 3600, JSON.stringify(scores));
}
```

**Update `src/app/api/score-jobs/route.ts` to use cache:**
```typescript
import { scoringRatelimit, getCachedScores, setCachedScores } from "@/lib/upstash";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  // Rate limit check
  const { success } = await scoringRatelimit.limit("user");
  if (!success) {
    return NextResponse.json({ error: "Rate limit reached. Try again in an hour." }, { status: 429 });
  }

  const { jobs, resume, appliedJobs, starred, keywords } = await req.json();

  // Cache key based on job IDs + keywords
  const cacheKey = `scores:${jobs.map((j: any) => j.id).join("-")}:${keywords}`;
  const cached = await getCachedScores(cacheKey);
  if (cached) return NextResponse.json({ scores: cached, cached: true });

  // Score with Claude
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [{
      role: "user",
      content: `Score these jobs. Return ONLY JSON array.
RESUME: ${resume}
APPLIED: ${appliedJobs}
STARRED: ${starred}
KEYWORDS: ${keywords}
JOBS: ${jobs.map((j: any) => `ID:${j.id} | "${j.title}" at ${j.company}`).join("\n")}
Return: [{id, score, matchLabel, reasons, redFlags, applyUrgency}]`
    }]
  });

  const text = message.content.find(b => b.type === "text")?.text || "[]";
  const clean = text.replace(/```json|```/g, "").trim();
  const scores = JSON.parse(clean);

  await setCachedScores(cacheKey, scores);
  return NextResponse.json({ scores, cached: false });
}
```

---

## Step 11 — Wire up Posthog

Posthog tracks how you actually use the app — which features get used, where you drop off, which jobs you apply to. This becomes critical data when you productize.

**Create account:** posthog.com → Create Project → grab API key → add to .env.local

### `src/lib/posthog.ts`
```typescript
"use client";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect } from "react";

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: true,
    capture_pageleave: true,
  });
}

export function PosthogProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

// Track key events throughout the app
export const track = {
  jobScored:        (count: number) => posthog.capture("jobs_scored",         { count }),
  rewriteRan:       (section: string, targetRole: string) => posthog.capture("rewrite_ran", { section, targetRole }),
  rewriteAccepted:  (section: string) => posthog.capture("rewrite_accepted",  { section }),
  jobApplied:       (company: string, score: number) => posthog.capture("job_applied",   { company, score }),
  jobSaved:         (company: string) => posthog.capture("job_saved",         { company }),
  digestOpened:     () => posthog.capture("digest_opened"),
};
```

Add `track.*` calls to your page components wherever a meaningful action happens — applying to a job, accepting a rewrite, running the scorer. Posthog captures it automatically.

---

```bash
# Push to GitHub first
git init
git add .
git commit -m "ResumAI Phase 1"
gh repo create resumai --private
git push origin main

# Deploy
npx vercel --prod
```

Then in Vercel dashboard:
1. Settings → Environment Variables → add ALL your .env.local values
2. Settings → Domains → add your custom domain
3. Redeploy

**Sync Inngest to production:**
After deploy, go to inngest.com → Apps → Add App → paste your Vercel URL + `/api/inngest`. Inngest will auto-discover your functions and start running the daily digest at 7am PT.

---

## Phase 1 done. What you have:

| Tool | URL | Access |
|------|-----|--------|
| Landing Page | yourdomain.com | Public |
| Analytics Dashboard | yourdomain.com/dashboard | Auth required |
| Resume Optimizer | yourdomain.com/optimize | Auth required |
| Job Matcher | yourdomain.com/jobs | Auth required |
| Daily Digest | Hits your email at 7am PT | Auto via Inngest |

**Full stack running:**

| Service | Purpose | Cost |
|---------|---------|------|
| Vercel | Hosting + deploys | Free |
| Supabase | Database | Free |
| Clerk | Auth | Free |
| Inngest | Background jobs + digest | Free |
| Upstash | Caching + rate limiting | Free |
| Posthog | Product analytics | Free |
| Resend | Email | Free |
| Anthropic | Claude API | Pay per use |

---

## Phase 2 preview (next session): CRM Layer
Adding status tracking, contact names, next action dates, and nudge system on top of the jobs table. Inngest already wired — Phase 2 just adds the overdue nudge function and the CRM UI on top of what's already there.

