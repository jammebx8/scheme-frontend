"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { applications as appsApi, ApplicationJob } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { STATUS_CONFIG, CATEGORY_ICONS, formatDate, cn } from "@/lib/utils";
import { ChevronRight, Bot, RefreshCw, FileText } from "lucide-react";
import Link from "next/link";

function AppRow({ app }: { app: ApplicationJob }) {
  const cfg    = STATUS_CONFIG[app.status];
  const name   = app.government_schemes?.scheme_name || "Unknown Scheme";
  const cat    = app.government_schemes?.scheme_category || "";
  const isLive = ["queued", "running"].includes(app.status);

  return (
    <Link
      href={`/applications/${app.id}`}
      className="group flex items-center gap-4 bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-4 hover:border-secondary/40 hover:shadow-card transition-all"
    >
      {/* category icon */}
      <div className="w-10 h-10 bg-surface-container-low rounded-xl flex items-center justify-center text-xl shrink-0 border border-outline-variant/30">
        {CATEGORY_ICONS[cat] || "📋"}
      </div>

      {/* text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[13px] font-semibold text-on-surface truncate">
            {name}
          </p>
          {isLive && (
            <span className="w-2 h-2 bg-secondary rounded-full animate-pulse shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-on-surface-variant flex-wrap">
          <span>{cat}</span>
          <span className="text-outline-variant">·</span>
          <span>{formatDate(app.created_at || "")}</span>
          {app.application_ref_id && (
            <>
              <span className="text-outline-variant">·</span>
              <span className="text-secondary font-mono font-semibold">
                Ref: {app.application_ref_id}
              </span>
            </>
          )}
        </div>
        {app.status === "needs_review" && app.error_details && (
          <p className="text-[11px] text-on-tertiary-container mt-0.5 truncate">
            ⚠️ {app.error_details}
          </p>
        )}
      </div>

      {/* status + chevron */}
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={cn(
            "text-[11px] px-2.5 py-1 rounded-full font-semibold whitespace-nowrap",
            cfg?.color
          )}
        >
          {cfg?.icon} {cfg?.label}
        </span>
        <ChevronRight
          size={14}
          className="text-outline-variant group-hover:text-secondary transition-colors"
        />
      </div>
    </Link>
  );
}

function Section({
  title,
  items,
  empty,
}: {
  title: string;
  items: ApplicationJob[];
  empty?: string;
}) {
  if (!items.length && !empty) return null;
  return (
    <div className="mb-7">
      <h2 className="section-label mb-3">{title}</h2>
      {items.length ? (
        <div className="space-y-2">
          {items.map((a) => (
            <AppRow key={a.id} app={a} />
          ))}
        </div>
      ) : (
        <p className="text-[13px] text-on-surface-variant px-1">{empty}</p>
      )}
    </div>
  );
}

export default function ApplicationsPage() {
  const { user, loading } = useAuth();
  const router            = useRouter();
  const [apps,     setApps]     = useState<ApplicationJob[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function load() {
    setFetching(true);
    try {
      setApps((await appsApi.getMyApplications()).applications);
    } finally {
      setFetching(false);
    }
  }

  const groups = {
    active: apps.filter((a) => ["queued", "running"].includes(a.status)),
    review: apps.filter((a) => a.status === "needs_review"),
    done:   apps.filter((a) => a.status === "completed"),
    failed: apps.filter((a) => a.status === "failed"),
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-7">
        {/* page header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="font-display text-xl font-bold text-on-surface tracking-tight">
              My Applications
            </h1>
            <p className="text-on-surface-variant text-[13px] mt-0.5">
              Track all your scheme applications in one place
            </p>
          </div>
          <button
            onClick={load}
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl transition"
            title="Refresh"
          >
            <RefreshCw
              size={17}
              className={fetching ? "animate-spin" : ""}
            />
          </button>
        </div>

        {fetching ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 shimmer rounded-xl" />
            ))}
          </div>
        ) : apps.length === 0 ? (
          /* empty state */
          <div className="bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mx-auto mb-4">
              <Bot size={30} className="text-on-surface-variant" />
            </div>
            <p className="font-display font-semibold text-on-surface mb-1">
              No applications yet
            </p>
            <p className="text-on-surface-variant text-[13px] mb-6">
              Find a scheme and click Apply Now to start
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-secondary text-on-secondary text-[13px] font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition shadow-sm"
            >
              <FileText size={14} />
              View Recommendations
            </Link>
          </div>
        ) : (
          <>
            {groups.active.length > 0 && (
              <Section title="🤖 Active — Agent Running" items={groups.active} />
            )}
            {groups.review.length > 0 && (
              <Section title="👀 Needs Your Review"     items={groups.review} />
            )}
            <Section
              title="✅ Completed"
              items={groups.done}
              empty="No completed applications yet"
            />
            {groups.failed.length > 0 && (
              <Section title="❌ Failed" items={groups.failed} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
