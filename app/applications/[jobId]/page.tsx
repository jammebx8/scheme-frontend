"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { applications as appsApi, ApplicationJob } from "@/lib/api";
import Navbar from "@/components/Navbar";
import AgentLiveView from "@/components/AgentLiveView";
import { STATUS_CONFIG, formatDate, cn } from "@/lib/utils";
import { ArrowLeft, ExternalLink, RefreshCw, Hash } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ApplicationDetailPage() {
  const { jobId }         = useParams<{ jobId: string }>();
  const { user, loading } = useAuth();
  const router            = useRouter();
  const [job,      setJob]      = useState<ApplicationJob | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user && jobId) {
      appsApi
        .getJob(jobId)
        .then(setJob)
        .catch(() => toast.error("Application not found"))
        .finally(() => setFetching(false));
    }
  }, [user, jobId]);

  async function handleRetry() {
    if (!job?.scheme_id) return;
    try {
      const r = await appsApi.apply(job.scheme_id);
      router.push(`/applications/${r.job_id}`);
      toast.success("New attempt started");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to retry");
    }
  }

  if (loading || fetching)
    return (
      <div className="min-h-screen bg-surface">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-10 space-y-4">
          <div className="h-8 w-48 shimmer rounded-xl" />
          <div className="h-[420px] shimmer rounded-xl" />
        </div>
      </div>
    );

  if (!job) return null;

  const cfg  = STATUS_CONFIG[job.status];
  const name = job.government_schemes?.scheme_name || "Unknown Scheme";

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-7">
        <Link
          href="/applications"
          className="inline-flex items-center gap-1.5 text-[13px] text-on-surface-variant hover:text-on-surface mb-5 transition-colors"
        >
          <ArrowLeft size={14} /> All Applications
        </Link>

        {/* job header card */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-5 mb-5 shadow-card">
          {/* top stripe */}
          <div className="tricolor-bar -mx-5 -mt-5 h-[3px] mb-5 rounded-t-xl" />

          <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={cn(
                    "text-[12px] font-bold px-2.5 py-1 rounded-full",
                    cfg?.color
                  )}
                >
                  {cfg?.icon} {cfg?.label}
                </span>
              </div>
              <h1 className="font-display text-[16px] font-bold text-on-surface mb-1">
                {name}
              </h1>
              <p className="text-[12px] text-on-surface-variant">
                Job{" "}
                <span className="font-mono">{job.id.slice(0, 8)}…</span>
                {" · "}
                Started {formatDate(job.created_at || "")}
              </p>
            </div>

            <div className="flex gap-2 shrink-0">
              {job.status === "failed" && (
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-secondary text-on-secondary text-[13px] font-semibold rounded-xl hover:opacity-90 transition shadow-sm"
                >
                  <RefreshCw size={13} /> Retry
                </button>
              )}
              {job.government_schemes?.slug && (
                <Link
                  href={`/schemes/${job.government_schemes.slug}`}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-surface-container text-on-surface text-[13px] font-medium rounded-xl hover:bg-surface-container-high transition"
                >
                  <ExternalLink size={13} /> View Scheme
                </Link>
              )}
            </div>
          </div>

          {/* reference number */}
          {job.application_ref_id && (
            <div className="mt-4 flex items-center gap-3 p-4 bg-secondary-fixed/20 border border-secondary-fixed/50 rounded-xl">
              <Hash size={18} className="text-secondary shrink-0" />
              <div>
                <p className="text-[11px] text-secondary font-bold uppercase tracking-wide">
                  Application Reference
                </p>
                <p className="text-[18px] font-mono font-bold text-on-secondary-container leading-tight">
                  {job.application_ref_id}
                </p>
              </div>
            </div>
          )}
        </div>

        <AgentLiveView jobId={jobId} initialJob={job} />
      </main>
    </div>
  );
}
