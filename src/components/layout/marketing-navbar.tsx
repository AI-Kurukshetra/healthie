"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { marketingNavigation } from "@/modules/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MarketingNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/90 backdrop-blur-xl">
      <div className="page-shell flex h-20 items-center justify-between gap-4">
        <Link className="flex items-center gap-3" href="/">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-white">HP</div>
          <div>
            <p className="text-sm font-semibold text-ink">Health Platform</p>
            <p className="text-xs text-muted">Virtual care operations</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {marketingNavigation.map((item) => (
            <Link key={item.href} className={cn("text-sm font-medium transition", pathname === item.href ? "text-ink" : "text-muted hover:text-ink")} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link className={buttonVariants({ variant: "ghost" })} href="/login">
            Log in
          </Link>
          <Link className={buttonVariants({ variant: "primary" })} href="/signup">
            Start free
          </Link>
        </div>

        <button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white lg:hidden" onClick={() => setOpen((current) => !current)} type="button">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-white lg:hidden">
          <div className="page-shell flex flex-col gap-2 py-4">
            {marketingNavigation.map((item) => (
              <Link key={item.href} className="rounded-2xl px-4 py-3 text-sm font-medium text-ink hover:bg-surface-muted" href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            <Link className="rounded-2xl px-4 py-3 text-sm font-medium text-ink hover:bg-surface-muted" href="/login" onClick={() => setOpen(false)}>
              Log in
            </Link>
            <Link className={buttonVariants({ variant: "primary", className: "mt-2 w-full" })} href="/signup" onClick={() => setOpen(false)}>
              Start free
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
