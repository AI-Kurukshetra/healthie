import { Mail, MapPin, Phone } from "lucide-react";

import { CtaBanner } from "@/components/marketing/sections";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  return (
    <MarketingLayout cta={<CtaBanner />}>
      <section className="section-space">
        <div className="page-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-5">
            <span className="eyebrow">Contact</span>
            <h1 className="font-display text-6xl font-semibold text-ink">Talk to the team about your care platform rollout.</h1>
            <p className="text-lg text-muted">The contact page follows the same structure pattern as the reference: concise value framing, contact methods, then a form panel.</p>
            <div className="space-y-4 text-sm text-muted">
              <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-primary" /> hello@healthplatform.dev</div>
              <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-primary" /> +1 (415) 555-0182</div>
              <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary" /> Remote-first healthcare product team</div>
            </div>
          </div>
          <Card className="p-8">
            <form className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Input placeholder="First name" />
                <Input placeholder="Last name" />
              </div>
              <Input placeholder="Work email" type="email" />
              <Input placeholder="Organization" />
              <Textarea placeholder="Tell us about your healthcare product or internal platform goals." />
              <Button size="lg" type="submit">Send message</Button>
            </form>
          </Card>
        </div>
      </section>
    </MarketingLayout>
  );
}
