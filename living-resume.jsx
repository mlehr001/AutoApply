import { useState } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const navy = "#2C3E50";
const navyLight = "#34495E";
const offWhite = "#F5F5F3";
const white = "#FFFFFF";
const border = "#E5E2DD";
const muted = "#888";
const green = "#27AE60";
const red = "#E74C3C";
const amber = "#F39C12";

// ─── RESUME CONTENT (editable — this is your source of truth) ─────────────────
const BASE_RESUME = {
  summary: `A seasoned enterprise sales leader with a demonstrated track record of driving revenue growth across industrial software, storage technology, and embedded systems. I specialize in complex multi-stakeholder deals, long-cycle relationship management, and channel partner development — now bridging operational technology and AI, bringing operator-level credibility to the next generation of data infrastructure.`,
  sections: [
    {
      id: "experience",
      title: "Experience",
      weight: 0.5,
      content: `AVEVA Select CA — Assistant Sales Manager (2018–Present)
• Sole California distributor for AVEVA's full industrial software suite — SCADA, HMI, PI System, and IIoT — managing enterprise and municipal accounts across energy, water, and manufacturing verticals.
• Navigated complex multi-stakeholder procurement cycles, building trust at the executive, operations, and IT levels simultaneously to close long-cycle deals.
• Drove consistent revenue growth through solution-based selling, customer success management, and strategic upsell into existing accounts.
• Developed deep technical fluency across AVEVA's portfolio to deliver credible, value-led presentations to both OT engineers and C-suite buyers.

Dexxxon Digital Storage — Key Account Manager (2020–2021)
• Managed and expanded key accounts for consumer flash memory brands (EMTEC, Kodak, Phillips) and LTO-Tape digital storage brands (IBM, Quantum, HP).
• Spearheaded strategic initiatives to unlock account potential, surpass sales targets, and amplify market presence.
• Leveraged negotiation skills to deliver compelling proposals and close deals that fostered long-term partnerships.

Transcend Information — Channel Account Manager (2014–2020)
• Spearheaded strategic partnerships with Ingram Micro and Synnex Corporation, growing annual revenue to $3 million.
• Achieved 30% year-over-year revenue increase by identifying market entry opportunities and executing co-marketing programs.
• Drove 100% YoY sales growth for Apple embedded solutions and military-grade body cameras.
• Collaborated with 200+ resellers and channel partners nationwide.`
    },
    {
      id: "about",
      title: "OT-to-AI Narrative",
      weight: 0.25,
      content: `Spent 10+ years selling to the physical world — SCADA, HMI, PI System, and industrial IoT to energy, water, and manufacturing enterprises. Deals where a wrong move resets a 9-month relationship. Built $25M+ in career revenue doing exactly that.

I know how enterprise decisions actually get made. How to navigate procurement, earn multi-stakeholder trust, and close in environments where urgency doesn't exist until you create it. Plus 7 apps in active development — I speak product as fluently as pipeline.

AI platforms. Data infrastructure. Cloud. AdTech. Entertainment tech. Companies that need a strategic seller who can walk into an industrial enterprise, speak their language, and close the deal nobody else could.`
    },
    {
      id: "skills",
      title: "Core Capabilities",
      weight: 0.15,
      content: `Enterprise Sales: Multi-stakeholder deal management, Long-cycle relationship mgmt, Executive-level engagement, Procurement navigation, Territory ownership

Strategic Partnerships: Channel & distributor programs, Partner ecosystem development, Co-sell motion design, Revenue share structuring, SI & ISV relationships

OT / Industrial Domain: SCADA & HMI platforms, PI System / OSIsoft, Industrial IoT, AVEVA portfolio, Energy, water, manufacturing

AI & Data Literacy: LLM platforms (Claude, GPT-4), Data pipeline concepts, Supabase / pgvector, Next.js / React / TypeScript, 7 apps in active development

Business Development: Pipeline generation, Outbound motion design, Competitive positioning, Deal structuring & negotiation, Forecasting & CRM`
    },
    {
      id: "contact",
      title: "Contact / CTA",
      weight: 0.1,
      content: `If you're building something in AI, data infrastructure, cloud, or enterprise tech and need a strategic seller who can open doors in industrial markets — let's find 30 minutes. Book a call via Calendly.`
    }
  ]
};

// ─── SAMPLE ANALYTICS (mirrors dashboard data) ────────────────────────────────
const SAMPLE_ANALYTICS = {
  totalVisits: 120,
  uniqueVisitors: 93,
  calendlyClicks: 6,
  calendlyRate: 6.5,
  avgScrollDepth: 62,
  sections: [
    { id: "experience", name: "Experience", scrollReach: 61, avgTimeSeconds: 83, dropoffPct: 39 },
    { id: "about",      name: "About",      scrollReach: 78, avgTimeSeconds: 47, dropoffPct: 22 },
    { id: "skills",     name: "Skills",     scrollReach: 44, avgTimeSeconds: 35, dropoffPct: 56 },
    { id: "contact",    name: "Contact",    scrollReach: 29, avgTimeSeconds: 22, dropoffPct: 71 },
  ],
  topSource: "LinkedIn (48%)",
  topDevice: "Desktop (58%)",
};

// ─── SCORING ENGINE ───────────────────────────────────────────────────────────
function scoreSection(section, analytics) {
  const data = analytics.sections.find(s => s.id === section.id);
  if (!data) return { score: 50, grade: "C", issues: [] };

  // Weighted score: scroll reach (40%) + time (35%) + calendly proxy (25%)
  const scrollScore  = (data.scrollReach / 100) * 100;
  const timeScore    = Math.min((data.avgTimeSeconds / 90) * 100, 100);
  const calendlyProxy = section.id === "contact" ? (analytics.calendlyRate / 15) * 100 : scrollScore * 0.5;

  const raw = scrollScore * 0.40 + timeScore * 0.35 + calendlyProxy * 0.25;
  const score = Math.round(raw);

  const grade = score >= 80 ? "A" : score >= 65 ? "B" : score >= 50 ? "C" : "D";
  const issues = [];
  if (data.scrollReach < 50)      issues.push(`Only ${data.scrollReach}% of visitors reach this section`);
  if (data.avgTimeSeconds < 30)   issues.push(`Avg read time is only ${data.avgTimeSeconds}s — content may not be compelling`);
  if (data.dropoffPct > 50)       issues.push(`${data.dropoffPct}% of visitors who reach this section bounce immediately after`);
  if (section.id === "contact" && analytics.calendlyRate < 10) issues.push(`Calendly conversion is ${analytics.calendlyRate}% — CTA needs urgency`);

  return { score, grade, issues, data };
}

// ─── PROMPT BUILDER ───────────────────────────────────────────────────────────
function buildPrompt(section, analytics, targetRole, scoreData) {
  return `You are an expert resume writer and conversion optimizer. Your job is to aggressively rewrite a resume section to maximize engagement and interview conversion.

TARGET ROLE: ${targetRole}

CANDIDATE PROFILE:
- Marc Lehrmann, 37, Southern California
- 10+ years enterprise tech sales ($25M+ career revenue)
- Background: industrial software (AVEVA SCADA/PI System), flash storage, embedded tech channel sales
- Positioning: "OT to AI bridge" — selling the narrative that he understands industrial enterprises AND AI/data platforms
- Building 7 apps (Next.js, Supabase, Claude API) — demonstrates builder mindset and technical fluency

SECTION TO REWRITE: "${section.title}"

CURRENT CONTENT:
${section.content}

PERFORMANCE DATA (why this needs a rewrite):
- Scroll reach: ${scoreData.data.scrollReach}% of visitors
- Avg time spent: ${scoreData.data.avgTimeSeconds} seconds
- Drop-off after this section: ${scoreData.data.dropoffPct}%
- Performance score: ${scoreData.score}/100 (Grade: ${scoreData.grade})
- Issues identified: ${scoreData.issues.join("; ")}

OVERALL PAGE METRICS:
- Calendly conversion rate: ${analytics.calendlyRate}% (target: 15%+)
- Top traffic source: ${analytics.topSource}
- Avg scroll depth: ${analytics.avgScrollDepth}%

REWRITE INSTRUCTIONS:
1. Be AGGRESSIVE. This is a full rewrite, not light editing.
2. Optimize specifically for the target role: ${targetRole}
3. Lead with the most powerful, role-relevant achievement or insight
4. Use active, specific language — no vague corporate speak
5. For Experience: quantify everything possible, lead each bullet with impact not activity
6. For Narrative/About: make it feel like a human wrote it, not a resume template
7. For Skills: ruthlessly cut generic skills, emphasize what's rare and relevant to the target role
8. For Contact/CTA: create urgency, specificity, and a clear reason to click NOW
9. Keep the OT-to-AI bridge narrative alive throughout
10. Match length to the original — don't add padding

Return ONLY the rewritten section content. No explanations, no headers, no preamble. Just the raw rewritten text ready to drop into the resume.`;
}

// ─── UI HELPERS ───────────────────────────────────────────────────────────────
const gradeColor = g => g === "A" ? green : g === "B" ? navy : g === "C" ? amber : red;

const Badge = ({ label, color }) => (
  <span style={{ display: "inline-block", padding: "2px 8px", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", background: color + "18", color, border: `1px solid ${color}40` }}>
    {label}
  </span>
);

const ScoreRing = ({ score, grade }) => {
  const color = gradeColor(grade);
  return (
    <div style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="26" fill="none" stroke={border} strokeWidth="5" />
        <circle cx="32" cy="32" r="26" fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${2 * Math.PI * 26 * score / 100} ${2 * Math.PI * 26 * (1 - score / 100)}`}
          strokeLinecap="butt" transform="rotate(-90 32 32)" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "Georgia,serif", fontSize: 16, fontWeight: 700, color, lineHeight: 1 }}>{grade}</div>
        <div style={{ fontSize: 9, color: muted, marginTop: 1 }}>{score}</div>
      </div>
    </div>
  );
};

// ─── DIFF VIEWER ──────────────────────────────────────────────────────────────
const DiffView = ({ original, rewritten }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, border: `1px solid ${border}`, fontSize: 12, lineHeight: 1.7 }}>
    <div style={{ padding: "16px 20px", background: "#FFF5F5", borderRight: `1px solid ${border}` }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: red, marginBottom: 12 }}>Before</div>
      <div style={{ color: "#666", whiteSpace: "pre-wrap" }}>{original}</div>
    </div>
    <div style={{ padding: "16px 20px", background: "#F0FFF4" }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: green, marginBottom: 12 }}>After (AI Rewrite)</div>
      <div style={{ color: "#2D2D2D", whiteSpace: "pre-wrap" }}>{rewritten}</div>
    </div>
  </div>
);

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function LivingResume() {
  const [targetRole, setTargetRole] = useState("");
  const [analytics]  = useState(SAMPLE_ANALYTICS);
  const [resume, setResume]         = useState(BASE_RESUME);
  const [rewrites, setRewrites]     = useState({});
  const [loading, setLoading]       = useState({});
  const [expanded, setExpanded]     = useState({});
  const [accepted, setAccepted]     = useState({});
  const [ran, setRan]               = useState(false);
  const [optimizing, setOptimizing] = useState(false);

  const scores = resume.sections.map(s => ({
    ...s,
    scoreData: scoreSection(s, analytics)
  }));

  const overallScore = Math.round(
    scores.reduce((sum, s) => sum + s.scoreData.score * s.weight, 0) /
    scores.reduce((sum, s) => sum + s.weight, 0)
  );

  const needsRewrite = scores.filter(s => s.scoreData.grade === "C" || s.scoreData.grade === "D");

  async function rewriteSection(section, scoreData) {
    if (!targetRole.trim()) return;
    setLoading(l => ({ ...l, [section.id]: true }));
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: buildPrompt(section, analytics, targetRole, scoreData)
          }]
        })
      });
      const data = await response.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      setRewrites(r => ({ ...r, [section.id]: text }));
      setExpanded(e => ({ ...e, [section.id]: true }));
    } catch (e) {
      setRewrites(r => ({ ...r, [section.id]: "Error reaching API. Check your connection." }));
    }
    setLoading(l => ({ ...l, [section.id]: false }));
  }

  async function rewriteAll() {
    if (!targetRole.trim()) return;
    setOptimizing(true);
    setRan(true);
    for (const s of needsRewrite) {
      await rewriteSection(s, s.scoreData);
    }
    setOptimizing(false);
  }

  function acceptRewrite(sectionId) {
    const newContent = rewrites[sectionId];
    if (!newContent) return;
    setResume(r => ({
      ...r,
      sections: r.sections.map(s => s.id === sectionId ? { ...s, content: newContent } : s)
    }));
    setAccepted(a => ({ ...a, [sectionId]: true }));
    setRewrites(rw => { const n = { ...rw }; delete n[sectionId]; return n; });
  }

  function rejectRewrite(sectionId) {
    setRewrites(rw => { const n = { ...rw }; delete n[sectionId]; return n; });
    setExpanded(e => ({ ...e, [sectionId]: false }));
  }

  const overallGrade = overallScore >= 80 ? "A" : overallScore >= 65 ? "B" : overallScore >= 50 ? "C" : "D";

  return (
    <div style={{ minHeight: "100vh", background: offWhite, fontFamily: "'Open Sans', system-ui, sans-serif", fontSize: 14, color: navy }}>

      {/* NAV */}
      <div style={{ background: navy, height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: white, letterSpacing: "-0.01em" }}>
          Marc Lehrmann <span style={{ opacity: 0.4, fontWeight: 300 }}>/</span> <span style={{ opacity: 0.7, fontWeight: 400, fontSize: 13 }}>Living Resume</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Badge label="AI Powered" color={white} />
          <Badge label={`Score: ${overallScore}`} color={gradeColor(overallGrade)} />
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* HEADER ROW */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "start", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: "Georgia,serif", fontSize: 26, fontWeight: 700, color: navy, marginBottom: 6 }}>Living Resume Optimizer</h1>
            <p style={{ fontSize: 13, color: muted, lineHeight: 1.6, maxWidth: 560 }}>
              Paste in your target role, review your section scores based on real visitor behavior, then let AI aggressively rewrite anything underperforming. Accept or reject each rewrite individually.
            </p>
          </div>
          <div style={{ background: white, border: `1px solid ${border}`, padding: "20px 24px", textAlign: "center", minWidth: 140 }}>
            <div style={{ fontSize: 11, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Overall Score</div>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 48, fontWeight: 700, color: gradeColor(overallGrade), lineHeight: 1 }}>{overallGrade}</div>
            <div style={{ fontSize: 13, color: muted, marginTop: 4 }}>{overallScore} / 100</div>
          </div>
        </div>

        {/* TARGET ROLE INPUT */}
        <div style={{ background: white, border: `1px solid ${border}`, padding: "24px 28px", marginBottom: 24, display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: navy, marginBottom: 8 }}>
              Target Role
            </label>
            <input
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              placeholder="e.g. Director of Strategic Partnerships at Databricks"
              style={{ width: "100%", padding: "11px 14px", border: `1px solid ${border}`, fontSize: 13, color: navy, outline: "none", fontFamily: "inherit", background: offWhite }}
            />
            <div style={{ fontSize: 11, color: muted, marginTop: 6 }}>Be specific — company + role title gives the AI better context for rewrites.</div>
          </div>
          <button
            onClick={rewriteAll}
            disabled={!targetRole.trim() || optimizing}
            style={{
              background: targetRole.trim() && !optimizing ? navy : border,
              color: targetRole.trim() && !optimizing ? white : muted,
              border: "none", cursor: targetRole.trim() && !optimizing ? "pointer" : "default",
              padding: "12px 24px", fontFamily: "inherit", fontWeight: 700, fontSize: 13,
              letterSpacing: "0.05em", textTransform: "uppercase", transition: "background 0.2s", whiteSpace: "nowrap"
            }}
          >
            {optimizing ? "Optimizing..." : `⚡ Rewrite ${needsRewrite.length} Failing Section${needsRewrite.length !== 1 ? "s" : ""}`}
          </button>
        </div>

        {/* ANALYTICS SNAPSHOT */}
        <div style={{ background: white, border: `1px solid ${border}`, padding: "20px 28px", marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: muted, marginBottom: 14 }}>Analytics Snapshot — Optimizing Against</div>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {[
              { label: "Unique Visitors", val: analytics.uniqueVisitors },
              { label: "Calendly Rate", val: `${analytics.calendlyRate}%` },
              { label: "Avg Scroll Depth", val: `${analytics.avgScrollDepth}%` },
              { label: "Top Source", val: analytics.topSource },
              { label: "Top Device", val: analytics.topDevice },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 11, color: muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontFamily: "Georgia,serif", fontSize: 18, fontWeight: 700, color: navy }}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION CARDS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {scores.map(section => {
            const { scoreData } = section;
            const isExpanded = expanded[section.id];
            const hasRewrite = !!rewrites[section.id];
            const isLoading  = loading[section.id];
            const wasAccepted = accepted[section.id];

            return (
              <div key={section.id} style={{ background: white, border: `1px solid ${scoreData.grade === "D" ? red + "40" : scoreData.grade === "C" ? amber + "40" : border}` }}>

                {/* Card header */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 24px", borderBottom: isExpanded ? `1px solid ${border}` : "none" }}>
                  <ScoreRing score={scoreData.score} grade={scoreData.grade} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "Georgia,serif", fontSize: 17, fontWeight: 700, color: navy }}>{section.title}</span>
                      {wasAccepted && <Badge label="✓ Rewrite Accepted" color={green} />}
                      {scoreData.grade === "D" && <Badge label="Needs Rewrite" color={red} />}
                      {scoreData.grade === "C" && <Badge label="Underperforming" color={amber} />}
                      {scoreData.grade === "B" && <Badge label="Good" color={navy} />}
                      {scoreData.grade === "A" && <Badge label="Top Performer" color={green} />}
                    </div>
                    <div style={{ display: "flex", gap: 20, fontSize: 12, color: muted, flexWrap: "wrap" }}>
                      <span>Scroll reach: <strong style={{ color: navy }}>{scoreData.data.scrollReach}%</strong></span>
                      <span>Avg time: <strong style={{ color: navy }}>{scoreData.data.avgTimeSeconds}s</strong></span>
                      <span>Drop-off: <strong style={{ color: scoreData.data.dropoffPct > 50 ? red : navy }}>{scoreData.data.dropoffPct}%</strong></span>
                    </div>
                    {scoreData.issues.length > 0 && (
                      <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {scoreData.issues.map((issue, i) => (
                          <span key={i} style={{ fontSize: 11, color: red, background: red + "10", border: `1px solid ${red}30`, padding: "2px 8px" }}>⚠ {issue}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button onClick={() => setExpanded(e => ({ ...e, [section.id]: !e[section.id] }))}
                      style={{ background: offWhite, border: `1px solid ${border}`, padding: "8px 14px", fontSize: 12, cursor: "pointer", color: navy, fontFamily: "inherit" }}>
                      {isExpanded ? "Collapse" : "View Content"}
                    </button>
                    {!wasAccepted && (
                      <button
                        onClick={() => rewriteSection(section, scoreData)}
                        disabled={!targetRole.trim() || isLoading}
                        style={{
                          background: targetRole.trim() && !isLoading ? navy : border,
                          color: targetRole.trim() && !isLoading ? white : muted,
                          border: "none", padding: "8px 16px", fontSize: 12, cursor: targetRole.trim() && !isLoading ? "pointer" : "default",
                          fontFamily: "inherit", fontWeight: 700, letterSpacing: "0.04em", transition: "background 0.2s"
                        }}>
                        {isLoading ? "Rewriting..." : "AI Rewrite →"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div style={{ padding: "20px 24px" }}>
                    {!hasRewrite && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: muted, marginBottom: 10 }}>Current Content</div>
                        <div style={{ fontSize: 12, lineHeight: 1.75, color: navy, whiteSpace: "pre-wrap", background: offWhite, padding: "16px 18px", border: `1px solid ${border}` }}>
                          {section.content}
                        </div>
                      </div>
                    )}

                    {isLoading && (
                      <div style={{ padding: "32px", textAlign: "center", color: muted, fontSize: 13 }}>
                        <div style={{ fontSize: 24, marginBottom: 10 }}>⚡</div>
                        Claude is rewriting this section for <strong style={{ color: navy }}>{targetRole}</strong>...
                      </div>
                    )}

                    {hasRewrite && !isLoading && (
                      <div>
                        <DiffView original={section.content} rewritten={rewrites[section.id]} />
                        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                          <button onClick={() => acceptRewrite(section.id)}
                            style={{ background: green, color: white, border: "none", padding: "11px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.04em" }}>
                            ✓ Accept &amp; Apply to Resume
                          </button>
                          <button onClick={() => rewriteSection(section, scoreData)}
                            style={{ background: offWhite, border: `1px solid ${border}`, color: navy, padding: "11px 20px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                            ↺ Try Again
                          </button>
                          <button onClick={() => rejectRewrite(section.id)}
                            style={{ background: "none", border: `1px solid ${border}`, color: muted, padding: "11px 20px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                            ✕ Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* EXPORT */}
        {Object.keys(accepted).length > 0 && (
          <div style={{ marginTop: 24, background: navy, padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ color: white, fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                {Object.keys(accepted).length} section{Object.keys(accepted).length > 1 ? "s" : ""} rewritten for <em>{targetRole}</em>
              </div>
              <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>Copy the updated content into your landing page HTML or resume doc.</div>
            </div>
            <button
              onClick={() => {
                const out = resume.sections.map(s => `=== ${s.title} ===\n\n${s.content}`).join("\n\n\n");
                navigator.clipboard.writeText(out);
              }}
              style={{ background: white, color: navy, border: "none", padding: "12px 24px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.04em" }}>
              Copy Full Resume to Clipboard
            </button>
          </div>
        )}

        {/* Setup note */}
        <div style={{ marginTop: 20, padding: "14px 18px", background: white, border: `1px solid ${border}`, fontSize: 12, color: muted, lineHeight: 1.7 }}>
          <strong style={{ color: navy }}>🔌 To use real analytics:</strong> Replace the <code style={{ background: offWhite, padding: "1px 5px", fontSize: 11 }}>SAMPLE_ANALYTICS</code> object at the top of this file with live data from your GA4 API. The scoring engine and prompts will automatically adapt.
        </div>

      </div>
    </div>
  );
}
