// Add these tracking functions to your existing src/lib/posthog.tsx

export const track = {
  // ... existing tracking functions ...

  // Cover Letter events
  coverLetterGenerated: (company: string, jobTitle: string, tone: string) =>
    posthog.capture("cover_letter_generated", { company, jobTitle, tone }),

  coverLetterSaved: (company: string, jobTitle: string) =>
    posthog.capture("cover_letter_saved", { company, jobTitle }),

  // Role Brief events
  roleBriefGenerated: (company: string, jobTitle: string) =>
    posthog.capture("role_brief_generated", { company, jobTitle }),

  // Interview events
  interviewScheduled: (company: string, jobTitle: string, interviewType: string) =>
    posthog.capture("interview_scheduled", { company, jobTitle, interviewType }),

  prepBriefGenerated: (company: string, jobTitle: string) =>
    posthog.capture("prep_brief_generated", { company, jobTitle }),
};
