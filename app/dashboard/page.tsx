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
import { STATUS_CONFIG, containsCategory, DB_CATEGORIES } from "@/lib/utils";
import CategoryIcon from "@/components/CategoryIcon";
import StatusIcon from "@/components/StatusIcon";
import {
  ArrowRight, CheckCircle2, Sparkles,
  ChevronRight, FileEdit, Search,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

type RecType = "eligible" | "profile_match" | "popular" | "vector";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [recommended,    setRecommended]    = useState<Scheme[]>([]);
  const [recentApps,     setRecentApps]     = useState<ApplicationJob[]>([]);
  const [schemesLoading, setSchemesLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [source,         setSource]         = useState<RecType>("popular");
  const [bgRefreshing,   setBgRefreshing]   = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Filter uses containsCategory so "Education & Learning, Health & Wellness"
  // is correctly matched when the user clicks "Education & Learning"
  const filtered = categoryFilter
    ? recommended.filter((s) => containsCategory(s.scheme_category, categoryFilter))
    : recommended;

  async function loadData() {
    setSchemesLoading(true);
    try {
      const [rec, apps] = await Promise.all([
        schemesApi.recommend({ limit: 40 }),
        appsApi.getMyApplications(),
      ]);
      const recType = (rec as any).recommendation_type as RecType;
      setRecommended(rec.schemes);
      setSource(recType);
      setRecentApps(apps.applications.slice(0, 3));

      // Silently trigger LLM eligibility refresh in background when user
      // has a complete profile but no eligibility cache yet.
      if (recType !== "eligible" && user?.profile_complete) {
        setBgRefreshing(true);
        schemesApi.refreshEligibility()
          .catch(() => {/* silent */})
          .finally(() => setBgRefreshing(false));
      }
    } catch {
      toast.error("Failed to load recommendations");
    } finally {
      setSchemesLoading(false);
    }
  }

  // Build category quick-filter tiles from actual recommended schemes
  const catCount: Record<string, number> = {};
  recommended.forEach((s) => {
    // A scheme may belong to multiple categories (CSV). Count each.
    const cats = s.scheme_category?.split(",").map((c) => c.trim()) ?? [];
    cats.forEach((c) => {
      if (DB_CATEGORIES.includes(c as any)) {
        catCount[c] = (catCount[c] || 0) + 1;
      }
    });
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/8 border border-white/12 text-xs font-medium text-white/60 uppercase tracking-wider">
                    
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
                    ? "Finding schemes matched to your profile…"
                    : source === "eligible"
                      ? `${recommended.length} schemes you're eligible for`
                      : source === "profile_match"
                        ? `${recommended.length} schemes matched to your profile`
                        : `${recommended.length} schemes available`
                  }
                </p>
              </div>

              {/* actions — Edit Documents replaces verify/refresh */}
              <div className="flex items-center gap-3 shrink-0">
                {!schemesLoading && (
                  <div className="hidden sm:flex flex-col items-center px-5 py-3 rounded-xl bg-white/8 border border-white/12">
                    <span className="font-display text-3xl font-bold text-white leading-none">
                      {recommended.length}
                    </span>
                    <span className="text-xs text-white/50 mt-1 uppercase tracking-wide">schemes</span>
                  </div>
                )}
                <Link
                  href="/onboarding"
                  className="flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 text-sm font-semibold px-4 py-2.5 rounded-lg transition shadow-sm"
                >
                  <FileEdit size={14} />
                  Edit Documents
                </Link>
              </div>
            </div>

            {/* category quick-filter tiles */}
            {topCats.length > 0 && (
              <div className="mt-5 pt-5 border-t border-white/8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {topCats.map(([cat, count]) => {
                    const isActive = categoryFilter === cat;
                    const label = cat.split(",")[0].trim();
                    return (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(isActive ? null : cat)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                          isActive
                            ? "bg-white text-slate-900 border-white shadow-sm"
                            : "bg-white/6 border-white/10 hover:bg-white/12 hover:border-white/20 text-white"
                        }`}
                      >
                        <CategoryIcon
                          category={cat}
                          size={20}
                          strokeWidth={1.8}
                          className="shrink-0 opacity-90"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate leading-tight">{label}</p>
                          <p className={`text-xs mt-0.5 ${isActive ? "text-slate-500" : "text-white/45"}`}>
                            {count} scheme{count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── quick tiles row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
          {recentApps.slice(0, 2).map((app) => {
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
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${cfg?.color}`}>
                    <StatusIcon name={cfg?.icon ?? "clock"} size={10} />
                    {cfg?.label}
                  </span>
                  <ChevronRight size={13} className="text-outline-variant group-hover:text-secondary transition" />
                </div>
              </Link>
            );
          })}

          <Link
            href="/schemes"
            className="col-span-1 bg-secondary/10 border border-secondary/20 rounded-xl px-4 py-3 hover:bg-secondary/15 hover:border-secondary/40 transition group"
          >
            <p className="text-xs text-secondary font-semibold uppercase tracking-wide mb-1">Discover</p>
            <p className="text-sm font-semibold text-on-surface">All Schemes</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-on-surface-variant">Browse full catalogue</span>
              <ArrowRight size={13} className="text-secondary group-hover:translate-x-0.5 transition" />
            </div>
          </Link>

          <Link
            href="/applications"
            className="col-span-1 bg-surface-container-lowest border border-outline-variant/40 rounded-xl px-4 py-3 hover:border-secondary/40 hover:shadow-card transition group"
          >
            <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wide mb-1">Tracker</p>
            <p className="text-sm font-semibold text-on-surface">My Applications</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-on-surface-variant">View history</span>
              <ChevronRight size={13} className="text-outline-variant group-hover:text-secondary transition" />
            </div>
          </Link>
        </div>

        {/* ── schemes feed ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-on-surface flex items-center gap-2 text-lg">
              {source === "eligible"
                ? <><CheckCircle2 size={16} className="text-secondary" />Eligible Schemes</>
                : source === "profile_match"
                  ? <><Sparkles size={16} className="text-secondary" />Matched to Your Profile</>
                  : <><Sparkles size={16} className="text-secondary" />Popular Schemes</>
              }
              {categoryFilter && (
                <span className="text-secondary font-normal text-base">
                  · {categoryFilter.split(",")[0].trim()}
                </span>
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
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                  <Search size={22} className="text-slate-400" />
                </div>
              </div>
              <p className="font-display font-semibold text-on-surface text-base mb-1">No schemes found</p>
              <p className="text-sm text-on-surface-variant">
                {categoryFilter
                  ? "No schemes in this category match your profile"
                  : "Complete your profile for personalised recommendations"}
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
                <SchemeCard
                  key={s.id}
                  scheme={s}
                  showEligibility={source === "eligible"}
                />
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
