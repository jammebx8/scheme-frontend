"use client";

import Link from "next/link";
import { Scheme } from "@/lib/api";
import { CATEGORY_EMOJI, cn } from "@/lib/utils";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";

interface Props {
  scheme: Scheme;
  showEligibility?: boolean;
  compact?: boolean;
}

const LEVEL_PILL: Record<string, string> = {
  Central:         "bg-slate-900 text-white",
  State:           "bg-white text-slate-900 border border-slate-300",
  "State-Central": "bg-slate-100 text-slate-700 border border-slate-200",
};

const CAT_BAR: Record<string, string> = {
  "Agriculture,Rural & Environment":           "bg-lime-500",
  "Banking,Financial Services and Insurance":  "bg-blue-500",
  "Business & Entrepreneurship":               "bg-orange-400",
  "Education & Learning":                      "bg-sky-500",
  "Health & Wellness":                         "bg-rose-400",
  "Housing & Shelter":                         "bg-amber-400",
  "Public Safety,Law & Justice":               "bg-slate-600",
  "Science, IT & Communications":              "bg-cyan-500",
  "Skills & Employment":                       "bg-violet-500",
  "Social welfare & Empowerment":              "bg-teal-500",
  "Sports & Culture":                          "bg-pink-400",
  "Transport & Infrastructure":                "bg-indigo-500",
  "Travel & Tourism":                          "bg-emerald-400",
  "Utility & Sanitation":                      "bg-yellow-500",
  "Women and Child":                           "bg-fuchsia-400",
  // legacy
  Education: "bg-sky-400",
  Agriculture: "bg-lime-500",
  Housing: "bg-amber-400",
  Health: "bg-rose-400",
  "Women & Child": "bg-pink-400",
  "Social Welfare": "bg-teal-500",
  Employment: "bg-violet-500",
  "Business & MSME": "bg-orange-400",
  Pension: "bg-yellow-500",
  Scholarship: "bg-indigo-400",
  "Skill Development": "bg-cyan-500",
  "Minority Welfare": "bg-purple-400",
  "Differently Abled": "bg-green-500",
  "Financial Inclusion": "bg-blue-500",
};

// Short display name for the category badge on the card
const SHORT_CAT: Record<string, string> = {
  "Agriculture,Rural & Environment":           "Agriculture",
  "Banking,Financial Services and Insurance":  "Banking",
  "Business & Entrepreneurship":               "Business",
  "Education & Learning":                      "Education",
  "Health & Wellness":                         "Health",
  "Housing & Shelter":                         "Housing",
  "Public Safety,Law & Justice":               "Law",
  "Science, IT & Communications":              "Science & IT",
  "Skills & Employment":                       "Employment",
  "Social welfare & Empowerment":              "Social Welfare",
  "Sports & Culture":                          "Sports",
  "Transport & Infrastructure":                "Transport",
  "Travel & Tourism":                          "Travel",
  "Utility & Sanitation":                      "Utilities",
  "Women and Child":                           "Women & Child",
};

function MatchBadge({ score }: { score: number }) {
  const pct = Math.round(score);
  const color =
    pct >= 80 ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
    pct >= 55 ? "bg-amber-100  text-amber-700  border-amber-200"  :
                "bg-slate-100  text-slate-600  border-slate-200";
  return (
    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full border shrink-0", color)}>
      {pct}% match
    </span>
  );
}

export default function SchemeCard({
  scheme,
  showEligibility = false,
  compact = false,
}: Props) {
  // For multi-category DB values, show the first segment as the primary category
  const primaryCat = scheme.scheme_category?.split(",")[0]?.trim() ?? scheme.scheme_category;
  const icon       = CATEGORY_EMOJI[primaryCat] ?? CATEGORY_EMOJI[scheme.scheme_category] ?? "📋";
  const bar        = CAT_BAR[primaryCat] ?? CAT_BAR[scheme.scheme_category] ?? "bg-slate-400";
  const levelPill  = LEVEL_PILL[scheme.level] ?? "bg-slate-100 text-slate-700";
  const catLabel   = SHORT_CAT[primaryCat] ?? SHORT_CAT[scheme.scheme_category] ?? primaryCat;

  return (
    <Link href={`/schemes/${scheme.slug}`} className="block group min-w-0 w-full">
      <article
        className={cn(
          "bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col",
          "hover:border-slate-400 hover:shadow-md transition-all duration-200"
        )}
      >
        {/* category colour bar */}
        <div className={cn("h-[3px] w-full", bar)} />

        <div className={cn("flex flex-col flex-1", compact ? "p-4" : "p-5")}>

          {/* header row */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl shrink-0">
              {icon}
            </div>

            <div className="min-w-0 flex-1 overflow-hidden">
              <h3
                className={cn(
                  "font-semibold text-slate-900 group-hover:text-slate-700 transition-colors leading-snug line-clamp-2",
                  compact ? "text-sm" : "text-[14px]"
                )}
              >
                {scheme.scheme_name}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap", levelPill)}>
                  {scheme.level}
                </span>
                <span className="text-[11px] text-slate-500 truncate">
                  {catLabel}
                </span>
              </div>
            </div>

            {/* right badges column */}
            <div className="shrink-0 flex flex-col items-end gap-1 mt-0.5">
              {typeof scheme.match_score === "number" && (
                <MatchBadge score={scheme.match_score} />
              )}
              {showEligibility && scheme.eligible !== undefined && (
                scheme.eligible
                  ? <CheckCircle2 size={16} className="text-emerald-500" />
                  : <XCircle      size={16} className="text-slate-300" />
              )}
            </div>
          </div>

          {/* description */}
          {!compact && (
            <p className="text-[12px] text-slate-500 leading-relaxed line-clamp-2 mb-3">
              {scheme.details}
            </p>
          )}

          {/* eligibility reason chip */}
          {showEligibility && scheme.eligibility_reason && (
            <div
              className={cn(
                "text-[11px] px-2.5 py-1.5 rounded-lg mb-3 leading-snug border",
                scheme.eligible
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-50 text-slate-500 border-slate-200"
              )}
            >
              {scheme.eligibility_reason}
            </div>
          )}

          <div className="flex-1" />

          {/* footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
            <p className="text-[11px] text-slate-400 truncate flex-1 min-w-0 mr-2">
              {(scheme.benefits ?? "").slice(0, 72)}{(scheme.benefits ?? "").length > 72 ? "…" : ""}
            </p>
            <ArrowRight
              size={14}
              className="text-slate-300 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all shrink-0"
            />
          </div>
        </div>
      </article>
    </Link>
  );
}
