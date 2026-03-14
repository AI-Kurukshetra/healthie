import { CapabilitiesSection, CtaBanner, ProductFeaturesSection } from "@/components/marketing/sections";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { Card } from "@/components/ui/card";

const detailCards = [
  {
    title: "Marketing-to-product continuity",
    description: "Use matching card geometry, CTA rhythm, and content hierarchy across landing and in-app experiences."
  },
  {
    title: "Workflow-first dashboards",
    description: "Templates prioritize appointments, client records, and communication patterns instead of generic KPI-only layouts."
  },
  {
    title: "Healthcare-friendly UI system",
    description: "Soft blues, white surfaces, accessible contrast, and restrained motion keep the product clear and credible."
  }
];

export default function FeaturesPage() {
  return (
    <MarketingLayout cta={<CtaBanner />}>
      <section className="section-space">
        <div className="page-shell max-w-4xl">
          <span className="eyebrow">Features</span>
          <h1 className="mt-4 font-display text-6xl font-semibold text-ink">A full website and dashboard template system for digital health products.</h1>
          <p className="mt-5 text-lg text-muted">These sections mirror the structural patterns common across mature healthcare SaaS marketing sites while staying brand-neutral and reusable.</p>
        </div>
      </section>
      <ProductFeaturesSection />
      <section className="pb-20">
        <div className="page-shell grid gap-5 lg:grid-cols-3">
          {detailCards.map((card) => (
            <Card key={card.title} className="p-8">
              <h2 className="text-2xl font-semibold text-ink">{card.title}</h2>
              <p className="mt-4 text-sm leading-7 text-muted">{card.description}</p>
            </Card>
          ))}
        </div>
      </section>
      <CapabilitiesSection />
    </MarketingLayout>
  );
}
