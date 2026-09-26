import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000)   return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000)     return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function timeAgo(dateStr: string): string {
  const now  = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── DB category names (as stored in government_schemes.scheme_category) ─────
// Values in DB can be comma-joined multi-category strings.
// Use containsCategory() for filtering.
export const DB_CATEGORIES = [
  "Agriculture,Rural & Environment",
  "Banking,Financial Services and Insurance",
  "Business & Entrepreneurship",
  "Education & Learning",
  "Health & Wellness",
  "Housing & Shelter",
  "Public Safety,Law & Justice",
  "Science, IT & Communications",
  "Skills & Employment",
  "Social welfare & Empowerment",
  "Sports & Culture",
  "Transport & Infrastructure",
  "Travel & Tourism",
  "Utility & Sanitation",
  "Women and Child",
] as const;

export type DBCategory = typeof DB_CATEGORIES[number];

/**
 * Returns true if a scheme's scheme_category value (which may be a
 * comma-joined multi-category string like "Education & Learning, Health & Wellness")
 * contains the given filter category.
 */
export function containsCategory(schemeCategory: string, filter: string): boolean {
  if (!schemeCategory || !filter) return false;
  if (schemeCategory === filter) return true;
  return schemeCategory
    .split(",")
    .map((s) => s.trim())
    .some((s) => s === filter);
}

// No emojis — icons are SVGs via CategoryIcon component (components/CategoryIcon.tsx).
// Kept as empty maps for backwards-compat imports that reference CATEGORY_ICONS.
export const CATEGORY_ICONS: Record<string, string> = {};
export const CATEGORY_EMOJI: Record<string, string> = {};

export const LEVEL_COLORS: Record<string, string> = {
  Central:         "bg-slate-900 text-white",
  State:           "bg-white text-slate-900 border border-slate-300",
  "State-Central": "bg-slate-100 text-slate-700 border border-slate-200",
};

export const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  queued:       { label: "Queued",           color: "bg-yellow-100 text-yellow-800", icon: "clock" },
  running:      { label: "Agent Running",    color: "bg-blue-100   text-blue-800",   icon: "bot"   },
  completed:    { label: "Completed",        color: "bg-green-100  text-green-800",  icon: "check" },
  failed:       { label: "Failed",           color: "bg-red-100    text-red-800",    icon: "x"     },
  needs_review: { label: "Needs Your Input", color: "bg-orange-100 text-orange-800", icon: "eye"   },
};

export const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli",
  "Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

export const DOC_TYPE_LABELS: Record<string, string> = {
  aadhaar:               "Aadhaar Card",
  pan:                   "PAN Card",
  income_certificate:    "Income Certificate",
  caste_certificate:     "Caste Certificate",
  domicile_certificate:  "Domicile Certificate",
  birth_certificate:     "Birth Certificate",
  marksheet:             "Marksheet / Certificate",
  bank_passbook:         "Bank Passbook",
  photo:                 "Passport Photo",
  signature:             "Signature",
  disability_certificate:"Disability Certificate",
  farmer_id:             "Farmer ID / Kisan Card",
};
