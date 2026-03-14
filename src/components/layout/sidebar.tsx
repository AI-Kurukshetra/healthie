"use client";

import { ShieldCheck, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/modules/navigation";

export function Sidebar({
  items,
  title,
  subtitle,
  userName,
  open,
  onOpenChange
}: {
  items: NavigationItem[];
  title: string;
  subtitle: string;
  userName?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname();

  useEffect(() => {
    onOpenChange(false);
  }, [pathname, onOpenChange]);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const content = (
    <div className="relative z-20 flex h-full flex-col gap-6 overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(245,249,253,0.98)_100%)] p-5 shadow-card backdrop-blur">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-24 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative flex items-start gap-3 border-b border-border/80 pb-5">
        <Avatar className="h-12 w-12" name={userName ?? title} />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-deep">Health Platform</p>
          <h2 className="mt-1 truncate text-lg font-semibold text-ink">{title}</h2>
          <p className="text-sm text-muted">{subtitle}</p>
        </div>
        <div className="ml-auto lg:hidden">
          <Button aria-label="Close navigation" onClick={() => onOpenChange(false)} size="sm" variant="ghost">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative flex items-center justify-between rounded-[22px] border border-border/80 bg-white/80 px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-deep">Workspace</p>
          <p className="mt-1 text-sm text-muted">Choose a section to continue.</p>
        </div>
        <Badge>{items.length} sections</Badge>
      </div>

      <nav className="relative z-10 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <a
              key={`${item.label}-${item.href}`}
              className={cn(
                "group relative z-10 flex items-center gap-3 rounded-[22px] border px-4 py-3 transition",
                active
                  ? "border-primary/15 bg-primary-soft text-ink shadow-soft"
                  : "border-transparent bg-transparent text-muted hover:border-border hover:bg-white hover:text-ink"
              )}
              href={item.href}
              onClick={() => onOpenChange(false)}
            >
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] transition",
                  active ? "bg-white text-primary-deep" : "bg-surface-muted text-muted group-hover:bg-primary-soft group-hover:text-primary-deep"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="truncate text-xs text-muted">{item.description}</p>
              </div>
              <div className={cn("ml-auto h-2 w-2 rounded-full transition", active ? "bg-primary" : "bg-transparent group-hover:bg-border-strong")} />
            </a>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="rounded-[22px] border border-border/80 bg-slate-950 px-4 py-4 text-white">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="h-4 w-4 text-sky-300" />
            Secure session
          </div>
          <p className="mt-2 text-sm text-slate-300">Protected navigation, role-based access, and workspace-specific actions.</p>
        </div>
        <LogoutButton className="w-full" />
      </div>
    </div>
  );

  return (
    <>
      <aside className="relative z-30 hidden shrink-0 lg:block lg:w-[280px] lg:self-start">
        <div className="sticky top-6">{content}</div>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 bg-slate-950/35 px-4 pb-6 pt-6 lg:hidden">
          <button aria-label="Close navigation" className="absolute inset-0" onClick={() => onOpenChange(false)} type="button" />
          <div className="relative h-full max-w-sm">{content}</div>
        </div>
      ) : null}
    </>
  );
}
