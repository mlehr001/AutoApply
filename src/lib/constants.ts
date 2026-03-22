import type { NavItem } from "@/types";

// ─── DESIGN SYSTEM COLORS ─────────────────────────────────────────────────────
export const COLORS = {
  navy:     "#2C3E50",
  navyDark: "#1E2C3A",
  navyLight:"#34495E",
  white:    "#FFFFFF",
  offWhite: "#F5F5F3",
  border:   "#E5E2DD",
  muted:    "#888888",
  green:    "#27AE60",
  amber:    "#F39C12",
  red:      "#E74C3C",
  blue:     "#2980B9",
} as const;

// ─── NAVIGATION ───────────────────────────────────────────────────────────────
export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Optimizer",  href: "/optimize",  icon: "⚡" },
  { label: "Jobs",       href: "/jobs",      icon: "🎯" },
];

// ─── JOB PIPELINE ─────────────────────────────────────────────────────────────
export const JOB_STATUSES = [
  "New",
  "Saved",
  "Applied",
  "Phone Screen",
  "Interview",
  "Offer",
  "Rejected",
] as const;

export const STATUS_COLORS: Record<string, string> = {
  New:            COLORS.muted,
  Saved:          COLORS.blue,
  Applied:        COLORS.navy,
  "Phone Screen": COLORS.amber,
  Interview:      COLORS.green,
  Offer:          "#16A085",
  Rejected:       COLORS.red,
};

// ─── MARC'S RESUME (source of truth for Claude prompts) ───────────────────────
export const MARC_RESUME = `
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
`.trim();

// ─── LAYOUT ───────────────────────────────────────────────────────────────────
export const SIDEBAR_WIDTH = 280;
export const NAV_HEIGHT    = 56;
