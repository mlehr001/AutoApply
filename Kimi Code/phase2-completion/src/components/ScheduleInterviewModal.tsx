"use client";

import { useState } from "react";
import { X, Calendar, Clock, FileText } from "lucide-react";
import { track } from "@/lib/posthog";

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduled: () => void;
  job: {
    id: string;
    title: string;
    company: string;
  } | null;
}

type InterviewType = "phone_screen" | "hiring_manager" | "panel" | "final" | "technical";

const interviewTypes: { value: InterviewType; label: string; desc: string }[] = [
  { value: "phone_screen", label: "Phone Screen", desc: "Recruiter or HR call" },
  { value: "hiring_manager", label: "Hiring Manager", desc: "Direct manager interview" },
  { value: "panel", label: "Panel Interview", desc: "Multiple stakeholders" },
  { value: "technical", label: "Technical", desc: "Skills assessment or case study" },
  { value: "final", label: "Final Round", desc: "Executive or culture fit" },
];

export default function ScheduleInterviewModal({
  isOpen,
  onClose,
  onScheduled,
  job,
}: ScheduleInterviewModalProps) {
  const [interviewType, setInterviewType] = useState<InterviewType>("phone_screen");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !job) return null;

  async function scheduleInterview() {
    if (!date || !time) return;

    setLoading(true);
    const scheduledAt = new Date(`${date}T${time}`).toISOString();

    track.interviewScheduled(job.company, job.title, interviewType);

    try {
      const res = await fetch("/api/interview-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          company: job.company,
          title: job.title,
          interviewType,
          scheduledAt,
          notes,
        }),
      });

      if (res.ok) {
        onScheduled();
        onClose();
        // Reset form
        setInterviewType("phone_screen");
        setDate("");
        setTime("");
        setNotes("");
      }
    } catch (err) {
      console.error("Failed to schedule interview:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(44, 62, 80, 0.8)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          width: "100%",
          maxWidth: "480px",
          border: "1px solid #E5E2DD",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "#1E2C3A",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Calendar size={20} color="#FFFFFF" />
            <span
              style={{
                fontFamily: "var(--font-raleway)",
                fontWeight: 700,
                fontSize: "16px",
                color: "#FFFFFF",
              }}
            >
              Schedule Interview
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <X size={20} color="#FFFFFF" />
          </button>
        </div>

        <div style={{ padding: "24px" }}>
          {/* Job Info */}
          <div
            style={{
              backgroundColor: "#F5F5F3",
              padding: "16px",
              marginBottom: "24px",
              border: "1px solid #E5E2DD",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-raleway)",
                fontWeight: 600,
                fontSize: "14px",
                color: "#2C3E50",
              }}
            >
              {job.title}
            </div>
            <div
              style={{
                fontFamily: "var(--font-open-sans)",
                fontSize: "13px",
                color: "#888888",
                marginTop: "4px",
              }}
            >
              {job.company}
            </div>
          </div>

          {/* Interview Type */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                fontFamily: "var(--font-raleway)",
                fontWeight: 600,
                fontSize: "12px",
                color: "#2C3E50",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "block",
                marginBottom: "12px",
              }}
            >
              Interview Type
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {interviewTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setInterviewType(type.value)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    border: interviewType === type.value ? "2px solid #2C3E50" : "1px solid #E5E2DD",
                    backgroundColor: interviewType === type.value ? "#F5F5F3" : "#FFFFFF",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-raleway)",
                        fontWeight: 600,
                        fontSize: "13px",
                        color: "#2C3E50",
                      }}
                    >
                      {type.label}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-open-sans)",
                        fontSize: "12px",
                        color: "#888888",
                        marginTop: "2px",
                      }}
                    >
                      {type.desc}
                    </div>
                  </div>
                  {interviewType === type.value && (
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        backgroundColor: "#2C3E50",
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  fontFamily: "var(--font-raleway)",
                  fontWeight: 600,
                  fontSize: "12px",
                  color: "#2C3E50",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Date
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #E5E2DD",
                    fontFamily: "var(--font-open-sans)",
                    fontSize: "14px",
                    color: "#2C3E50",
                    backgroundColor: "#FFFFFF",
                  }}
                />
                <Calendar
                  size={16}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    color: "#888888",
                  }}
                />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  fontFamily: "var(--font-raleway)",
                  fontWeight: 600,
                  fontSize: "12px",
                  color: "#2C3E50",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Time
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #E5E2DD",
                    fontFamily: "var(--font-open-sans)",
                    fontSize: "14px",
                    color: "#2C3E50",
                    backgroundColor: "#FFFFFF",
                  }}
                />
                <Clock
                  size={16}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    color: "#888888",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                fontFamily: "var(--font-raleway)",
                fontWeight: 600,
                fontSize: "12px",
                color: "#2C3E50",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Interviewer names, agenda, prep reminders..."
              rows={3}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #E5E2DD",
                fontFamily: "var(--font-open-sans)",
                fontSize: "14px",
                color: "#2C3E50",
                backgroundColor: "#FFFFFF",
                resize: "vertical",
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "14px 24px",
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5E2DD",
                color: "#888888",
                fontFamily: "var(--font-raleway)",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={scheduleInterview}
              disabled={!date || !time || loading}
              style={{
                flex: 2,
                padding: "14px 24px",
                backgroundColor: !date || !time ? "#BDC3C7" : "#2C3E50",
                border: "none",
                color: "#FFFFFF",
                fontFamily: "var(--font-raleway)",
                fontWeight: 700,
                fontSize: "14px",
                cursor: !date || !time ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Scheduling..." : "Schedule Interview"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
