import { NextRequest, NextResponse } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";
import { MARC_RESUME } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const { jobTitle, company, jobDescription = "", tone = "confident-direct" } = await req.json();
    if (!jobTitle || !company) {
      return NextResponse.json({ error: "jobTitle and company are required" }, { status: 400 });
    }

    const prompt = `Write a cover letter for Marc Lehrmann. Tone: ${tone}.

CANDIDATE:
${MARC_RESUME}

ROLE: ${jobTitle} at ${company}
${jobDescription ? `\nJOB DESCRIPTION:\n${jobDescription}` : ""}

COVER LETTER RULES:
- 3 tight paragraphs, max 250 words total
- No generic opener ("I am excited to apply…") — start with a bold claim or a specific insight about the company
- Paragraph 1: The hook — why Marc specifically for this role at this company
- Paragraph 2: 1-2 specific achievements that prove he can do the job
- Paragraph 3: Forward-looking close — what he wants to build together, clear CTA
- Voice: Marc's — direct, intelligent, no corporate fluff, no em dashes
- Do NOT use bullet points in a cover letter
- Preserve the OT-to-AI bridge positioning

GUARDRAILS:
- No invented facts or metrics beyond what's in the resume
- If there's no job description, write to the company and role title only`;

    const message = await anthropic.messages.create({
      model:      MODEL,
      max_tokens: 800,
      messages:   [{ role: "user", content: prompt }],
    });

    const letter = message.content.find(b => b.type === "text")?.text ?? "";
    return NextResponse.json({ letter });
  } catch (err) {
    console.error("[api/cover-letter]", err);
    return NextResponse.json({ error: "Failed to generate cover letter." }, { status: 500 });
  }
}
