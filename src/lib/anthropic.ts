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

function buildSectionTypeRules(sectionId: string, roleTitle: string, roleContext: string, roleTraits: string[]): string {
  const traitList = roleTraits.slice(0, 4).join(", ");
  switch (sectionId) {
    case "experience":
      return `SECTION TYPE: Experience
- Max 3 bullets per role. Lead every bullet with the biggest revenue, scale, or impact number available.
- Sequence bullets within each role: (1) biggest commercial outcome, (2) complexity or strategic action, (3) domain or relationship proof
- Select and order roles so the most ${roleTitle}-relevant experience appears first
- Surface the specifics that most directly map to: ${traitList}
- Cut or compress roles and bullets that do not serve the target role`;

    case "about":
      return `SECTION TYPE: Narrative / Positioning Statement
- Write directly to a hiring manager recruiting for ${roleTitle} at ${roleContext}
- Under 170 words. Every sentence earns its place or gets cut.
- Structure: (1) what Marc has done at scale, (2) what makes him distinctive for this specific role, (3) what he is ready to do next — name the role type explicitly
- Do not write a general career summary. Write a targeted positioning statement.
- The traits ${traitList} should be evident without naming them literally`;

    case "skills":
      return `SECTION TYPE: Skills / Capabilities
- Keep only skills that directly serve at least one of these traits: ${traitList}
- Cut any skill not relevant to ${roleTitle}
- Lead each category with the highest-signal skill for this role
- Rename or reframe category headers if a sharper label better fits the target role
- No padding — if a skill doesn't belong, remove it entirely`;

    case "contact":
      return `SECTION TYPE: Call to Action
- Name ${roleTitle} specifically — not a generic role category
- Reference ${roleContext} if a company was provided
- One sentence pitch: what Marc brings + what he is looking for. Direct and concrete.
- End with a clear action (call, conversation, demo of work — whatever fits)
- Under 60 words`;

    default:
      return `SECTION TYPE: General
- Rewrite to directly serve the target role: ${roleTitle}
- Lead with outcomes and scale
- Cut anything that does not advance the candidate's case for this specific role`;
  }
}

export function buildRewritePrompt(
  section: { id: string; title: string; content: string },
  roleTitle: string,
  roleContext: string,
  roleTraits: string[],
  roleReasoning: string,
  scoreData: { score: number; issues?: string[] },
  analytics: { calendlyRate: number; avgScrollDepth: number },
  allSections?: Array<{ id: string; title: string; content: string }>
): string {
  const otherSections = (allSections ?? []).filter(s => s.id !== section.id);
  const resumeContext = otherSections.length > 0
    ? `\nFULL RESUME CONTEXT (other sections — use for coherence, do not repeat their claims):\n` +
      otherSections.map(s => {
        const snippet = s.content.length > 300 ? s.content.slice(0, 300) + "…" : s.content;
        return `[${s.title}]\n${snippet}`;
      }).join("\n\n")
    : "";

  const sectionRules = buildSectionTypeRules(section.id, roleTitle, roleContext, roleTraits);

  return `You are a precision resume writer for enterprise tech sales. Your output goes directly into a resume targeting a specific role. Generic output fails. Role-specific, factually grounded output wins.

CANDIDATE: Marc Lehrmann
- 10+ years enterprise tech sales, $25M+ career revenue
- Background: AVEVA (SCADA/HMI/PI System/IIoT), Transcend Information, Dexxxon Digital Storage, Advantech USA, Radeus Labs
- Positioning: "OT to AI bridge" — industrial enterprise credibility meets AI/data platform fluency
- Building 7 apps actively (Next.js, Supabase, Claude API)

TARGET ROLE: ${roleTitle}
ROLE CONTEXT: ${roleContext}
WHY MARC FITS: ${roleReasoning}

TARGETING LENS — these traits define what to emphasize and what to cut:
${roleTraits.map((t, i) => `${i + 1}. ${t}`).join("\n")}
Every claim in the rewrite must serve at least one of these traits. Anything that does not serve this role gets cut or compressed.
${resumeContext}
SECTION TO REWRITE: ${section.title}
CURRENT CONTENT:
${section.content}

PERFORMANCE DATA:
- Score: ${scoreData.score}/100
- Issues: ${scoreData.issues?.join("; ") || "none flagged"}
- Scroll reach: ${analytics.avgScrollDepth}%

${sectionRules}

STYLE RULES — apply to every line:
- Open bullets with a strong verb: closed, built, drove, grew, owned, converted, negotiated, launched, structured, scaled
- Lead with result or scale before explaining activity
- One idea per bullet — no compound bullets joined with "and"
- Preserve every specific number, company name, product name, and date exactly as given
- Cut these phrases entirely: "responsible for", "helped with", "worked on", "experienced in", "results-driven", "team player", "proven track record", "passionate about", "dynamic", "synergy", "leverage"
- If a detail does not serve the target role traits, remove it

GUARDRAILS — never break these:
- No invented metrics, companies, titles, or dates
- Every claim must be traceable to the original content
- Do not add roles or experiences that do not exist in the source

Return ONLY the rewritten section text.
No preamble. No labels. No explanation.`;
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
