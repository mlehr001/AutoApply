import { NextRequest, NextResponse } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";
import { MARC_RESUME } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const { jobTitle, company, interviewNotes, outcome = "unknown" } = await req.json();
    if (!jobTitle || !company || !interviewNotes) {
      return NextResponse.json({ error: "jobTitle, company, and interviewNotes are required" }, { status: 400 });
    }

    const prompt = `Analyze this post-interview debrief and generate actionable next steps for Marc Lehrmann.

CANDIDATE:
${MARC_RESUME}

ROLE: ${jobTitle} at ${company}
OUTCOME SO FAR: ${outcome}

MARC'S INTERVIEW NOTES:
${interviewNotes}

Generate:

**WHAT WENT WELL** (2-3 specific strengths based on the notes)

**WHAT TO IMPROVE** (2-3 honest gaps or missed opportunities — be direct)

**NEXT STEPS** (concrete actions ranked by priority:
- If advancing: what to prepare for next round
- If following up: the exact follow-up approach and timing
- If rejected: what to learn and whether/how to stay in touch)

**FOLLOW-UP EMAIL DRAFT** (a 3-sentence follow-up email Marc can send within 24 hours — no generic "great to meet you" openers)

Keep it direct and honest. This is for Marc's personal growth, not a feel-good summary.`;

    const message = await anthropic.messages.create({
      model:      MODEL,
      max_tokens: 1200,
      messages:   [{ role: "user", content: prompt }],
    });

    const analysis = message.content.find(b => b.type === "text")?.text ?? "";
    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("[api/debrief]", err);
    return NextResponse.json({ error: "Failed to generate debrief." }, { status: 500 });
  }
}
