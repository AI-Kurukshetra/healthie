import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-pill bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-deep", className)}>
      {children}
    </span>
  );
}
