"use client";

import { DB_CATEGORIES, cn } from "@/lib/utils";
import CategoryIcon from "@/components/CategoryIcon";

interface Props {
  selected: string | null;
  onChange: (cat: string | null) => void;
}

const SHORT_LABEL: Record<string, string> = {
  "Agriculture,Rural & Environment":           "Agriculture",
  "Banking,Financial Services and Insurance":  "Banking & Finance",
  "Business & Entrepreneurship":               "Business",
  "Education & Learning":                      "Education",
  "Health & Wellness":                         "Health",
  "Housing & Shelter":                         "Housing",
  "Public Safety,Law & Justice":               "Law & Justice",
  "Science, IT & Communications":              "Science & IT",
  "Skills & Employment":                       "Employment",
  "Social welfare & Empowerment":              "Social Welfare",
  "Sports & Culture":                          "Sports & Culture",
  "Transport & Infrastructure":                "Transport",
  "Travel & Tourism":                          "Travel & Tourism",
  "Utility & Sanitation":                      "Utilities",
  "Women and Child":                           "Women & Child",
};

export default function CategoryFilter({ selected, onChange }: Props) {
  return (
    <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {/* All pill */}
      <button
        onClick={() => onChange(null)}
        className={cn(
          "shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap border",
          !selected
            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
            : "bg-white text-slate-700 border-slate-300 hover:border-slate-500 hover:text-slate-900"
        )}
      >
        All Schemes
      </button>

      {DB_CATEGORIES.map((cat) => {
        const isActive = selected === cat;
        const label    = SHORT_LABEL[cat] ?? cat;

        return (
          <button
            key={cat}
            onClick={() => onChange(isActive ? null : cat)}
            className={cn(
              "shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap border",
              isActive
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "bg-white text-slate-700 border-slate-300 hover:border-slate-500 hover:text-slate-900 hover:bg-slate-50"
            )}
          >
            <CategoryIcon
              category={cat}
              size={13}
              strokeWidth={2.2}
              className="shrink-0"
            />
            {label}
          </button>
        );
      })}
    </div>
  );
}
