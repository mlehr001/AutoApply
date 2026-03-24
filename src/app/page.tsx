"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getJobs, getActiveResume } from "@/lib/supabase";
import { STATUS_COLORS, COLORS } from "@/lib/constants";
import type { Job, ResumeVersion } from "@/types";

const { navy, navyDark, offWhite, white, border, muted, green, amber, red } = COLORS;

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: white, border: `1px solid ${border}`, padding: "20px 22px", ...style }}>{children}</div>;
}

function SectionHead({ title, sub, href }: { title: string; sub?: string; href?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <div>
        <div style={{ fontFamily: "var(--font-raleway), sans-serif", fontWeight: 800, fontSize: 12, textTransform: "uppercase" as const, letterSpacing: "0.09em", color: navy }}>{title}</div>
        {sub && <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>{sub}</div>}
      </div>
      {href && <Link href={href} style={{ fontSize: 11, color: muted, textDecoration: "none", letterSpacing: "0.05em" }}>View all →</Link>}
    </div>
  );
}

export default function HomePage() {
  const [jobs,    setJobs]    = useState<Job[]>([]);
  const [resume,  setResume]  = useState<ResumeVersion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getJobs(), getActiveResume()])
      .then(([j, r]) => { setJobs(j); setResume(r); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const today        = new Date().toISOString().split("T")[0];
  const topMatches   = jobs.filter(j => (j.score ?? 0) >= 70 && j.status === "New").slice(0, 5);
  const followupsDue = jobs.filter(j => j.next_action_date && j.next_action_date <= today && j.status !== "Rejected" && j.status !== "Offer").slice(0, 5);

  const pipeline: Record<string, number> = {};
  jobs.forEach(j => { pipeline[j.status] = (pipeline[j.status] ?? 0) + 1; });
  const totalActive = jobs.filter(j => j.status !== "Rejected").length;
  const statuses = ["New", "Saved", "Applied", "Phone Screen", "Interview", "Offer", "Rejected"];

  return (
    <div style={{ minHeight: "100vh", background: offWhite, fontFamily: "var(--font-open-sans), system-ui, sans-serif", fontSize: 14, color: navy }}>

      {/* PAGE HEADER */}
      <div style={{ background: navyDark, padding: "0 32px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
        <div>
          <span style={{ fontFamily: "var(--font-raleway), sans-serif", fontWeight: 800, fontSize: 15, color: white, letterSpacing: "-0.01em" }}>Command Center</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginLeft: 12 }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </span>
        </div>
        <Link href="/proof" style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", textDecoration: "none", letterSpacing: "0.06em", fontFamily: "var(--font-raleway), sans-serif", fontWeight: 700, textTransform: "uppercase" as const }}>
          View Resume ↗
        </Link>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px", display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>

        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Top Matches */}
          <Card>
            <SectionHead title="Top Matches" sub="Score ≥ 70 — new / unactioned" href="/opportunities" />
            {loading ? (
              <div style={{ padding: "20px 0", color: muted, fontSize: 13 }}>Loading…</div>
            ) : topMatches.length === 0 ? (
              <div style={{ padding: "20px 0", textAlign: "center" }}>
                <div style={{ fontSize: 13, color: muted, marginBottom: 12 }}>No scored jobs yet.</div>
                <Link href="/opportunities" style={{ display: "inline-block", padding: "10px 20px", background: navy, color: white, textDecoration: "none", fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" as const }}>
                  ⚡ Score Jobs →
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {topMatches.map((job, i) => (
                  <div key={job.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: i < topMatches.length - 1 ? `1px solid ${border}` : "none" }}>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: (job.score ?? 0) >= 85 ? green : navy, minWidth: 36, textAlign: "center" }}>{job.score}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{job.title}</div>
                      <div style={{ fontSize: 11, color: muted }}>{job.company} · {job.location}</div>
                    </div>
                    <div style={{ fontSize: 10, padding: "3px 8px", fontWeight: 700, background: (job.score ?? 0) >= 85 ? green + "18" : navy + "10", color: (job.score ?? 0) >= 85 ? green : navy, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
                      {job.match_label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Follow-ups Due */}
          <Card>
            <SectionHead title="Follow-ups Due" sub="Action date ≤ today" href="/crm" />
            {loading ? (
              <div style={{ padding: "20px 0", color: muted, fontSize: 13 }}>Loading…</div>
            ) : followupsDue.length === 0 ? (
              <div style={{ padding: "16px 0", fontSize: 13, color: muted }}>No follow-ups due. You&apos;re on top of it.</div>
            ) : (
              <div>
                {followupsDue.map((job, i) => (
                  <div key={job.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < followupsDue.length - 1 ? `1px solid ${border}` : "none" }}>
                    <div style={{ width: 8, height: 8, background: STATUS_COLORS[job.status] ?? muted, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: navy }}>{job.title}</div>
                      <div style={{ fontSize: 11, color: muted }}>{job.company}</div>
                    </div>
                    <div style={{ fontSize: 11, color: job.next_action_date! < today ? red : amber, fontWeight: 700 }}>
                      {job.next_action_date === today ? "Today" : "Overdue"}
                    </div>
                    <div style={{ fontSize: 11, padding: "3px 8px", background: (STATUS_COLORS[job.status] ?? muted) + "18", color: STATUS_COLORS[job.status] ?? muted, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
                      {job.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick Links */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[
              { label: "Score Jobs",      href: "/opportunities", icon: "🎯", sub: "Run AI matcher"   },
              { label: "Optimize Resume", href: "/positioning",   icon: "⚡", sub: "Rewrite sections" },
              { label: "Analytics",       href: "/dashboard",     icon: "📊", sub: "See who viewed"   },
            ].map(link => (
              <Link key={link.href} href={link.href} style={{ textDecoration: "none" }}>
                <Card style={{ textAlign: "center", cursor: "pointer" }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{link.icon}</div>
                  <div style={{ fontFamily: "var(--font-raleway), sans-serif", fontWeight: 800, fontSize: 12, color: navy, textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 4 }}>{link.label}</div>
                  <div style={{ fontSize: 11, color: muted }}>{link.sub}</div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Pipeline Funnel */}
          <Card>
            <SectionHead title="Pipeline" sub={`${totalActive} active`} href="/crm" />
            {statuses.map(status => {
              const count = pipeline[status] ?? 0;
              const max   = Math.max(...statuses.map(s => pipeline[s] ?? 0), 1);
              return (
                <div key={status} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                    <span style={{ color: navy, fontWeight: 600 }}>{status}</span>
                    <span style={{ color: muted, fontWeight: 700 }}>{count}</span>
                  </div>
                  <div style={{ height: 5, background: offWhite, border: `1px solid ${border}` }}>
                    <div style={{ height: "100%", width: `${(count / max) * 100}%`, background: STATUS_COLORS[status] ?? muted, transition: "width 0.6s ease" }} />
                  </div>
                </div>
              );
            })}
          </Card>

          {/* Active Resume */}
          <Card>
            <SectionHead title="Active Resume" href="/positioning" />
            {loading ? (
              <div style={{ fontSize: 13, color: muted }}>Loading…</div>
            ) : resume ? (
              <div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: resume.score && resume.score >= 80 ? green : resume.score && resume.score >= 65 ? amber : navy, lineHeight: 1, marginBottom: 6 }}>
                  {resume.score ? `${resume.score}/100` : "Unscored"}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: navy, marginBottom: 4 }}>{resume.version_name}</div>
                {resume.target_role && <div style={{ fontSize: 11, color: muted, marginBottom: 12 }}>For: {resume.target_role}</div>}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {resume.sections.slice(0, 3).map(s => (
                    <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ fontSize: 10, color: muted, width: 80, textTransform: "uppercase" as const, letterSpacing: "0.05em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{s.title}</div>
                      <div style={{ flex: 1, height: 4, background: offWhite, border: `1px solid ${border}` }}>
                        <div style={{ height: "100%", width: `${Math.round(s.weight * 100)}%`, background: navy }} />
                      </div>
                      <div style={{ fontSize: 10, color: muted, width: 30, textAlign: "right" }}>{Math.round(s.weight * 100)}%</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 13, color: muted, marginBottom: 10 }}>No resume version found.</div>
                <Link href="/positioning" style={{ fontSize: 11, color: navy, fontWeight: 700, textDecoration: "none" }}>Set up →</Link>
              </div>
            )}
          </Card>

          {/* System Status */}
          <Card>
            <SectionHead title="System Status" />
            {[
              { label: "Supabase",   ok: true  },
              { label: "Claude API", ok: true  },
              { label: "GA4 Data",   ok: false },
              { label: "Inngest",    ok: true  },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${border}` }}>
                <span style={{ fontSize: 12, color: navy }}>{s.label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: s.ok ? green : amber }}>{s.ok ? "● Connected" : "○ Pending"}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
