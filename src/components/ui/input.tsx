import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-xl border border-border bg-white px-4 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-primary/40 focus:ring-2 focus:ring-primary/10",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
