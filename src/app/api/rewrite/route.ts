import { NextRequest, NextResponse } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";
import { rewriteRatelimit } from "@/lib/upstash";
import { MARC_RESUME } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "global";
    const { success, limit, remaining } = await rewriteRatelimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: `Rate limit reached (${limit} rewrites/min). Try again shortly.` },
        { status: 429, headers: { "X-RateLimit-Remaining": String(remaining) } }
      );
    }

    const { section, targetRole, analytics, scoreData } = await req.json();

    if (!section?.title || !section?.content || !targetRole?.trim()) {
      return NextResponse.json({ error: "Missing required fields: section, targetRole" }, { status: 400 });
    }

    const prompt = `You are an expert resume writer specializing in enterprise tech sales and career pivots into AI/data companies.

CANDIDATE PROFILE:
${MARC_RESUME}

TARGET ROLE: ${targetRole}

SECTION TO REWRITE: "${section.title}"

CURRENT CONTENT:
${section.content}

PERFORMANCE DATA (why this needs rewriting):
- Section score: ${scoreData?.score ?? "unknown"}/100 (Grade: ${scoreData?.grade ?? "?"})
- Identified issues: ${scoreData?.issues?.join("; ") || "none flagged"}
- Page Calendly conversion: ${analytics?.calendlyRate ?? "unknown"}%
- Average scroll depth: ${analytics?.avgScrollDepth ?? "unknown"}%

REWRITE RULES — follow strictly:
1. Aggressive full rewrite — not light editing
2. Optimize specifically for: ${targetRole}
3. Lead with the most powerful, role-relevant achievement or positioning statement
4. Use active, specific language — zero vague corporate speak
5. For Experience: quantify impact, lead each bullet with outcome not activity
6. For Narrative/About: human voice, not resume template
7. For Skills: cut generic, keep rare and relevant
8. For Contact/CTA: create urgency and a clear reason to reach out NOW
9. Maintain the OT-to-AI bridge narrative throughout
10. Match original length — no padding

GUARDRAILS — never break these:
- Do NOT invent numbers, revenue figures, titles, or companies not in the original
- Preserve all factual claims — enhance framing, not facts
- Every change must be explainable

Return ONLY the rewritten section text. No preamble, no labels, no explanation, no quotes around the output.`;

    const message = await anthropic.messages.create({
      model:      MODEL,
      max_tokens: 1200,
      messages:   [{ role: "user", content: prompt }],
    });

    const text = message.content.find(b => b.type === "text")?.text ?? "";
    return NextResponse.json({ text });
  } catch (err) {
    console.error("[api/rewrite]", err);
    return NextResponse.json({ error: "Rewrite failed. Please try again." }, { status: 500 });
  }
}
