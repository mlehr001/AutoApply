import { createClient } from "@supabase/supabase-js";
import type { Job, ResumeVersion, AnalyticsSnapshot } from "@/types";

// Server-only client — uses service role key, bypasses RLS.
// Import only in Server Components, API route handlers, and Inngest functions.
// Never bundle into client-side code.
export function createServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ─── SERVER-SIDE HELPERS ──────────────────────────────────────────────────────
export async function serverGetActiveResume(): Promise<ResumeVersion | null> {
  const db = createServerSupabase();
  const { data } = await db
    .from("resume_versions")
    .select("*")
    .eq("is_active", true)
    .single();
  return data;
}

export async function serverGetNewJobsSince(hoursAgo: number): Promise<Job[]> {
  const db = createServerSupabase();
  const since = new Date();
  since.setHours(since.getHours() - hoursAgo);
  const { data } = await db
    .from("jobs")
    .select("*")
    .gte("created_at", since.toISOString())
    .gte("score", 70)
    .order("score", { ascending: false })
    .limit(10);
  return data || [];
}

export async function serverGetOverdueJobs(): Promise<Job[]> {
  const db = createServerSupabase();
  const today = new Date().toISOString().split("T")[0];
  const { data } = await db
    .from("jobs")
    .select("*")
    .lte("next_action_date", today)
    .not("status", "in", '("Offer","Rejected")')
    .order("next_action_date", { ascending: true });
  return data || [];
}

export async function serverGetRecentAnalytics(
  limit = 2
): Promise<AnalyticsSnapshot[]> {
  const db = createServerSupabase();
  const { data } = await db
    .from("analytics_snapshots")
    .select("*")
    .order("captured_at", { ascending: false })
    .limit(limit);
  return data || [];
}

export async function serverUpsertJobs(jobs: Partial<Job>[]): Promise<Job[]> {
  const db = createServerSupabase();
  const { data } = await db
    .from("jobs")
    .upsert(jobs, { onConflict: "external_id" })
    .select();
  return data || [];
}
