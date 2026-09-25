"use client";

import { CATEGORY_ICONS, cn } from "@/lib/utils";

const CATEGORIES = [
  "Education", "Agriculture", "Housing", "Health",
  "Women & Child", "Social Welfare", "Employment",
  "Business & MSME", "Pension", "Scholarship",
  "Skill Development", "Minority Welfare", "Differently Abled",
  "Financial Inclusion",
];

interface Props {
  selected: string | null;
  onChange: (cat: string | null) => void;
}

export default function CategoryFilter({ selected, onChange }: Props) {
  return (
    <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {/* All pill */}
      <button
        onClick={() => onChange(null)}
        className={cn(
          "shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap border",
          !selected
            ? "bg-primary text-on-primary border-primary shadow-chip"
            : "bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:border-outline hover:text-on-surface"
        )}
      >
        All Schemes
      </button>

      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(selected === cat ? null : cat)}
          className={cn(
            "shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap border",
            selected === cat
              ? "bg-secondary text-on-secondary border-secondary shadow-chip"
              : "bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:border-secondary/50 hover:text-secondary hover:bg-secondary-fixed/20"
          )}
        >
          <span className="text-[13px]">{CATEGORY_ICONS[cat] || "📋"}</span>
          {cat}
        </button>
      ))}
    </div>
  );
}
