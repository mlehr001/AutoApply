"use client";

import { useState, useEffect } from "react";
import { X, Briefcase, Target, AlertTriangle, MessageSquare, HelpCircle } from "lucide-react";
import { track } from "@/lib/posthog";

interface RoleBriefPanelProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: string;
    title: string;
    company: string;
    description?: string;
  } | null;
}

export default function RoleBriefPanel({ isOpen, onClose, job }: RoleBriefPanelProps) {
  const [brief, setBrief] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"full" | "snapshot">("snapshot");

  useEffect(() => {
    if (isOpen && job && !brief) {
      generateBrief();
    }
  }, [isOpen, job]);

  async function generateBrief() {
    if (!job) return;
    setLoading(true);
    track.roleBriefGenerated(job.company, job.title);

    try {
      const res = await fetch("/api/role-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: job.title,
          company: job.company,
          jobDescription: job.description || "",
        }),
      });

      const data = await res.json();
      if (data.brief) {
        setBrief(data.brief);
      }
    } catch (err) {
      console.error("Failed to generate role brief:", err);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen || !job) return null;

  // Parse brief sections for snapshot view
  const sections = parseBriefSections(brief);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(44, 62, 80, 0.5)",
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: "100%",
          maxWidth: "500px",
          backgroundColor: "#FFFFFF",
          borderLeft: "1px solid #E5E2DD",
          overflow: "auto",
          animation: "slideIn 0.3s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "#1E2C3A",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-raleway)",
                fontWeight: 700,
                fontSize: "16px",
                color: "#FFFFFF",
              }}
            >
              Role Brief
            </div>
            <div
              style={{
                fontFamily: "var(--font-open-sans)",
                fontSize: "13px",
                color: "#888888",
                marginTop: "4px",
              }}
            >
              {job.title} at {job.company}
            </div>
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

        {/* Tab Switcher */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #E5E2DD",
            backgroundColor: "#F5F5F3",
          }}
        >
          <button
            onClick={() => setActiveTab("snapshot")}
            style={{
              flex: 1,
              padding: "12px",
              backgroundColor: activeTab === "snapshot" ? "#FFFFFF" : "transparent",
              border: "none",
              borderBottom: activeTab === "snapshot" ? "2px solid #2C3E50" : "none",
              fontFamily: "var(--font-raleway)",
              fontWeight: activeTab === "snapshot" ? 600 : 400,
              fontSize: "13px",
              color: activeTab === "snapshot" ? "#2C3E50" : "#888888",
              cursor: "pointer",
            }}
          >
            Snapshot
          </button>
          <button
            onClick={() => setActiveTab("full")}
            style={{
              flex: 1,
              padding: "12px",
              backgroundColor: activeTab === "full" ? "#FFFFFF" : "transparent",
              border: "none",
              borderBottom: activeTab === "full" ? "2px solid #2C3E50" : "none",
              fontFamily: "var(--font-raleway)",
              fontWeight: activeTab === "full" ? 600 : 400,
              fontSize: "13px",
              color: activeTab === "full" ? "#2C3E50" : "#888888",
              cursor: "pointer",
            }}
          >
            Full Brief
          </button>
        </div>

        <div style={{ padding: "24px" }}>
          {loading && (
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
              <p style={{ fontFamily: "var(--font-open-sans)", fontSize: "14px" }}>
                Generating role intelligence...
              </p>
            </div>
          )}

          {!loading && activeTab === "snapshot" && (
            <SnapshotView sections={sections} />
          )}

          {!loading && activeTab === "full" && (
            <div
              style={{
                fontFamily: "var(--font-open-sans)",
                fontSize: "14px",
                lineHeight: "1.7",
                color: "#2C3E50",
                whiteSpace: "pre-wrap",
              }}
            >
              {brief || "No brief generated yet."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Parse brief into structured sections
function parseBriefSections(brief: string): Record<string, string> {
  const sections: Record<string, string> = {};
  if (!brief) return sections;

  const patterns = [
    { key: "company", regex: /\*\*Company Snapshot\*\*:?\s*
?([^*]+)/i },
    { key: "fit", regex: /\*\*Why Marc Fits\*\*:?\s*
?([^*]+)/i },
    { key: "objections", regex: /\*\*Potential Objections\*\*:?\s*
?([^*]+)/i },
    { key: "talking", regex: /\*\*Key Talking Points\*\*:?\s*
?([^*]+)/i },
    { key: "questions", regex: /\*\*Questions to Ask\*\*:?\s*
?([^*]+)/i },
  ];

  patterns.forEach(({ key, regex }) => {
    const match = brief.match(regex);
    if (match) {
      sections[key] = match[1].trim();
    }
  });

  return sections;
}

function SnapshotView({ sections }: { sections: Record<string, string> }) {
  const cards = [
    {
      key: "company",
      icon: Briefcase,
      title: "Company Snapshot",
      color: "#2980B9",
    },
    {
      key: "fit",
      icon: Target,
      title: "Why You Fit",
      color: "#27AE60",
    },
    {
      key: "objections",
      icon: AlertTriangle,
      title: "Watch Outs",
      color: "#F39C12",
    },
    {
      key: "talking",
      icon: MessageSquare,
      title: "Key Talking Points",
      color: "#2C3E50",
    },
    {
      key: "questions",
      icon: HelpCircle,
      title: "Smart Questions",
      color: "#8E44AD",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {cards.map(({ key, icon: Icon, title, color }) => {
        const content = sections[key];
        if (!content) return null;

        return (
          <div
            key={key}
            style={{
              border: "1px solid #E5E2DD",
              backgroundColor: "#FFFFFF",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 16px",
                borderBottom: "1px solid #E5E2DD",
                backgroundColor: "#F5F5F3",
              }}
            >
              <Icon size={16} color={color} />
              <span
                style={{
                  fontFamily: "var(--font-raleway)",
                  fontWeight: 700,
                  fontSize: "12px",
                  color: "#2C3E50",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {title}
              </span>
            </div>
            <div
              style={{
                padding: "16px",
                fontFamily: "var(--font-open-sans)",
                fontSize: "13px",
                lineHeight: "1.6",
                color: "#2C3E50",
              }}
            >
              {content.split('
').map((line, i) => (
                <p key={i} style={{ margin: i === 0 ? 0 : "8px 0 0 0" }}>
                  {line.trim().startsWith('-') ? line.trim().slice(1).trim() : line.trim()}
                </p>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
