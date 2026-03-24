import Anthropic from "@anthropic-ai/sdk";

// Server-only — import exclusively in API route handlers and server functions.
// Never import from Client Components.
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Primary model for all ResumAI features
export const MODEL = "claude-sonnet-4-6";

// ─── SHARED PROMPT BUILDERS ───────────────────────────────────────────────────
export function buildRewritePrompt(
  section: { title: string; content: string },
  targetRole: string,
  scoreData: { score: number; issues?: string[] },
  analytics: { calendlyRate: number; avgScrollDepth: number }
): string {
  return `You are an expert resume writer specializing in enterprise tech sales and career pivots.
Aggressively rewrite the section below to maximize relevance for the target role.

TARGET ROLE: ${targetRole}
SECTION: ${section.title}
CURRENT CONTENT:
${section.content}

PERFORMANCE DATA:
- Current score: ${scoreData.score}/100
- Known issues: ${scoreData.issues?.join("; ") || "none flagged"}
- Landing page Calendly conversion: ${analytics.calendlyRate}%
- Avg scroll depth to this section: ${analytics.avgScrollDepth}%

RULES:
- Preserve all factual claims — do not invent numbers or titles
- Lead with the most relevant achievement for this role type
- Use active, specific language — no buzzword filler
- Keep the same general length as the original
- Return ONLY the rewritten content. No preamble, no labels, no explanation.`;
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
