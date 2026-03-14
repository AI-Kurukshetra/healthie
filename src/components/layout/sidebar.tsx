"use client";

import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { Avatar } from "@/components/ui/avatar";
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
    <div className="relative z-20 flex h-full flex-col gap-6 rounded-[28px] border border-border/80 bg-white p-5 shadow-card">
      <div className="flex items-start gap-3 border-b border-border pb-5">
        <Avatar className="h-12 w-12" name={userName ?? title} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-deep">Health Platform</p>
          <h2 className="mt-1 text-lg font-semibold text-ink">{title}</h2>
          <p className="text-sm text-muted">{subtitle}</p>
        </div>
      </div>

      <nav className="relative z-10 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <a
              key={`${item.label}-${item.href}`}
              className={cn(
                "relative z-10 flex items-center gap-3 rounded-[20px] px-4 py-3 transition",
                active ? "bg-primary text-white shadow-soft" : "text-muted hover:bg-surface-muted hover:text-ink"
              )}
              href={item.href}
              onClick={() => onOpenChange(false)}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className={cn("text-xs", active ? "text-white/75" : "text-muted")}>{item.description}</p>
              </div>
            </a>
          );
        })}
      </nav>

      <LogoutButton className="mt-auto w-full" />
    </div>
  );

  return (
    <>
      <div className="lg:hidden">
        <Button className="fixed left-4 top-4 z-50 shadow-soft" onClick={() => onOpenChange(!open)} size="sm" variant="secondary">
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          Menu
        </Button>
      </div>

      <aside className="relative z-30 hidden shrink-0 lg:block lg:w-[280px] lg:self-start">
        <div className="sticky top-6">{content}</div>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 bg-slate-950/30 px-4 pb-6 pt-20 lg:hidden">
          <button aria-label="Close navigation" className="absolute inset-0" onClick={() => onOpenChange(false)} type="button" />
          <div className="relative h-full">{content}</div>
        </div>
      ) : null}
    </>
  );
}
