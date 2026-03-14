import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function DashboardCard({
  title,
  value,
  description,
  tone = "default"
}: {
  title: string;
  value: string | number;
  description: string;
  tone?: "default" | "accent";
}) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-white/70",
        tone === "accent"
          ? "bg-[linear-gradient(135deg,rgba(34,93,188,1)_0%,rgba(63,132,244,0.95)_55%,rgba(126,176,255,0.92)_100%)] text-white"
          : "bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(246,250,253,0.98)_100%)]"
      )}
    >
      <div className="p-6">
        <div className="flex items-center justify-between gap-3">
          <p className={tone === "accent" ? "text-white/80" : "text-sm text-muted"}>{title}</p>
          <span className={cn("h-2.5 w-2.5 rounded-full", tone === "accent" ? "bg-white/80" : "bg-primary/70")} />
        </div>
        <p className="mt-5 font-display text-4xl font-semibold">{value}</p>
        <p className={tone === "accent" ? "mt-3 text-sm text-white/80" : "mt-3 text-sm leading-6 text-muted"}>{description}</p>
      </div>
    </Card>
  );
}
