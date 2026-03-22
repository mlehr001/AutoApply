import { useState, useEffect } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const navy    = "#2C3E50";
const navyL   = "#34495E";
const offWhite= "#F5F5F3";
const white   = "#FFFFFF";
const border  = "#E5E2DD";
const muted   = "#888";
const green   = "#27AE60";
const amber   = "#F39C12";
const red     = "#E74C3C";
const blue    = "#2980B9";

// ─── YOUR RESUME SNAPSHOT (same source of truth as living resume) ─────────────
const MY_RESUME = `
NAME: Marc Lehrmann
TITLE: Strategic Partnerships / Business Development / Enterprise Sales
LOCATION: Southern California — open to remote & hybrid
CAREER REVENUE: $25M+
YEARS EXPERIENCE: 10+

EXPERIENCE:
- Assistant Sales Manager, AVEVA Select CA (2018–Present): California-exclusive distributor for AVEVA industrial software suite — SCADA, HMI, PI System, IIoT. Enterprise and municipal accounts across energy, water, manufacturing. Complex multi-stakeholder procurement cycles. Executive, operations, and IT-level trust building.
- Key Account Manager, Dexxxon Digital Storage (2020–2021): Flash memory and LTO-Tape digital storage brands. Account expansion, strategic initiatives, negotiation, long-term partnerships.
- Channel Account Manager, Transcend Information (2014–2020): Ingram Micro and Synnex partnerships. $3M annual revenue. 30% YoY growth. 100% YoY growth for Apple embedded solutions and military-grade body cameras. 200+ reseller network.

SKILLS: Enterprise Sales, Strategic Partnerships, Channel Development, SCADA, HMI, PI System, Industrial IoT, AVEVA, OT/IT convergence, CRM, Negotiation, Solution Selling, AI literacy, Next.js, React, TypeScript, Supabase, Claude API, Product Development

EDUCATION: BA Economics, UC Riverside 2012

POSITIONING: "OT to AI bridge" — 10 years selling to industrial enterprises, now targeting AI platforms, data infrastructure, cloud, AdTech, entertainment tech. Builder of 7 apps. Speaks product and pipeline.
`;

// ─── SAMPLE APPLIED JOBS (user's history — drives preference learning) ────────
const APPLIED_JOBS_DEFAULT = [
  { title: "Director of Strategic Partnerships", company: "Snowflake", date: "2026-02-10", status: "Applied" },
  { title: "Enterprise Account Executive", company: "Databricks", date: "2026-02-18", status: "Phone Screen" },
  { title: "Sr. Business Development Manager", company: "Palantir", date: "2026-03-01", status: "Applied" },
  { title: "Strategic Partnerships Manager", company: "Scale AI", date: "2026-03-08", status: "Applied" },
];

// ─── SAMPLE JOB LISTINGS (real API calls replace this in production) ──────────
// In production: fetch from Adzuna API, Greenhouse/Lever open boards, SerpAPI Google Jobs
const SAMPLE_JOBS = [
  { id: 1,  title: "Director, Strategic Partnerships",         company: "Databricks",        location: "Remote",              source: "LinkedIn",    url: "#", tags: ["AI", "Data", "Partnerships"] },
  { id: 2,  title: "Enterprise Sales Director — AI Platform",  company: "Anthropic",         location: "San Francisco / Remote", source: "Greenhouse", url: "#", tags: ["AI", "Enterprise", "Sales"] },
  { id: 3,  title: "VP Business Development",                  company: "Palantir",          location: "Remote",              source: "Lever",       url: "#", tags: ["Data", "BD", "Enterprise"] },
  { id: 4,  title: "Strategic Partnerships Manager",           company: "Snowflake",         location: "Remote",              source: "Indeed",      url: "#", tags: ["Cloud", "Data", "Partnerships"] },
  { id: 5,  title: "Sr. Enterprise AE — Industrial IoT",       company: "PTC",               location: "Los Angeles, CA",     source: "LinkedIn",    url: "#", tags: ["IoT", "OT", "Enterprise"] },
  { id: 6,  title: "Channel Sales Director",                   company: "Palo Alto Networks", location: "Remote",             source: "Google Jobs", url: "#", tags: ["Channel", "Sales", "Cybersecurity"] },
  { id: 7,  title: "Head of Partnerships — AdTech",            company: "The Trade Desk",    location: "Ventura, CA",         source: "LinkedIn",    url: "#", tags: ["AdTech", "Partnerships", "BD"] },
  { id: 8,  title: "Enterprise BD Manager",                    company: "Cohere",            location: "Remote",              source: "Greenhouse",  url: "#", tags: ["AI", "LLM", "BD"] },
  { id: 9,  title: "Senior AE — Data Infrastructure",          company: "Confluent",         location: "Remote",              source: "Lever",       url: "#", tags: ["Data", "Cloud", "Sales"] },
  { id: 10, title: "Partnerships Lead — Industrial AI",        company: "Sight Machine",     location: "Remote",              source: "Google Jobs", url: "#", tags: ["Industrial", "AI", "OT"] },
  { id: 11, title: "Regional Sales Manager",                   company: "OSIsoft / AVEVA",   location: "Southern California", source: "Indeed",      url: "#", tags: ["SCADA", "PI System", "OT"] },
  { id: 12, title: "Director of Sales — Entertainment Tech",   company: "Endeavor",          location: "Los Angeles, CA",     source: "LinkedIn",    url: "#", tags: ["Entertainment", "Sales", "Tech"] },
  { id: 13, title: "Strategic Alliances Manager",              company: "AWS",               location: "Remote",              source: "LinkedIn",    url: "#", tags: ["Cloud", "Alliances", "AWS"] },
  { id: 14, title: "Inside Sales Representative",              company: "Generic SaaS Co",   location: "Remote",              source: "Indeed",      url: "#", tags: ["SaaS", "Sales"] },
  { id: 15, title: "Enterprise Partnerships — AI/ML",          company: "Scale AI",          location: "Remote",              source: "Google Jobs", url: "#", tags: ["AI", "ML", "Partnerships"] },
];

// ─── SOURCE COLORS ────────────────────────────────────────────────────────────
const sourceColor = s => ({
  "LinkedIn": "#0077B5", "Indeed": "#003A9B",
  "Greenhouse": "#27AE60", "Lever": "#7B68EE",
  "Google Jobs": "#EA4335",
}[s] || navy);

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const scoreColor = s => s >= 85 ? green : s >= 70 ? navy : s >= 55 ? amber : red;
const scoreLabel = s => s >= 85 ? "Strong Match" : s >= 70 ? "Good Match" : s >= 55 ? "Partial Match" : "Weak Match";

const Pill = ({ label, color = navy }) => (
  <span style={{ display:"inline-block", padding:"2px 8px", fontSize:10, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", background: color+"18", color, border:`1px solid ${color}30`, marginRight:5, marginBottom:4 }}>
    {label}
  </span>
);

const ScoreBar = ({ score }) => (
  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
    <div style={{ flex:1, height:6, background:offWhite, border:`1px solid ${border}` }}>
      <div style={{ height:"100%", width:`${score}%`, background: scoreColor(score), transition:"width 0.6s ease" }} />
    </div>
    <div style={{ fontSize:13, fontWeight:700, color: scoreColor(score), minWidth:32 }}>{score}</div>
  </div>
);

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function JobMatcher() {
  const [keywords, setKeywords]       = useState("Strategic Partnerships, AI, Enterprise Sales, Business Development");
  const [starred, setStarred]         = useState(["Databricks", "Anthropic", "Snowflake", "The Trade Desk"]);
  const [starInput, setStarInput]     = useState("");
  const [appliedJobs]                 = useState(APPLIED_JOBS_DEFAULT);
  const [results, setResults]         = useState([]);
  const [loading, setLoading]         = useState(false);
  const [expanded, setExpanded]       = useState(null);
  const [ran, setRan]                 = useState(false);
  const [filter, setFilter]           = useState("All");
  const [savedJobs, setSavedJobs]     = useState([]);
  const [sourceFilter, setSourceFilter] = useState("All");

  const sources = ["All", "LinkedIn", "Indeed", "Greenhouse", "Lever", "Google Jobs"];
  const matchFilters = ["All", "Strong Match", "Good Match", "Partial Match"];

  async function runMatcher() {
    setLoading(true);
    setRan(true);
    setResults([]);

    const appliedTitles = appliedJobs.map(j => `${j.title} at ${j.company}`).join(", ");
    const starredStr    = starred.join(", ");

    // Score all jobs in parallel batches of 5
    const batches = [];
    for (let i = 0; i < SAMPLE_JOBS.length; i += 5) batches.push(SAMPLE_JOBS.slice(i, i + 5));

    const allResults = [];

    for (const batch of batches) {
      const prompt = `You are a job match scoring engine. Score each job listing for the candidate below and return ONLY valid JSON — no preamble, no markdown, no explanation.

CANDIDATE RESUME:
${MY_RESUME}

PREVIOUSLY APPLIED ROLES (learn preference patterns from these):
${appliedTitles}

STARRED COMPANIES (candidate is especially interested in these):
${starredStr}

MANUAL KEYWORDS (candidate specifically wants these):
${keywords}

JOBS TO SCORE:
${batch.map(j => `ID:${j.id} | "${j.title}" at ${j.company} | ${j.location} | Tags: ${j.tags.join(", ")}`).join("\n")}

For each job return a JSON array with objects containing:
- id (number, match the ID above)
- score (0-100 integer)
- matchLabel ("Strong Match" | "Good Match" | "Partial Match" | "Weak Match")  
- reasons (array of 2-3 short strings explaining the score, each under 12 words)
- redFlags (array of 0-2 short strings flagging any concerns, each under 10 words)
- applyUrgency ("High" | "Medium" | "Low")

Scoring criteria:
- Title alignment with candidate's seniority and focus: 30pts
- Industry/domain match (AI, data, OT, partnerships, channel): 25pts  
- Company match (starred companies get +10 bonus): 15pts
- Keyword match with resume skills: 15pts
- Pattern match with previously applied roles: 15pts

Return ONLY the JSON array. No other text.`;

      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [{ role: "user", content: prompt }]
          })
        });
        const data = await res.json();
        const text = data.content?.find(b => b.type === "text")?.text || "[]";
        const clean = text.replace(/```json|```/g, "").trim();
        const scored = JSON.parse(clean);
        allResults.push(...scored);
      } catch (e) {
        // Fallback scores if API fails
        batch.forEach(j => allResults.push({
          id: j.id, score: Math.floor(Math.random() * 40 + 40),
          matchLabel: "Partial Match", reasons: ["API unavailable — sample score"],
          redFlags: [], applyUrgency: "Medium"
        }));
      }
    }

    // Merge scores back into job objects and sort
    const merged = SAMPLE_JOBS.map(job => {
      const scored = allResults.find(r => r.id === job.id);
      return { ...job, ...(scored || { score: 50, matchLabel: "Partial Match", reasons: [], redFlags: [], applyUrgency: "Medium" }) };
    }).sort((a, b) => b.score - a.score);

    setResults(merged);
    setLoading(false);
  }

  const filtered = results.filter(j => {
    const matchOk = filter === "All" || j.matchLabel === filter;
    const srcOk   = sourceFilter === "All" || j.source === sourceFilter;
    return matchOk && srcOk;
  });

  const strongCount  = results.filter(j => j.score >= 85).length;
  const goodCount    = results.filter(j => j.score >= 70 && j.score < 85).length;
  const appliedIds   = new Set(appliedJobs.map(j => j.company));

  return (
    <div style={{ minHeight:"100vh", background:offWhite, fontFamily:"'Open Sans',system-ui,sans-serif", fontSize:14, color:navy }}>

      {/* NAV */}
      <div style={{ background:navy, height:56, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 32px", borderBottom:"2px solid rgba(255,255,255,0.1)" }}>
        <div style={{ fontWeight:800, fontSize:15, color:white, letterSpacing:"-0.01em" }}>
          Marc Lehrmann <span style={{ opacity:0.4, fontWeight:300 }}>/</span> <span style={{ opacity:0.7, fontWeight:400, fontSize:13 }}>Job Matcher</span>
        </div>
        {ran && !loading && (
          <div style={{ display:"flex", gap:16, fontSize:12 }}>
            <span style={{ color:green, fontWeight:700 }}>{strongCount} Strong</span>
            <span style={{ color:"rgba(255,255,255,0.5)" }}>·</span>
            <span style={{ color:"rgba(255,255,255,0.7)" }}>{goodCount} Good</span>
            <span style={{ color:"rgba(255,255,255,0.5)" }}>·</span>
            <span style={{ color:"rgba(255,255,255,0.5)" }}>{results.length} total scored</span>
          </div>
        )}
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"32px 24px" }}>

        {/* HEADER */}
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:26, fontWeight:700, color:navy, marginBottom:6 }}>AI Job Matcher</h1>
          <p style={{ fontSize:13, color:muted, lineHeight:1.6 }}>
            Claude scores every job against your resume, applied history, starred companies, and keywords — then ranks them so you apply where it counts.
          </p>
        </div>

        {/* INPUTS */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:20 }}>

          {/* Keywords */}
          <div style={{ background:white, border:`1px solid ${border}`, padding:"20px 20px" }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:navy, marginBottom:8 }}>Keywords</label>
            <textarea
              value={keywords}
              onChange={e => setKeywords(e.target.value)}
              rows={3}
              style={{ width:"100%", padding:"10px 12px", border:`1px solid ${border}`, fontSize:12, color:navy, outline:"none", fontFamily:"inherit", background:offWhite, resize:"vertical", lineHeight:1.6 }}
            />
            <div style={{ fontSize:11, color:muted, marginTop:6 }}>Comma-separated terms you want weighted.</div>
          </div>

          {/* Starred companies */}
          <div style={{ background:white, border:`1px solid ${border}`, padding:"20px 20px" }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:navy, marginBottom:8 }}>Starred Companies</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10, minHeight:32 }}>
              {starred.map(s => (
                <span key={s} style={{ display:"inline-flex", alignItems:"center", gap:5, background:navy+"12", border:`1px solid ${border}`, padding:"3px 8px", fontSize:11, color:navy }}>
                  ★ {s}
                  <button onClick={() => setStarred(prev => prev.filter(x => x !== s))} style={{ background:"none", border:"none", cursor:"pointer", color:muted, fontSize:13, padding:0, lineHeight:1 }}>×</button>
                </span>
              ))}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <input value={starInput} onChange={e => setStarInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && starInput.trim()) { setStarred(p => [...p, starInput.trim()]); setStarInput(""); }}}
                placeholder="Add company + Enter"
                style={{ flex:1, padding:"8px 10px", border:`1px solid ${border}`, fontSize:12, color:navy, outline:"none", fontFamily:"inherit", background:offWhite }} />
            </div>
            <div style={{ fontSize:11, color:muted, marginTop:6 }}>Starred companies get a score bonus.</div>
          </div>

          {/* Applied history */}
          <div style={{ background:white, border:`1px solid ${border}`, padding:"20px 20px" }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:navy, marginBottom:8 }}>Applied History</label>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {appliedJobs.map((j, i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:11, padding:"5px 0", borderBottom:`1px solid ${border}` }}>
                  <span style={{ color:navy, fontWeight:600, flex:1 }}>{j.title}</span>
                  <span style={{ color:muted, marginLeft:8 }}>{j.company}</span>
                  <span style={{ marginLeft:10, padding:"2px 6px", fontSize:10, background: j.status === "Phone Screen" ? green+"15" : offWhite, color: j.status === "Phone Screen" ? green : muted, border:`1px solid ${border}` }}>{j.status}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize:11, color:muted, marginTop:8 }}>Patterns from these roles influence scoring.</div>
          </div>
        </div>

        {/* RUN BUTTON */}
        <button
          onClick={runMatcher}
          disabled={loading}
          style={{ width:"100%", background: loading ? border : navy, color: loading ? muted : white, border:"none", padding:"16px", fontSize:14, fontWeight:800, cursor: loading ? "default" : "pointer", fontFamily:"inherit", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:28, transition:"background 0.2s" }}>
          {loading ? "⚡ Claude is scoring all jobs..." : ran ? "↺ Re-Score with Updated Preferences" : "⚡ Score & Rank All Jobs"}
        </button>

        {/* LOADING STATE */}
        {loading && (
          <div style={{ background:white, border:`1px solid ${border}`, padding:"48px", textAlign:"center", marginBottom:24 }}>
            <div style={{ fontSize:32, marginBottom:16 }}>⚡</div>
            <div style={{ fontFamily:"Georgia,serif", fontSize:18, color:navy, marginBottom:8 }}>Scoring {SAMPLE_JOBS.length} jobs...</div>
            <div style={{ fontSize:13, color:muted }}>Claude is reading your resume, applying history, and starred companies to rank every role.</div>
            <div style={{ marginTop:20, display:"flex", justifyContent:"center", gap:6 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:navy, animation:`bounce 1.2s ${i*0.2}s infinite` }} />
              ))}
            </div>
            <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }`}</style>
          </div>
        )}

        {/* RESULTS */}
        {!loading && results.length > 0 && (
          <div>
            {/* Filters */}
            <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {matchFilters.map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{ padding:"7px 14px", fontSize:11, fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase", border:`1px solid ${filter===f ? navy : border}`, background: filter===f ? navy : white, color: filter===f ? white : muted, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" }}>
                    {f}
                  </button>
                ))}
              </div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {sources.map(s => (
                  <button key={s} onClick={() => setSourceFilter(s)} style={{ padding:"7px 12px", fontSize:11, fontWeight:700, letterSpacing:"0.04em", border:`1px solid ${sourceFilter===s ? sourceColor(s) : border}`, background: sourceFilter===s ? sourceColor(s)+"15" : white, color: sourceFilter===s ? sourceColor(s) : muted, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Job cards */}
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {filtered.map((job, idx) => {
                const isExp     = expanded === job.id;
                const isSaved   = savedJobs.includes(job.id);
                const wasApplied = appliedIds.has(job.company);
                const isStarred = starred.includes(job.company);

                return (
                  <div key={job.id} style={{ background:white, border:`1px solid ${job.score >= 85 ? green+"40" : border}`, transition:"border-color 0.2s" }}>

                    {/* Card row */}
                    <div style={{ display:"flex", alignItems:"center", gap:16, padding:"18px 22px", cursor:"pointer" }}
                      onClick={() => setExpanded(isExp ? null : job.id)}>

                      {/* Rank */}
                      <div style={{ fontFamily:"Georgia,serif", fontSize:20, fontWeight:700, color:border, minWidth:28, textAlign:"center" }}>
                        {String(idx+1).padStart(2,"0")}
                      </div>

                      {/* Score */}
                      <div style={{ minWidth:52, textAlign:"center" }}>
                        <div style={{ fontFamily:"Georgia,serif", fontSize:22, fontWeight:700, color: scoreColor(job.score), lineHeight:1 }}>{job.score}</div>
                        <div style={{ fontSize:9, color:muted, textTransform:"uppercase", letterSpacing:"0.05em", marginTop:2 }}>score</div>
                      </div>

                      {/* Job info */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:4 }}>
                          <span style={{ fontFamily:"Georgia,serif", fontSize:16, fontWeight:700, color:navy }}>{job.title}</span>
                          {isStarred && <span style={{ color:amber, fontSize:13 }}>★</span>}
                          {wasApplied && <Pill label="Applied" color={blue} />}
                        </div>
                        <div style={{ display:"flex", gap:12, fontSize:12, color:muted, flexWrap:"wrap" }}>
                          <span style={{ fontWeight:600, color:navyL }}>{job.company}</span>
                          <span>{job.location}</span>
                          <span style={{ color: sourceColor(job.source), fontWeight:600 }}>{job.source}</span>
                        </div>
                        <div style={{ marginTop:6, display:"flex", gap:4, flexWrap:"wrap" }}>
                          {job.tags?.map(t => <Pill key={t} label={t} />)}
                        </div>
                      </div>

                      {/* Right side */}
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8, flexShrink:0 }}>
                        <div style={{ minWidth:120 }}>
                          <ScoreBar score={job.score} />
                          <div style={{ fontSize:10, color: scoreColor(job.score), fontWeight:700, textAlign:"right", marginTop:3 }}>{scoreLabel(job.score)}</div>
                        </div>
                        <div style={{ display:"flex", gap:6 }}>
                          <button onClick={e => { e.stopPropagation(); setSavedJobs(p => isSaved ? p.filter(x => x !== job.id) : [...p, job.id]); }}
                            style={{ padding:"5px 10px", fontSize:11, border:`1px solid ${border}`, background: isSaved ? navy : white, color: isSaved ? white : muted, cursor:"pointer", fontFamily:"inherit", fontWeight:700 }}>
                            {isSaved ? "✓ Saved" : "Save"}
                          </button>
                          <a href={job.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                            style={{ padding:"5px 10px", fontSize:11, background: job.applyUrgency === "High" ? green : navy, color:white, textDecoration:"none", fontWeight:700, letterSpacing:"0.04em", display:"inline-block" }}>
                            Apply {job.applyUrgency === "High" ? "↑" : "→"}
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Expanded reasoning */}
                    {isExp && (
                      <div style={{ borderTop:`1px solid ${border}`, padding:"20px 22px", background:offWhite, display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                        <div>
                          <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:green, marginBottom:10 }}>Why It Matches</div>
                          {job.reasons?.map((r, i) => (
                            <div key={i} style={{ display:"flex", gap:10, marginBottom:8, fontSize:12, color:navy }}>
                              <span style={{ color:green, flexShrink:0 }}>✓</span>{r}
                            </div>
                          ))}
                        </div>
                        <div>
                          {job.redFlags?.length > 0 && (
                            <>
                              <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:amber, marginBottom:10 }}>Watch Out For</div>
                              {job.redFlags.map((f, i) => (
                                <div key={i} style={{ display:"flex", gap:10, marginBottom:8, fontSize:12, color:navy }}>
                                  <span style={{ color:amber, flexShrink:0 }}>⚠</span>{f}
                                </div>
                              ))}
                            </>
                          )}
                          <div style={{ marginTop: job.redFlags?.length ? 16 : 0 }}>
                            <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:muted, marginBottom:8 }}>Apply Urgency</div>
                            <span style={{ padding:"4px 12px", fontSize:12, fontWeight:700, background: job.applyUrgency === "High" ? green+"20" : job.applyUrgency === "Medium" ? amber+"20" : border, color: job.applyUrgency === "High" ? green : job.applyUrgency === "Medium" ? amber : muted, border:`1px solid ${job.applyUrgency === "High" ? green : job.applyUrgency === "Medium" ? amber : border}` }}>
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

            {/* Saved summary */}
            {savedJobs.length > 0 && (
              <div style={{ marginTop:24, background:navy, padding:"18px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ color:white, fontWeight:700 }}>{savedJobs.length} job{savedJobs.length > 1 ? "s" : ""} saved</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.55)" }}>Open each one and apply — your top matches are waiting.</div>
              </div>
            )}
          </div>
        )}

        {/* API setup note */}
        <div style={{ marginTop:24, background:white, border:`1px solid ${border}`, padding:"16px 20px", fontSize:12, color:muted, lineHeight:1.7 }}>
          <strong style={{ color:navy }}>🔌 Production API connections:</strong> Replace <code style={{ background:offWhite, padding:"1px 5px", fontSize:11 }}>SAMPLE_JOBS</code> with live fetches from:
          {" "}<strong style={{ color:navy }}>Adzuna API</strong> (free, broad), <strong style={{ color:navy }}>Greenhouse/Lever open boards</strong> (no auth, startup-heavy),
          {" "}<strong style={{ color:navy }}>SerpAPI Google Jobs</strong> ($50/mo, aggregates everything). Each returns job objects you map to the same shape and this UI works unchanged.
        </div>

      </div>
    </div>
  );
}
