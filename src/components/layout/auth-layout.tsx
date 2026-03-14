import type { PropsWithChildren, ReactNode } from "react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export function AuthLayout({
  children,
  title,
  description,
  kicker,
  aside
}: PropsWithChildren<{
  title: string;
  description: string;
  kicker: string;
  aside?: ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(63,132,244,0.16),_transparent_30%),linear-gradient(180deg,#fbfdff_0%,#f3f8fc_100%)]">
      <div className="page-shell py-6">
        <Link className={buttonVariants({ variant: "ghost", className: "px-0" })} href="/">
          Back to website
        </Link>
      </div>
      <div className="page-shell grid gap-10 pb-20 pt-8 lg:grid-cols-[0.95fr_minmax(360px,520px)] lg:items-center">
        <section className="space-y-6">
          <span className="eyebrow">{kicker}</span>
          <div className="space-y-4">
            <h1 className="font-display text-5xl font-semibold text-ink">{title}</h1>
            <p className="max-w-xl text-lg text-muted">{description}</p>
          </div>
          <div className="dashboard-panel subtle-grid overflow-hidden p-8">
            {aside ?? (
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-deep">Built for modern care teams</p>
                <p className="text-2xl font-semibold text-ink">Bring scheduling, records, prescriptions, and messaging into one calm operating system.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[20px] bg-white/90 p-4">
                    <p className="text-sm font-semibold text-ink">Patients</p>
                    <p className="mt-2 text-sm text-muted">Self-serve scheduling and access to visit history.</p>
                  </div>
                  <div className="rounded-[20px] bg-white/90 p-4">
                    <p className="text-sm font-semibold text-ink">Providers</p>
                    <p className="mt-2 text-sm text-muted">A focused workspace for clinical workflow execution.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
        <section>{children}</section>
      </div>
    </main>
  );
}
