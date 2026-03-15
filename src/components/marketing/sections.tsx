import Link from "next/link";
import { ArrowRight, Check, Play, ShieldCheck, Sparkles, Zap } from "lucide-react";

import {
  capabilityCards,
  featureCards,
  howItWorksSteps,
  platformStats,
  pricingTiers,
  testimonialCards,
  trustedLogos
} from "@/modules/site";
import { hasSupabaseEnv } from "@/lib/env";
import { formatCurrency } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/* ── CTA Banner ────────────────────────────────────── */
export function CtaBanner() {
  return (
    <div className="navy-section overflow-hidden rounded-2xl">
      <div className="relative grid gap-8 p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-12">
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">Ready to modernize care operations?</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white lg:text-4xl">Launch your healthcare platform with clarity and confidence.</h2>
          <p className="mt-4 max-w-xl text-base text-slate-300">
            All the tools your care team needs — scheduling, records, prescriptions, and messaging — in one modern system.
          </p>
        </div>
        <div className="relative flex flex-wrap gap-3">
          <Link className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-navy transition hover:bg-slate-100" href="/signup">
            Get started free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-6 text-sm font-semibold text-white transition hover:bg-white/10" href="/contact">
            Book a demo
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Hero ──────────────────────────────────────────── */
export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/6 to-transparent blur-3xl" />

      <div className="page-shell relative section-space">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">The all-in-one care platform</span>
          <h1 className="mt-8 text-4xl font-semibold tracking-tight text-ink sm:text-5xl lg:text-[3.5rem] lg:leading-[1.1]">
            Healthcare infrastructure,{" "}
            <span className="gradient-text">built for modern teams</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            Scheduling, clinical records, prescriptions, and secure messaging — designed for care teams that value clarity, speed, and trust.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link className={buttonVariants({ size: "lg" })} href="/signup">
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link className={buttonVariants({ variant: "secondary", size: "lg" })} href={hasSupabaseEnv ? "/login" : "/contact"}>
              <Play className="h-4 w-4" />
              {hasSupabaseEnv ? "View live app" : "See a demo"}
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-20 grid max-w-4xl gap-4 sm:grid-cols-3">
          {platformStats.map((stat) => (
            <div key={stat.label} className="gradient-border rounded-2xl p-6 text-center shadow-card">
              <p className="text-3xl font-semibold text-ink">{stat.value}</p>
              <p className="mt-2 text-sm text-muted">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Feature Preview Cards */}
        <div className="mx-auto mt-20 grid max-w-5xl gap-6 lg:grid-cols-2">
          <div className="gradient-border rounded-2xl p-6 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Provider workspace</p>
                <h2 className="mt-2 text-xl font-semibold text-ink">Daily schedule, records, and notes</h2>
              </div>
              <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">Live</span>
            </div>
            <div className="mt-5 space-y-3">
              <div className="rounded-xl bg-surface-muted p-4">
                <p className="text-sm font-semibold text-ink">Today&apos;s appointments</p>
                <p className="mt-1 text-sm text-muted">See your queue, meeting links, and follow-ups.</p>
              </div>
              <div className="rounded-xl bg-surface-muted p-4">
                <p className="text-sm font-semibold text-ink">Care coordination</p>
                <p className="mt-1 text-sm text-muted">Messaging, prescriptions, and clinical documentation.</p>
              </div>
            </div>
          </div>
          <div className="grid gap-6">
            <div className="gradient-bg rounded-2xl p-6 text-white">
              <Sparkles className="h-5 w-5 text-cyan-200" />
              <p className="mt-3 text-lg font-semibold">Patient-friendly onboarding</p>
              <p className="mt-2 text-sm text-white/80">Clean forms, clear pricing, and a consistent care experience.</p>
            </div>
            <div className="navy-section rounded-2xl p-6">
              <ShieldCheck className="h-5 w-5 text-accent" />
              <p className="mt-3 text-lg font-semibold text-white">Secure by design</p>
              <p className="mt-2 text-sm text-slate-300">Supabase auth, row-level security, and full audit trails.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Logo Cloud ───────────────────────────────────── */
export function LogoCloudSection() {
  return (
    <section className="pb-16">
      <div className="page-shell">
        <p className="text-center text-sm font-medium uppercase tracking-wider text-muted">Trusted by modern care teams</p>
        <div className="mt-8 grid gap-3 text-center text-sm font-semibold text-muted sm:grid-cols-3 lg:grid-cols-6">
          {trustedLogos.map((logo) => (
            <div key={logo} className="rounded-xl border border-border bg-white px-4 py-4 transition hover:shadow-card">
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Features ─────────────────────────────────────── */
export function ProductFeaturesSection() {
  return (
    <section className="section-space">
      <div className="page-shell">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Features</span>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Built around <span className="gradient-text">healthcare workflows</span>
          </h2>
          <p className="mt-4 text-base text-muted">Everything care teams need to schedule, document, and communicate.</p>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {featureCards.map((feature, i) => (
            <div key={feature.title} className="gradient-border rounded-2xl p-6 shadow-card transition hover:shadow-elevated">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-ink">{feature.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── How It Works ─────────────────────────────────── */
export function HowItWorksSection() {
  return (
    <section className="navy-section section-space">
      <div className="page-shell relative">
        <div className="pointer-events-none absolute -right-40 top-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent">How it works</span>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Three steps to better care delivery</h2>
        </div>
        <div className="relative mt-14 grid gap-6 lg:grid-cols-3">
          {howItWorksSteps.map((step, index) => (
            <div key={step.step} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:bg-white/8">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-sm font-bold text-white">{index + 1}</span>
              <h3 className="mt-5 text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Capabilities ─────────────────────────────────── */
export function CapabilitiesSection() {
  return (
    <section className="section-space">
      <div className="page-shell">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Capabilities</span>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            One platform, <span className="gradient-text">every workflow</span>
          </h2>
          <p className="mt-4 text-base text-muted">Consistent experience from patient onboarding to daily clinical operations.</p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {capabilityCards.map((capability) => (
            <div key={capability.title} className="gradient-border rounded-2xl p-6 shadow-card">
              <h3 className="text-lg font-semibold text-ink">{capability.title}</h3>
              <div className="mt-5 space-y-3">
                {capability.items.map((item) => (
                  <div key={item} className="flex items-start gap-2.5 text-sm text-muted">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Testimonials ─────────────────────────────────── */
export function TestimonialsSection() {
  return (
    <section className="section-space bg-surface-muted">
      <div className="page-shell">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Testimonials</span>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Trusted by healthcare teams</h2>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {testimonialCards.map((testimonial) => (
            <Card key={testimonial.author} className="p-6">
              <p className="text-base leading-7 text-ink">&quot;{testimonial.quote}&quot;</p>
              <div className="mt-6 border-t border-border pt-4">
                <p className="text-sm font-semibold text-ink">{testimonial.author}</p>
                <p className="text-sm text-muted">{testimonial.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Pricing ──────────────────────────────────────── */
export function PricingPreviewSection() {
  return (
    <section className="section-space">
      <div className="page-shell">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Pricing</span>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-4 text-base text-muted">Choose the plan that fits your practice. Upgrade anytime.</p>
        </div>
        <div className="mt-14 grid gap-6 xl:grid-cols-3">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={
                tier.featured
                  ? "relative overflow-hidden rounded-2xl border-2 border-primary bg-white p-6 shadow-glow"
                  : "rounded-2xl border border-border bg-white p-6 shadow-card"
              }
            >
              {tier.featured && (
                <div className="gradient-bg absolute right-0 top-0 rounded-bl-xl px-4 py-1.5 text-xs font-semibold text-white">Most popular</div>
              )}
              <h3 className="text-xl font-semibold text-ink">{tier.name}</h3>
              <p className="mt-3 text-sm text-muted">{tier.description}</p>
              <p className="mt-6 text-4xl font-semibold text-ink">
                {formatCurrency(tier.price)}
                <span className="ml-1 text-sm font-normal text-muted">/mo</span>
              </p>
              <div className="mt-6 space-y-2.5">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2.5 text-sm text-muted">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <Link
                className={buttonVariants({
                  className: "mt-8 w-full",
                  variant: tier.featured ? "primary" : "secondary"
                })}
                href="/signup"
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
