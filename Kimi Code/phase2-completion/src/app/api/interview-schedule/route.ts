import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const {
      jobId,
      company,
      title,
      interviewType,
      scheduledAt,
      notes = "",
    } = await req.json();

    if (!company || !title || !interviewType || !scheduledAt) {
      return NextResponse.json(
        { error: "company, title, interviewType, and scheduledAt are required" },
        { status: 400 }
      );
    }

    // Create interview record
    const { data: interview, error } = await supabase
      .from("interviews")
      .insert({
        job_id: jobId,
        company,
        job_title: title,
        interview_type: interviewType,
        scheduled_at: scheduledAt,
        notes,
        status: "upcoming",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("[api/interview-schedule] Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to schedule interview" },
        { status: 500 }
      );
    }

    // Update job status to "interview" if jobId provided
    if (jobId) {
      await supabase
        .from("jobs")
        .update({ status: "interview" })
        .eq("id", jobId);
    }

    return NextResponse.json({ interview });
  } catch (err) {
    console.error("[api/interview-schedule]", err);
    return NextResponse.json(
      { error: "Failed to schedule interview" },
      { status: 500 }
    );
  }
}
