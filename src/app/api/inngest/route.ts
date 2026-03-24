import { serve } from "inngest/next";
import { Inngest } from "inngest";

// Inngest client — functions registered here will be invoked by Inngest Cloud
const inngest = new Inngest({ id: "resumai" });

// ─── PLACEHOLDER FUNCTIONS (Phase 2+ will expand these) ──────────────────────
// dailyDigest: runs every morning, scores new jobs, emails top matches
// analyticsCapture: polls GA4, inserts analytics_snapshots row
// resumeScoreRefresh: re-scores active resume version weekly

const dailyDigest = inngest.createFunction(
  { id: "daily-digest", name: "Daily Job Digest", triggers: [{ cron: "0 8 * * 1-5" }] }, // 8am Mon–Fri
  async () => {
    // Phase 3 implementation: fetch new jobs → score → send email via Resend
    return { status: "ok", message: "Daily digest scheduled — implementation in Phase 3" };
  }
);

const analyticsCapture = inngest.createFunction(
  { id: "analytics-capture", name: "Analytics Snapshot Capture", triggers: [{ cron: "0 0 * * *" }] }, // midnight daily
  async () => {
    // Phase 2 implementation: GA4 API → analytics_snapshots table
    return { status: "ok", message: "Analytics capture scheduled — implementation in Phase 2" };
  }
);

export const { GET, POST, PUT } = serve({
  client:    inngest,
  functions: [dailyDigest, analyticsCapture],
});
