// Add these imports at the top of your existing src/app/opportunities/page.tsx:
// import CoverLetterModal from "@/components/CoverLetterModal";
// import RoleBriefPanel from "@/components/RoleBriefPanel";
// import ScheduleInterviewModal from "@/components/ScheduleInterviewModal";

// Add these state hooks inside your OpportunitiesPage component:
// const [coverLetterJob, setCoverLetterJob] = useState<Job | null>(null);
// const [roleBriefJob, setRoleBriefJob] = useState<Job | null>(null);
// const [scheduleJob, setScheduleJob] = useState<Job | null>(null);

// Add these modal components at the bottom of your return statement, before closing </div>:

/*
<CoverLetterModal
  isOpen={!!coverLetterJob}
  onClose={() => setCoverLetterJob(null)}
  job={coverLetterJob}
/>

<RoleBriefPanel
  isOpen={!!roleBriefJob}
  onClose={() => setRoleBriefJob(null)}
  job={roleBriefJob}
/>

<ScheduleInterviewModal
  isOpen={!!scheduleJob}
  onClose={() => setScheduleJob(null)}
  onScheduled={() => {
    // Refresh jobs list or show success toast
  }}
  job={scheduleJob}
/>
*/

// Add these buttons to each job card (inside your jobs.map or similar iteration):
// Replace the existing action buttons section with:

const JobActionButtons = ({ job }: { job: Job }) => (
  <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
    {/* Cover Letter */}
    <button
      onClick={() => setCoverLetterJob(job)}
      style={{
        padding: "8px 12px",
        backgroundColor: "#FFFFFF",
        border: "1px solid #2C3E50",
        color: "#2C3E50",
        fontFamily: "var(--font-raleway)",
        fontWeight: 600,
        fontSize: "12px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      <FileText size={14} />
      Cover Letter
    </button>

    {/* Role Brief */}
    <button
      onClick={() => setRoleBriefJob(job)}
      style={{
        padding: "8px 12px",
        backgroundColor: "#FFFFFF",
        border: "1px solid #2980B9",
        color: "#2980B9",
        fontFamily: "var(--font-raleway)",
        fontWeight: 600,
        fontSize: "12px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      <Briefcase size={14} />
      Role Brief
    </button>

    {/* Schedule Interview */}
    <button
      onClick={() => setScheduleJob(job)}
      style={{
        padding: "8px 12px",
        backgroundColor: "#27AE60",
        border: "none",
        color: "#FFFFFF",
        fontFamily: "var(--font-raleway)",
        fontWeight: 600,
        fontSize: "12px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      <Calendar size={14} />
      Schedule
    </button>

    {/* Existing status change buttons... */}
  </div>
);

// You'll need to add these imports at the top of opportunities/page.tsx:
// import { FileText, Briefcase, Calendar } from "lucide-react";
