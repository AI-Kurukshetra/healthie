import { Card } from "@/components/ui/card";

export function EmptyState({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="border-dashed border-border-strong bg-surface-muted p-8 text-center">
      <h3 className="font-display text-2xl font-semibold text-ink">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-muted">{description}</p>
    </Card>
  );
}
