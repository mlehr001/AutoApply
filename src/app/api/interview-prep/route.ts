import { NextRequest, NextResponse } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";
import { MARC_RESUME } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const { jobTitle, company, interviewType = "general", notes = "" } = await req.json();
    if (!jobTitle || !company) {
      return NextResponse.json({ error: "jobTitle and company are required" }, { status: 400 });
    }

    const prompt = `Generate an interview prep brief for Marc Lehrmann.

CANDIDATE:
${MARC_RESUME}

INTERVIEW: ${interviewType} round for ${jobTitle} at ${company}
${notes ? `\nADDITIONAL CONTEXT:\n${notes}` : ""}

Generate the following prep brief:

**LIKELY QUESTIONS** (5 questions they will almost certainly ask, with Marc's ideal answer framework in 2-3 sentences each)

**STORIES TO PREPARE** (3 specific STAR-format stories from Marc's background that map to this role type — use real companies and real scenarios from his resume)

**COMPANY INTELLIGENCE** (3 things Marc should know cold before this call: company positioning, recent news, why they're hiring for this role)

**OBJECTION HANDLERS** (2-3 likely concerns about Marc's candidacy + how to reframe each as a strength)

**CLOSE STRONG** (the one thing Marc should say at the end of every interview to stand out)

Be concrete and specific. No generic advice — this is tailored to Marc's exact background vs. this specific role.`;

    const message = await anthropic.messages.create({
      model:      MODEL,
      max_tokens: 2000,
      messages:   [{ role: "user", content: prompt }],
    });

    const brief = message.content.find(b => b.type === "text")?.text ?? "";
    return NextResponse.json({ brief });
  } catch (err) {
    console.error("[api/interview-prep]", err);
    return NextResponse.json({ error: "Failed to generate prep brief." }, { status: 500 });
  }
}
