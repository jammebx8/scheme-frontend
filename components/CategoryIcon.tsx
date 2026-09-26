/**
 * CategoryIcon — renders a Lucide SVG icon for a given DB scheme category.
 * No emojis. Handles both new DB category names and legacy names.
 */
import {
  Sprout,
  Landmark,
  Briefcase,
  GraduationCap,
  HeartPulse,
  Home,
  Shield,
  Cpu,
  Wrench,
  HandHeart,
  Trophy,
  Bus,
  Plane,
  Droplets,
  Baby,
  // legacy
  BookOpen,
  Accessibility,
  Coins,
  type LucideProps,
} from "lucide-react";

type IconComponent = React.ComponentType<LucideProps>;

const ICON_MAP: Record<string, IconComponent> = {
  // New DB category names
  "Agriculture,Rural & Environment":           Sprout,
  "Banking,Financial Services and Insurance":  Landmark,
  "Business & Entrepreneurship":               Briefcase,
  "Education & Learning":                      GraduationCap,
  "Health & Wellness":                         HeartPulse,
  "Housing & Shelter":                         Home,
  "Public Safety,Law & Justice":               Shield,
  "Science, IT & Communications":              Cpu,
  "Skills & Employment":                       Wrench,
  "Social welfare & Empowerment":              HandHeart,
  "Sports & Culture":                          Trophy,
  "Transport & Infrastructure":                Bus,
  "Travel & Tourism":                          Plane,
  "Utility & Sanitation":                      Droplets,
  "Women and Child":                           Baby,
  // Legacy names
  Education:             GraduationCap,
  Agriculture:           Sprout,
  Housing:               Home,
  Health:                HeartPulse,
  "Women & Child":       Baby,
  "Social Welfare":      HandHeart,
  Employment:            Briefcase,
  "Business & MSME":     Briefcase,
  Pension:               Coins,
  Scholarship:           BookOpen,
  "Skill Development":   Wrench,
  "Minority Welfare":    HandHeart,
  "Differently Abled":   Accessibility,
  "Financial Inclusion": Landmark,
};

interface Props extends LucideProps {
  category: string;
}

export default function CategoryIcon({ category, ...props }: Props) {
  // For multi-value CSV fields ("Education & Learning, Health & Wellness"),
  // use the first segment as the primary category.
  const primary  = category?.split(",")[0]?.trim() ?? category;
  const Icon     = ICON_MAP[primary] ?? ICON_MAP[category] ?? Briefcase;
  return <Icon {...props} />;
}
