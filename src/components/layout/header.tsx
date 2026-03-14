import type { ReactNode } from "react";

import { PanelLeftOpen, Search } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header({
  title,
  description,
  actions,
  userName,
  onMenuToggle
}: {
  title: string;
  description: string;
  actions?: ReactNode;
  userName?: string | null;
  onMenuToggle?: () => void;
}) {
  return (
    <header className="dashboard-panel relative overflow-hidden border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(239,246,255,0.94)_52%,rgba(223,236,255,0.9)_100%)] p-5 sm:p-6">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(63,132,244,0.18),transparent_52%)]" />
      <div className="pointer-events-none absolute -right-16 top-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative z-10 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        <div className="min-w-0 space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-pill border border-primary/15 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-deep shadow-soft">
              Care workspace
            </span>
            {onMenuToggle ? (
              <div className="lg:hidden">
                <Button onClick={onMenuToggle} size="sm" variant="secondary">
                  <PanelLeftOpen className="h-4 w-4" />
                  Sections
                </Button>
              </div>
            ) : null}
            <div className="lg:hidden">{actions}</div>
          </div>

          <div className="max-w-3xl">
            <h1 className="font-display text-3xl font-semibold tracking-[-0.04em] text-ink sm:text-4xl xl:text-[3.2rem]">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-[15px]">
              {description}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:max-w-2xl">
            <div className="rounded-[22px] border border-white/80 bg-white/85 px-4 py-4 shadow-soft backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-deep">Session</p>
              <p className="mt-2 text-base font-semibold text-ink">{userName ?? "Care team"}</p>
              <p className="mt-1 text-sm text-muted">Authenticated and ready for today&apos;s workflow.</p>
            </div>
            <div className="rounded-[22px] border border-white/80 bg-slate-950 px-4 py-4 text-white shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">Focus</p>
              <p className="mt-2 text-base font-semibold">Appointments, notes, and follow-ups</p>
              <p className="mt-1 text-sm text-slate-300">One surface for operational care delivery.</p>
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-3 xl:items-stretch">
          <div className="hidden items-center gap-3 lg:flex lg:justify-end">
            <div className="relative min-w-[220px] flex-1 xl:max-w-[220px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input className="border-white/80 bg-white/85 pl-10" placeholder="Search workspace" />
            </div>
            <div className="flex items-center gap-3">{actions}</div>
          </div>

          <div className="rounded-[24px] border border-white/80 bg-white/88 p-4 shadow-soft backdrop-blur">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12" name={userName} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{userName ?? "Care team"}</p>
                <p className="text-sm text-muted">Live dashboard session</p>
              </div>
            </div>
            <div className="mt-4 rounded-[18px] border border-border/80 bg-surface-muted px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-deep">Command center</p>
              <p className="mt-2 text-sm leading-6 text-muted">Search records, review alerts, and move through the day&apos;s queue without leaving the dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
