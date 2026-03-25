import "server-only";
import Anthropic from "@anthropic-ai/sdk";

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("Missing ANTHROPIC_API_KEY environment variable");
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Primary model for all ResumAI features
export const MODEL = process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-6";

// ─── SHARED PROMPT BUILDERS ───────────────────────────────────────────────────
export function buildRewritePrompt(
  section: { title: string; content: string },
  roleTitle: string,
  roleContext: string,
  roleTraits: string[],
  roleReasoning: string,
  scoreData: { score: number; issues?: string[] },
  analytics: { calendlyRate: number; avgScrollDepth: number }
): string {
  return `You are a senior resume writer specializing in enterprise tech sales career positioning.
Your job is to rewrite one resume section so it reads like it was written specifically
for this role — not adapted from a generic resume.

CANDIDATE: Marc Lehrmann
- 10+ years enterprise tech sales, $25M+ career revenue
- Background: AVEVA (SCADA/HMI/PI System/IIoT), Transcend Information, Dexxxon Digital Storage, Advantech USA, Radeus Labs
- Positioning: "OT to AI bridge" — industrial enterprise credibility meets AI/data platform fluency
- Building 7 apps actively (Next.js, Supabase, Claude API)

TARGET ROLE: ${roleTitle}
COMPANY/CONTEXT: ${roleContext}
WHY MARC FITS: ${roleReasoning}
KEY TRAITS NEEDED: ${roleTraits.join(", ")}

SECTION TO REWRITE: ${section.title}
CURRENT CONTENT:
${section.content}

PERFORMANCE DATA:
- Score: ${scoreData.score}/100
- Issues: ${scoreData.issues?.join("; ") || "none flagged"}
- Scroll reach: ${analytics.avgScrollDepth}%

REWRITE RULES:
1. Every bullet must open with an outcome, not an activity
2. Reference at least 2 of the key traits naturally in the content
3. For Experience: max 3 bullets per role, lead with biggest revenue/impact number
4. For Narrative: write as if speaking directly to a hiring manager at ${roleContext}. Under 180 words.
5. For Skills: only include skills that map to the key traits list. Cut everything else.
6. For CTA: name the role title and company specifically.
7. Confident, direct tone. No hedging. No "I am passionate about" language.

GUARDRAILS — never break these:
- No invented metrics, companies, or titles
- Preserve all dates exactly as given
- Every claim must be traceable to the original content
- Do not add roles or experiences that don't exist

Return ONLY the rewritten section text.
No preamble, no labels, no explanation.`;
}

export function buildScoringPrompt(
  jobs: { id: string | number; title: string; company: string }[],
  resume: string,
  appliedJobs: string,
  starred: string,
  keywords: string
): string {
  return `Score these job listings for this candidate. Return ONLY a valid JSON array — no markdown, no explanation.

CANDIDATE RESUME:
${resume}

APPLIED HISTORY: ${appliedJobs}
STARRED COMPANIES: ${starred}
TARGET KEYWORDS: ${keywords}

JOBS TO SCORE:
${jobs.map((j) => `ID:${j.id} | "${j.title}" at ${j.company}`).join("\n")}

Return format: [{"id":"...","score":0-100,"matchLabel":"Strong Match|Good Match|Weak Match","reasons":["..."],"redFlags":["..."],"applyUrgency":"Apply Now|Apply Soon|Low Priority"}]`;
}
