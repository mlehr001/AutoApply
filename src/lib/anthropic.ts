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

function inferRoleType(roleTitle: string): string {
  const t = roleTitle.toLowerCase();
  if (/\b(vp|vice president|director|head of|cro)\b/.test(t)) return "executive sales leader";
  if (/\b(ai|artificial intelligence|ml|machine learning|data platform|llm|genai)\b/.test(t)) return "AI/data platform sales";
  if (/\b(ot|iiot|industrial|scada|automation|manufacturing|plant|operations)\b/.test(t)) return "industrial/OT sales";
  if (/\b(partner|channel|alliances|reseller|ecosystem)\b/.test(t)) return "channel/partner sales";
  if (/\b(technical|solutions|pre.?sales|se|systems engineer)\b/.test(t)) return "technical/solutions sales";
  return "enterprise tech sales";
}

function buildSectionTypeRules(sectionId: string, roleTitle: string, roleContext: string, roleTraits: string[], roleType: string): string {
  const topTraits = roleTraits.slice(0, 4).join(", ");
  switch (sectionId) {
    case "experience":
      return `SECTION TYPE: Experience
- Max 3 bullets per role. Every bullet must make at least one of these traits visible through evidence: ${topTraits}
- Sequence bullets within each role: (1) biggest commercial outcome with a number, (2) the strategic action or complexity that produced it, (3) domain or relationship proof specific to ${roleType}
- Order roles so the most ${roleTitle}-relevant experience appears first — but preserve all roles that carry proof of domain credibility or scale, even if only partially on-trait
- Compress rather than delete: a bullet with partial relevance can be tightened to one clause and kept as context proof
- Surface specifics — product names, deal sizes, account names, cycle lengths — that are invisible in a generic resume but highly legible to a ${roleType} hiring manager`;

    case "about":
      return `SECTION TYPE: Narrative / Positioning Statement
- Write directly to a hiring manager recruiting for ${roleTitle}${roleContext ? ` at ${roleContext}` : ""}
- Under 170 words. Every sentence earns its place by advancing Marc's case for this specific role.
- Structure: (1) what Marc has done at scale in terms a ${roleType} hiring manager cares about, (2) what makes him specifically credible for ${roleTitle} — not generally credible, specifically credible, (3) what he is ready to do next, naming the role type explicitly
- Tone for ${roleType}: ${
  roleType === "executive sales leader" ? "executive register — strategic, revenue-framed, org-level" :
  roleType === "AI/data platform sales" ? "technically literate but commercially focused — fluent in data stack, ROI-driven" :
  roleType === "industrial/OT sales" ? "domain-deep — show operational credibility, not just familiarity" :
  roleType === "channel/partner sales" ? "ecosystem-aware — show leverage through partners, not just direct motion" :
  roleType === "technical/solutions sales" ? "credibility-first — technical depth earns the commercial outcome" :
  "confident, commercially grounded, outcome-first"
}
- The traits ${topTraits} should be evident through example and word choice, not stated directly`;

    case "skills":
      return `SECTION TYPE: Skills / Capabilities
- Keep skills that directly serve at least one of these traits: ${topTraits}
- Elevate skills that a ${roleType} hiring manager would screen for specifically — these should lead each category
- Rename or reframe category headers if a sharper label better signals relevance to ${roleTitle}
- Compress low-relevance categories to a single line rather than deleting them if they provide cross-domain credibility
- No padding — a skill that adds nothing for this role gets removed or absorbed into a higher-signal category`;

    case "contact":
      return `SECTION TYPE: Call to Action
- Name ${roleTitle} explicitly — not a generic category like "sales leadership" or "enterprise roles"
- ${roleContext ? `Reference ${roleContext} specifically if it raises the relevance signal` : "Reference the company or sector if provided"}
- One tight pitch: what Marc brings that is specific to this role + what he wants next. Direct and concrete.
- End with a clear action (call, conversation, demo of work — whatever fits the role type)
- Under 60 words`;

    default:
      return `SECTION TYPE: General
- Rewrite every line to serve the target role: ${roleTitle}
- Lead with outcomes and scale; compress setup and activity
- Preserve domain-specific details even if they require a beat of context — specificity beats brevity for a ${roleType} reader`;
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
  const roleType = inferRoleType(roleTitle);

  const otherSections = (allSections ?? []).filter(s => s.id !== section.id);
  const resumeContext = otherSections.length > 0
    ? `\nFULL RESUME CONTEXT (other sections — read for coherence and do not repeat their exact claims, but use them to understand what is already established):\n` +
      otherSections.map(s => {
        const snippet = s.content.length > 500 ? s.content.slice(0, 500) + "…" : s.content;
        return `[${s.title}]\n${snippet}`;
      }).join("\n\n")
    : "";

  const issueDirective = scoreData.issues && scoreData.issues.length > 0
    ? `The current draft scores ${scoreData.score}/100. The rewrite must directly fix: ${scoreData.issues.join("; ")}.`
    : `The current draft scores ${scoreData.score}/100. Raise the score by sharpening role-specificity and leading with outcomes.`;

  const sectionRules = buildSectionTypeRules(section.id, roleTitle, roleContext, roleTraits, roleType);

  return `You are a precision resume writer specializing in ${roleType}. Your output goes directly into a resume. Generic output fails — a hiring manager for ${roleTitle} will immediately recognize when a resume was written for a different role. Your job is to make every sentence feel like it was written specifically for this role.

CANDIDATE: Marc Lehrmann
- 10+ years enterprise tech sales, $25M+ career revenue
- Background: AVEVA (SCADA/HMI/PI System/IIoT), Transcend Information, Dexxxon Digital Storage, Advantech USA, Radeus Labs
- Positioning: "OT to AI bridge" — industrial enterprise credibility meets AI/data platform fluency
- Building 7 apps actively (Next.js, Supabase, Claude API)

TARGET ROLE: ${roleTitle}
ROLE CONTEXT: ${roleContext || "not specified"}
ROLE TYPE: ${roleType}

WHY MARC FITS THIS ROLE SPECIFICALLY:
${roleReasoning}
Use this reasoning to calibrate which aspects of Marc's background to foreground. The traits and experiences that make him a strong fit for this role should dominate. Other material gets compressed.

TARGETING LENS — these traits are what this hiring manager is screening for:
${roleTraits.map((t, i) => `${i + 1}. ${t}`).join("\n")}
Every sentence in the rewrite must make at least one of these traits visible through evidence or word choice. If a line does not advance Marc's case against these traits, cut or compress it.
${resumeContext}
SECTION TO REWRITE: ${section.title}
CURRENT CONTENT:
${section.content}

PERFORMANCE DIRECTIVE:
${issueDirective}
Scroll reach: ${analytics.avgScrollDepth}% — if this is low, the opening lines are weak. Fix the hook.

${sectionRules}

STYLE RULES — apply to every line:
- Open bullets with a strong verb suited to ${roleType}: closed, built, drove, grew, owned, converted, negotiated, launched, structured, scaled, deployed, architected, expanded, accelerated
- Lead with result or scale before explaining the activity that produced it
- One idea per bullet — no compound bullets joined with "and"
- Preserve every specific number, company name, product name, and date exactly as given — these are the signals a ${roleType} reader actually reads
- Cut these phrases entirely: "responsible for", "helped with", "worked on", "experienced in", "results-driven", "team player", "proven track record", "passionate about", "dynamic", "synergy", "leverage"

GUARDRAILS — never break these:
- No invented metrics, companies, titles, or dates
- Every claim must be traceable to the original content
- Do not add roles or experiences that do not exist in the source

Return ONLY the rewritten section text.
No preamble. No labels. No explanation.`;
}
