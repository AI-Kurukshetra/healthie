import { CtaBanner, PricingPreviewSection } from "@/components/marketing/sections";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { pricingTiers } from "@/modules/site";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export default function PricingPage() {
  return (
    <MarketingLayout cta={<CtaBanner />}>
      <section className="section-space">
        <div className="page-shell max-w-4xl">
          <span className="eyebrow">Pricing</span>
          <h1 className="mt-4 font-display text-6xl font-semibold text-ink">Pricing built to explain value clearly before the buyer ever reaches the dashboard.</h1>
          <p className="mt-5 text-lg text-muted">The pricing page follows the same structure pattern as modern healthcare SaaS pages: headline, summary, card comparison, and a conversion-focused CTA.</p>
        </div>
      </section>
      <PricingPreviewSection />
      <section className="pb-20">
        <div className="page-shell grid gap-5 lg:grid-cols-3">
          {pricingTiers.map((tier) => (
            <Card key={tier.name} className="p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-deep">{tier.name}</p>
              <p className="mt-5 font-display text-5xl font-semibold text-ink">{formatCurrency(tier.price)}</p>
              <p className="mt-4 text-sm text-muted">{tier.description}</p>
            </Card>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
}
