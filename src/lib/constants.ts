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
  { label: "Home",          href: "/",             icon: "⌂"  },
  { label: "Dashboard",     href: "/dashboard",    icon: "📊" },
  { label: "Positioning",   href: "/positioning",  icon: "⚡" },
  { label: "Opportunities", href: "/opportunities",icon: "🎯" },
  { label: "CRM",           href: "/crm",          icon: "📋" },
  { label: "Interview",     href: "/interview",    icon: "🎤" },
];

// ─── JOB PIPELINE ─────────────────────────────────────────────────────────────
export const JOB_STATUSES = [
  "New", "Saved", "Applied", "Phone Screen",
  "Interview", "Offer", "Rejected",
] as const;

export const STATUS_COLORS: Record<string, string> = {
  New:            "#888888",
  Saved:          "#2980B9",
  Applied:        "#2C3E50",
  "Phone Screen": "#F39C12",
  Interview:      "#27AE60",
  Offer:          "#16A085",
  Rejected:       "#E74C3C",
};

// ─── MARC'S FULL RESUME (source of truth for all Claude prompts) ───────────────
export const MARC_RESUME = `
NAME: Marc Lehrmann
TITLE: Strategic Partnerships / Business Development / Enterprise Sales
LOCATION: Southern California — open to remote & hybrid
CAREER REVENUE: $25M+
YEARS EXPERIENCE: 10+

EXPERIENCE:
- Assistant Sales Manager, AVEVA Select CA (2018–Present): California-exclusive AVEVA distributor — SCADA, HMI, PI System, IIoT. Enterprise and municipal accounts across energy, water, manufacturing. Complex multi-stakeholder procurement cycles. Executive, OT, and IT trust-building. Consistent revenue growth through solution-based selling and strategic upsell.

- Business Development, Radeus Labs (Jan 2024–Mar 2024): Satellite communications and advanced antenna systems. Defense and aerospace sector relationships. Consultative enterprise selling into highly technical procurement environments.

- Business Development Manager, Advantech USA (May 2021–Oct 2023): Industrial IoT hardware, edge computing, and embedded systems. OEM and VAR channel development. Grew partner ecosystem across manufacturing, energy, and transportation verticals. Deep alignment with OT/IT convergence trends.

- Key Account Manager, Dexxxon Digital Storage (Apr 2020–May 2021): Flash memory and LTO-Tape digital storage brands (EMTEC, Kodak, IBM, Quantum, HP). Key account expansion, strategic initiatives, negotiation, long-term partnerships.

- Channel Account Manager, Transcend Information (Feb 2014–Mar 2020): Ingram Micro and Synnex partnerships. $3M annual revenue. 30% YoY growth. 100% YoY growth for Apple embedded solutions and military-grade body cameras. 200+ reseller and channel partner network nationwide.

SKILLS: Enterprise Sales, Strategic Partnerships, Channel Development, SCADA, HMI, PI System, Industrial IoT, AVEVA, Satellite Communications, Edge Computing, Embedded Systems, OT/IT convergence, CRM, Negotiation, Solution Selling, AI literacy, Next.js, React, TypeScript, Supabase, Claude API, Product Development

EDUCATION: BA Economics, UC Riverside 2012

POSITIONING: "OT to AI bridge" — 10 years selling physical-world technology (industrial software, satellite comms, edge computing, storage) to enterprise customers. $25M+ career revenue. Now targeting AI platforms, data infrastructure, cloud, AdTech, entertainment tech. Active builder of 7 apps. Speaks product as fluently as pipeline.
`.trim();

// ─── LAYOUT ───────────────────────────────────────────────────────────────────
export const SIDEBAR_WIDTH = 280;
export const NAV_HEIGHT    = 56;
