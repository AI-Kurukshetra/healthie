import { cn } from "@/lib/utils";

export function Avatar({
  initials,
  name,
  className
}: {
  initials?: string;
  name?: string | null;
  className?: string;
}) {
  const fallback = initials ?? name?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() ?? "HP";

  return (
    <div className={cn("inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary-deep", className)} aria-label={name ?? "Avatar"}>
      {fallback}
    </div>
  );
}
