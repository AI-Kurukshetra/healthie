import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "subtle";
  size?: "sm" | "md" | "lg";
};

const variantClasses = {
  primary: "bg-primary text-white shadow-soft hover:bg-primary-deep",
  secondary: "border border-border bg-white text-ink hover:border-border-strong hover:bg-surface-muted",
  ghost: "bg-transparent text-muted hover:bg-surface-muted hover:text-ink",
  danger: "bg-danger text-white hover:bg-rose-700",
  subtle: "bg-primary-soft text-primary-deep hover:bg-primary-soft/80"
} satisfies Record<NonNullable<ButtonProps["variant"]>, string>;

const sizeClasses = {
  sm: "h-10 rounded-pill px-4 text-sm",
  md: "h-11 rounded-pill px-5 text-sm",
  lg: "h-12 rounded-pill px-6 text-sm"
} satisfies Record<NonNullable<ButtonProps["size"]>, string>;

export function buttonVariants({
  variant = "primary",
  size = "md",
  className
}: {
  variant?: NonNullable<ButtonProps["variant"]>;
  size?: NonNullable<ButtonProps["size"]>;
  className?: string;
}) {
  return cn(
    "inline-flex items-center justify-center gap-2 font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-60",
    variantClasses[variant],
    sizeClasses[size],
    className
  );
}

export function Button({
  children,
  className,
  type = "button",
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button className={buttonVariants({ variant, size, className })} type={type} {...props}>
      {children}
    </button>
  );
}
