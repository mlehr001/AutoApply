// ─── RESUME ───────────────────────────────────────────────────────────────────
export interface ResumeSection {
  id: string;
  title: string;
  weight: number;
  content: string;
}

export interface ResumeVersion {
  id: string;
  created_at: string;
  version_name: string;
  target_role: string | null;
  summary: string | null;
  sections: ResumeSection[];
  score: number | null;
  is_active: boolean;
}

// ─── JOBS ─────────────────────────────────────────────────────────────────────
export type JobStatus =
  | "New"
  | "Saved"
  | "Applied"
  | "Phone Screen"
  | "Interview"
  | "Offer"
  | "Rejected";

export interface Job {
  id: string;
  created_at: string;
  external_id: string | null;
  title: string;
  company: string;
  location: string | null;
  source: string | null;
  url: string | null;
  tags: string[] | null;
  score: number | null;
  match_label: string | null;
  reasons: string[] | null;
  red_flags: string[] | null;
  apply_urgency: string | null;
  status: JobStatus;
  notes: string | null;
  contact_name: string | null;
  contact_url: string | null;
  next_action_date: string | null;
  scored_at: string | null;
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
export interface SectionAnalytics {
  id: string;
  title: string;
  scrollPct: number;
  avgSeconds: number;
}

export interface AnalyticsSnapshot {
  id: string;
  captured_at: string;
  total_visits: number | null;
  unique_visitors: number | null;
  calendly_clicks: number | null;
  avg_scroll_depth: number | null;
  sections: SectionAnalytics[] | null;
  sources: Record<string, number> | null;
  devices: Record<string, number> | null;
  geo: Record<string, number> | null;
}

// ─── SCORING ──────────────────────────────────────────────────────────────────
export interface JobScoreResult {
  id: string | number;
  score: number;
  matchLabel: string;
  reasons: string[];
  redFlags: string[];
  applyUrgency: string;
}

// ─── NAV ──────────────────────────────────────────────────────────────────────
export interface NavItem {
  label: string;
  href: string;
  icon: string;
}
