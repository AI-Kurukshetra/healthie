import { CtaBanner, HeroSection, LogoCloudSection, ProductFeaturesSection, HowItWorksSection, CapabilitiesSection, TestimonialsSection, PricingPreviewSection } from "@/components/marketing/sections";
import { MarketingLayout } from "@/components/layout/marketing-layout";

export default function HomePage() {
  return (
    <MarketingLayout cta={<CtaBanner />}>
      <HeroSection />
      <LogoCloudSection />
      <ProductFeaturesSection />
      <HowItWorksSection />
      <CapabilitiesSection />
      <TestimonialsSection />
      <PricingPreviewSection />
    </MarketingLayout>
  );
}
