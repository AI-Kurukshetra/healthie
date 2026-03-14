export function SectionHeading({
  eyebrow,
  title,
  description
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-3">
      {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-deep">{eyebrow}</p> : null}
      <h2 className="font-display text-4xl font-semibold text-ink">{title}</h2>
      <p className="max-w-3xl text-sm leading-7 text-muted">{description}</p>
    </div>
  );
}
