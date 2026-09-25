"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { schemes as schemesApi, Scheme } from "@/lib/api";
import Navbar from "@/components/Navbar";
import SchemeCard from "@/components/SchemeCard";
import CategoryFilter from "@/components/CategoryFilter";
import {
  Search, X, Sparkles, SlidersHorizontal,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LEVELS    = ["Central", "State", "State-Central"];
const PAGE_SIZE = 18;
type  Mode      = "browse" | "vector";

// Suggestions that cycle in the search placeholder
const SEARCH_SUGGESTIONS = [
  "Search schemes with AI…",
  "Schemes for single child families…",
  "Schemes for widows & destitute women…",
  "Scholarships for girl students…",
  "Farming loans in Rajasthan…",
  "Housing scheme for BPL families…",
  "Pension for senior citizens…",
  "Health insurance for labourers…",
  "Startup funding for youth…",
  "Skill development for SC/ST youth…",
];

function buildPageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++)
    pages.push(i);
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}

// ── Animated placeholder component ──────────────────────────────────────────
function AnimatedPlaceholder({ active }: { active: boolean }) {
  const [idx, setIdx]         = useState(0);
  const [phase, setPhase]     = useState<"visible" | "exit" | "enter">("visible");
  const [nextIdx, setNextIdx] = useState(1);

  useEffect(() => {
    if (active) return; // hide animation when user is typing
    const interval = setInterval(() => {
      setPhase("exit");
      const next = (idx + 1) % SEARCH_SUGGESTIONS.length;
      setNextIdx(next);
      setTimeout(() => {
        setIdx(next);
        setPhase("enter");
        setTimeout(() => setPhase("visible"), 320);
      }, 320);
    }, 2800);
    return () => clearInterval(interval);
  }, [idx, active]);

  if (active) return null;

  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center pl-[52px] pr-4 overflow-hidden"
    >
      <span
        className={cn(
          "text-base text-outline whitespace-nowrap transition-all duration-300",
          phase === "visible" && "opacity-100 translate-y-0",
          phase === "exit"    && "opacity-0 -translate-y-3",
          phase === "enter"   && "opacity-0 translate-y-3",
        )}
      >
        {SEARCH_SUGGESTIONS[idx]}
      </span>
    </span>
  );
}

export default function SchemesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [mode,       setMode]       = useState<Mode>("browse");
  const [allSchemes, setAllSchemes] = useState<Scheme[]>([]);
  const [vectorRes,  setVectorRes]  = useState<Scheme[]>([]);
  const [fetching,   setFetching]   = useState(true);
  const [searching,  setSearching]  = useState(false);
  const [query,      setQuery]      = useState("");
  const [category,   setCategory]   = useState<string | null>(null);
  const [level,      setLevel]      = useState<string | null>(null);
  const [page,       setPage]       = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayList  = mode === "vector" ? vectorRes : allSchemes;
  const totalSchemes = displayList.length;
  const totalPages   = mode === "browse" ? Math.max(1, Math.ceil(totalSchemes / PAGE_SIZE)) : 1;
  const pageSlice    = mode === "browse"
    ? allSchemes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : vectorRes;
  const startIdx = (page - 1) * PAGE_SIZE + 1;
  const endIdx   = Math.min(page * PAGE_SIZE, totalSchemes);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user && mode === "browse") {
      setPage(1);
      loadBrowse();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, category, level]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      if (mode === "vector") { setMode("browse"); setPage(1); }
      return;
    }
    setMode("vector");
    setSearching(true);
    debounceRef.current = setTimeout(() => runVector(query.trim()), 380);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function loadBrowse() {
    setFetching(true);
    try {
      let pg = 1;
      const collected: Scheme[] = [];
      while (pg <= 20) {
        const res = await schemesApi.list({
          category: category ?? undefined,
          level:    level    ?? undefined,
          page:     pg,
        });
        collected.push(...res.schemes);
        if (res.schemes.length < (res.page_size ?? PAGE_SIZE)) break;
        pg++;
      }
      setAllSchemes(collected);
    } catch { /* silent */ } finally {
      setFetching(false);
    }
  }

  async function runVector(q: string) {
    setFetching(true);
    try {
      const res = await schemesApi.vectorSearch({
        q,
        limit:    60,
        category: category ?? undefined,
        level:    level    ?? undefined,
      });
      setVectorRes(res.schemes);
    } catch { /* silent */ } finally {
      setFetching(false);
      setSearching(false);
    }
  }

  function goToPage(p: number) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearAll() {
    setQuery(""); setCategory(null); setLevel(null);
    setMode("browse"); setPage(1);
  }

  const hasFilters = query || category || level;

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      {/* ── search / filter header ── */}
      <div className="bg-surface-container-low border-b border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* heading */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container border border-outline-variant/50 text-on-surface-variant text-xs font-semibold uppercase tracking-wider mb-3">
              <span className="text-secondary">✦</span>
              Verified Central &amp; State Repository
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-on-surface tracking-tight mb-2">
              Government Schemes
            </h1>
            <p className="text-on-surface-variant text-base leading-relaxed">
              Search with AI — type a natural-language query to find matching schemes instantly.
            </p>
          </div>

          {/* search bar with animated placeholder */}
          <div className="relative max-w-2xl mb-5">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm flex items-center gap-3 px-4 h-14 relative">
              <div className="shrink-0 w-5 flex items-center justify-center z-10">
                {searching ? (
                  <span className="block w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                ) : mode === "vector" && query ? (
                  <Sparkles size={18} className="text-secondary" />
                ) : (
                  <Search size={18} className="text-outline" />
                )}
              </div>

              {/* Animated placeholder — only shown when input is empty */}
              <AnimatedPlaceholder active={query.length > 0} />

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder=""
                className="flex-1 h-full bg-transparent text-base text-on-surface focus:outline-none relative z-10"
                aria-label="Search government schemes"
              />

              {mode === "vector" && query && !searching && (
                <span className="flex items-center gap-1 text-xs text-secondary font-semibold bg-secondary-fixed/40 border border-secondary-fixed px-2.5 py-1 rounded-full shrink-0 z-10">
                  <Sparkles size={10} /> AI
                </span>
              )}
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="p-1.5 text-outline hover:text-on-surface rounded-lg hover:bg-surface-container transition shrink-0 z-10"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* level pills + mode badge */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {LEVELS.map((l) => (
              <button
                key={l}
                onClick={() => {
                  setLevel(level === l ? null : l);
                  setPage(1);
                  if (mode === "vector" && query) runVector(query);
                }}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-semibold border transition-all",
                  level === l
                    ? "bg-primary text-on-primary border-primary shadow-chip"
                    : "bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:border-outline hover:text-on-surface"
                )}
              >
                {l}
              </button>
            ))}
            <div className="flex items-center gap-1.5 ml-auto text-sm text-on-surface-variant">
              {mode === "vector"
                ? <><Sparkles size={13} className="text-secondary" /> AI Search</>
                : <><SlidersHorizontal size={13} /> Browsing</>
              }
            </div>
          </div>

          {/* category strip */}
          <div className="overflow-x-auto pb-1">
            <CategoryFilter
              selected={category}
              onChange={(c) => {
                setCategory(c);
                setPage(1);
                if (mode === "vector" && query) runVector(query);
              }}
            />
          </div>

          {/* active filter chips */}
          {hasFilters && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <SlidersHorizontal size={14} className="text-outline" />
              {query && (
                <span className="flex items-center gap-1 text-xs bg-secondary-fixed/30 text-on-secondary-container border border-secondary-fixed/60 px-3 py-1 rounded-full font-medium">
                  <Sparkles size={10} /> &ldquo;{query}&rdquo;
                </span>
              )}
              {category && (
                <span className="text-xs bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full font-medium">
                  {category}
                </span>
              )}
              {level && (
                <span className="text-xs bg-surface-container-high text-on-surface px-3 py-1 rounded-full font-medium">
                  {level}
                </span>
              )}
              <button onClick={clearAll} className="text-xs text-error hover:underline font-semibold">
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── results area ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {!fetching && totalSchemes > 0 && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-on-surface-variant">
              {mode === "vector" ? (
                <>
                  <Sparkles size={13} className="inline text-secondary mr-1 mb-0.5" />
                  <span className="font-semibold text-on-surface">{totalSchemes}</span> AI results
                  {" "}for &ldquo;<span className="text-secondary">{query}</span>&rdquo;
                </>
              ) : (
                <>
                  Showing{" "}
                  <span className="font-semibold text-on-surface">{startIdx}–{endIdx}</span>
                  {" "}of{" "}
                  <span className="font-semibold text-on-surface">{totalSchemes}</span> schemes
                </>
              )}
            </p>
            {mode === "browse" && totalPages > 1 && (
              <p className="text-xs text-on-surface-variant">
                Page <span className="font-semibold text-on-surface">{page}</span>
                {" "}of{" "}
                <span className="font-semibold text-on-surface">{totalPages}</span>
              </p>
            )}
          </div>
        )}

        {fetching && pageSlice.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface-container-lowest rounded-xl h-52 shimmer" />
            ))}
          </div>
        ) : totalSchemes === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant p-16 text-center">
            <div className="text-5xl mb-4">{mode === "vector" ? "🔮" : "🔍"}</div>
            <p className="font-display font-semibold text-on-surface text-xl mb-2">
              No schemes found
            </p>
            <p className="text-on-surface-variant text-base max-w-sm mx-auto">
              {mode === "vector"
                ? "Try rephrasing — e.g. \"loans for small farmers\" or \"girl student scholarship AP\""
                : "Try different filters or clear your selection"}
            </p>
            <button
              onClick={clearAll}
              className="mt-5 text-secondary text-sm font-semibold hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
            {pageSlice.map((s) => (
              <SchemeCard key={s.id} scheme={s} />
            ))}
          </div>
        )}

        {/* page-number pagination (browse mode only) */}
        {mode === "browse" && !fetching && totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-10">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className={cn(
                "w-9 h-9 flex items-center justify-center rounded-lg border transition-all",
                page === 1
                  ? "border-outline-variant/30 text-outline/40 cursor-not-allowed"
                  : "border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-on-surface hover:border-outline"
              )}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>

            {buildPageList(page, totalPages).map((p, i) =>
              p === "…" ? (
                <span
                  key={`ellipsis-${i}`}
                  className="w-9 h-9 flex items-center justify-center text-on-surface-variant text-sm select-none"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => goToPage(p as number)}
                  className={cn(
                    "w-9 h-9 flex items-center justify-center rounded-lg border text-sm font-semibold transition-all",
                    page === p
                      ? "bg-primary text-on-primary border-primary shadow-chip"
                      : "border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-on-surface hover:border-outline"
                  )}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className={cn(
                "w-9 h-9 flex items-center justify-center rounded-lg border transition-all",
                page === totalPages
                  ? "border-outline-variant/30 text-outline/40 cursor-not-allowed"
                  : "border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-on-surface hover:border-outline"
              )}
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
