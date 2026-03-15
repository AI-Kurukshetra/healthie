"use client";

import { ShieldCheck, X } from "lucide-react";
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
    <div className="flex h-full flex-col border-r border-border bg-white px-4 py-5">
      {/* Brand + User */}
      <div className="flex items-center gap-3 pb-5">
        <Avatar className="h-9 w-9" name={userName ?? title} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-ink">{title}</p>
          <p className="truncate text-xs text-muted">{subtitle}</p>
        </div>
        <div className="lg:hidden">
          <Button aria-label="Close navigation" onClick={() => onOpenChange(false)} size="sm" variant="ghost">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted/60">Menu</p>
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <a
              key={`${item.label}-${item.href}`}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors",
                active
                  ? "bg-primary-soft text-primary-deep font-semibold"
                  : "text-muted hover:bg-surface-muted hover:text-ink"
              )}
              href={item.href}
              onClick={() => onOpenChange(false)}
            >
              <Icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-primary" : "text-muted/70 group-hover:text-ink")} />
              <span>{item.label}</span>
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
            </a>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto space-y-3 border-t border-border pt-4">
        <div className="flex items-center gap-2 px-3 text-[11px] text-muted">
          <ShieldCheck className="h-3.5 w-3.5 text-success" />
          <span>Secure session</span>
        </div>
        <LogoutButton className="w-full" />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: fixed sidebar */}
      <aside className="hidden h-screen w-[250px] shrink-0 lg:sticky lg:top-0 lg:block">
        {content}
      </aside>

      {/* Mobile: overlay drawer */}
      {open ? (
        <div className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden">
          <button aria-label="Close navigation" className="absolute inset-0" onClick={() => onOpenChange(false)} type="button" />
          <div className="relative h-full w-[280px]">{content}</div>
        </div>
      ) : null}
    </>
  );
}
