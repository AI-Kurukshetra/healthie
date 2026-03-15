import Link from "next/link";

import { footerColumns } from "@/modules/site";

export function Footer() {
  return (
    <footer className="navy-section">
      <div className="page-shell grid gap-10 py-14 lg:grid-cols-[1.3fr_repeat(2,minmax(0,1fr))]">
        <div className="max-w-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="gradient-bg flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white">H</div>
            <span className="text-sm font-bold text-white">Healthie</span>
          </div>
          <p className="text-sm text-slate-400">
            A virtual care platform built with Next.js, TailwindCSS, and Supabase.
          </p>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{column.title}</h3>
            <div className="mt-4 space-y-2.5 text-sm">
              {column.links.map((link) => (
                <Link key={link.href} className="block text-slate-300 transition hover:text-white" href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="page-shell py-4 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Health Platform. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
