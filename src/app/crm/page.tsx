"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { STATUS_COLORS, COLORS } from "@/lib/constants";

const { navy, navyDark, offWhite, white, border, muted, green } = COLORS;

interface Application {
  id: string;
  job_title: string;
  company: string;
  status: string;
  contact_name?: string;
  applied_date?: string;
  notes?: string;
}

interface Contact {
  id: string;
  name: string;
  company?: string;
  title?: string;
  email?: string;
  linkedin?: string;
  relationship?: string;
  notes?: string;
}

const PIPELINE_COLUMNS = [
  "Drafting", "Applied", "Recruiter Screen", "HM Screen",
  "Interview", "Final", "Offer", "Rejected",
];

export default function CRMPage() {
  const [tab,          setTab]          = useState<"pipeline" | "contacts">("pipeline");
  const [applications, setApplications] = useState<Application[]>([]);
  const [contacts,     setContacts]     = useState<Contact[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [showAddApp,   setShowAddApp]   = useState(false);

  // New application form state
  const [newApp, setNewApp] = useState({ job_title: "", company: "", status: "Drafting" });

  useEffect(() => {
    async function load() {
      try {
        const [appsRes, contactsRes] = await Promise.all([
          supabase.from("applications").select("*").order("created_at", { ascending: false }),
          supabase.from("contacts").select("*").order("name"),
        ]);
        setApplications(appsRes.data || []);
        setContacts(contactsRes.data || []);
      } catch { /* tables may not exist yet — empty state */ }
      setLoading(false);
    }
    load();
  }, []);

  async function addApplication() {
    if (!newApp.job_title.trim() || !newApp.company.trim()) return;
    try {
      const { data } = await supabase.from("applications").insert(newApp).select().single();
      if (data) setApplications(prev => [data, ...prev]);
    } catch { /* table not set up yet */ }
    setNewApp({ job_title: "", company: "", status: "Drafting" });
    setShowAddApp(false);
  }

  async function moveApp(id: string, status: string) {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    try { await supabase.from("applications").update({ status }).eq("id", id); } catch { /* non-blocking */ }
  }

  return (
    <div style={{ minHeight: "100vh", background: offWhite, fontFamily: "var(--font-open-sans), system-ui, sans-serif", fontSize: 14, color: navy }}>

      {/* PAGE HEADER */}
      <div style={{ background: navyDark, padding: "0 32px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontFamily: "var(--font-raleway), sans-serif", fontWeight: 800, fontSize: 15, color: white, letterSpacing: "-0.01em" }}>CRM</div>
        <button
          onClick={() => setShowAddApp(true)}
          style={{ padding: "8px 18px", background: white, color: navy, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>
          + Add Application
        </button>
      </div>

      {/* TABS */}
      <div style={{ background: white, borderBottom: `1px solid ${border}`, padding: "0 32px", display: "flex" }}>
        {(["pipeline", "contacts"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: "none", border: "none", cursor: "pointer",
            padding: "14px 20px", fontSize: 12, fontWeight: 700,
            letterSpacing: "0.07em", textTransform: "uppercase" as const,
            color: tab === t ? navy : muted,
            borderBottom: tab === t ? `2px solid ${navy}` : "2px solid transparent",
          }}>{t}</button>
        ))}
      </div>

      <div style={{ padding: "28px 32px" }}>

        {/* ADD APPLICATION MODAL */}
        {showAddApp && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: white, padding: "32px", width: 480, border: `2px solid ${navy}` }}>
              <div style={{ fontFamily: "var(--font-raleway), sans-serif", fontWeight: 800, fontSize: 16, color: navy, marginBottom: 20 }}>Add Application</div>
              {[
                { label: "Job Title", key: "job_title" as const, placeholder: "Director of Strategic Partnerships" },
                { label: "Company",   key: "company"   as const, placeholder: "Databricks" },
              ].map(field => (
                <div key={field.key} style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: navy, marginBottom: 6 }}>{field.label}</label>
                  <input
                    value={newApp[field.key]}
                    onChange={e => setNewApp(p => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    style={{ width: "100%", padding: "10px 12px", border: `1px solid ${border}`, fontSize: 13, color: navy, outline: "none", fontFamily: "inherit", background: offWhite }}
                  />
                </div>
              ))}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: navy, marginBottom: 6 }}>Status</label>
                <select
                  value={newApp.status}
                  onChange={e => setNewApp(p => ({ ...p, status: e.target.value }))}
                  style={{ width: "100%", padding: "10px 12px", border: `1px solid ${border}`, fontSize: 13, color: navy, outline: "none", fontFamily: "inherit", background: offWhite }}>
                  {PIPELINE_COLUMNS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={addApplication} style={{ flex: 1, background: navy, color: white, border: "none", padding: "12px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Add</button>
                <button onClick={() => setShowAddApp(false)} style={{ flex: 1, background: offWhite, color: navy, border: `1px solid ${border}`, padding: "12px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* PIPELINE TAB */}
        {tab === "pipeline" && (
          <div>
            {loading ? (
              <div style={{ padding: 40, textAlign: "center", color: muted }}>Loading pipeline…</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <div style={{ display: "flex", gap: 12, minWidth: 800 }}>
                  {PIPELINE_COLUMNS.map(col => {
                    const colApps = applications.filter(a => a.status === col);
                    return (
                      <div key={col} style={{ flex: "0 0 180px", background: white, border: `1px solid ${border}` }}>
                        {/* Column header */}
                        <div style={{ padding: "12px 14px", borderBottom: `2px solid ${STATUS_COLORS[col] ?? muted}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontFamily: "var(--font-raleway), sans-serif", fontWeight: 800, fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.07em", color: navy }}>{col}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: STATUS_COLORS[col] ?? muted }}>{colApps.length}</span>
                        </div>
                        {/* Cards */}
                        <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8, minHeight: 120 }}>
                          {colApps.length === 0 ? (
                            <div style={{ fontSize: 11, color: muted, textAlign: "center", padding: "20px 0" }}>Empty</div>
                          ) : (
                            colApps.map(app => (
                              <div key={app.id} style={{ background: offWhite, border: `1px solid ${border}`, padding: "10px 12px" }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: navy, marginBottom: 3 }}>{app.job_title}</div>
                                <div style={{ fontSize: 11, color: muted, marginBottom: 8 }}>{app.company}</div>
                                <select
                                  value={app.status}
                                  onChange={e => moveApp(app.id, e.target.value)}
                                  onClick={e => e.stopPropagation()}
                                  style={{ width: "100%", padding: "4px 6px", fontSize: 10, border: `1px solid ${border}`, background: white, color: navy, outline: "none", fontFamily: "inherit" }}>
                                  {PIPELINE_COLUMNS.map(s => <option key={s}>{s}</option>)}
                                </select>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!loading && applications.length === 0 && (
              <div style={{ marginTop: 32, textAlign: "center", padding: "48px 24px", background: white, border: `1px solid ${border}` }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>📋</div>
                <div style={{ fontFamily: "var(--font-raleway), sans-serif", fontWeight: 800, fontSize: 18, color: navy, marginBottom: 8 }}>Pipeline is empty</div>
                <div style={{ fontSize: 13, color: muted, marginBottom: 20 }}>Add your first application to start tracking your search.</div>
                <button onClick={() => setShowAddApp(true)}
                  style={{ padding: "12px 28px", background: navy, color: white, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>
                  + Add Application
                </button>
              </div>
            )}
          </div>
        )}

        {/* CONTACTS TAB */}
        {tab === "contacts" && (
          <div>
            {loading ? (
              <div style={{ padding: 40, textAlign: "center", color: muted }}>Loading contacts…</div>
            ) : contacts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 24px", background: white, border: `1px solid ${border}` }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>👤</div>
                <div style={{ fontFamily: "var(--font-raleway), sans-serif", fontWeight: 800, fontSize: 18, color: navy, marginBottom: 8 }}>No contacts yet</div>
                <div style={{ fontSize: 13, color: muted }}>Contacts will appear here as you add recruiters and hiring managers from your applications.</div>
              </div>
            ) : (
              <div style={{ background: white, border: `1px solid ${border}` }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${navy}` }}>
                      {["Name", "Company", "Title", "Email", "LinkedIn", "Relationship"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.07em", color: muted, fontWeight: 700 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((c, i) => (
                      <tr key={c.id} style={{ borderBottom: `1px solid ${border}`, background: i % 2 === 0 ? white : offWhite }}>
                        <td style={{ padding: "10px 14px", fontWeight: 700, color: navy }}>{c.name}</td>
                        <td style={{ padding: "10px 14px", color: muted }}>{c.company}</td>
                        <td style={{ padding: "10px 14px", color: muted }}>{c.title}</td>
                        <td style={{ padding: "10px 14px" }}>{c.email && <a href={`mailto:${c.email}`} style={{ color: navy }}>{c.email}</a>}</td>
                        <td style={{ padding: "10px 14px" }}>{c.linkedin && <a href={c.linkedin} target="_blank" rel="noreferrer" style={{ color: "#0077B5" }}>Profile ↗</a>}</td>
                        <td style={{ padding: "10px 14px" }}>
                          <span style={{ padding: "3px 8px", fontSize: 11, fontWeight: 700, background: green + "15", color: green }}>{c.relationship || "Contact"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
