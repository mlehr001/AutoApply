"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { COLORS } from "@/lib/constants";
import { track } from "@/lib/posthog";
import ScheduleInterviewModal from "@/components/ScheduleInterviewModal";

const { navy, navyDark, offWhite, white, border, muted, green, amber } = COLORS;

interface Interview {
  id: string;
  job_title: string;
  company: string;
  interview_type: string;
  scheduled_at: string;
  status: "upcoming" | "active" | "past";
  notes?: string;
  prep_brief?: string;
}

type TabType = "upcoming" | "active" | "past";

export default function InterviewPage() {
  const [tab,             setTab]             = useState<TabType>("upcoming");
  const [interviews,      setInterviews]      = useState<Interview[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [expanded,        setExpanded]        = useState<string | null>(null);
  const [prepLoading,     setPrepLoading]     = useState<string | null>(null);
  const [showSchedule,    setShowSchedule]    = useState(false);

  async function loadInterviews() {
    setLoading(true);
    const { data } = await supabase.from("interviews").select("*").order("scheduled_at");
    setInterviews(data || []);
    setLoading(false);
  }

  useEffect(() => { loadInterviews(); }, []);

  async function generatePrepBrief(interview: Interview) {
    setPrepLoading(interview.id);
    track.prepBriefGenerated(interview.company, interview.job_title);
    try {
      const res = await fetch("/api/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle:      interview.job_title,
          company:       interview.company,
          interviewType: interview.interview_type,
          notes:         interview.notes || "",
        }),
      });
      const data = await res.json();
      if (data.brief) {
        setInterviews(prev => prev.map(i => i.id === interview.id ? { ...i, prep_brief: data.brief } : i));
        try { await supabase.from("interviews").update({ prep_brief: data.brief }).eq("id", interview.id); } catch { /* non-blocking */ }
      }
    } catch { /* show error state */ }
    setPrepLoading(null);
  }

  function updateStatus(id: string, newStatus: TabType) {
    supabase.from("interviews").update({ status: newStatus }).eq("id", id).then(() => {
      setInterviews(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
    });
  }

  const filtered = interviews.filter(i => i.status === tab);
  const tabs: { key: TabType; label: string }[] = [
    { key: "upcoming", label: "Upcoming" },
    { key: "active",   label: "Active"   },
    { key: "past",     label: "Past"     },
  ];

  return (
    <div style={{ minHeight: "100vh", background: offWhite, fontFamily: "var(--font-open-sans), system-ui, sans-serif", fontSize: 14, color: navy }}>

      {/* PAGE HEADER */}
      <div style={{ background: navyDark, padding: "0 32px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontFamily: "var(--font-raleway), sans-serif", fontWeight: 800, fontSize: 15, color: white, letterSpacing: "-0.01em" }}>Interview Prep</div>
        <button onClick={() => setShowSchedule(true)}
          style={{ padding: "8px 16px", background: green, border: "none", color: white, fontFamily: "var(--font-raleway), sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer", letterSpacing: "0.04em" }}>
          + Schedule New
        </button>
      </div>

      {/* TABS */}
      <div style={{ background: white, borderBottom: `1px solid ${border}`, padding: "0 32px", display: "flex" }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            background: "none", border: "none", cursor: "pointer",
            padding: "14px 20px", fontSize: 12, fontWeight: 700,
            letterSpacing: "0.07em", textTransform: "uppercase" as const,
            color: tab === t.key ? navy : muted,
            borderBottom: tab === t.key ? `2px solid ${navy}` : "2px solid transparent",
          }}>
            {t.label}
            {interviews.filter(i => i.status === t.key).length > 0 && (
              <span style={{ marginLeft: 6, fontSize: 10, background: navy, color: white, padding: "2px 5px", fontWeight: 700 }}>
                {interviews.filter(i => i.status === t.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: muted }}>Loading interviews…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "56px 24px", background: white, border: `1px solid ${border}` }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>🎤</div>
            <div style={{ fontFamily: "var(--font-raleway), sans-serif", fontWeight: 800, fontSize: 18, color: navy, marginBottom: 8 }}>
              No {tab} interviews
            </div>
            <div style={{ fontSize: 13, color: muted, maxWidth: 360, margin: "0 auto" }}>
              {tab === "upcoming"
                ? "When you move a CRM application to Interview status, it will appear here."
                : tab === "active"
                ? "Interviews in progress will show here."
                : "Completed interviews and your post-interview notes will appear here."}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filtered.map(interview => {
              const isExp      = expanded === interview.id;
              const isGenLoading = prepLoading === interview.id;

              return (
                <div key={interview.id} style={{ background: white, border: `1px solid ${border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 24px", cursor: "pointer" }}
                    onClick={() => setExpanded(isExp ? null : interview.id)}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--font-raleway), sans-serif", fontSize: 16, fontWeight: 800, color: navy, marginBottom: 4 }}>{interview.job_title}</div>
                      <div style={{ display: "flex", gap: 16, fontSize: 12, color: muted }}>
                        <span style={{ fontWeight: 600, color: navy }}>{interview.company}</span>
                        <span>{interview.interview_type}</span>
                        <span>{new Date(interview.scheduled_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      {!interview.prep_brief && (
                        <button
                          onClick={e => { e.stopPropagation(); generatePrepBrief(interview); }}
                          disabled={isGenLoading}
                          style={{ padding: "8px 16px", background: isGenLoading ? border : navy, color: isGenLoading ? muted : white, border: "none", fontSize: 12, fontWeight: 700, cursor: isGenLoading ? "default" : "pointer", fontFamily: "inherit", letterSpacing: "0.04em" }}>
                          {isGenLoading ? "Generating…" : "⚡ Prep Brief"}
                        </button>
                      )}
                      {interview.prep_brief && (
                        <span style={{ padding: "6px 12px", fontSize: 11, fontWeight: 700, background: green + "18", color: green }}>✓ Brief Ready</span>
                      )}
                      <span style={{ fontSize: 12, color: muted, padding: "8px 4px" }}>{isExp ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {isExp && (
                    <div style={{ borderTop: `1px solid ${border}`, padding: "20px 24px" }}>
                      {interview.notes && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: muted, marginBottom: 8 }}>Notes</div>
                          <div style={{ fontSize: 13, color: navy, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{interview.notes}</div>
                        </div>
                      )}
                      {interview.prep_brief ? (
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: green, marginBottom: 8 }}>AI Prep Brief</div>
                          <div style={{ fontSize: 13, color: navy, lineHeight: 1.75, whiteSpace: "pre-wrap", background: offWhite, padding: "16px 18px", border: `1px solid ${border}` }}>
                            {interview.prep_brief}
                          </div>
                        </div>
                      ) : (
                        <div style={{ textAlign: "center", padding: "20px", color: muted, fontSize: 13 }}>
                          No prep brief yet. Click &quot;⚡ Prep Brief&quot; to generate one with Claude.
                        </div>
                      )}
                      {/* Status transitions */}
                      <div style={{ display: "flex", gap: 8, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${border}` }}>
                        {tab === "upcoming" && (
                          <button onClick={() => updateStatus(interview.id, "active")}
                            style={{ padding: "7px 14px", fontSize: 11, fontWeight: 700, fontFamily: "inherit", background: navy, color: white, border: "none", cursor: "pointer" }}>
                            Mark Active
                          </button>
                        )}
                        {tab === "active" && (
                          <>
                            <button onClick={() => updateStatus(interview.id, "past")}
                              style={{ padding: "7px 14px", fontSize: 11, fontWeight: 700, fontFamily: "inherit", background: green, color: white, border: "none", cursor: "pointer" }}>
                              Mark Complete
                            </button>
                            <button onClick={() => updateStatus(interview.id, "upcoming")}
                              style={{ padding: "7px 14px", fontSize: 11, fontWeight: 700, fontFamily: "inherit", background: white, color: muted, border: `1px solid ${border}`, cursor: "pointer" }}>
                              Back to Upcoming
                            </button>
                          </>
                        )}
                        {tab === "past" && (
                          <button onClick={() => updateStatus(interview.id, "active")}
                            style={{ padding: "7px 14px", fontSize: 11, fontWeight: 700, fontFamily: "inherit", background: white, color: muted, border: `1px solid ${border}`, cursor: "pointer" }}>
                            Reactivate
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ScheduleInterviewModal
        isOpen={showSchedule}
        onClose={() => setShowSchedule(false)}
        onScheduled={loadInterviews}
        job={null}
      />
    </div>
  );
}
