import { createClient } from "@supabase/supabase-js";
import type { Job, ResumeVersion, AnalyticsSnapshot } from "@/types";

// Browser client — uses public anon key, safe to expose
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── RESUME HELPERS ───────────────────────────────────────────────────────────
export async function getActiveResume(): Promise<ResumeVersion | null> {
  const { data } = await supabase
    .from("resume_versions")
    .select("*")
    .eq("is_active", true)
    .single();
  return data;
}

export async function getAllResumeVersions(): Promise<ResumeVersion[]> {
  const { data } = await supabase
    .from("resume_versions")
    .select("*")
    .order("created_at", { ascending: false });
  return data || [];
}

export async function saveResumeVersion(
  version: Partial<ResumeVersion>
): Promise<ResumeVersion | null> {
  const { data } = await supabase
    .from("resume_versions")
    .insert(version)
    .select()
    .single();
  return data;
}

export async function updateResumeVersion(
  id: string,
  updates: Partial<ResumeVersion>
): Promise<void> {
  await supabase.from("resume_versions").update(updates).eq("id", id);
}

export async function setActiveResume(id: string): Promise<void> {
  // Deactivate all, then activate the target
  await supabase.from("resume_versions").update({ is_active: false }).neq("id", id);
  await supabase.from("resume_versions").update({ is_active: true }).eq("id", id);
}

// ─── JOB HELPERS ─────────────────────────────────────────────────────────────
export async function getJobs(status?: string): Promise<Job[]> {
  let query = supabase
    .from("jobs")
    .select("*")
    .order("score", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data } = await query;
  return data || [];
}

export async function getJobById(id: string): Promise<Job | null> {
  const { data } = await supabase.from("jobs").select("*").eq("id", id).single();
  return data;
}

export async function insertJob(job: Partial<Job>): Promise<Job | null> {
  const { data } = await supabase.from("jobs").insert(job).select().single();
  return data;
}

export async function upsertJobs(jobs: Partial<Job>[]): Promise<Job[]> {
  const { data } = await supabase
    .from("jobs")
    .upsert(jobs, { onConflict: "external_id" })
    .select();
  return data || [];
}

export async function updateJobStatus(
  id: string,
  status: string,
  notes?: string
): Promise<void> {
  const update: Record<string, string> = { status };
  if (notes !== undefined) update.notes = notes;
  await supabase.from("jobs").update(update).eq("id", id);
}

export async function updateJob(
  id: string,
  updates: Partial<Job>
): Promise<void> {
  await supabase.from("jobs").update(updates).eq("id", id);
}

export async function deleteJob(id: string): Promise<void> {
  await supabase.from("jobs").delete().eq("id", id);
}

// ─── ANALYTICS HELPERS ────────────────────────────────────────────────────────
export async function getLatestAnalytics(): Promise<AnalyticsSnapshot | null> {
  const { data } = await supabase
    .from("analytics_snapshots")
    .select("*")
    .order("captured_at", { ascending: false })
    .limit(1)
    .single();
  return data;
}

export async function getAnalyticsHistory(days = 14): Promise<AnalyticsSnapshot[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data } = await supabase
    .from("analytics_snapshots")
    .select("*")
    .gte("captured_at", since.toISOString())
    .order("captured_at", { ascending: true });
  return data || [];
}

export async function insertAnalyticsSnapshot(
  snapshot: Partial<AnalyticsSnapshot>
): Promise<void> {
  await supabase.from("analytics_snapshots").insert(snapshot);
}
