import Link from "next/link";

import { footerColumns } from "@/modules/site";

export function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="page-shell grid gap-10 py-14 lg:grid-cols-[1.3fr_repeat(2,minmax(0,1fr))]">
        <div className="max-w-md space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-white">HP</div>
            <div>
              <p className="font-semibold text-ink">Health Platform</p>
              <p className="text-sm text-muted">Healthcare SaaS template system</p>
            </div>
          </div>
          <p className="text-sm text-muted">
            A reusable marketing and dashboard framework for digital care products, built with Next.js, TailwindCSS, and Supabase.
          </p>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-deep">{column.title}</h3>
            <div className="mt-4 space-y-3 text-sm text-muted">
              {column.links.map((link) => (
                <Link key={link.href} className="block hover:text-ink" href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}
