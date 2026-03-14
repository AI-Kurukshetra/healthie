import { CtaBanner } from "@/components/marketing/sections";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { Card } from "@/components/ui/card";

const values = [
  {
    title: "Trust-first design",
    description: "Healthcare interfaces need to feel calm, legible, and well organized before they feel clever."
  },
  {
    title: "Operational clarity",
    description: "The product structure should support care delivery teams as much as it supports marketing conversion."
  },
  {
    title: "Reusable architecture",
    description: "Marketing, auth, and dashboard surfaces share one consistent design language for faster iteration."
  }
];

export default function AboutPage() {
  return (
    <MarketingLayout cta={<CtaBanner />}>
      <section className="section-space">
        <div className="page-shell max-w-4xl">
          <span className="eyebrow">About</span>
          <h1 className="mt-4 font-display text-6xl font-semibold text-ink">A healthcare product template inspired by strong SaaS information architecture.</h1>
          <p className="mt-5 text-lg text-muted">This project keeps the original application logic intact while elevating the website and product UX around the layout patterns used by mature digital health platforms.</p>
        </div>
      </section>
      <section className="pb-20">
        <div className="page-shell grid gap-5 lg:grid-cols-3">
          {values.map((value) => (
            <Card key={value.title} className="p-8">
              <h2 className="text-2xl font-semibold text-ink">{value.title}</h2>
              <p className="mt-4 text-sm leading-7 text-muted">{value.description}</p>
            </Card>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
}
