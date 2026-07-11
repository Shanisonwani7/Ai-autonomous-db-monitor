"use client";

import { LucideIcon } from "lucide-react";

export type CardTone = "neutral" | "good" | "warning" | "critical" | "info";

interface ReportCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone?: CardTone;
  hint?: string;
}

const TONE_STYLES: Record<
  CardTone,
  { iconWrap: string; ring: string; badge: string }
> = {
  neutral: {
    iconWrap: "bg-slate-800 text-slate-300",
    ring: "hover:ring-slate-700",
    badge: "bg-slate-800 text-slate-300",
  },
  good: {
    iconWrap: "bg-emerald-500/10 text-emerald-400",
    ring: "hover:ring-emerald-500/30",
    badge: "bg-emerald-500/10 text-emerald-400",
  },
  warning: {
    iconWrap: "bg-amber-500/10 text-amber-400",
    ring: "hover:ring-amber-500/30",
    badge: "bg-amber-500/10 text-amber-400",
  },
  critical: {
    iconWrap: "bg-red-500/10 text-red-400",
    ring: "hover:ring-red-500/30",
    badge: "bg-red-500/10 text-red-400",
  },
  info: {
    iconWrap: "bg-sky-500/10 text-sky-400",
    ring: "hover:ring-sky-500/30",
    badge: "bg-sky-500/10 text-sky-400",
  },
};

export default function ReportCard({
  icon: Icon,
  label,
  value,
  tone = "neutral",
  hint,
}: ReportCardProps) {
  const styles = TONE_STYLES[tone];

  return (
    <div
      className={`group relative rounded-xl border border-slate-800 bg-slate-900/60 p-5 ring-1 ring-transparent transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-700 hover:shadow-lg hover:shadow-black/20 ${styles.ring}`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105 ${styles.iconWrap}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        {hint && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles.badge}`}
          >
            {hint}
          </span>
        )}
      </div>
      <p className="mt-4 text-sm font-medium text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
        {value}
      </p>
    </div>
  );
}