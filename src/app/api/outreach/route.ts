import { NextRequest, NextResponse } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";
import { MARC_RESUME } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const {
      contactName, contactTitle, company,
      platform = "LinkedIn",
      jobTitle = "",
      context = "",
    } = await req.json();

    if (!contactName || !company) {
      return NextResponse.json({ error: "contactName and company are required" }, { status: 400 });
    }

    const prompt = `Write a cold outreach message for Marc Lehrmann. Platform: ${platform}.

MARC'S PROFILE:
${MARC_RESUME}

TARGET:
- Name: ${contactName}
- Title: ${contactTitle || "Unknown"}
- Company: ${company}
${jobTitle  ? `- Relevant role: ${jobTitle}` : ""}
${context   ? `- Additional context: ${context}` : ""}

OUTREACH RULES:
- ${platform === "LinkedIn" ? "Max 300 characters for connection request note, OR a short 3-paragraph InMail if longer format requested" : "Max 150 words for email subject + body"}
- No generic "I came across your profile" openers
- Lead with something specific about ${company} or ${contactTitle || "their work"}
- Connect Marc's OT-to-AI bridge positioning to what ${company} is building
- One clear, low-friction ask (30-min call, not a job pitch)
- Marc's voice: direct, intelligent, no fluff, no em dashes

Write the message. If LinkedIn, write the connection note only (under 300 chars) unless the user asks for InMail.`;

    const message = await anthropic.messages.create({
      model:      MODEL,
      max_tokens: 600,
      messages:   [{ role: "user", content: prompt }],
    });

    const outreach = message.content.find(b => b.type === "text")?.text ?? "";
    return NextResponse.json({ outreach });
  } catch (err) {
    console.error("[api/outreach]", err);
    return NextResponse.json({ error: "Failed to generate outreach message." }, { status: 500 });
  }
}
