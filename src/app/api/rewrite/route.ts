import { NextRequest, NextResponse } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";
import { buildRewritePrompt } from "@/lib/anthropic";

// GET /api/rewrite — connectivity probe
export async function GET() {
  try {
    const res = await fetch("https://api.anthropic.com", { method: "HEAD" });
    return NextResponse.json({
      reachable: true,
      status: res.status,
      apiKeyPresent: !!process.env.ANTHROPIC_API_KEY,
    });
  } catch (err) {
    return NextResponse.json({
      reachable: false,
      error: err instanceof Error ? err.message : String(err),
      apiKeyPresent: !!process.env.ANTHROPIC_API_KEY,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("[rewrite] env check", {
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      upstashUrl: !!process.env.UPSTASH_REDIS_REST_URL,
      upstashToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    // Upstash rate limiter disabled for debugging — re-enable after Claude confirmed working
    // const ip = req.headers.get("x-forwarded-for") ?? "global";
    // const { success, limit, remaining } = await rewriteRatelimit.limit(ip);
    // if (!success) {
    //   return NextResponse.json(
    //     { error: `Rate limit reached (${limit} rewrites/min). Try again shortly.` },
    //     { status: 429, headers: { "X-RateLimit-Remaining": String(remaining) } }
    //   );
    // }

    const { section, targetRole, analytics, scoreData, allSections } = await req.json();

    // targetRole can be string OR structured object — handle both for backwards compatibility
    const roleTitle: string = typeof targetRole === "object" ? targetRole.title : targetRole;
    const roleContext: string = typeof targetRole === "object" ? targetRole.context : targetRole;
    const roleTraits: string[] = typeof targetRole === "object" ? targetRole.traits : [];
    const roleReasoning: string = typeof targetRole === "object" ? targetRole.reasoning : "";

    if (!section?.title || !section?.content || !roleTitle?.trim()) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2500,
      messages: [{ role: "user", content:
        buildRewritePrompt(section, roleTitle, roleContext, roleTraits, roleReasoning, scoreData, analytics, allSections ?? [])
      }],
    });

    const textResponse = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("")
      .trim();

    if (!textResponse) {
      console.error("[api/rewrite] empty response from Claude", {
        model: MODEL,
        stopReason: message.stop_reason,
        contentBlocks: message.content.length,
        usage: message.usage,
      });
      return NextResponse.json(
        { error: "Claude returned an empty response", debug: { stopReason: message.stop_reason, contentBlocks: message.content.length } },
        { status: 502 }
      );
    }

    if (message.stop_reason === "max_tokens") {
      console.warn("[api/rewrite] response truncated at max_tokens", { usage: message.usage });
      return NextResponse.json({
        text: textResponse,
        truncated: true,
        warning: "Rewrite may be incomplete — response was cut off at the token limit.",
      });
    }

    return NextResponse.json({ text: textResponse });

  } catch (err: unknown) {
    console.error("[api/rewrite] full error", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Rewrite failed" },
      { status: 500 }
    );
  }
}
