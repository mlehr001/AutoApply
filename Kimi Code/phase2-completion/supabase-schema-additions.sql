-- Add to your Supabase schema (SQL Editor)
-- Run this to create the interviews table and cover_letters table

-- Interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  company TEXT NOT NULL,
  job_title TEXT NOT NULL,
  interview_type TEXT NOT NULL CHECK (interview_type IN ('phone_screen', 'hiring_manager', 'panel', 'technical', 'final')),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'past')),
  notes TEXT,
  prep_brief TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cover letters table (for persistence)
CREATE TABLE IF NOT EXISTS cover_letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  title TEXT NOT NULL,
  tone TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id)
);

-- Enable RLS (if using Row Level Security)
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE cover_letters ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust for your auth setup)
CREATE POLICY "Allow all" ON interviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON cover_letters FOR ALL USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_interviews_status ON interviews(status);
CREATE INDEX idx_interviews_scheduled_at ON interviews(scheduled_at);
CREATE INDEX idx_cover_letters_job_id ON cover_letters(job_id);
