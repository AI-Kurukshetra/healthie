import type { HTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

export function Card({ children, className, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={cn("rounded-card border border-border bg-white shadow-card", className)} {...props}>
      {children}
    </div>
  );
}
