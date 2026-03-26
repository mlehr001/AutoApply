"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { track } from "@/lib/posthog";
import {
  Mic,
  Calendar,
  Building,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileText,
  Plus,
} from "lucide-react";
import ScheduleInterviewModal from "@/components/ScheduleInterviewModal";

type InterviewStatus = "upcoming" | "active" | "past";

interface Interview {
  id: string;
  company: string;
  job_title: string;
  interview_type: string;
  scheduled_at: string;
  status: InterviewStatus;
  notes?: string;
  prep_brief?: string;
}

export default function InterviewPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<InterviewStatus>("upcoming");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [prepLoadingId, setPrepLoadingId] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  useEffect(() => {
    loadInterviews();
  }, []);

  async function loadInterviews() {
    setLoading(true);
    const { data } = await supabase
      .from("interviews")
      .select("*")
      .order("scheduled_at", { ascending: true });

    setInterviews(data || []);
    setLoading(false);
  }

  async function generatePrepBrief(interview: Interview) {
    setPrepLoadingId(interview.id);
    track.prepBriefGenerated(interview.company, interview.job_title);

    try {
      const res = await fetch("/api/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: interview.job_title,
          company: interview.company,
          interviewType: interview.interview_type,
          notes: interview.notes || "",
        }),
      });

      const data = await res.json();
      if (data.brief) {
        // Update local state
        setInterviews((prev) =>
          prev.map((i) =>
            i.id === interview.id ? { ...i, prep_brief: data.brief } : i
          )
        );

        // Persist to Supabase
        await supabase
          .from("interviews")
          .update({ prep_brief: data.brief })
          .eq("id", interview.id);
      }
    } catch (err) {
      console.error("Failed to generate prep brief:", err);
    } finally {
      setPrepLoadingId(null);
    }
  }

  function updateInterviewStatus(id: string, newStatus: InterviewStatus) {
    supabase
      .from("interviews")
      .update({ status: newStatus })
      .eq("id", id)
      .then(() => {
        setInterviews((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
        );
      });
  }

  const filteredInterviews = interviews.filter((i) => i.status === activeTab);

  const tabs: { key: InterviewStatus; label: string }[] = [
    { key: "upcoming", label: "Upcoming" },
    { key: "active", label: "Active" },
    { key: "past", label: "Past" },
  ];

  const interviewTypeLabels: Record<string, string> = {
    phone_screen: "Phone Screen",
    hiring_manager: "Hiring Manager",
    panel: "Panel",
    technical: "Technical",
    final: "Final Round",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F3" }}>
      {/* Nav */}
      <nav
        style={{
          height: "56px",
          backgroundColor: "#1E2C3A",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-raleway)",
            fontWeight: 700,
            fontSize: "16px",
            color: "#FFFFFF",
          }}
        >
          Interview Prep
        </span>
        <button
          onClick={() => setShowScheduleModal(true)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#27AE60",
            border: "none",
            color: "#FFFFFF",
            fontFamily: "var(--font-raleway)",
            fontWeight: 600,
            fontSize: "13px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Plus size={14} />
          Schedule New
        </button>
      </nav>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              fontFamily: "var(--font-raleway)",
              fontWeight: 800,
              fontSize: "28px",
              color: "#2C3E50",
              marginBottom: "8px",
            }}
          >
            Interview Command Center
          </h1>
          <p
            style={{
              fontFamily: "var(--font-open-sans)",
              fontSize: "14px",
              color: "#888888",
            }}
          >
            Track conversations, generate prep briefs, and move offers forward.
          </p>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          {[
            { label: "Upcoming", value: interviews.filter((i) => i.status === "upcoming").length, color: "#2980B9" },
            { label: "Active", value: interviews.filter((i) => i.status === "active").length, color: "#F39C12" },
            { label: "Past", value: interviews.filter((i) => i.status === "past").length, color: "#888888" },
            { label: "With Prep", value: interviews.filter((i) => i.prep_brief).length, color: "#27AE60" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5E2DD",
                padding: "20px",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-raleway)",
                  fontWeight: 800,
                  fontSize: "32px",
                  color: stat.color,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-open-sans)",
                  fontSize: "13px",
                  color: "#888888",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: "2px solid #E5E2DD",
            marginBottom: "24px",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "12px 24px",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: activeTab === tab.key ? "2px solid #2C3E50" : "none",
                fontFamily: "var(--font-raleway)",
                fontWeight: activeTab === tab.key ? 700 : 400,
                fontSize: "14px",
                color: activeTab === tab.key ? "#2C3E50" : "#888888",
                cursor: "pointer",
                marginBottom: "-2px",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Interview List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#888888" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                border: "3px solid #E5E2DD",
                borderTopColor: "#2C3E50",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 16px",
              }}
            />
            <p style={{ fontFamily: "var(--font-open-sans)" }}>Loading interviews...</p>
          </div>
        ) : filteredInterviews.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "64px 24px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E2DD",
            }}
          >
            <Mic size={48} color="#E5E2DD" style={{ marginBottom: "16px" }} />
            <h3
              style={{
                fontFamily: "var(--font-raleway)",
                fontWeight: 600,
                fontSize: "18px",
                color: "#2C3E50",
                marginBottom: "8px",
              }}
            >
              No {activeTab} interviews
            </h3>
            <p
              style={{
                fontFamily: "var(--font-open-sans)",
                fontSize: "14px",
                color: "#888888",
                maxWidth: "400px",
                margin: "0 auto",
              }}
            >
              {activeTab === "upcoming"
                ? "Schedule interviews from your opportunities or add them directly here."
                : activeTab === "active"
                ? "Move upcoming interviews here when you're in the process."
                : "Mark interviews as past to keep your history."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {filteredInterviews.map((interview) => {
              const isExpanded = expandedId === interview.id;
              const isPrepLoading = prepLoadingId === interview.id;
              const scheduledDate = new Date(interview.scheduled_at);

              return (
                <div
                  key={interview.id}
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E2DD",
                  }}
                >
                  {/* Card Header */}
                  <div
                    style={{
                      padding: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                    }}
                    onClick={() => setExpandedId(isExpanded ? null : interview.id)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          backgroundColor: "#F5F5F3",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Building size={24} color="#2C3E50" />
                      </div>
                      <div>
                        <h3
                          style={{
                            fontFamily: "var(--font-raleway)",
                            fontWeight: 700,
                            fontSize: "16px",
                            color: "#2C3E50",
                            marginBottom: "4px",
                          }}
                        >
                          {interview.job_title}
                        </h3>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            fontFamily: "var(--font-open-sans)",
                            fontSize: "13px",
                            color: "#888888",
                          }}
                        >
                          <span>{interview.company}</span>
                          <span>•</span>
                          <span style={{ color: "#2980B9" }}>
                            {interviewTypeLabels[interview.interview_type] || interview.interview_type}
                          </span>
                          <span>•</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <Calendar size={12} />
                            {scheduledDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {/* Prep Status */}
                      {interview.prep_brief ? (
                        <span
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "#27AE60",
                            color: "#FFFFFF",
                            fontFamily: "var(--font-raleway)",
                            fontWeight: 600,
                            fontSize: "11px",
                            textTransform: "uppercase",
                          }}
                        >
                          ✓ Prep Ready
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            generatePrepBrief(interview);
                          }}
                          disabled={isPrepLoading}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: isPrepLoading ? "#BDC3C7" : "#F39C12",
                            border: "none",
                            color: "#FFFFFF",
                            fontFamily: "var(--font-raleway)",
                            fontWeight: 600,
                            fontSize: "11px",
                            cursor: isPrepLoading ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Sparkles size={12} />
                          {isPrepLoading ? "Generating..." : "⚡ Prep Brief"}
                        </button>
                      )}

                      {/* Expand Icon */}
                      {isExpanded ? (
                        <ChevronUp size={20} color="#888888" />
                      ) : (
                        <ChevronDown size={20} color="#888888" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div
                      style={{
                        borderTop: "1px solid #E5E2DD",
                        padding: "20px",
                        backgroundColor: "#F5F5F3",
                      }}
                    >
                      {/* Notes */}
                      {interview.notes && (
                        <div
                          style={{
                            backgroundColor: "#FFFFFF",
                            border: "1px solid #E5E2DD",
                            padding: "16px",
                            marginBottom: "16px",
                          }}
                        >
                          <div
                            style={{
                              fontFamily: "var(--font-raleway)",
                              fontWeight: 600,
                              fontSize: "11px",
                              color: "#888888",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              marginBottom: "8px",
                            }}
                          >
                            Your Notes
                          </div>
                          <p
                            style={{
                              fontFamily: "var(--font-open-sans)",
                              fontSize: "14px",
                              color: "#2C3E50",
                              margin: 0,
                            }}
                          >
                            {interview.notes}
                          </p>
                        </div>
                      )}

                      {/* Prep Brief */}
                      {interview.prep_brief ? (
                        <div
                          style={{
                            backgroundColor: "#FFFFFF",
                            border: "1px solid #E5E2DD",
                            padding: "20px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              marginBottom: "16px",
                            }}
                          >
                            <FileText size={18} color="#2980B9" />
                            <span
                              style={{
                                fontFamily: "var(--font-raleway)",
                                fontWeight: 700,
                                fontSize: "14px",
                                color: "#2C3E50",
                              }}
                            >
                              AI Prep Brief
                            </span>
                          </div>
                          <div
                            style={{
                              fontFamily: "var(--font-open-sans)",
                              fontSize: "14px",
                              lineHeight: "1.7",
                              color: "#2C3E50",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {interview.prep_brief}
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            textAlign: "center",
                            padding: "32px",
                            color: "#888888",
                            fontFamily: "var(--font-open-sans)",
                            fontSize: "14px",
                          }}
                        >
                          <Sparkles size={24} style={{ marginBottom: "8px" }} />
                          <p>
                            No prep brief yet. Click "⚡ Prep Brief" to generate one with Claude.
                          </p>
                        </div>
                      )}

                      {/* Status Actions */}
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          marginTop: "16px",
                          paddingTop: "16px",
                          borderTop: "1px solid #E5E2DD",
                        }}
                      >
                        {activeTab === "upcoming" && (
                          <button
                            onClick={() => updateInterviewStatus(interview.id, "active")}
                            style={{
                              padding: "8px 16px",
                              backgroundColor: "#2980B9",
                              border: "none",
                              color: "#FFFFFF",
                              fontFamily: "var(--font-raleway)",
                              fontWeight: 600,
                              fontSize: "12px",
                              cursor: "pointer",
                            }}
                          >
                            Mark as Active
                          </button>
                        )}
                        {activeTab === "active" && (
                          <>
                            <button
                              onClick={() => updateInterviewStatus(interview.id, "past")}
                              style={{
                                padding: "8px 16px",
                                backgroundColor: "#27AE60",
                                border: "none",
                                color: "#FFFFFF",
                                fontFamily: "var(--font-raleway)",
                                fontWeight: 600,
                                fontSize: "12px",
                                cursor: "pointer",
                              }}
                            >
                              Mark Complete
                            </button>
                            <button
                              onClick={() => updateInterviewStatus(interview.id, "upcoming")}
                              style={{
                                padding: "8px 16px",
                                backgroundColor: "#FFFFFF",
                                border: "1px solid #E5E2DD",
                                color: "#888888",
                                fontFamily: "var(--font-raleway)",
                                fontWeight: 600,
                                fontSize: "12px",
                                cursor: "pointer",
                              }}
                            >
                              Back to Upcoming
                            </button>
                          </>
                        )}
                        {activeTab === "past" && (
                          <button
                            onClick={() => updateInterviewStatus(interview.id, "active")}
                            style={{
                              padding: "8px 16px",
                              backgroundColor: "#FFFFFF",
                              border: "1px solid #E5E2DD",
                              color: "#888888",
                              fontFamily: "var(--font-raleway)",
                              fontWeight: 600,
                              fontSize: "12px",
                              cursor: "pointer",
                            }}
                          >
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

      {/* Schedule Modal */}
      <ScheduleInterviewModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onScheduled={loadInterviews}
        job={null}
      />
    </div>
  );
}
