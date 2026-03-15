import type { PropsWithChildren, ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, ShieldCheck, CalendarDays } from "lucide-react";

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
    <main className="min-h-screen bg-canvas">
      {/* Top bar */}
      <div className="border-b border-border/60 bg-white/90 backdrop-blur-sm">
        <div className="page-shell flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="gradient-bg flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white">H</div>
            <span className="text-sm font-bold text-ink">Healthie</span>
          </Link>
          <Link className={buttonVariants({ variant: "ghost", size: "sm" })} href="/">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to website
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="page-shell py-12 lg:py-20">
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1fr_minmax(360px,440px)] lg:items-start">
          {/* Left */}
          <section className="hidden lg:block">
            <span className="eyebrow">{kicker}</span>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-ink lg:text-4xl">{title}</h1>
            <p className="mt-4 max-w-md text-base text-muted">{description}</p>

            {aside ?? (
              <div className="mt-10 space-y-4">
                {[
                  { icon: CalendarDays, title: "Smart scheduling", desc: "Book and manage appointments with automated provider availability." },
                  { icon: ShieldCheck, title: "Secure by default", desc: "Row-level security, encrypted sessions, and role-based access." },
                  { icon: Heart, title: "Built for care teams", desc: "Patient portal, provider workspace, and admin dashboard in one platform." }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="gradient-border flex items-start gap-4 rounded-xl p-4 shadow-soft">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ink">{item.title}</p>
                        <p className="mt-1 text-sm text-muted">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Right */}
          <section>
            <div className="mb-8 lg:hidden">
              <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
              <p className="mt-2 text-sm text-muted">{description}</p>
            </div>
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
