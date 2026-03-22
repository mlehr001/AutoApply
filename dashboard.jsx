import { useState } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

// ─── MOCK DATA (replace with real GA4 API calls once connected) ───────────────
const visitData = [
  { day: "Mar 10", visits: 3, unique: 3 },
  { day: "Mar 11", visits: 7, unique: 6 },
  { day: "Mar 12", visits: 4, unique: 4 },
  { day: "Mar 13", visits: 12, unique: 10 },
  { day: "Mar 14", visits: 9, unique: 8 },
  { day: "Mar 15", visits: 5, unique: 5 },
  { day: "Mar 16", visits: 18, unique: 14 },
  { day: "Mar 17", visits: 11, unique: 9 },
  { day: "Mar 18", visits: 22, unique: 17 },
  { day: "Mar 19", visits: 8, unique: 7 },
  { day: "Mar 20", visits: 15, unique: 12 },
  { day: "Mar 21", visits: 6, unique: 6 },
];

const scrollData = [
  { section: "Hero", pct: 100 },
  { section: "About", pct: 78 },
  { section: "Experience", pct: 61 },
  { section: "Skills", pct: 44 },
  { section: "Contact", pct: 29 },
];

const sourceData = [
  { name: "LinkedIn", value: 48, color: "#0077B5" },
  { name: "QR Code", value: 27, color: "#2C3E50" },
  { name: "Direct", value: 14, color: "#7F8C8D" },
  { name: "Other", value: 11, color: "#BDC3C7" },
];

const deviceData = [
  { name: "Desktop", value: 58, color: "#2C3E50" },
  { name: "Mobile", value: 34, color: "#34495E" },
  { name: "Tablet", value: 8, color: "#7F8C8D" },
];

const geoData = [
  { city: "Los Angeles, CA", visits: 31 },
  { city: "San Francisco, CA", visits: 18 },
  { city: "New York, NY", visits: 14 },
  { city: "Seattle, WA", visits: 9 },
  { city: "Austin, TX", visits: 6 },
  { city: "Chicago, IL", visits: 4 },
];

const sectionTimeData = [
  { section: "Hero", seconds: 18 },
  { section: "About", seconds: 47 },
  { section: "Experience", seconds: 83 },
  { section: "Skills", seconds: 35 },
  { section: "Contact", seconds: 22 },
];

const recentVisitors = [
  { time: "Today, 2:41 PM", source: "LinkedIn", device: "Desktop", city: "San Francisco, CA", scrolled: 78, calendly: true },
  { time: "Today, 11:08 AM", source: "QR Code", device: "Mobile", city: "Los Angeles, CA", scrolled: 100, calendly: false },
  { time: "Today, 9:22 AM", source: "Direct", device: "Desktop", city: "Los Angeles, CA", scrolled: 44, calendly: false },
  { time: "Yesterday, 4:55 PM", source: "LinkedIn", device: "Desktop", city: "New York, NY", scrolled: 61, calendly: true },
  { time: "Yesterday, 1:30 PM", source: "LinkedIn", device: "Mobile", city: "Seattle, WA", scrolled: 29, calendly: false },
  { time: "Mar 19, 3:12 PM", source: "QR Code", device: "Desktop", city: "Austin, TX", scrolled: 100, calendly: false },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const navy = "#2C3E50";
const navyLight = "#34495E";
const white = "#FFFFFF";
const offWhite = "#F5F5F3";
const muted = "#888";
const border = "#E5E2DD";

const fmt = (n) => n >= 1000 ? (n / 1000).toFixed(1) + "k" : n;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: navy, border: "none", padding: "10px 14px", fontSize: 12, color: white }}>
      <div style={{ marginBottom: 4, opacity: 0.6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: white }}>{p.name}: <strong>{p.value}</strong></div>
      ))}
    </div>
  );
};

// ─── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, accent }) => (
  <div style={{
    background: white, border: `1px solid ${border}`,
    padding: "24px 20px", display: "flex", flexDirection: "column", gap: 6,
  }}>
    <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.09em", color: muted }}>{label}</div>
    <div style={{ fontFamily: "Georgia, serif", fontSize: 36, fontWeight: 700, color: navy, lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: muted }}>{sub}</div>}
    {accent && <div style={{ fontSize: 12, color: "#27AE60", fontWeight: 600 }}>{accent}</div>}
  </div>
);

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
const SectionHeader = ({ title, sub }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: navy, marginBottom: 3 }}>{title}</div>
    {sub && <div style={{ fontSize: 11, color: muted, letterSpacing: "0.06em" }}>{sub}</div>}
  </div>
);

// ─── SCROLL BAR ───────────────────────────────────────────────────────────────
const ScrollBar = ({ section, pct }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: navy, marginBottom: 5, fontWeight: 600 }}>
      <span>{section}</span><span style={{ color: muted }}>{pct}%</span>
    </div>
    <div style={{ height: 8, background: offWhite, border: `1px solid ${border}` }}>
      <div style={{ height: "100%", width: `${pct}%`, background: navy, transition: "width 0.8s ease" }} />
    </div>
  </div>
);

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────
export default function Dashboard() {
  const [tab, setTab] = useState("overview");
  const totalVisits = visitData.reduce((a, b) => a + b.visits, 0);
  const totalUnique = visitData.reduce((a, b) => a + b.unique, 0);
  const calendlyClicks = recentVisitors.filter(v => v.calendly).length;
  const avgScroll = Math.round(scrollData.reduce((a, b) => a + b.pct, 0) / scrollData.length);

  const tabs = ["overview", "behavior", "audience", "feed"];

  return (
    <div style={{ minHeight: "100vh", background: offWhite, fontFamily: "'Open Sans', system-ui, sans-serif", fontSize: 14, color: navy }}>

      {/* NAV */}
      <div style={{ background: navy, padding: "0 32px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: white, letterSpacing: "-0.01em" }}>
            Marc Lehrmann <span style={{ opacity: 0.4, fontWeight: 300 }}>/</span> <span style={{ opacity: 0.7, fontWeight: 400, fontSize: 13 }}>Analytics</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", padding: "4px 10px", fontSize: 11, color: "rgba(255,255,255,0.7)", letterSpacing: "0.05em" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#2ECC71", animation: "none" }} />
            LIVE
          </div>
        </div>
        <a href="#" style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", textDecoration: "none", letterSpacing: "0.06em" }}>
          ↗ View Site
        </a>
      </div>

      {/* TABS */}
      <div style={{ background: white, borderBottom: `1px solid ${border}`, padding: "0 32px", display: "flex", gap: 0 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: "none", border: "none", cursor: "pointer",
            padding: "14px 20px", fontSize: 12, fontWeight: 700,
            letterSpacing: "0.07em", textTransform: "uppercase",
            color: tab === t ? navy : muted,
            borderBottom: tab === t ? `2px solid ${navy}` : "2px solid transparent",
            transition: "color 0.15s",
          }}>{t}</button>
        ))}
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <div>
            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
              <StatCard label="Total Visits" value={fmt(totalVisits)} sub="Last 12 days" accent="↑ 22% vs prior period" />
              <StatCard label="Unique Visitors" value={fmt(totalUnique)} sub="Last 12 days" accent="↑ 18% vs prior period" />
              <StatCard label="Calendly Clicks" value={calendlyClicks} sub="Book a call CTAs" accent={`${Math.round(calendlyClicks/totalUnique*100)}% conversion`} />
              <StatCard label="Avg Scroll Depth" value={`${avgScroll}%`} sub="Across all sessions" accent="Experience = most read" />
            </div>

            {/* Visits chart */}
            <div style={{ background: white, border: `1px solid ${border}`, padding: "28px 24px", marginBottom: 28 }}>
              <SectionHeader title="Visits Over Time" sub="Daily visits vs unique visitors" />
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={visitData}>
                  <defs>
                    <linearGradient id="gVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={navy} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={navy} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gUnique" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={navyLight} stopOpacity={0.1} />
                      <stop offset="95%" stopColor={navyLight} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} width={24} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="visits" name="Visits" stroke={navy} strokeWidth={2} fill="url(#gVisits)" />
                  <Area type="monotone" dataKey="unique" name="Unique" stroke={navyLight} strokeWidth={1.5} strokeDasharray="4 3" fill="url(#gUnique)" />
                </AreaChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", gap: 20, marginTop: 12, fontSize: 11, color: muted }}>
                <span><span style={{ display: "inline-block", width: 20, height: 2, background: navy, verticalAlign: "middle", marginRight: 6 }} />Total Visits</span>
                <span><span style={{ display: "inline-block", width: 20, height: 2, background: navyLight, verticalAlign: "middle", marginRight: 6, borderTop: "2px dashed" }} />Unique</span>
              </div>
            </div>

            {/* Source + Device row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ background: white, border: `1px solid ${border}`, padding: "28px 24px" }}>
                <SectionHeader title="Traffic Sources" sub="Where visitors are coming from" />
                {sourceData.map(s => (
                  <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: 13, color: navy, fontWeight: 600 }}>{s.name}</div>
                    <div style={{ flex: 2, height: 6, background: offWhite, border: `1px solid ${border}` }}>
                      <div style={{ height: "100%", width: `${s.value}%`, background: s.color }} />
                    </div>
                    <div style={{ fontSize: 12, color: muted, minWidth: 32, textAlign: "right" }}>{s.value}%</div>
                  </div>
                ))}
              </div>
              <div style={{ background: white, border: `1px solid ${border}`, padding: "28px 24px" }}>
                <SectionHeader title="Device Breakdown" sub="Desktop vs mobile vs tablet" />
                <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                  <ResponsiveContainer width={120} height={120}>
                    <PieChart>
                      <Pie data={deviceData} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={55} strokeWidth={0}>
                        {deviceData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex: 1 }}>
                    {deviceData.map(d => (
                      <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <div style={{ width: 10, height: 10, background: d.color, flexShrink: 0 }} />
                        <div style={{ flex: 1, fontSize: 13, color: navy }}>{d.name}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: navy }}>{d.value}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── BEHAVIOR TAB ── */}
        {tab === "behavior" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>

              {/* Scroll depth */}
              <div style={{ background: white, border: `1px solid ${border}`, padding: "28px 24px" }}>
                <SectionHeader title="Scroll Depth by Section" sub="% of visitors who reached each section" />
                {scrollData.map(s => <ScrollBar key={s.section} {...s} />)}
                <div style={{ marginTop: 16, padding: "12px 14px", background: offWhite, border: `1px solid ${border}`, fontSize: 12, color: muted, lineHeight: 1.6 }}>
                  💡 <strong style={{ color: navy }}>29% reach Contact.</strong> Consider moving the Calendly CTA higher — try adding a floating button or a mid-page CTA after Experience.
                </div>
              </div>

              {/* Time per section */}
              <div style={{ background: white, border: `1px solid ${border}`, padding: "28px 24px" }}>
                <SectionHeader title="Avg Time Per Section" sub="Seconds spent reading each section" />
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={sectionTimeData} layout="vertical" margin={{ left: 0, right: 20 }}>
                    <XAxis type="number" tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} unit="s" />
                    <YAxis type="category" dataKey="section" tick={{ fontSize: 12, fill: navy }} axisLine={false} tickLine={false} width={72} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="seconds" name="Seconds" radius={0} barSize={20}>
                      {sectionTimeData.map((d, i) => (
                        <Cell key={i} fill={d.seconds === Math.max(...sectionTimeData.map(x => x.seconds)) ? navy : "#BDC3C7"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ marginTop: 16, padding: "12px 14px", background: offWhite, border: `1px solid ${border}`, fontSize: 12, color: muted, lineHeight: 1.6 }}>
                  💡 <strong style={{ color: navy }}>Experience gets the most time (83s avg).</strong> Recruiters are reading your bullets carefully — make sure your strongest achievement is the first bullet in each role.
                </div>
              </div>
            </div>

            {/* Calendly conversion */}
            <div style={{ background: white, border: `1px solid ${border}`, padding: "28px 24px" }}>
              <SectionHeader title="Calendly Click-Through" sub="Who clicked Book a Call vs who didn't" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 40, fontWeight: 700, color: navy }}>{totalUnique}</div>
                  <div style={{ fontSize: 12, color: muted, marginTop: 4 }}>Unique Visitors</div>
                </div>
                <div style={{ textAlign: "center", padding: "20px 0", borderLeft: `1px solid ${border}`, borderRight: `1px solid ${border}` }}>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 40, fontWeight: 700, color: navy }}>{calendlyClicks}</div>
                  <div style={{ fontSize: 12, color: muted, marginTop: 4 }}>Calendly Clicks</div>
                </div>
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 40, fontWeight: 700, color: "#27AE60" }}>{Math.round(calendlyClicks / totalUnique * 100)}%</div>
                  <div style={{ fontSize: 12, color: muted, marginTop: 4 }}>Conversion Rate</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── AUDIENCE TAB ── */}
        {tab === "audience" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

              {/* Geo */}
              <div style={{ background: white, border: `1px solid ${border}`, padding: "28px 24px" }}>
                <SectionHeader title="Top Locations" sub="Cities generating the most visits" />
                {geoData.map((g, i) => (
                  <div key={g.city} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < geoData.length - 1 ? `1px solid ${border}` : "none" }}>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: border, minWidth: 28 }}>
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: navy }}>{g.city}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: navy }}>{g.visits}</div>
                    <div style={{ fontSize: 11, color: muted }}>visits</div>
                  </div>
                ))}
              </div>

              {/* Source + device detail */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ background: white, border: `1px solid ${border}`, padding: "28px 24px" }}>
                  <SectionHeader title="Source Detail" sub="Referral breakdown" />
                  {sourceData.map(s => (
                    <div key={s.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
                        <span style={{ fontSize: 13, color: navy, fontWeight: 600 }}>{s.name}</span>
                      </div>
                      <div style={{ display: "flex", gap: 16 }}>
                        <span style={{ fontSize: 13, color: navy, fontWeight: 700 }}>{Math.round(totalVisits * s.value / 100)}</span>
                        <span style={{ fontSize: 12, color: muted }}>{s.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ background: white, border: `1px solid ${border}`, padding: "28px 24px" }}>
                  <SectionHeader title="Device Detail" />
                  {deviceData.map(d => (
                    <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 8, height: 8, background: d.color }} />
                        <span style={{ fontSize: 13, color: navy, fontWeight: 600 }}>{d.name}</span>
                      </div>
                      <div style={{ display: "flex", gap: 16 }}>
                        <span style={{ fontSize: 13, color: navy, fontWeight: 700 }}>{Math.round(totalVisits * d.value / 100)}</span>
                        <span style={{ fontSize: 12, color: muted }}>{d.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── FEED TAB ── */}
        {tab === "feed" && (
          <div>
            <div style={{ background: white, border: `1px solid ${border}`, padding: "28px 24px" }}>
              <SectionHeader title="Recent Visitor Feed" sub="Latest sessions — most recent first" />
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${navy}` }}>
                      {["Time", "Source", "Device", "Location", "Scroll Depth", "Calendly"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: muted, fontWeight: 700 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentVisitors.map((v, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${border}`, background: i % 2 === 0 ? white : offWhite }}>
                        <td style={{ padding: "12px", color: muted, fontSize: 12 }}>{v.time}</td>
                        <td style={{ padding: "12px" }}>
                          <span style={{ display: "inline-block", padding: "3px 8px", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", background: v.source === "LinkedIn" ? "#E8F4FD" : v.source === "QR Code" ? "#EAF0F6" : "#F0F0F0", color: v.source === "LinkedIn" ? "#0077B5" : navy }}>
                            {v.source}
                          </span>
                        </td>
                        <td style={{ padding: "12px", color: navy }}>{v.device}</td>
                        <td style={{ padding: "12px", color: navy }}>{v.city}</td>
                        <td style={{ padding: "12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 60, height: 6, background: border }}>
                              <div style={{ height: "100%", width: `${v.scrolled}%`, background: v.scrolled === 100 ? "#27AE60" : navy }} />
                            </div>
                            <span style={{ fontSize: 12, color: v.scrolled === 100 ? "#27AE60" : navy, fontWeight: 600 }}>{v.scrolled}%</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px" }}>
                          {v.calendly
                            ? <span style={{ color: "#27AE60", fontWeight: 700, fontSize: 13 }}>✓ Clicked</span>
                            : <span style={{ color: border, fontSize: 13 }}>—</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 20, padding: "14px 16px", background: offWhite, border: `1px solid ${border}`, fontSize: 12, color: muted, lineHeight: 1.6 }}>
                💡 <strong style={{ color: navy }}>2 of 6 recent visitors clicked Calendly</strong> — both came from LinkedIn on desktop and read past Experience. That's your highest-intent profile. Consider a more direct LinkedIn outreach message targeting hiring managers who match that pattern.
              </div>
            </div>
          </div>
        )}

        {/* Setup banner */}
        <div style={{ marginTop: 28, padding: "16px 20px", background: navy, color: white, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <strong>🔌 Connect your real data</strong>
            <span style={{ opacity: 0.65, marginLeft: 10 }}>This dashboard shows sample data. Add your GA4 Measurement ID and Hotjar Site ID to the landing page to go live.</span>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <span style={{ padding: "4px 10px", background: "rgba(255,255,255,0.12)", fontSize: 11, letterSpacing: "0.06em" }}>GA4: G-XXXXXXXXXX</span>
            <span style={{ padding: "4px 10px", background: "rgba(255,255,255,0.12)", fontSize: 11, letterSpacing: "0.06em" }}>Hotjar: #XXXXXXX</span>
          </div>
        </div>

      </div>
    </div>
  );
}
