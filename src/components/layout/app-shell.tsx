import Link from "next/link";
import type { PropsWithChildren } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { dashboardNavigation } from "@/modules/navigation";
import type { Role, UserProfile } from "@/types/domain";

export function AppShell({
  role,
  profile,
  children
}: PropsWithChildren<{ role: Role; profile: UserProfile }>) {
  const nav = dashboardNavigation[role];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(22,131,255,0.16),_transparent_32%),linear-gradient(180deg,#f7fcff_0%,#edf7ff_100%)]">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-[2rem] border border-white/70 bg-slate-950 px-5 py-6 text-white shadow-panel">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.24em] text-ocean-100">Health Platform</p>
            <h1 className="font-display text-2xl font-semibold">{profile.full_name ?? profile.email}</h1>
            <p className="text-sm capitalize text-slate-300">{role} portal</p>
          </div>

          <nav className="mt-10 space-y-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                className="block rounded-2xl px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10 hover:text-white"
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <LogoutButton className="mt-10 w-full" />
        </aside>

        <main className="space-y-6 py-2">{children}</main>
      </div>
    </div>
  );
}
