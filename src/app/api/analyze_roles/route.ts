import { NextRequest, NextResponse } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";
import type { RoleRecommendation } from "@/types";

function extractJsonArray(text: string): RoleRecommendation[] {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  // Try parsing directly first
  try {
    return JSON.parse(cleaned);
  } catch {}

  // Fallback: extract array manually
  const match = cleaned.match(/\[\s*{[\s\S]*}\s*\]/);

  if (!match) {
    throw new Error("No JSON array found");
  }

  return JSON.parse(match[0]);
}

function formatResumeForPrompt(resume: { sections?: Array<{ title: string; content: string }> }): string {
  if (!resume?.sections?.length) return JSON.stringify(resume, null, 2);
  return resume.sections.map(s => `## ${s.title}\n${s.content}`).join("\n\n");
}

function buildAnalyzeRolesPrompt(resume: { sections?: Array<{ title: string; content: string }> }) {
  const resumeText = formatResumeForPrompt(resume);
  return `You are a senior talent strategist and sales career advisor.

CANDIDATE PROFILE: Marc Lehrmann
- 12 years enterprise and channel sales across industrial software, IIoT hardware, and data storage
- $25M+ career revenue across direct and channel motions
- Deep domain: SCADA, HMI, PI System (OSIsoft), Industrial IoT, edge computing, AVEVA portfolio
- Industries covered: energy, water, manufacturing, transportation, defense
- Actively building 7 applications (Next.js, Supabase, Claude API) — credible AI/data product fluency
- Positioning: the candidate who can walk into an industrial enterprise, speak OT, and close deals that require earned trust over 6–18 month cycles
- Target market: AI platforms, data infrastructure, cloud, enterprise SaaS — companies selling into or alongside industrial markets

TASK:
Analyze the resume below and recommend 5 to 8 specific roles this candidate is a strong, realistic fit for right now.

ROLE SELECTION RULES:
- Specific job titles only — no generic labels like "Sales Professional" or "Business Development"
- Prioritize roles where OT domain expertise is a genuine differentiator, not just a nice-to-have
- Prioritize roles where long-cycle enterprise selling, multi-stakeholder navigation, and channel/partner motions are core requirements
- Include at least one role in: AI/ML platform sales, industrial data / PI System ecosystem, and channel/partner leadership
- Confidence score must reflect actual resume evidence — do not inflate
- Reasoning must cite specific experience from the resume — no generic statements
- Context must describe the environment this role operates in (company stage, buyer type, deal complexity) — this is used downstream to guide resume rewriting

TRAITS RULES:
- Traits are used by a resume rewriting engine to decide what to emphasize and what to cut
- Each trait must be a specific, actionable capability — not a personality adjective
- Good traits: "industrial enterprise multi-stakeholder sales", "channel program development", "PI System / OSIsoft ecosystem"
- Bad traits: "results-driven", "team player", "strong communicator", "strategic thinker"
- 3 to 5 traits per role, ordered by importance to that specific role

Return ONLY a valid JSON array. No markdown. No triple backticks. No explanation before or after the JSON.

Required format:
[
  {
    "id": "unique-kebab-id",
    "title": "Specific Role Title",
    "company": null,
    "context": "2-3 sentences: what kind of company, what the buyer looks like, deal complexity and cycle length",
    "reasoning": "2-3 sentences citing specific resume evidence for why this candidate fits this role",
    "confidence": 85,
    "traits": ["specific capability 1", "specific capability 2", "specific capability 3"]
  }
]

RESUME:
${resumeText}
`;
}

export async function POST(req: NextRequest) {
  try {
    console.log("analyze-roles: request received");

    const { resume } = await req.json();
    console.log("analyze-roles: parsed resume", !!resume);

    if (!resume) {
      return NextResponse.json(
        { error: "Missing resume data" },
        { status: 400 }
      );
    }

    const prompt = buildAnalyzeRolesPrompt(resume);
    console.log("analyze-roles: prompt built");

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2000,
      temperature: 0.3,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    console.log("analyze-roles: anthropic responded");

    const text =
      response.content?.[0]?.type === "text"
        ? response.content[0].text
        : "";

    console.log("analyze-roles: raw text", text);

    let parsed: RoleRecommendation[] = [];

 try {
  parsed = extractJsonArray(text);
      console.log("analyze-roles: parsed recommendations", parsed.length);
    } catch (err) {
      console.error("Failed to parse roles:", text);
      return NextResponse.json(
        { error: "Invalid AI response format", raw: text },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      recommendations: parsed,
    });
  } catch (error) {
    console.error("Analyze roles error:", error);
    return NextResponse.json(
      { error: "Failed to analyze roles" },
      { status: 500 }
    );
  }
}