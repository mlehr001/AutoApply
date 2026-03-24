"use client";

import { useState, useEffect } from "react";
import { getActiveResume, saveResumeVersion, updateResumeVersion } from "@/lib/supabase";
import { track } from "@/lib/posthog";
import type { ResumeVersion, ResumeSection } from "@/types";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const navy = "#2C3E50", offWhite = "#F5F5F3", white = "#FFFFFF",
  border = "#E5E2DD", muted = "#888", green = "#27AE60",
  red = "#E74C3C", amber = "#F39C12";

// ─── BASE RESUME FALLBACK ─────────────────────────────────────────────────────
const BASE_SECTIONS: ResumeSection[] = [
  {
    id: "experience", title: "Experience", weight: 0.5,
    content: `AVEVA Select CA — Assistant Sales Manager (2018–Present)
• Sole California distributor for AVEVA's full industrial software suite — SCADA, HMI, PI System, and IIoT — managing enterprise and municipal accounts across energy, water, and manufacturing verticals.
• Navigated complex multi-stakeholder procurement cycles, building trust at the executive, operations, and IT levels simultaneously to close long-cycle deals.
• Drove consistent revenue growth through solution-based selling, customer success management, and strategic upsell into existing accounts.

Advantech USA — Business Development Manager (May 2021–Oct 2023)
• Industrial IoT hardware, edge computing, and embedded systems. OEM and VAR channel development.
• Grew partner ecosystem across manufacturing, energy, and transportation verticals.

Dexxxon Digital Storage — Key Account Manager (Apr 2020–May 2021)
• Managed and expanded key accounts for consumer flash memory and LTO-Tape storage brands.
• Negotiation and long-term partnership development.

Transcend Information — Channel Account Manager (Feb 2014–Mar 2020)
• Spearheaded strategic partnerships with Ingram Micro and Synnex Corporation, growing annual revenue to $3 million.
• 30% YoY revenue increase. 100% YoY growth for Apple embedded + military-grade body cameras.
• 200+ reseller and channel partner network nationwide.`
  },
  {
    id: "about", title: "OT-to-AI Narrative", weight: 0.25,
    content: `Spent 10+ years selling to the physical world — SCADA, HMI, PI System, and industrial IoT to energy, water, and manufacturing enterprises. Deals where a wrong move resets a 9-month relationship. Built $25M+ in career revenue doing exactly that.

I know how enterprise decisions actually get made. How to navigate procurement, earn multi-stakeholder trust, and close in environments where urgency doesn't exist until you create it. Plus 7 apps in active development — I speak product as fluently as pipeline.

AI platforms. Data infrastructure. Cloud. AdTech. Entertainment tech. Companies that need a strategic seller who can walk into an industrial enterprise, speak their language, and close the deal nobody else could.`
  },
  {
    id: "skills", title: "Core Capabilities", weight: 0.15,
    content: `Enterprise Sales: Multi-stakeholder deal management, Long-cycle relationship mgmt, Executive-level engagement, Procurement navigation, Territory ownership

Strategic Partnerships: Channel & distributor programs, Partner ecosystem development, Co-sell motion design, Revenue share structuring, SI & ISV relationships

OT / Industrial Domain: SCADA & HMI platforms, PI System / OSIsoft, Industrial IoT & edge computing, AVEVA portfolio, Energy, water, manufacturing

AI & Data Literacy: LLM platforms (Claude, GPT-4), Data pipeline concepts, Supabase / pgvector, Next.js / React / TypeScript, 7 apps in active development

Business Development: Pipeline generation, Outbound motion design, Competitive positioning, Deal structuring & negotiation, Forecasting & CRM`
  },
  {
    id: "contact", title: "Contact / CTA", weight: 0.1,
    content: `If you're building something in AI, data infrastructure, cloud, or enterprise tech and need a strategic seller who can open doors in industrial markets — let's find 30 minutes. Book a call via Calendly.`
  },
];

const SAMPLE_ANALYTICS = {
  totalVisits: 120, uniqueVisitors: 93, calendlyClicks: 6,
  calendlyRate: 6.5, avgScrollDepth: 62, topSource: "LinkedIn (48%)", topDevice: "Desktop (58%)",
  sections: [
    { id: "experience", name: "Experience", scrollReach: 61, avgTimeSeconds: 83, dropoffPct: 39 },
    { id: "about",      name: "About",      scrollReach: 78, avgTimeSeconds: 47, dropoffPct: 22 },
    { id: "skills",     name: "Skills",     scrollReach: 44, avgTimeSeconds: 35, dropoffPct: 56 },
    { id: "contact",    name: "Contact",    scrollReach: 29, avgTimeSeconds: 22, dropoffPct: 71 },
  ],
};

// ─── SCORING ──────────────────────────────────────────────────────────────────
interface SectionScore {
  score: number; grade: string; issues: string[];
  data: { scrollReach: number; avgTimeSeconds: number; dropoffPct: number };
}

function scoreSection(section: ResumeSection, analytics: typeof SAMPLE_ANALYTICS): SectionScore {
  const data = analytics.sections.find(s => s.id === section.id);
  if (!data) return { score: 50, grade: "C", issues: [], data: { scrollReach: 50, avgTimeSeconds: 30, dropoffPct: 50 } };
  const scrollScore    = (data.scrollReach / 100) * 100;
  const timeScore      = Math.min((data.avgTimeSeconds / 90) * 100, 100);
  const calendlyProxy  = section.id === "contact" ? (analytics.calendlyRate / 15) * 100 : scrollScore * 0.5;
  const raw            = scrollScore * 0.4 + timeScore * 0.35 + calendlyProxy * 0.25;
  const score          = Math.round(raw);
  const grade          = score >= 80 ? "A" : score >= 65 ? "B" : score >= 50 ? "C" : "D";
  const issues: string[] = [];
  if (data.scrollReach < 50)    issues.push(`Only ${data.scrollReach}% of visitors reach this section`);
  if (data.avgTimeSeconds < 30) issues.push(`Avg read time is only ${data.avgTimeSeconds}s`);
  if (data.dropoffPct > 50)     issues.push(`${data.dropoffPct}% bounce immediately after`);
  if (section.id === "contact" && analytics.calendlyRate < 10) issues.push(`Calendly conversion is ${analytics.calendlyRate}%`);
  return { score, grade, issues, data };
}

// ─── UI HELPERS ───────────────────────────────────────────────────────────────
const gradeColor = (g: string) => g === "A" ? green : g === "B" ? navy : g === "C" ? amber : red;

const Badge = ({ label, color }: { label: string; color: string }) => (
  <span style={{ display: "inline-block", padding: "2px 8px", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, background: color + "18", color, border: `1px solid ${color}40` }}>
    {label}
  </span>
);

const ScoreRing = ({ score, grade }: { score: number; grade: string }) => {
  const color = gradeColor(grade);
  const r = 26, c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke={border}  strokeWidth="5" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={color}   strokeWidth="5"
          strokeDasharray={`${c * score / 100} ${c * (1 - score / 100)}`}
          strokeLinecap="butt" transform="rotate(-90 32 32)" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "Georgia,serif", fontSize: 16, fontWeight: 700, color, lineHeight: 1 }}>{grade}</div>
        <div style={{ fontSize: 9, color: muted, marginTop: 1 }}>{score}</div>
      </div>
    </div>
  );
};

const DiffView = ({ original, rewritten }: { original: string; rewritten: string }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: `1px solid ${border}`, fontSize: 12, lineHeight: 1.7 }}>
    <div style={{ padding: "16px 20px", background: "#FFF5F5", borderRight: `1px solid ${border}` }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: red, marginBottom: 12 }}>Before</div>
      <div style={{ color: "#666", whiteSpace: "pre-wrap" }}>{original}</div>
    </div>
    <div style={{ padding: "16px 20px", background: "#F0FFF4" }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: green, marginBottom: 12 }}>After (AI Rewrite)</div>
      <div style={{ color: "#2D2D2D", whiteSpace: "pre-wrap" }}>{rewritten}</div>
    </div>
  </div>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function PositioningPage() {
  const [targetRole,  setTargetRole]  = useState("");
  const [resume,      setResume]      = useState<{ sections: ResumeSection[]; id?: string }>({ sections: BASE_SECTIONS });
  const [analytics]                   = useState(SAMPLE_ANALYTICS);
  const [rewrites,    setRewrites]    = useState<Record<string, string>>({});
  const [loading,     setLoading]     = useState<Record<string, boolean>>({});
  const [expanded,    setExpanded]    = useState<Record<string, boolean>>({});
  const [accepted,    setAccepted]    = useState<Record<string, boolean>>({});
  const [optimizing,  setOptimizing]  = useState(false);
  const [ran,         setRan]         = useState(false);
  const [dbLoading,   setDbLoading]   = useState(true);

  // Load active resume version from Supabase
  useEffect(() => {
    getActiveResume().then(v => {
      if (v) setResume({ sections: v.sections, id: v.id });
    }).catch(() => {}).finally(() => setDbLoading(false));
  }, []);

  const scores = resume.sections.map(s => ({ ...s, scoreData: scoreSection(s, analytics) }));
  const overallScore = Math.round(scores.reduce((sum, s) => sum + s.scoreData.score * s.weight, 0) / scores.reduce((sum, s) => sum + s.weight, 0));
  const overallGrade = overallScore >= 80 ? "A" : overallScore >= 65 ? "B" : overallScore >= 50 ? "C" : "D";
  const needsRewrite = scores.filter(s => s.scoreData.grade === "C" || s.scoreData.grade === "D");

  async function rewriteSection(section: ResumeSection & { scoreData: SectionScore }) {
    if (!targetRole.trim()) return;
    setLoading(l => ({ ...l, [section.id]: true }));
    track.rewriteRan(section.title, targetRole);
    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, targetRole, analytics, scoreData: section.scoreData }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `API error ${res.status}`);
      }
      const text = data.text ?? data.rewrite ?? "";
      if (!text) {
        throw new Error("Claude returned an empty rewrite. Try again.");
      }
      setRewrites(r => ({ ...r, [section.id]: text }));
      setExpanded(e => ({ ...e, [section.id]: true }));
    } catch (err) {
      setRewrites(r => ({ ...r, [section.id]: `Error: ${err instanceof Error ? err.message : String(err)}` }));
    }
    setLoading(l => ({ ...l, [section.id]: false }));
  }

  async function rewriteAll() {
    if (!targetRole.trim()) return;
    setOptimizing(true);
    setRan(true);
    for (const s of needsRewrite) await rewriteSection(s);
    setOptimizing(false);
  }

  async function acceptRewrite(sectionId: string) {
    const newContent = rewrites[sectionId];
    if (!newContent) return;
    track.rewriteAccepted(sectionId);
    const newSections = resume.sections.map(s => s.id === sectionId ? { ...s, content: newContent } : s);
    setResume(r => ({ ...r, sections: newSections }));
    setAccepted(a => ({ ...a, [sectionId]: true }));
    setRewrites(rw => { const n = { ...rw }; delete n[sectionId]; return n; });
    // Persist to Supabase
    try {
      if (resume.id) {
        await updateResumeVersion(resume.id, { sections: newSections });
      } else {
        const saved = await saveResumeVersion({ version_name: `AI Rewrite — ${targetRole}`, sections: newSections, is_active: false });
        if (saved) setResume(r => ({ ...r, id: saved.id }));
      }
    } catch { /* non-blocking */ }
  }

  function rejectRewrite(sectionId: string) {
    track.rewriteRejected(sectionId);
    setRewrites(rw => { const n = { ...rw }; delete n[sectionId]; return n; });
    setExpanded(e => ({ ...e, [sectionId]: false }));
  }

  if (dbLoading) {
    return <div style={{ padding: 48, textAlign: "center", color: muted }}>Loading resume data…</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: offWhite, fontFamily: "'Open Sans', system-ui, sans-serif", fontSize: 14, color: navy }}>

      {/* PAGE HEADER */}
      <div style={{ background: navy, height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: white, letterSpacing: "-0.01em" }}>Positioning Optimizer</div>
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
              Paste in your target role, review section scores based on real visitor behavior, then let AI aggressively rewrite anything underperforming.
            </p>
          </div>
          <div style={{ background: white, border: `1px solid ${border}`, padding: "20px 24px", textAlign: "center", minWidth: 140 }}>
            <div style={{ fontSize: 11, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Overall Score</div>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 48, fontWeight: 700, color: gradeColor(overallGrade), lineHeight: 1 }}>{overallGrade}</div>
            <div style={{ fontSize: 13, color: muted, marginTop: 4 }}>{overallScore} / 100</div>
          </div>
        </div>

        {/* TARGET ROLE INPUT */}
        <div style={{ background: white, border: `1px solid ${border}`, padding: "24px 28px", marginBottom: 24, display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" as const }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: navy, marginBottom: 8 }}>Target Role</label>
            <input
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              placeholder="e.g. Director of Strategic Partnerships at Databricks"
              style={{ width: "100%", padding: "11px 14px", border: `1px solid ${border}`, fontSize: 13, color: navy, outline: "none", fontFamily: "inherit", background: offWhite }}
            />
            <div style={{ fontSize: 11, color: muted, marginTop: 6 }}>Company + role title gives the AI better rewrite context.</div>
          </div>
          <button
            onClick={rewriteAll}
            disabled={!targetRole.trim() || optimizing}
            style={{
              background: targetRole.trim() && !optimizing ? navy : border,
              color: targetRole.trim() && !optimizing ? white : muted,
              border: "none", cursor: targetRole.trim() && !optimizing ? "pointer" : "default",
              padding: "12px 24px", fontFamily: "inherit", fontWeight: 700, fontSize: 13,
              letterSpacing: "0.05em", textTransform: "uppercase" as const, whiteSpace: "nowrap" as const,
            }}
          >
            {optimizing ? "Optimizing…" : `⚡ Rewrite ${needsRewrite.length} Failing Section${needsRewrite.length !== 1 ? "s" : ""}`}
          </button>
        </div>

        {/* ANALYTICS SNAPSHOT */}
        <div style={{ background: white, border: `1px solid ${border}`, padding: "20px 28px", marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.09em", color: muted, marginBottom: 14 }}>Analytics Snapshot — Optimizing Against</div>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" as const }}>
            {[
              { label: "Unique Visitors",  val: analytics.uniqueVisitors },
              { label: "Calendly Rate",    val: `${analytics.calendlyRate}%` },
              { label: "Avg Scroll Depth", val: `${analytics.avgScrollDepth}%` },
              { label: "Top Source",       val: analytics.topSource },
              { label: "Top Device",       val: analytics.topDevice },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 11, color: muted, textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontFamily: "Georgia,serif", fontSize: 18, fontWeight: 700, color: navy }}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION CARDS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {scores.map(section => {
            const { scoreData } = section;
            const isExpanded  = expanded[section.id];
            const hasRewrite  = !!rewrites[section.id];
            const isLoading   = loading[section.id];
            const wasAccepted = accepted[section.id];

            return (
              <div key={section.id} style={{ background: white, border: `1px solid ${scoreData.grade === "D" ? red + "40" : scoreData.grade === "C" ? amber + "40" : border}` }}>

                <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 24px", borderBottom: isExpanded ? `1px solid ${border}` : "none" }}>
                  <ScoreRing score={scoreData.score} grade={scoreData.grade} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" as const }}>
                      <span style={{ fontFamily: "Georgia,serif", fontSize: 17, fontWeight: 700, color: navy }}>{section.title}</span>
                      {wasAccepted              && <Badge label="✓ Accepted" color={green} />}
                      {scoreData.grade === "D"  && <Badge label="Needs Rewrite" color={red} />}
                      {scoreData.grade === "C"  && <Badge label="Underperforming" color={amber} />}
                      {scoreData.grade === "B"  && <Badge label="Good" color={navy} />}
                      {scoreData.grade === "A"  && <Badge label="Top Performer" color={green} />}
                    </div>
                    <div style={{ display: "flex", gap: 20, fontSize: 12, color: muted, flexWrap: "wrap" as const }}>
                      <span>Scroll reach: <strong style={{ color: navy }}>{scoreData.data.scrollReach}%</strong></span>
                      <span>Avg time: <strong style={{ color: navy }}>{scoreData.data.avgTimeSeconds}s</strong></span>
                      <span>Drop-off: <strong style={{ color: scoreData.data.dropoffPct > 50 ? red : navy }}>{scoreData.data.dropoffPct}%</strong></span>
                    </div>
                    {scoreData.issues.length > 0 && (
                      <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" as const }}>
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
                        onClick={() => rewriteSection(section)}
                        disabled={!targetRole.trim() || isLoading}
                        style={{
                          background: targetRole.trim() && !isLoading ? navy : border,
                          color: targetRole.trim() && !isLoading ? white : muted,
                          border: "none", padding: "8px 16px", fontSize: 12,
                          cursor: targetRole.trim() && !isLoading ? "pointer" : "default",
                          fontFamily: "inherit", fontWeight: 700, letterSpacing: "0.04em",
                        }}>
                        {isLoading ? "Rewriting…" : "AI Rewrite →"}
                      </button>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ padding: "20px 24px" }}>
                    {!hasRewrite && !isLoading && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: muted, marginBottom: 10 }}>Current Content</div>
                        <div style={{ fontSize: 12, lineHeight: 1.75, color: navy, whiteSpace: "pre-wrap", background: offWhite, padding: "16px 18px", border: `1px solid ${border}` }}>
                          {section.content}
                        </div>
                      </div>
                    )}
                    {isLoading && (
                      <div style={{ padding: "32px", textAlign: "center", color: muted, fontSize: 13 }}>
                        <div style={{ fontSize: 24, marginBottom: 10 }}>⚡</div>
                        Claude is rewriting this section for <strong style={{ color: navy }}>{targetRole}</strong>…
                      </div>
                    )}
                    {hasRewrite && !isLoading && (
                      <div>
                        <DiffView original={section.content} rewritten={rewrites[section.id]} />
                        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                          <button onClick={() => acceptRewrite(section.id)}
                            style={{ background: green, color: white, border: "none", padding: "11px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                            ✓ Accept &amp; Apply
                          </button>
                          <button onClick={() => rewriteSection(section)}
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
          <div style={{ marginTop: 24, background: navy, padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 16 }}>
            <div>
              <div style={{ color: white, fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                {Object.keys(accepted).length} section{Object.keys(accepted).length > 1 ? "s" : ""} rewritten for <em>{targetRole}</em>
              </div>
              <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>Changes saved to Supabase. Copy full text for your resume doc.</div>
            </div>
            <button
              onClick={() => {
                const out = resume.sections.map(s => `=== ${s.title} ===\n\n${s.content}`).join("\n\n\n");
                navigator.clipboard.writeText(out);
              }}
              style={{ background: white, color: navy, border: "none", padding: "12px 24px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              Copy Full Resume to Clipboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
