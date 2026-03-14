import { Card } from "@/components/ui/card";

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
    <Card className={tone === "accent" ? "bg-primary text-white" : "bg-white"}>
      <div className="p-6">
        <p className={tone === "accent" ? "text-white/80" : "text-sm text-muted"}>{title}</p>
        <p className="mt-4 font-display text-4xl font-semibold">{value}</p>
        <p className={tone === "accent" ? "mt-3 text-sm text-white/80" : "mt-3 text-sm text-muted"}>{description}</p>
      </div>
    </Card>
  );
}
