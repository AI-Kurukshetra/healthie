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
    <header className="sticky top-0 z-40 border-b border-border/60 bg-white/90 backdrop-blur-md">
      <div className="page-shell flex h-16 items-center justify-between gap-4">
        <Link className="flex items-center gap-2.5" href="/">
          <div className="gradient-bg flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white">H</div>
          <span className="text-sm font-bold text-ink">Healthie</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {marketingNavigation.map((item) => (
            <Link
              key={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href ? "bg-primary-soft text-primary" : "text-muted hover:text-ink"
              )}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link className={buttonVariants({ variant: "ghost", size: "sm" })} href="/login">
            Log in
          </Link>
          <Link className={buttonVariants({ size: "sm" })} href="/signup">
            Get started
          </Link>
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white text-muted lg:hidden"
          onClick={() => setOpen((prev) => !prev)}
          type="button"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-white lg:hidden">
          <div className="page-shell flex flex-col gap-1 py-3">
            {marketingNavigation.map((item) => (
              <Link key={item.href} className="rounded-lg px-4 py-2.5 text-sm font-medium text-ink hover:bg-surface-muted" href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
              <Link className={buttonVariants({ variant: "ghost" })} href="/login" onClick={() => setOpen(false)}>Log in</Link>
              <Link className={buttonVariants({})} href="/signup" onClick={() => setOpen(false)}>Get started</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
