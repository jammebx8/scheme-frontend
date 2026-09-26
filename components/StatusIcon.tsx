import { Clock, Bot, CheckCircle2, XCircle, Eye, type LucideProps } from "lucide-react";

const MAP: Record<string, React.ComponentType<LucideProps>> = {
  clock:  Clock,
  bot:    Bot,
  check:  CheckCircle2,
  x:      XCircle,
  eye:    Eye,
};

export default function StatusIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = MAP[name] ?? Clock;
  return <Icon {...props} />;
}
