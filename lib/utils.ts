import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Real DB category names from government_schemes.scheme_category ──────────
// These are the top-level canonical names. DB values may be comma-joined
// multi-category strings — use containsCategory() to match.
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

// PNG icons available in /public — mapped to DB category names.
// Categories without a dedicated PNG fall back to an emoji.
export const CATEGORY_ICON_PNG: Partial<Record<DBCategory, string>> = {
  "Agriculture,Rural & Environment":           "/farm.png",
  "Banking,Financial Services and Insurance":  "/money.png",
  "Business & Entrepreneurship":               "/money.png",
  "Education & Learning":                      "/student.png",
  "Health & Wellness":                         "/first-aid.png",
  "Housing & Shelter":                         "/house.png",
  "Skills & Employment":                       "/student.png",
  "Social welfare & Empowerment":              "/wheelchair.png",
  "Women and Child":                           "/first-aid.png",
};

export const CATEGORY_EMOJI: Record<string, string> = {
  "Agriculture,Rural & Environment":           "🌾",
  "Banking,Financial Services and Insurance":  "🏦",
  "Business & Entrepreneurship":               "💼",
  "Education & Learning":                      "🎓",
  "Health & Wellness":                         "🏥",
  "Housing & Shelter":                         "🏠",
  "Public Safety,Law & Justice":               "⚖️",
  "Science, IT & Communications":              "💻",
  "Skills & Employment":                       "🛠️",
  "Social welfare & Empowerment":              "🤝",
  "Sports & Culture":                          "🏅",
  "Transport & Infrastructure":                "🚌",
  "Travel & Tourism":                          "✈️",
  "Utility & Sanitation":                      "🚿",
  "Women and Child":                           "👩‍👧",
  // Legacy names kept for backwards compat
  Education: "🎓",
  Agriculture: "🌾",
  Housing: "🏠",
  Health: "🏥",
  "Women & Child": "👩‍👧",
  "Social Welfare": "🤝",
  Employment: "💼",
  "Business & MSME": "🏭",
  Pension: "👴",
  Scholarship: "📚",
  "Skill Development": "🛠️",
  "Minority Welfare": "🌙",
  "Differently Abled": "♿",
  "Financial Inclusion": "🏦",
};

// Keep CATEGORY_ICONS as the emoji fallback map for SchemeCard / legacy usage
export const CATEGORY_ICONS = CATEGORY_EMOJI;

/**
 * Returns true if a scheme's scheme_category value (which may be a
 * comma-joined multi-category string like "Education & Learning, Health & Wellness")
 * contains the given filter category.
 */
export function containsCategory(schemeCategory: string, filter: string): boolean {
  if (!schemeCategory || !filter) return false;
  // Exact match first
  if (schemeCategory === filter) return true;
  // Multi-value: "Education & Learning, Health & Wellness, Women and Child"
  return schemeCategory
    .split(",")
    .map((s) => s.trim())
    .some((s) => s === filter);
}

export const LEVEL_COLORS: Record<string, string> = {
  Central: "bg-blue-100 text-blue-800",
  State: "bg-green-100 text-green-800",
  "State-Central": "bg-purple-100 text-purple-800",
};

export const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  queued: { label: "Queued", color: "bg-yellow-100 text-yellow-800", icon: "⏳" },
  running: { label: "Agent Running", color: "bg-blue-100 text-blue-800", icon: "🤖" },
  completed: { label: "Completed", color: "bg-green-100 text-green-800", icon: "✅" },
  failed: { label: "Failed", color: "bg-red-100 text-red-800", icon: "❌" },
  needs_review: { label: "Needs Your Input", color: "bg-orange-100 text-orange-800", icon: "👀" },
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
  aadhaar: "Aadhaar Card",
  pan: "PAN Card",
  income_certificate: "Income Certificate",
  caste_certificate: "Caste Certificate",
  domicile_certificate: "Domicile Certificate",
  birth_certificate: "Birth Certificate",
  marksheet: "Marksheet / Certificate",
  bank_passbook: "Bank Passbook",
  photo: "Passport Photo",
  signature: "Signature",
  disability_certificate: "Disability Certificate",
  farmer_id: "Farmer ID / Kisan Card",
};
