import { NextRequest, NextResponse } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";
import { MARC_RESUME } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const { jobTitle, company, jobDescription = "" } = await req.json();
    if (!jobTitle || !company) {
      return NextResponse.json({ error: "jobTitle and company are required" }, { status: 400 });
    }

    const prompt = `Create a concise role intelligence brief for a job application. Be specific and actionable.

CANDIDATE:
${MARC_RESUME}

TARGET ROLE: ${jobTitle} at ${company}
${jobDescription ? `\nJOB DESCRIPTION:\n${jobDescription}` : ""}

Generate a brief with these sections:
1. **Company Snapshot** (3 sentences: what they do, recent news, why it matters for this role)
2. **Why Marc Fits** (3 specific reasons connecting his OT/enterprise background to this role)
3. **Potential Objections** (2-3 concerns they might have + how to counter each)
4. **Key Talking Points** (5 bullet points for the first conversation)
5. **Questions to Ask** (3 smart questions that show domain depth)

Keep it tight — this is a cheat sheet, not an essay.`;

    const message = await anthropic.messages.create({
      model:      MODEL,
      max_tokens: 1500,
      messages:   [{ role: "user", content: prompt }],
    });

    const brief = message.content.find(b => b.type === "text")?.text ?? "";
    return NextResponse.json({ brief });
  } catch (err) {
    console.error("[api/role-brief]", err);
    return NextResponse.json({ error: "Failed to generate role brief." }, { status: 500 });
  }
}
