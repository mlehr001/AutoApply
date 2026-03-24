import { NextRequest, NextResponse } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";
import { getCachedScores, setCachedScores, buildScoreCacheKey } from "@/lib/upstash";
import { MARC_RESUME } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    // Upstash rate limiter disabled for debugging — re-enable after Claude confirmed working
    // const ip = req.headers.get("x-forwarded-for") ?? "global";
    // const { success } = await scoringRatelimit.limit(ip);
    // if (!success) {
    //   return NextResponse.json({ error: "Rate limit: max 3 scoring runs per hour." }, { status: 429 });
    // }

    const { jobs = [], keywords = "", starred = [], appliedJobs = [] } = await req.json();

    if (!jobs.length) return NextResponse.json({ scores: [] });

    // Check cache
    const cacheKey = buildScoreCacheKey(jobs.map((j: { id: string }) => j.id), keywords);
    const cached   = await getCachedScores(cacheKey);
    if (cached) return NextResponse.json({ scores: cached, fromCache: true });

    const appliedStr = appliedJobs
      .map((j: { title: string; company: string }) => `${j.title} at ${j.company}`)
      .join(", ") || "none";

    const prompt = `You are a precise job match scoring engine. Score each job for the candidate below.
Return ONLY a valid JSON array — no markdown code fences, no explanation text, nothing else.

CANDIDATE RESUME:
${MARC_RESUME}

APPLIED HISTORY (learn preference patterns): ${appliedStr}
STARRED COMPANIES (high-interest, +10 bonus): ${starred.join(", ") || "none"}
TARGET KEYWORDS (weight these): ${keywords || "Strategic Partnerships, AI, Enterprise Sales"}

JOBS TO SCORE:
${jobs.map((j: { id: string; title: string; company: string; location?: string; tags?: string[] }) =>
  `ID:${j.id} | "${j.title}" at ${j.company} | ${j.location ?? ""} | Tags: ${j.tags?.join(", ") ?? ""}`
).join("\n")}

SCORING CRITERIA:
- Title seniority + focus alignment: 30pts
- Industry/domain match (AI, data, OT, partnerships, channel): 25pts
- Company match (starred = +10 bonus): 15pts
- Keyword match with resume skills: 15pts
- Pattern match with applied role history: 15pts

RETURN FORMAT — JSON array only:
[{"id":"...","score":0-100,"matchLabel":"Strong Match|Good Match|Partial Match|Weak Match","reasons":["max 12 words","max 12 words"],"redFlags":["max 10 words"],"applyUrgency":"High|Medium|Low"}]`;

    const message = await anthropic.messages.create({
      model:      MODEL,
      max_tokens: 2000,
      messages:   [{ role: "user", content: prompt }],
    });

    const raw   = message.content.find(b => b.type === "text")?.text ?? "[]";
    const clean = raw.replace(/```json|```/g, "").trim();

    let scores: unknown[];
    try {
      scores = JSON.parse(clean);
    } catch {
      scores = jobs.map((j: { id: string }) => ({
        id: j.id, score: 50, matchLabel: "Partial Match",
        reasons: ["Parse error — review manually"], redFlags: [], applyUrgency: "Medium",
      }));
    }

    await setCachedScores(cacheKey, scores as Record<string, unknown>[]);
    return NextResponse.json({ scores });
  } catch (err) {
    console.error("[api/score-jobs]", err);
    return NextResponse.json({ error: "Scoring failed." }, { status: 500 });
  }
}
