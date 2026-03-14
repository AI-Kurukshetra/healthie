import type { ReactNode } from "react";

import { PanelLeftOpen, Sparkles } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    <header className="dashboard-panel relative overflow-hidden border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(246,250,253,0.98)_100%)] p-5 sm:p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top_right,rgba(63,132,244,0.18),transparent_38%)]" />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative z-10 space-y-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="border border-primary/15 bg-white">Care workspace</Badge>
              <Badge className="bg-white text-muted">Live session</Badge>
              {onMenuToggle ? (
                <div className="lg:hidden">
                  <Button onClick={onMenuToggle} size="sm" variant="secondary">
                    <PanelLeftOpen className="h-4 w-4" />
                    Sections
                  </Button>
                </div>
              ) : null}
            </div>

            <div className="max-w-3xl">
              <h1 className="font-display text-3xl font-semibold tracking-[-0.04em] text-ink sm:text-4xl xl:text-[3.1rem]">
                {title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-[15px]">
                {description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start">
            <div className="hidden lg:flex lg:items-center lg:gap-3">{actions}</div>
            {onMenuToggle ? <div className="lg:hidden">{actions}</div> : null}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
          <div className="rounded-[22px] border border-border/80 bg-white/90 px-4 py-4 shadow-soft">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12" name={userName} />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-deep">Signed in as</p>
                <p className="truncate text-base font-semibold text-ink">{userName ?? "Care team"}</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">Use the left navigation to move between scheduling, records, messages, and account tasks without losing context.</p>
          </div>

          <div className="rounded-[22px] border border-slate-900/10 bg-slate-950 px-4 py-4 text-white shadow-soft">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-white/10">
                <Sparkles className="h-5 w-5 text-sky-200" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-200">Workflow focus</p>
                <p className="mt-2 text-base font-semibold">This screen now emphasizes the next decision instead of every possible action.</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">Open a section when you need detail. Use the dashboard to orient, prioritize, and move quickly.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
