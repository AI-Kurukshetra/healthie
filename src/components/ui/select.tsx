import { forwardRef, type SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "h-11 w-full rounded-xl border border-border bg-white px-4 text-sm text-ink outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10",
          className
        )}
        {...props}
      />
    );
  }
);

Select.displayName = "Select";
