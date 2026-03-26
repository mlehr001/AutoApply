"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect } from "react";

// ─── INIT ─────────────────────────────────────────────────────────────────────
if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host:         process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    capture_pageview: true,
    capture_pageleave: true,
    autocapture:      false,
  });
}

// ─── PROVIDER ─────────────────────────────────────────────────────────────────
export function PosthogProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

// ─── TYPED EVENT TRACKER ──────────────────────────────────────────────────────
export const track = {
  // Job Matcher events
  jobsScored:      (count: number) =>
    posthog.capture("jobs_scored", { count }),
  jobApplied:      (company: string, score: number) =>
    posthog.capture("job_applied", { company, score }),
  jobSaved:        (company: string) =>
    posthog.capture("job_saved", { company }),
  jobStatusChanged:(company: string, status: string) =>
    posthog.capture("job_status_changed", { company, status }),

  // Optimizer events
  roleSelected:    (roleId: string, roleTitle: string, company: string) =>
    posthog.capture("role_selected", { roleId, roleTitle, company }),
  rewriteRan:      (sectionId: string, targetRole: string) =>
    posthog.capture("rewrite_ran", { sectionId, targetRole }),
  rewriteAccepted: (sectionId: string, targetRole: string) =>
    posthog.capture("rewrite_accepted", { sectionId, targetRole }),
  rewriteRejected: (sectionId: string, targetRole: string) =>
    posthog.capture("rewrite_rejected", { sectionId, targetRole }),

  // Dashboard events
  dashboardViewed: () =>
    posthog.capture("dashboard_viewed"),
  analyticsRefreshed: () =>
    posthog.capture("analytics_refreshed"),

  // Digest events
  digestOpened:    () =>
    posthog.capture("digest_opened"),
};
