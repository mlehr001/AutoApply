import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { RoleRecommendation } from "@/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const MODEL = "claude-sonnet-4-6";

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

function buildAnalyzeRolesPrompt(resume: unknown) {
  return `
You are an expert career strategist.

Analyze this resume and recommend the top 5 to 8 most realistic, strong-fit roles.

Rules:
- Use specific job titles only
- Stay realistic based on actual experience
- Prioritize adjacent roles, not major career pivots
- Base reasoning on evidence from the resume
- Avoid vague suggestions
- Return ONLY a valid JSON array
- Do NOT use markdown
- Do NOT use triple backticks
- Do NOT include any explanation before or after the JSON

Required format:
[
  {
    "id": "unique-id",
    "title": "Role Title",
    "company": null,
    "context": "short context",
    "reasoning": "why this person fits",
    "confidence": 85,
    "traits": ["trait1", "trait2", "trait3"]
  }
]

RESUME:
${JSON.stringify(resume, null, 2)}
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
      max_tokens: 1200,
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