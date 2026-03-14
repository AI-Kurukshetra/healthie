import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  description
}: {
  label: string;
  value: string | number;
  description: string;
}) {
  return (
    <Card className="p-6">
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="mt-4 font-display text-4xl font-semibold text-ink">{value}</p>
      <p className="mt-3 text-sm text-muted">{description}</p>
    </Card>
  );
}
