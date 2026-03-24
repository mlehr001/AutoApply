"use client";

import { useState, useEffect } from "react";
import { getJobs, upsertJobs, updateJobStatus } from "@/lib/supabase";
import { track } from "@/lib/posthog";
import type { Job, JobScoreResult } from "@/types";

const navy = "#2C3E50", navyL = "#34495E", offWhite = "#F5F5F3",
  white = "#FFFFFF", border = "#E5E2DD", muted = "#888",
  green = "#27AE60", amber = "#F39C12", red = "#E74C3C", blue = "#2980B9";

// ─── SAMPLE JOBS ──────────────────────────────────────────────────────────────
const SAMPLE_JOBS = [
  { id: "1",  title: "Director, Strategic Partnerships",        company: "Databricks",         location: "Remote",               source: "LinkedIn",    url: "#", tags: ["AI","Data","Partnerships"], external_id: "sample-1" },
  { id: "2",  title: "Enterprise Sales Director — AI Platform", company: "Anthropic",          location: "San Francisco / Remote",source: "Greenhouse",  url: "#", tags: ["AI","Enterprise","Sales"],  external_id: "sample-2" },
  { id: "3",  title: "VP Business Development",                 company: "Palantir",           location: "Remote",               source: "Lever",       url: "#", tags: ["Data","BD","Enterprise"],   external_id: "sample-3" },
  { id: "4",  title: "Strategic Partnerships Manager",          company: "Snowflake",          location: "Remote",               source: "Indeed",      url: "#", tags: ["Cloud","Data","Partnerships"],external_id: "sample-4" },
  { id: "5",  title: "Sr. Enterprise AE — Industrial IoT",      company: "PTC",                location: "Los Angeles, CA",      source: "LinkedIn",    url: "#", tags: ["IoT","OT","Enterprise"],    external_id: "sample-5" },
  { id: "6",  title: "Channel Sales Director",                  company: "Palo Alto Networks", location: "Remote",               source: "Google Jobs", url: "#", tags: ["Channel","Sales","Security"],external_id: "sample-6" },
  { id: "7",  title: "Head of Partnerships — AdTech",           company: "The Trade Desk",     location: "Ventura, CA",          source: "LinkedIn",    url: "#", tags: ["AdTech","Partnerships","BD"],external_id: "sample-7" },
  { id: "8",  title: "Enterprise BD Manager",                   company: "Cohere",             location: "Remote",               source: "Greenhouse",  url: "#", tags: ["AI","LLM","BD"],            external_id: "sample-8" },
  { id: "9",  title: "Senior AE — Data Infrastructure",         company: "Confluent",          location: "Remote",               source: "Lever",       url: "#", tags: ["Data","Cloud","Sales"],     external_id: "sample-9" },
  { id: "10", title: "Partnerships Lead — Industrial AI",       company: "Sight Machine",      location: "Remote",               source: "Google Jobs", url: "#", tags: ["Industrial","AI","OT"],    external_id: "sample-10" },
  { id: "11", title: "Regional Sales Manager",                  company: "OSIsoft / AVEVA",    location: "Southern California",  source: "Indeed",      url: "#", tags: ["SCADA","PI System","OT"],   external_id: "sample-11" },
  { id: "12", title: "Director of Sales — Entertainment Tech",  company: "Endeavor",           location: "Los Angeles, CA",      source: "LinkedIn",    url: "#", tags: ["Entertainment","Sales","Tech"],external_id: "sample-12" },
  { id: "13", title: "Strategic Alliances Manager",             company: "AWS",                location: "Remote",               source: "LinkedIn",    url: "#", tags: ["Cloud","Alliances","AWS"],  external_id: "sample-13" },
  { id: "14", title: "Inside Sales Representative",             company: "Generic SaaS Co",    location: "Remote",               source: "Indeed",      url: "#", tags: ["SaaS","Sales"],            external_id: "sample-14" },
  { id: "15", title: "Enterprise Partnerships — AI/ML",         company: "Scale AI",           location: "Remote",               source: "Google Jobs", url: "#", tags: ["AI","ML","Partnerships"],  external_id: "sample-15" },
];

const APPLIED_DEFAULTS = [
  { title: "Director of Strategic Partnerships", company: "Snowflake",  date: "2026-02-10", status: "Applied"      },
  { title: "Enterprise Account Executive",        company: "Databricks", date: "2026-02-18", status: "Phone Screen" },
  { title: "Sr. Business Development Manager",    company: "Palantir",   date: "2026-03-01", status: "Applied"      },
  { title: "Strategic Partnerships Manager",      company: "Scale AI",   date: "2026-03-08", status: "Applied"      },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const sourceColor = (s: string): string => (({
  LinkedIn: "#0077B5", Indeed: "#003A9B", Greenhouse: "#27AE60",
  Lever: "#7B68EE", "Google Jobs": "#EA4335",
} as Record<string, string>)[s] ?? navy);

const scoreColor = (s: number) => s >= 85 ? green : s >= 70 ? navy : s >= 55 ? amber : red;
const scoreLabel = (s: number) => s >= 85 ? "Strong Match" : s >= 70 ? "Good Match" : s >= 55 ? "Partial Match" : "Weak Match";

const Pill = ({ label, color = navy }: { label: string; color?: string }) => (
  <span style={{ display: "inline-block", padding: "2px 8px", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, background: color + "18", color, border: `1px solid ${color}30`, marginRight: 5, marginBottom: 4 }}>
    {label}
  </span>
);

const ScoreBar = ({ score }: { score: number }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{ flex: 1, height: 6, background: offWhite, border: `1px solid ${border}` }}>
      <div style={{ height: "100%", width: `${score}%`, background: scoreColor(score), transition: "width 0.6s ease" }} />
    </div>
    <div style={{ fontSize: 13, fontWeight: 700, color: scoreColor(score), minWidth: 32 }}>{score}</div>
  </div>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────
type ScoredJob = typeof SAMPLE_JOBS[0] & { score: number; matchLabel: string; reasons: string[]; redFlags: string[]; applyUrgency: string; status?: string };

export default function OpportunitiesPage() {
  const [keywords,     setKeywords]     = useState("Strategic Partnerships, AI, Enterprise Sales, Business Development");
  const [starred,      setStarred]      = useState(["Databricks", "Anthropic", "Snowflake", "The Trade Desk"]);
  const [starInput,    setStarInput]    = useState("");
  const [appliedJobs,  setAppliedJobs]  = useState(APPLIED_DEFAULTS);
  const [results,      setResults]      = useState<ScoredJob[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [expanded,     setExpanded]     = useState<string | null>(null);
  const [ran,          setRan]          = useState(false);
  const [filter,       setFilter]       = useState("All");
  const [savedJobs,    setSavedJobs]    = useState<string[]>([]);
  const [sourceFilter, setSourceFilter] = useState("All");

  // Load saved/applied jobs from Supabase to pre-populate applied history
  useEffect(() => {
    getJobs("Applied").then(jobs => {
      if (jobs.length > 0) {
        setAppliedJobs(jobs.map(j => ({
          title: j.title, company: j.company,
          date: j.created_at.split("T")[0], status: j.status,
        })));
      }
    }).catch(() => {});
  }, []);

  const sources      = ["All", "LinkedIn", "Indeed", "Greenhouse", "Lever", "Google Jobs"];
  const matchFilters = ["All", "Strong Match", "Good Match", "Partial Match"];

  async function runMatcher() {
    setLoading(true);
    setRan(true);
    setResults([]);
    const batches: typeof SAMPLE_JOBS[] = [];
    for (let i = 0; i < SAMPLE_JOBS.length; i += 5) batches.push(SAMPLE_JOBS.slice(i, i + 5) as typeof SAMPLE_JOBS);

    const allResults: JobScoreResult[] = [];

    for (const batch of batches) {
      try {
        const res = await fetch("/api/score-jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobs: batch, keywords, starred, appliedJobs }),
        });
        const data = await res.json();
        if (data.scores) allResults.push(...data.scores);
      } catch {
        batch.forEach(j => allResults.push({
          id: j.id, score: Math.floor(Math.random() * 40 + 40),
          matchLabel: "Partial Match", reasons: ["API unavailable — sample score"],
          redFlags: [], applyUrgency: "Medium",
        }));
      }
    }

    const merged = SAMPLE_JOBS.map(job => {
      const scored = allResults.find(r => String(r.id) === String(job.id));
      return {
        ...job,
        score:        scored?.score        ?? 50,
        matchLabel:   scored?.matchLabel   ?? "Partial Match",
        reasons:      scored?.reasons      ?? [],
        redFlags:     scored?.redFlags     ?? [],
        applyUrgency: scored?.applyUrgency ?? "Medium",
      } as ScoredJob;
    }).sort((a, b) => b.score - a.score);

    setResults(merged);
    track.jobsScored(merged.length);

    // Upsert scored jobs into Supabase
    try {
      await upsertJobs(merged.map(j => ({
        external_id:   j.external_id,
        title:         j.title,
        company:       j.company,
        location:      j.location,
        source:        j.source,
        url:           j.url,
        tags:          j.tags,
        score:         j.score,
        match_label:   j.matchLabel,
        reasons:       j.reasons,
        red_flags:     j.redFlags,
        apply_urgency: j.applyUrgency,
        status:        "New" as const,
        scored_at:     new Date().toISOString(),
      })));
    } catch { /* non-blocking */ }

    setLoading(false);
  }

  async function handleSave(jobId: string, job: ScoredJob) {
    const isSaved = savedJobs.includes(jobId);
    setSavedJobs(p => isSaved ? p.filter(x => x !== jobId) : [...p, jobId]);
    if (!isSaved) {
      track.jobSaved(job.company);
      try { await updateJobStatus(jobId, "Saved"); } catch { /* non-blocking */ }
    }
  }

  const filtered = results.filter(j => {
    const matchOk = filter === "All" || j.matchLabel === filter;
    const srcOk   = sourceFilter === "All" || j.source === sourceFilter;
    return matchOk && srcOk;
  });

  const strongCount = results.filter(j => j.score >= 85).length;
  const goodCount   = results.filter(j => j.score >= 70 && j.score < 85).length;
  const appliedSet  = new Set(appliedJobs.map(j => j.company));

  return (
    <div style={{ minHeight: "100vh", background: offWhite, fontFamily: "'Open Sans',system-ui,sans-serif", fontSize: 14, color: navy }}>

      {/* PAGE HEADER */}
      <div style={{ background: navy, height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: white, letterSpacing: "-0.01em" }}>AI Job Matcher</div>
        {ran && !loading && (
          <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
            <span style={{ color: green, fontWeight: 700 }}>{strongCount} Strong</span>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>·</span>
            <span style={{ color: "rgba(255,255,255,0.7)" }}>{goodCount} Good</span>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>·</span>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>{results.length} scored</span>
          </div>
        )}
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "Georgia,serif", fontSize: 26, fontWeight: 700, color: navy, marginBottom: 6 }}>AI Job Matcher</h1>
          <p style={{ fontSize: 13, color: muted, lineHeight: 1.6 }}>
            Claude scores every job against your resume, applied history, starred companies, and keywords — then ranks them so you apply where it counts.
          </p>
        </div>

        {/* INPUTS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>

          <div style={{ background: white, border: `1px solid ${border}`, padding: "20px" }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: navy, marginBottom: 8 }}>Keywords</label>
            <textarea
              value={keywords}
              onChange={e => setKeywords(e.target.value)}
              rows={3}
              style={{ width: "100%", padding: "10px 12px", border: `1px solid ${border}`, fontSize: 12, color: navy, outline: "none", fontFamily: "inherit", background: offWhite, resize: "vertical", lineHeight: 1.6 }}
            />
            <div style={{ fontSize: 11, color: muted, marginTop: 6 }}>Comma-separated terms you want weighted.</div>
          </div>

          <div style={{ background: white, border: `1px solid ${border}`, padding: "20px" }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: navy, marginBottom: 8 }}>Starred Companies</label>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginBottom: 10, minHeight: 32 }}>
              {starred.map(s => (
                <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: navy + "12", border: `1px solid ${border}`, padding: "3px 8px", fontSize: 11, color: navy }}>
                  ★ {s}
                  <button onClick={() => setStarred(p => p.filter(x => x !== s))} style={{ background: "none", border: "none", cursor: "pointer", color: muted, fontSize: 13, padding: 0 }}>×</button>
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={starInput} onChange={e => setStarInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && starInput.trim()) { setStarred(p => [...p, starInput.trim()]); setStarInput(""); }}}
                placeholder="Add company + Enter"
                style={{ flex: 1, padding: "8px 10px", border: `1px solid ${border}`, fontSize: 12, color: navy, outline: "none", fontFamily: "inherit", background: offWhite }} />
            </div>
            <div style={{ fontSize: 11, color: muted, marginTop: 6 }}>Starred companies get a score bonus.</div>
          </div>

          <div style={{ background: white, border: `1px solid ${border}`, padding: "20px" }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: navy, marginBottom: 8 }}>Applied History</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {appliedJobs.slice(0, 4).map((j, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, padding: "5px 0", borderBottom: `1px solid ${border}` }}>
                  <span style={{ color: navy, fontWeight: 600, flex: 1 }}>{j.title}</span>
                  <span style={{ color: muted, marginLeft: 8 }}>{j.company}</span>
                  <span style={{ marginLeft: 10, padding: "2px 6px", fontSize: 10, background: j.status === "Phone Screen" ? green + "15" : offWhite, color: j.status === "Phone Screen" ? green : muted, border: `1px solid ${border}` }}>{j.status}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: muted, marginTop: 8 }}>Patterns from these roles influence scoring.</div>
          </div>
        </div>

        {/* RUN BUTTON */}
        <button
          onClick={runMatcher}
          disabled={loading}
          style={{ width: "100%", background: loading ? border : navy, color: loading ? muted : white, border: "none", padding: "16px", fontSize: 14, fontWeight: 800, cursor: loading ? "default" : "pointer", fontFamily: "inherit", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 28 }}>
          {loading ? "⚡ Claude is scoring all jobs…" : ran ? "↺ Re-Score with Updated Preferences" : "⚡ Score & Rank All Jobs"}
        </button>

        {/* LOADING */}
        {loading && (
          <div style={{ background: white, border: `1px solid ${border}`, padding: "48px", textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>⚡</div>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 18, color: navy, marginBottom: 8 }}>Scoring {SAMPLE_JOBS.length} jobs…</div>
            <div style={{ fontSize: 13, color: muted }}>Claude is reading your resume, applied history, and starred companies to rank every role.</div>
          </div>
        )}

        {/* RESULTS */}
        {!loading && results.length > 0 && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" as const, alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                {matchFilters.map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{ padding: "7px 14px", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" as const, border: `1px solid ${filter === f ? navy : border}`, background: filter === f ? navy : white, color: filter === f ? white : muted, cursor: "pointer", fontFamily: "inherit" }}>
                    {f}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                {sources.map(s => (
                  <button key={s} onClick={() => setSourceFilter(s)} style={{ padding: "7px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", border: `1px solid ${sourceFilter === s ? sourceColor(s) : border}`, background: sourceFilter === s ? sourceColor(s) + "15" : white, color: sourceFilter === s ? sourceColor(s) : muted, cursor: "pointer", fontFamily: "inherit" }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map((job, idx) => {
                const isExp      = expanded === job.id;
                const isSaved    = savedJobs.includes(job.id);
                const wasApplied = appliedSet.has(job.company);
                const isStarred  = starred.includes(job.company);

                return (
                  <div key={job.id} style={{ background: white, border: `1px solid ${job.score >= 85 ? green + "40" : border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 22px", cursor: "pointer" }}
                      onClick={() => setExpanded(isExp ? null : job.id)}>
                      <div style={{ fontFamily: "Georgia,serif", fontSize: 20, fontWeight: 700, color: border, minWidth: 28, textAlign: "center" }}>
                        {String(idx + 1).padStart(2, "0")}
                      </div>
                      <div style={{ minWidth: 52, textAlign: "center" }}>
                        <div style={{ fontFamily: "Georgia,serif", fontSize: 22, fontWeight: 700, color: scoreColor(job.score), lineHeight: 1 }}>{job.score}</div>
                        <div style={{ fontSize: 9, color: muted, textTransform: "uppercase" as const, letterSpacing: "0.05em", marginTop: 2 }}>score</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const, marginBottom: 4 }}>
                          <span style={{ fontFamily: "Georgia,serif", fontSize: 16, fontWeight: 700, color: navy }}>{job.title}</span>
                          {isStarred  && <span style={{ color: amber, fontSize: 13 }}>★</span>}
                          {wasApplied && <Pill label="Applied" color={blue} />}
                        </div>
                        <div style={{ display: "flex", gap: 12, fontSize: 12, color: muted, flexWrap: "wrap" as const }}>
                          <span style={{ fontWeight: 600, color: navyL }}>{job.company}</span>
                          <span>{job.location}</span>
                          <span style={{ color: sourceColor(job.source), fontWeight: 600 }}>{job.source}</span>
                        </div>
                        <div style={{ marginTop: 6, display: "flex", gap: 4, flexWrap: "wrap" as const }}>
                          {job.tags?.map(t => <Pill key={t} label={t} />)}
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                        <div style={{ minWidth: 120 }}>
                          <ScoreBar score={job.score} />
                          <div style={{ fontSize: 10, color: scoreColor(job.score), fontWeight: 700, textAlign: "right", marginTop: 3 }}>{scoreLabel(job.score)}</div>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={e => { e.stopPropagation(); handleSave(job.id, job); }}
                            style={{ padding: "5px 10px", fontSize: 11, border: `1px solid ${border}`, background: isSaved ? navy : white, color: isSaved ? white : muted, cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>
                            {isSaved ? "✓ Saved" : "Save"}
                          </button>
                          <a href={job.url} target="_blank" rel="noreferrer" onClick={e => { e.stopPropagation(); track.jobApplied(job.company, job.score); }}
                            style={{ padding: "5px 10px", fontSize: 11, background: job.applyUrgency === "High" ? green : navy, color: white, textDecoration: "none", fontWeight: 700, letterSpacing: "0.04em", display: "inline-block" }}>
                            Apply {job.applyUrgency === "High" ? "↑" : "→"}
                          </a>
                        </div>
                      </div>
                    </div>

                    {isExp && (
                      <div style={{ borderTop: `1px solid ${border}`, padding: "20px 22px", background: offWhite, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: green, marginBottom: 10 }}>Why It Matches</div>
                          {job.reasons?.map((r, i) => (
                            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, fontSize: 12, color: navy }}>
                              <span style={{ color: green, flexShrink: 0 }}>✓</span>{r}
                            </div>
                          ))}
                        </div>
                        <div>
                          {job.redFlags?.length > 0 && (
                            <>
                              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: amber, marginBottom: 10 }}>Watch Out For</div>
                              {job.redFlags.map((f, i) => (
                                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, fontSize: 12, color: navy }}>
                                  <span style={{ color: amber, flexShrink: 0 }}>⚠</span>{f}
                                </div>
                              ))}
                            </>
                          )}
                          <div style={{ marginTop: job.redFlags?.length ? 16 : 0 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: muted, marginBottom: 8 }}>Apply Urgency</div>
                            <span style={{ padding: "4px 12px", fontSize: 12, fontWeight: 700, background: job.applyUrgency === "High" ? green + "20" : job.applyUrgency === "Medium" ? amber + "20" : border, color: job.applyUrgency === "High" ? green : job.applyUrgency === "Medium" ? amber : muted, border: `1px solid ${job.applyUrgency === "High" ? green : job.applyUrgency === "Medium" ? amber : border}` }}>
                              {job.applyUrgency} Priority
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {savedJobs.length > 0 && (
              <div style={{ marginTop: 24, background: navy, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ color: white, fontWeight: 700 }}>{savedJobs.length} job{savedJobs.length > 1 ? "s" : ""} saved to your pipeline</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>Open each one and apply — your top matches are waiting.</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
