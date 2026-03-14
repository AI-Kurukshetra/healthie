import Link from "next/link";
import { ArrowRight, Check, Play, ShieldCheck, Sparkles } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function CtaBanner() {
  return (
    <Card className="overflow-hidden bg-ink text-white">
      <div className="grid gap-8 p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-soft">Ready to modernize care operations?</p>
          <h2 className="mt-3 font-display text-4xl font-semibold">Launch a healthcare SaaS experience with a clearer structure.</h2>
          <p className="mt-4 max-w-2xl text-sm text-white/72">
            Reuse the marketing templates, auth flows, and dashboards to accelerate product delivery without copying any external assets.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link className={buttonVariants({ variant: "primary" })} href="/signup">
            Create account
          </Link>
          <Link className={buttonVariants({ variant: "secondary", className: "border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white" })} href="/contact">
            Request a walkthrough
          </Link>
        </div>
      </div>
    </Card>
  );
}

export function HeroSection() {
  return (
    <section className="section-space">
      <div className="page-shell hero-grid">
        <div className="space-y-6">
          <span className="eyebrow">Healthie-style layout system</span>
          <div className="space-y-5">
            <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[1.02] text-ink sm:text-6xl lg:text-7xl">
              A refined virtual care website and dashboard system built for healthcare workflows.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted">
              Structure your marketing site, onboarding, and operations dashboard around the patterns modern healthcare SaaS products use to drive trust and clarity.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className={buttonVariants({ variant: "primary", size: "lg" })} href="/signup">
              Start free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link className={buttonVariants({ variant: "secondary", size: "lg" })} href={hasSupabaseEnv ? "/login" : "/contact"}>
              <Play className="h-4 w-4" />
              {hasSupabaseEnv ? "View live app" : "Talk to product"}
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {platformStats.map((stat) => (
              <div key={stat.label} className="rounded-[20px] border border-border/80 bg-white/80 p-4 shadow-soft">
                <p className="font-display text-3xl font-semibold text-ink">{stat.value}</p>
                <p className="mt-2 text-sm text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <Card className="subtle-grid overflow-hidden p-6 lg:p-8">
          <div className="grid gap-4">
            <div className="rounded-[24px] bg-white p-5 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-deep">Provider workspace</p>
                  <h2 className="mt-2 text-2xl font-semibold text-ink">Daily schedule, records, and notes</h2>
                </div>
                <Badge>Live workflow</Badge>
              </div>
              <div className="mt-5 grid gap-3">
                <div className="rounded-[18px] bg-surface-muted p-4">
                  <p className="text-sm font-semibold text-ink">Today&apos;s appointments</p>
                  <p className="mt-2 text-sm text-muted">See your queue, meeting links, and follow-up requirements.</p>
                </div>
                <div className="rounded-[18px] bg-surface-muted p-4">
                  <p className="text-sm font-semibold text-ink">Care coordination</p>
                  <p className="mt-2 text-sm text-muted">Secure messaging, prescriptions, and clinical documentation in one surface.</p>
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] bg-primary p-5 text-white shadow-soft">
                <Sparkles className="h-5 w-5" />
                <p className="mt-3 text-lg font-semibold">Patient-friendly onboarding</p>
                <p className="mt-2 text-sm text-white/80">Calm forms, clear pricing, and consistent CTAs.</p>
              </div>
              <div className="rounded-[24px] bg-ink p-5 text-white shadow-soft">
                <ShieldCheck className="h-5 w-5" />
                <p className="mt-3 text-lg font-semibold">Secure by design</p>
                <p className="mt-2 text-sm text-white/80">Supabase auth, row-level security, and auditability baked in.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

export function LogoCloudSection() {
  return (
    <section className="pb-10">
      <div className="page-shell">
        <div className="rounded-[28px] border border-border/80 bg-white/90 px-6 py-8 shadow-card">
          <p className="text-center text-sm font-semibold uppercase tracking-[0.24em] text-muted">Trusted by modern care teams and digital health operators</p>
          <div className="mt-6 grid gap-4 text-center text-sm font-semibold text-muted sm:grid-cols-3 lg:grid-cols-6">
            {trustedLogos.map((logo) => (
              <div key={logo} className="rounded-[18px] border border-border bg-surface-muted px-4 py-4">
                {logo}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProductFeaturesSection() {
  return (
    <section className="section-space">
      <div className="page-shell">
        <div className="max-w-2xl">
          <span className="eyebrow">Product features</span>
          <h2 className="mt-4 font-display text-5xl font-semibold text-ink">Design the product around healthcare workflows, not generic admin screens.</h2>
          <p className="mt-4 text-lg text-muted">These reusable sections mirror the narrative pacing of healthcare SaaS marketing websites: trust, workflow depth, outcomes, then conversion.</p>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {featureCards.map((feature) => (
            <Card key={feature.title} className="p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-deep">Core capability</p>
              <h3 className="mt-5 text-2xl font-semibold text-ink">{feature.title}</h3>
              <p className="mt-4 text-sm leading-7 text-muted">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  return (
    <section className="section-space bg-white/70">
      <div className="page-shell">
        <div className="max-w-2xl">
          <span className="eyebrow">How it works</span>
          <h2 className="mt-4 font-display text-5xl font-semibold text-ink">A simple flow from marketing site to care operations.</h2>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {howItWorksSteps.map((step) => (
            <Card key={step.step} className="p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-deep">{step.step}</p>
              <h3 className="mt-6 text-2xl font-semibold text-ink">{step.title}</h3>
              <p className="mt-4 text-sm leading-7 text-muted">{step.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CapabilitiesSection() {
  return (
    <section className="section-space">
      <div className="page-shell grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <span className="eyebrow">Platform capabilities</span>
          <h2 className="mt-4 font-display text-5xl font-semibold text-ink">Templates that cover both the website and the product interior.</h2>
          <p className="mt-4 text-lg text-muted">Use the same design system across acquisition, onboarding, and day-to-day dashboard workflows.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {capabilityCards.map((capability) => (
            <Card key={capability.title} className="p-6">
              <h3 className="text-xl font-semibold text-ink">{capability.title}</h3>
              <div className="mt-5 space-y-3">
                {capability.items.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-muted">
                    <Check className="mt-0.5 h-4 w-4 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  return (
    <section className="section-space bg-white/70">
      <div className="page-shell">
        <div className="max-w-2xl">
          <span className="eyebrow">Testimonials</span>
          <h2 className="mt-4 font-display text-5xl font-semibold text-ink">Healthcare buyers need proof, calm, and operational clarity.</h2>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {testimonialCards.map((testimonial) => (
            <Card key={testimonial.author} className="p-8">
              <p className="text-lg leading-8 text-ink">&quot;{testimonial.quote}&quot;</p>
              <div className="mt-8">
                <p className="font-semibold text-ink">{testimonial.author}</p>
                <p className="text-sm text-muted">{testimonial.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PricingPreviewSection() {
  return (
    <section className="section-space">
      <div className="page-shell">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="eyebrow">Pricing preview</span>
            <h2 className="mt-4 font-display text-5xl font-semibold text-ink">Pricing cards designed for healthcare SaaS storytelling.</h2>
            <p className="mt-4 text-lg text-muted">Lead with the operational value, then show the plan structure clearly and cleanly.</p>
          </div>
          <Link className={buttonVariants({ variant: "secondary" })} href="/pricing">
            View full pricing
          </Link>
        </div>
        <div className="mt-10 grid gap-5 xl:grid-cols-3">
          {pricingTiers.map((tier) => (
            <Card key={tier.name} className={tier.featured ? "border-primary bg-primary text-white" : "bg-white"}>
              <div className="p-8">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-2xl font-semibold">{tier.name}</h3>
                  {tier.featured ? <Badge className="bg-white/15 text-white">Most popular</Badge> : null}
                </div>
                <p className={tier.featured ? "mt-4 text-sm text-white/75" : "mt-4 text-sm text-muted"}>{tier.description}</p>
                <p className="mt-8 font-display text-5xl font-semibold">{formatCurrency(tier.price)}<span className={tier.featured ? "ml-2 text-base text-white/70" : "ml-2 text-base text-muted"}>/mo</span></p>
                <div className="mt-8 space-y-3">
                  {tier.features.map((feature) => (
                    <div key={feature} className={tier.featured ? "flex items-start gap-3 text-sm text-white/80" : "flex items-start gap-3 text-sm text-muted"}>
                      <Check className="mt-0.5 h-4 w-4" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
