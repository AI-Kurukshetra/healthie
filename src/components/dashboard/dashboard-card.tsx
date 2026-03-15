import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "default"
}: {
  title: string;
  value: string | number;
  description: string;
  icon?: LucideIcon;
  tone?: "default" | "accent" | "success" | "warning" | "danger";
}) {
  const toneStyles = {
    default: {
      card: "bg-white border-border",
      icon: "bg-slate-100 text-slate-600",
      value: "text-ink"
    },
    accent: {
      card: "bg-gradient-to-br from-blue-600 to-blue-500 border-blue-500 text-white",
      icon: "bg-white/20 text-white",
      value: "text-white"
    },
    success: {
      card: "bg-white border-emerald-200",
      icon: "bg-emerald-50 text-emerald-600",
      value: "text-emerald-700"
    },
    warning: {
      card: "bg-white border-amber-200",
      icon: "bg-amber-50 text-amber-600",
      value: "text-amber-700"
    },
    danger: {
      card: "bg-white border-red-200",
      icon: "bg-red-50 text-red-600",
      value: "text-red-700"
    }
  }[tone];

  return (
    <div className={cn("rounded-2xl border p-6 shadow-card transition-shadow hover:shadow-elevated", toneStyles.card)}>
      <div className="flex items-start justify-between">
        <div>
          <p className={cn("text-sm font-medium", tone === "accent" ? "text-white/80" : "text-muted")}>{title}</p>
          <p className={cn("mt-3 text-4xl font-extrabold tracking-tight", toneStyles.value)}>{value}</p>
          <p className={cn("mt-2 text-sm", tone === "accent" ? "text-white/70" : "text-muted")}>{description}</p>
        </div>
        {Icon && (
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", toneStyles.icon)}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
}
