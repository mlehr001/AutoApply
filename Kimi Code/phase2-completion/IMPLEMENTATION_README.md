# Phase 2 Completion — Implementation Guide

This folder contains all the code needed to complete ResumAI Phase 2:
- Cover Letter Generation UI
- Role Brief Integration
- Interview Pipeline (Opportunities → Interview → Prep)

---

## Files Overview

| File | Destination | Action |
|------|-------------|--------|
| `src/components/CoverLetterModal.tsx` | `src/components/CoverLetterModal.tsx` | Copy (new file) |
| `src/components/RoleBriefPanel.tsx` | `src/components/RoleBriefPanel.tsx` | Copy (new file) |
| `src/components/ScheduleInterviewModal.tsx` | `src/components/ScheduleInterviewModal.tsx` | Copy (new file) |
| `src/app/api/interview-schedule/route.ts` | `src/app/api/interview-schedule/route.ts` | Copy (new file) |
| `src/app/interview/page.tsx` | `src/app/interview/page.tsx` | Replace existing |
| `src/app/opportunities/page-integration.tsx` | Reference only | Merge into existing |
| `src/lib/posthog-tracking-additions.tsx` | Reference only | Merge into existing |
| `supabase-schema-additions.sql` | Supabase SQL Editor | Run manually |

---

## Step-by-Step Implementation

### Step 1: Database Setup
1. Go to Supabase Dashboard → SQL Editor
2. Run the contents of `supabase-schema-additions.sql`
3. This creates `interviews` and `cover_letters` tables

### Step 2: Copy New Components
Copy these files to your project:
```bash
cp phase2-completion/src/components/CoverLetterModal.tsx src/components/
cp phase2-completion/src/components/RoleBriefPanel.tsx src/components/
cp phase2-completion/src/components/ScheduleInterviewModal.tsx src/components/
cp phase2-completion/src/app/api/interview-schedule/route.ts src/app/api/interview-schedule/
```

### Step 3: Update Tracking (posthog.tsx)
Add these functions to your existing `src/lib/posthog.tsx`:

```typescript
coverLetterGenerated: (company: string, jobTitle: string, tone: string) =>
  posthog.capture("cover_letter_generated", { company, jobTitle, tone }),

coverLetterSaved: (company: string, jobTitle: string) =>
  posthog.capture("cover_letter_saved", { company, jobTitle }),

roleBriefGenerated: (company: string, jobTitle: string) =>
  posthog.capture("role_brief_generated", { company, jobTitle }),

interviewScheduled: (company: string, jobTitle: string, interviewType: string) =>
  posthog.capture("interview_scheduled", { company, jobTitle, interviewType }),

prepBriefGenerated: (company: string, jobTitle: string) =>
  posthog.capture("prep_brief_generated", { company, jobTitle }),
```

### Step 4: Update Opportunities Page
In `src/app/opportunities/page.tsx`:

1. **Add imports:**
```typescript
import { FileText, Briefcase, Calendar } from "lucide-react";
import CoverLetterModal from "@/components/CoverLetterModal";
import RoleBriefPanel from "@/components/RoleBriefPanel";
import ScheduleInterviewModal from "@/components/ScheduleInterviewModal";
```

2. **Add state hooks** (inside component):
```typescript
const [coverLetterJob, setCoverLetterJob] = useState<Job | null>(null);
const [roleBriefJob, setRoleBriefJob] = useState<Job | null>(null);
const [scheduleJob, setScheduleJob] = useState<Job | null>(null);
```

3. **Add action buttons** to each job card (inside your job mapping):
```typescript
<div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
  <button
    onClick={() => setCoverLetterJob(job)}
    style={{ padding: "8px 12px", backgroundColor: "#FFFFFF", border: "1px solid #2C3E50", color: "#2C3E50", fontFamily: "var(--font-raleway)", fontWeight: 600, fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
  >
    <FileText size={14} />
    Cover Letter
  </button>

  <button
    onClick={() => setRoleBriefJob(job)}
    style={{ padding: "8px 12px", backgroundColor: "#FFFFFF", border: "1px solid #2980B9", color: "#2980B9", fontFamily: "var(--font-raleway)", fontWeight: 600, fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
  >
    <Briefcase size={14} />
    Role Brief
  </button>

  <button
    onClick={() => setScheduleJob(job)}
    style={{ padding: "8px 12px", backgroundColor: "#27AE60", border: "none", color: "#FFFFFF", fontFamily: "var(--font-raleway)", fontWeight: 600, fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
  >
    <Calendar size={14} />
    Schedule
  </button>
</div>
```

4. **Add modals** at bottom of return statement:
```typescript
<CoverLetterModal
  isOpen={!!coverLetterJob}
  onClose={() => setCoverLetterJob(null)}
  job={coverLetterJob}
/>

<RoleBriefPanel
  isOpen={!!roleBriefJob}
  onClose={() => setRoleBriefJob(null)}
  job={roleBriefJob}
/>

<ScheduleInterviewModal
  isOpen={!!scheduleJob}
  onClose={() => setScheduleJob(null)}
  onScheduled={() => {
    // Optionally refresh or show toast
  }}
  job={scheduleJob}
/>
```

### Step 5: Replace Interview Page
```bash
cp phase2-completion/src/app/interview/page.tsx src/app/interview/page.tsx
```

---

## What Each Feature Does

### Cover Letter Modal
- Opens from any job card in Opportunities
- Choose tone: Confident-Direct, Warm-Professional, or Aggressive-Closer
- Claude generates 3-paragraph cover letter (max 250 words)
- Copy to clipboard or save to Supabase
- Tracks generation and saves in `cover_letters` table

### Role Brief Panel
- Slide-out panel from right side
- Two views: Snapshot (cards) and Full (raw text)
- Claude generates:
  - Company Snapshot
  - Why Marc Fits (3 reasons)
  - Potential Objections + counters
  - Key Talking Points
  - Smart Questions to Ask

### Interview Pipeline
- Schedule interviews from Opportunities or directly
- Types: Phone Screen, Hiring Manager, Panel, Technical, Final
- Auto-generates prep briefs with Claude
- Status workflow: Upcoming → Active → Past
- Tracks all interviews in Supabase

---

## Testing Checklist

- [ ] Run SQL schema in Supabase
- [ ] Copy all files to correct locations
- [ ] Add tracking functions to posthog.tsx
- [ ] Merge integration code into opportunities/page.tsx
- [ ] `npm run dev` — check for TypeScript errors
- [ ] Test cover letter generation
- [ ] Test role brief panel
- [ ] Test scheduling interview from Opportunities
- [ ] Test interview status changes
- [ ] Test prep brief generation
- [ ] Commit and push

---

## Post-Implementation: What's Next?

Phase 2 will be **complete** after this. Remaining items for Phase 3:
- Daily digest emails (Inngest + Resend)
- Job auto-ingestion from Adzuna/Greenhouse
- Resume versioning with side-by-side compare
