"use client";

import Link from "next/link";
import { Scheme } from "@/lib/api";
import { CATEGORY_ICONS, cn } from "@/lib/utils";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";

interface Props {
  scheme: Scheme;
  showEligibility?: boolean;
  compact?: boolean;
}

const LEVEL_PILL: Record<string, string> = {
  Central:         "bg-primary-fixed text-on-primary-fixed",
  State:           "bg-secondary-fixed text-on-secondary-fixed",
  "State-Central": "bg-surface-container-highest text-on-surface",
};

const CAT_ACCENT: Record<string, { bg: string; bar: string }> = {
  Education:            { bg: "bg-sky-50",     bar: "bg-sky-400"    },
  Agriculture:          { bg: "bg-lime-50",    bar: "bg-lime-500"   },
  Housing:              { bg: "bg-amber-50",   bar: "bg-amber-400"  },
  Health:               { bg: "bg-rose-50",    bar: "bg-rose-400"   },
  "Women & Child":      { bg: "bg-pink-50",    bar: "bg-pink-400"   },
  "Social Welfare":     { bg: "bg-teal-50",    bar: "bg-teal-500"   },
  Employment:           { bg: "bg-violet-50",  bar: "bg-violet-400" },
  "Business & MSME":    { bg: "bg-orange-50",  bar: "bg-orange-400" },
  Pension:              { bg: "bg-yellow-50",  bar: "bg-yellow-500" },
  Scholarship:          { bg: "bg-indigo-50",  bar: "bg-indigo-400" },
  "Skill Development":  { bg: "bg-cyan-50",    bar: "bg-cyan-500"   },
  "Minority Welfare":   { bg: "bg-purple-50",  bar: "bg-purple-400" },
  "Differently Abled":  { bg: "bg-green-50",   bar: "bg-green-500"  },
  "Financial Inclusion":{ bg: "bg-blue-50",    bar: "bg-blue-400"   },
};

export default function SchemeCard({
  scheme,
  showEligibility = false,
  compact = false,
}: Props) {
  const icon      = CATEGORY_ICONS[scheme.scheme_category] || "📋";
  const accent    = CAT_ACCENT[scheme.scheme_category] || { bg: "bg-surface-container", bar: "bg-outline" };
  const levelPill = LEVEL_PILL[scheme.level]           || "bg-surface-container text-on-surface-variant";

  return (
    <Link href={`/schemes/${scheme.slug}`} className="block group min-w-0 w-full">
      <article
        className={cn(
          "scheme-card bg-surface-container-lowest rounded-xl border border-outline-variant/40",
          "overflow-hidden flex flex-col",
          "hover:border-secondary/50 hover:shadow-card-hover"
        )}
      >
        {/* category colour accent bar */}
        <div className={cn("h-[3px] w-full", accent.bar)} />

        <div className={cn("flex flex-col flex-1", compact ? "p-4" : "p-5 sm:p-6")}>

          {/* ── header row ── */}
          <div className="flex items-start gap-3 mb-3">
            {/* emoji icon */}
            <div
              className={cn(
                "rounded-xl flex items-center justify-center shrink-0",
                accent.bg,
                compact ? "w-10 h-10 text-xl" : "w-12 h-12 text-2xl"
              )}
            >
              {icon}
            </div>

            {/* title + pills */}
            <div className="min-w-0 flex-1 overflow-hidden">
              <h3
                className={cn(
                  "font-semibold text-on-surface group-hover:text-secondary transition-colors leading-snug line-clamp-2",
                  compact ? "text-sm" : "text-base"
                )}
              >
                {scheme.scheme_name}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap", levelPill)}>
                  {scheme.level}
                </span>
                <span className="text-xs text-on-surface-variant truncate">
                  {scheme.scheme_category}
                </span>
              </div>
            </div>

            {/* eligibility icon */}
            {showEligibility && scheme.eligible !== undefined && (
              <div className="shrink-0 mt-0.5">
                {scheme.eligible
                  ? <CheckCircle2 size={18} className="text-secondary" />
                  : <XCircle      size={18} className="text-outline-variant" />
                }
              </div>
            )}
          </div>

          {/* ── description ── */}
          {!compact && (
            <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-2 mb-3">
              {scheme.details}
            </p>
          )}

          {/* ── eligibility reason chip ── */}
          {showEligibility && scheme.eligibility_reason && (
            <div
              className={cn(
                "text-xs px-3 py-1.5 rounded-lg mb-3 leading-snug",
                scheme.eligible
                  ? "bg-secondary-fixed/30 text-on-secondary-container border border-secondary-fixed/50"
                  : "bg-surface-container text-on-surface-variant border border-outline-variant/40"
              )}
            >
              {scheme.eligibility_reason}
            </div>
          )}

          <div className="flex-1" />

          {/* ── footer ── */}
          <div className="flex items-center justify-between pt-3 border-t border-surface-container mt-2">
            <p className="text-xs text-on-surface-variant truncate flex-1 min-w-0 mr-2">
              {scheme.benefits.slice(0, 72)}{scheme.benefits.length > 72 ? "…" : ""}
            </p>
            <ArrowRight
              size={15}
              className="text-outline-variant group-hover:text-secondary group-hover:translate-x-0.5 transition-all shrink-0"
            />
          </div>
        </div>
      </article>
    </Link>
  );
}
