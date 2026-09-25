"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  schemes as schemesApi,
  Scheme,
  applications as appsApi,
  ApplicationJob,
} from "@/lib/api";
import Navbar from "@/components/Navbar";
import SchemeCard from "@/components/SchemeCard";
import CategoryFilter from "@/components/CategoryFilter";
import { CATEGORY_ICONS, STATUS_CONFIG, formatDate } from "@/lib/utils";
import {
  RefreshCw, ArrowRight, CheckCircle2,
  Sparkles, Bot, ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [recommended,    setRecommended]    = useState<Scheme[]>([]);
  const [recentApps,     setRecentApps]     = useState<ApplicationJob[]>([]);
  const [schemesLoading, setSchemesLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [refreshing,     setRefreshing]     = useState(false);
  const [source,         setSource]         = useState<"vector" | "eligible" | "popular" | "profile_match">("popular");
  const [bgRefreshing,   setBgRefreshing]   = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filtered = categoryFilter
    ? recommended.filter((s) => s.scheme_category === categoryFilter)
    : recommended;

  async function loadData() {
    setSchemesLoading(true);
    try {
      const [rec, apps] = await Promise.all([
        schemesApi.recommend({ limit: 30 }),
        appsApi.getMyApplications(),
      ]);
      const recType = (rec as any).recommendation_type as string;
      setRecommended(rec.schemes);
      setSource(recType === "eligible" ? "eligible" : recType === "profile_match" ? "profile_match" : recType === "popular" ? "popular" : "vector");
      setRecentApps(apps.applications.slice(0, 3));

      // Silently trigger background LLM eligibility check when user has a
      // profile but no cache yet — next visit will return verified results.
      if (recType !== "eligible" && user?.profile_complete) {
        setBgRefreshing(true);
        schemesApi.refreshEligibility()
          .catch(() => {/* silent */})
          .finally(() => setBgRefreshing(false));
      }
    } catch {
      toast.error("Failed to load data");
    } finally {
      setSchemesLoading(false);
    }
  }

  async function handleVerifyEligibility() {
    setRefreshing(true);
    try {
      await schemesApi.refreshEligibility();

      // Poll until the background Groq job populates the cache.
      // The LLM batch can take 30–90 s, so we poll every 5 s for up to 2 minutes.
      const MAX_WAIT_MS = 120_000;
      const POLL_MS = 5_000;
      const startedAt = Date.now();
      let result = await schemesApi.getEligible();

      while (result.total === 0 && Date.now() - startedAt < MAX_WAIT_MS) {
        await new Promise((r) => setTimeout(r, POLL_MS));
        result = await schemesApi.getEligible();
      }

      setRecommended(result.schemes);
      setSource("eligible");
      if (result.total === 0) {
        toast.error("Eligibility check timed out. Try again shortly.");
      } else {
        toast.success(`${result.schemes.length} verified eligible schemes loaded`);
      }
    } catch {
      toast.error("Eligibility check failed");
    } finally {
      setRefreshing(false);
    }
  }

  // category tile stats
  const catCount: Record<string, number> = {};
  recommended.forEach((s) => {
    catCount[s.scheme_category] = (catCount[s.scheme_category] || 0) + 1;
  });
  const topCats = Object.entries(catCount).sort((a, b) => b[1] - a[1]).slice(0, 4);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ── hero banner ── */}
        <section className="relative overflow-hidden rounded-2xl mb-7 bg-gradient-to-br from-slate-950 via-[#001428] to-emerald-950 text-white shadow-xl">
          <div
            className="absolute inset-0 opacity-[0.3] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="absolute -top-20 -right-16 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-secondary" />

          <div className="relative px-6 sm:px-8 py-6">
            {/* top row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/8 border border-white/12 text-xs font-medium text-white/60 uppercase tracking-wider">
                    <Sparkles size={10} className="text-emerald-300" />
                    {new Date().toLocaleDateString("en-IN", {
                      weekday: "long", day: "numeric", month: "long",
                    })}
                  </span>
                  {source === "eligible" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-400/15 border border-emerald-400/30 text-xs font-semibold text-emerald-300">
                      <CheckCircle2 size={10} /> AI Verified
                    </span>
                  )}
                  {bgRefreshing && source !== "eligible" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-white/50">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Building eligibility…
                    </span>
                  )}
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
                  Welcome back,{" "}
                  <span className="text-emerald-300">
                    {user?.full_name?.split(" ")[0] || "Citizen"}
                  </span>
                </h1>
                <p className="text-white/55 text-sm mt-1.5 leading-snug">
                  {schemesLoading
                    ? "Finding personalised schemes for you…"
                    : source === "eligible"
                      ? `${recommended.length} AI-verified eligible schemes`
                      : source === "profile_match"
                        ? `${recommended.length} schemes matched to your profile`
                        : `${recommended.length} schemes`
                  }
                </p>
              </div>

              {/* stat + actions */}
              <div className="flex items-center gap-3 shrink-0">
                {!schemesLoading && (
                  <div className="hidden sm:flex flex-col items-center px-5 py-3 rounded-xl bg-white/8 border border-white/12">
                    <span className="font-display text-3xl font-bold text-white leading-none">
                      {recommended.length}
                    </span>
                    <span className="text-xs text-white/50 mt-1 uppercase tracking-wide">schemes</span>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleVerifyEligibility}
                    disabled={refreshing}
                    className="flex items-center gap-2 bg-secondary hover:opacity-90 text-on-secondary text-sm font-semibold px-4 py-2.5 rounded-lg transition shadow-sm disabled:opacity-60"
                  >
                    <Bot size={14} className={refreshing ? "animate-pulse" : ""} />
                    {refreshing ? "Checking…" : "Verify with AI"}
                  </button>
                  <button
                    onClick={loadData}
                    disabled={schemesLoading}
                    className="flex items-center gap-2 bg-white/8 hover:bg-white/15 border border-white/12 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
                  >
                    <RefreshCw size={13} className={schemesLoading ? "animate-spin" : ""} />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* category tiles */}
            {topCats.length > 0 && (
              <div className="mt-5 pt-5 border-t border-white/8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {topCats.map(([cat, count]) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat === categoryFilter ? null : cat)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                        categoryFilter === cat
                          ? "bg-secondary border-secondary/60 text-on-secondary shadow-sm"
                          : "bg-white/6 border-white/10 hover:bg-white/12 hover:border-white/20"
                      }`}
                    >
                      <span className="text-xl shrink-0">{CATEGORY_ICONS[cat] || "📋"}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate leading-tight">{cat}</p>
                        <p className={`text-xs mt-0.5 ${categoryFilter === cat ? "text-on-secondary/70" : "text-white/45"}`}>
                          {count} schemes
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── quick stats row (replaces sidebar) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
          {/* recent applications mini-strip */}
          {recentApps.length > 0
            ? recentApps.slice(0, 2).map((app) => {
                const cfg  = STATUS_CONFIG[app.status];
                const name = app.government_schemes?.scheme_name || "Unknown";
                return (
                  <Link
                    key={app.id}
                    href={`/applications/${app.id}`}
                    className="col-span-1 bg-surface-container-lowest rounded-xl border border-outline-variant/40 px-4 py-3 hover:border-secondary/40 hover:shadow-card transition group"
                  >
                    <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wide mb-1">
                      Application
                    </p>
                    <p className="text-sm font-semibold text-on-surface truncate">{name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${cfg?.color}`}>
                        {cfg?.icon} {cfg?.label}
                      </span>
                      <ChevronRight size={13} className="text-outline-variant group-hover:text-secondary transition" />
                    </div>
                  </Link>
                );
              })
            : null
          }

          {/* "browse all schemes" tile */}
          <Link
            href="/schemes"
            className="col-span-1 bg-secondary/10 border border-secondary/20 rounded-xl px-4 py-3 hover:bg-secondary/15 hover:border-secondary/40 transition group"
          >
            <p className="text-xs text-secondary font-semibold uppercase tracking-wide mb-1">
              Discover
            </p>
            <p className="text-sm font-semibold text-on-surface">All Schemes</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-on-surface-variant">Browse full catalogue</span>
              <ArrowRight size={13} className="text-secondary group-hover:translate-x-0.5 transition" />
            </div>
          </Link>

          {/* view all applications tile */}
          <Link
            href="/applications"
            className="col-span-1 bg-surface-container-lowest border border-outline-variant/40 rounded-xl px-4 py-3 hover:border-secondary/40 hover:shadow-card transition group"
          >
            <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wide mb-1">
              Tracker
            </p>
            <p className="text-sm font-semibold text-on-surface">My Applications</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-on-surface-variant">View history</span>
              <ChevronRight size={13} className="text-outline-variant group-hover:text-secondary transition" />
            </div>
          </Link>
        </div>

        {/* ── schemes feed — full width ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-on-surface flex items-center gap-2 text-lg">
              {source === "eligible"
                ? <><CheckCircle2 size={16} className="text-secondary" />Eligible Schemes</>
                : source === "profile_match"
                  ? <><Sparkles size={16} className="text-secondary" />Matched to Your Profile</>
                  : source === "popular"
                    ? <><Sparkles size={16} className="text-secondary" />Popular Schemes</>
                    : <><Sparkles size={16} className="text-secondary" />Recommended for You</>
              }
              {categoryFilter && (
                <span className="text-secondary font-normal text-base">· {categoryFilter}</span>
              )}
            </h2>
            <Link
              href="/schemes"
              className="flex items-center gap-1 text-sm text-secondary hover:underline font-semibold"
            >
              Browse all <ArrowRight size={14} />
            </Link>
          </div>

          {/* category filter strip */}
          <div className="mb-5 overflow-x-auto pb-1">
            <CategoryFilter selected={categoryFilter} onChange={setCategoryFilter} />
          </div>

          {schemesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-surface-container-lowest rounded-xl h-48 shimmer" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant p-12 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-display font-semibold text-on-surface text-base mb-1">
                No schemes found
              </p>
              <p className="text-sm text-on-surface-variant">
                {categoryFilter
                  ? "Try a different category"
                  : "Complete your profile for better recommendations"}
              </p>
              {categoryFilter && (
                <button
                  onClick={() => setCategoryFilter(null)}
                  className="mt-3 text-sm text-secondary hover:underline font-semibold"
                >
                  Clear filter
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
              {filtered.map((s) => (
                <SchemeCard key={s.id} scheme={s} showEligibility={source === "eligible"} />
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
