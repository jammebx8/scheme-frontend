"use client";

import { useEffect, useRef, useState } from "react";
import { ApplicationJob, AgentStep } from "@/lib/api";
import { STATUS_CONFIG, timeAgo, cn } from "@/lib/utils";
import {
  CheckCircle2, XCircle, AlertTriangle, Clock,
  Eye, ChevronDown, ChevronUp, Bot, Camera,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const STEP_ICONS: Record<string, string> = {
  navigate:      "🌐", fill:          "✏️", click:         "👆",
  select:        "🔽", upload:        "📎", scroll:        "⬇️",
  verify:        "🔍", verify_passed: "✅", verify_failed: "⚠️",
  submit:        "🚀", completed:     "🎉", needs_human:   "👤",
  failed:        "❌", plan_error:    "⚠️", wait:          "⏳",
};

interface Props {
  jobId:       string;
  initialJob?: ApplicationJob;
}

export default function AgentLiveView({ jobId, initialJob }: Props) {
  const [job,        setJob]        = useState<ApplicationJob | null>(initialJob || null);
  const [screenshot, setScreenshot] = useState<string | null>(
    initialJob?.screenshot_urls?.at(-1) || null
  );
  const [expanded, setExpanded] = useState(true);
  const [showAll,  setShowAll]  = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);
  const tokenRef  = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined")
      tokenRef.current = localStorage.getItem("govassist_token");
  }, []);

  useEffect(() => {
    if (!jobId) return;
    if (
      initialJob &&
      ["completed", "failed", "needs_review"].includes(initialJob.status)
    )
      return;

    const url = `${API_BASE}/api/v1/applications/jobs/${jobId}/stream${
      tokenRef.current ? `?token=${tokenRef.current}` : ""
    }`;
    const es = new EventSource(url);

    es.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data);
        if (d.type === "update" || d.type === "terminal") {
          setJob({
            id: jobId, user_id: d.user_id || "", scheme_id: d.scheme_id || "",
            status: d.status, agent_log: d.agent_log || [],
            screenshot_urls: d.screenshot_urls || [],
            application_ref_id: d.application_ref_id,
            error_details: d.error_details, completed_at: d.completed_at,
          });
          if (d.screenshot_urls?.at(-1)) setScreenshot(d.screenshot_urls.at(-1));
        }
        if (d.type === "terminal") es.close();
      } catch { /* silent */ }
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, [jobId, initialJob]);

  useEffect(() => {
    if (logEndRef.current && expanded)
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [job?.agent_log?.length, expanded]);

  if (!job) return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-10 text-center shadow-card">
      <div className="animate-spin w-7 h-7 border-2 border-secondary border-t-transparent rounded-full mx-auto mb-3" />
      <p className="text-on-surface-variant text-[13px]">Connecting to agent…</p>
    </div>
  );

  const cfg       = STATUS_CONFIG[job.status];
  const steps     = job.agent_log || [];
  const visible   = showAll ? steps : steps.slice(-12);
  const isRunning = ["running", "queued"].includes(job.status);

  const bannerCls: Record<string, string> = {
    completed:    "bg-secondary-fixed/20 border-secondary-fixed/50",
    failed:       "bg-error-container/40 border-error/30",
    needs_review: "bg-tertiary-fixed/30 border-on-tertiary-container/30",
  };
  const bannerClass =
    bannerCls[job.status] || "bg-primary-fixed/20 border-primary-fixed/50";

  return (
    <div className="space-y-4">
      {/* ── status banner ── */}
      <div
        className={cn(
          "rounded-xl p-4 border shadow-card",
          bannerClass
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* status icon */}
            {isRunning && (
              <div className="relative w-10 h-10 shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary-fixed/40 flex items-center justify-center">
                  <Bot size={20} className="text-primary" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-secondary rounded-full border-2 border-white animate-pulse" />
              </div>
            )}
            {job.status === "completed"    && <CheckCircle2 size={32} className="text-secondary shrink-0" />}
            {job.status === "failed"       && <XCircle      size={32} className="text-error shrink-0" />}
            {job.status === "needs_review" && <AlertTriangle size={32} className="text-on-tertiary-container shrink-0" />}

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    "text-[12px] font-bold px-2.5 py-0.5 rounded-full",
                    cfg?.color
                  )}
                >
                  {cfg?.icon} {cfg?.label}
                </span>
                {isRunning && (
                  <span className="text-[11px] text-secondary font-semibold animate-pulse">
                    Step {steps.length}…
                  </span>
                )}
              </div>

              {job.status === "completed" && job.application_ref_id && (
                <p className="text-[13px] text-on-secondary-container mt-1 font-medium">
                  Reference:{" "}
                  <span className="font-mono bg-secondary-fixed/40 px-2 py-0.5 rounded text-[12px] font-bold">
                    {job.application_ref_id}
                  </span>
                </p>
              )}
              {(job.status === "needs_review" || job.status === "failed") &&
                job.error_details && (
                  <p className="text-[12px] text-on-surface-variant mt-1 max-w-md">
                    {job.error_details}
                  </p>
                )}
            </div>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container transition shrink-0"
          >
            {expanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
          </button>
        </div>
      </div>

      {/* ── expanded panels ── */}
      {expanded && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">

          {/* ── browser / screenshot panel ── */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 overflow-hidden shadow-card">
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-container-low">
              <span className="text-[13px] font-semibold text-on-surface flex items-center gap-2">
                <Camera size={14} className="text-on-surface-variant" />
                Live Browser
              </span>
              {isRunning && (
                <span className="flex items-center gap-1.5 text-[11px] text-secondary font-semibold">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
                  LIVE
                </span>
              )}
            </div>

            {/* viewport */}
            <div className="bg-slate-900 aspect-video relative flex items-center justify-center">
              {screenshot ? (
                <img
                  src={screenshot}
                  alt="Browser state"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-slate-500">
                  <Bot size={28} className="mx-auto mb-2 opacity-40" />
                  <p className="text-[12px]">Awaiting first screenshot…</p>
                </div>
              )}
            </div>

            {/* thumbnail strip */}
            {(job.screenshot_urls?.length || 0) > 1 && (
              <div className="flex gap-1.5 p-2 overflow-x-auto bg-surface-container-low border-t border-outline-variant/30">
                {job.screenshot_urls?.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setScreenshot(url)}
                    className={cn(
                      "w-11 h-7 rounded overflow-hidden shrink-0 border-2 transition",
                      screenshot === url
                        ? "border-secondary"
                        : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <img
                      src={url}
                      alt={`s${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── agent log panel ── */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 overflow-hidden flex flex-col shadow-card">
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-container-low shrink-0">
              <span className="text-[13px] font-semibold text-on-surface flex items-center gap-2">
                <Eye size={14} className="text-on-surface-variant" />
                Agent Log
              </span>
              <span className="text-[11px] text-on-surface-variant font-mono">
                {steps.length} steps
              </span>
            </div>

            <div className="overflow-y-auto max-h-[340px] p-3 space-y-1 font-mono text-[11px]">
              {steps.length === 0 ? (
                <div className="text-center py-8 text-on-surface-variant">
                  <Clock size={22} className="mx-auto mb-2 opacity-30" />
                  Waiting for agent…
                </div>
              ) : (
                <>
                  {steps.length > 12 && !showAll && (
                    <button
                      onClick={() => setShowAll(true)}
                      className="w-full text-[11px] text-secondary hover:underline py-1 font-semibold"
                    >
                      ↑ {steps.length - 12} earlier steps
                    </button>
                  )}
                  {visible.map((step: AgentStep, i: number) => (
                    <div
                      key={`${step.step}-${i}`}
                      className={cn(
                        "flex gap-2 items-start px-2 py-1.5 rounded-lg agent-step-enter",
                        step.success === false
                          ? "bg-error-container/40"
                          : step.action_type === "completed"
                          ? "bg-secondary-fixed/20"
                          : "hover:bg-surface-container-low"
                      )}
                    >
                      <span className="shrink-0 text-[13px] mt-px">
                        {STEP_ICONS[step.action_type] || "▸"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "leading-relaxed break-words",
                            step.success === false
                              ? "text-error"
                              : step.action_type === "completed"
                              ? "text-on-secondary-container font-semibold"
                              : "text-on-surface"
                          )}
                        >
                          {step.description}
                        </p>
                        {step.value && (
                          <p className="text-on-surface-variant mt-0.5 truncate">
                            →{" "}
                            <span className="text-secondary">{step.value}</span>
                          </p>
                        )}
                        {step.error && (
                          <p className="text-error mt-0.5 break-words text-[10px]">
                            {step.error}
                          </p>
                        )}
                        {step.timestamp && (
                          <p className="text-outline mt-0.5 text-[10px]">
                            {timeAgo(step.timestamp)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={logEndRef} />
                </>
              )}
            </div>

            {/* running footer */}
            {isRunning && (
              <div className="border-t border-surface-container-low px-3 py-2.5 bg-primary-fixed/20 shrink-0">
                <div className="flex items-center gap-2 text-[11px] text-primary font-semibold">
                  <div className="flex gap-0.5">
                    {[0, 1, 2].map((j) => (
                      <span
                        key={j}
                        className="w-1 h-1 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: `${j * 0.15}s` }}
                      />
                    ))}
                  </div>
                  Agent is working…
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
