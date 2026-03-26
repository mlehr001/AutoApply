"use client";

import { useState } from "react";
import { X, Copy, Check, Sparkles, FileText } from "lucide-react";
import { track } from "@/lib/posthog";

interface CoverLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: string;
    title: string;
    company: string;
    description?: string;
  } | null;
}

type Tone = "confident-direct" | "warm-professional" | "aggressive-closer";

const toneOptions: { value: Tone; label: string; desc: string }[] = [
  { value: "confident-direct", label: "Confident & Direct", desc: "Marc's default voice — sharp, no fluff" },
  { value: "warm-professional", label: "Warm Professional", desc: "Relationship-building, partnership-focused" },
  { value: "aggressive-closer", label: "Aggressive Closer", desc: "High-energy, revenue-obsessed, competitive" },
];

export default function CoverLetterModal({ isOpen, onClose, job }: CoverLetterModalProps) {
  const [tone, setTone] = useState<Tone>("confident-direct");
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!isOpen || !job) return null;

  async function generateLetter() {
    setLoading(true);
    setLetter("");
    setSaved(false);
    track.coverLetterGenerated(job.company, job.title, tone);

    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: job.title,
          company: job.company,
          jobDescription: job.description || "",
          tone,
        }),
      });

      const data = await res.json();
      if (data.letter) {
        setLetter(data.letter);
      }
    } catch (err) {
      console.error("Failed to generate cover letter:", err);
    } finally {
      setLoading(false);
    }
  }

  async function saveToSupabase() {
    if (!letter) return;

    try {
      const { supabase } = await import("@/lib/supabase");
      await supabase.from("cover_letters").upsert({
        job_id: job.id,
        company: job.company,
        title: job.title,
        tone,
        content: letter,
        created_at: new Date().toISOString(),
      }, { onConflict: "job_id" });
      setSaved(true);
      track.coverLetterSaved(job.company, job.title);
    } catch (err) {
      console.error("Failed to save cover letter:", err);
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          maxWidth: "800px",
          maxHeight: "90vh",
          overflow: "auto",
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
            <FileText size={20} color="#FFFFFF" />
            <span
              style={{
                fontFamily: "var(--font-raleway)",
                fontWeight: 700,
                fontSize: "16px",
                color: "#FFFFFF",
              }}
            >
              Cover Letter — {job.title} at {job.company}
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
          {/* Tone Selector */}
          {!letter && !loading && (
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
                  marginBottom: "12px",
                }}
              >
                Select Tone
              </label>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {toneOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTone(option.value)}
                    style={{
                      flex: "1",
                      minWidth: "150px",
                      padding: "16px",
                      border: tone === option.value ? "2px solid #2C3E50" : "1px solid #E5E2DD",
                      backgroundColor: tone === option.value ? "#F5F5F3" : "#FFFFFF",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-raleway)",
                        fontWeight: 600,
                        fontSize: "14px",
                        color: "#2C3E50",
                        marginBottom: "4px",
                      }}
                    >
                      {option.label}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-open-sans)",
                        fontSize: "12px",
                        color: "#888888",
                      }}
                    >
                      {option.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Generate Button */}
          {!letter && !loading && (
            <button
              onClick={generateLetter}
              style={{
                width: "100%",
                padding: "16px 24px",
                backgroundColor: "#2C3E50",
                color: "#FFFFFF",
                border: "none",
                fontFamily: "var(--font-raleway)",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <Sparkles size={18} />
              Generate Cover Letter with Claude
            </button>
          )}

          {/* Loading State */}
          {loading && (
            <div
              style={{
                padding: "48px",
                textAlign: "center",
                color: "#888888",
                fontFamily: "var(--font-open-sans)",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  border: "3px solid #E5E2DD",
                  borderTopColor: "#2C3E50",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 16px",
                }}
              />
              <p>Claude is writing your cover letter...</p>
            </div>
          )}

          {/* Generated Letter */}
          {letter && !loading && (
            <>
              <div
                style={{
                  backgroundColor: "#F5F5F3",
                  padding: "24px",
                  border: "1px solid #E5E2DD",
                  marginBottom: "16px",
                  fontFamily: "var(--font-open-sans)",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  color: "#2C3E50",
                  whiteSpace: "pre-wrap",
                }}
              >
                {letter}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={copyToClipboard}
                  style={{
                    flex: "1",
                    padding: "12px 24px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #2C3E50",
                    color: "#2C3E50",
                    fontFamily: "var(--font-raleway)",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "Copied!" : "Copy to Clipboard"}
                </button>

                <button
                  onClick={saveToSupabase}
                  style={{
                    flex: "1",
                    padding: "12px 24px",
                    backgroundColor: saved ? "#27AE60" : "#2C3E50",
                    border: "none",
                    color: "#FFFFFF",
                    fontFamily: "var(--font-raleway)",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  {saved ? "Saved to Database" : "Save to Database"}
                </button>

                <button
                  onClick={() => {
                    setLetter("");
                    setSaved(false);
                  }}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E2DD",
                    color: "#888888",
                    fontFamily: "var(--font-raleway)",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Regenerate
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
