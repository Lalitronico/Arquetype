"use client";

import {
  Navigation,
  Hero,
  LogoBar,
  BenefitsGrid,
  SSRMethodology,
  TestimonialsGrid,
  PricingSection,
  FAQSection,
  CTABanner,
  Footer,
} from "@/components/landing";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Sticky with progress bar */}
      <Navigation />

      {/* Hero Section - Badge + Title + CTA + Product Image */}
      <Hero />

      {/* Logo Bar - Social Proof */}
      <LogoBar />

      {/* Benefits Grid - /01, /02, /03 format */}
      <BenefitsGrid />

      {/* SSR Methodology - Key technical section with animated flow diagram */}
      <SSRMethodology />

      {/* Testimonials - Masonry grid */}
      <TestimonialsGrid />

      {/* Pricing - 3 tiers */}
      <PricingSection />

      {/* FAQ - Accordion style */}
      <FAQSection />

      {/* CTA Banner - Dark background */}
      <CTABanner />

      {/* Footer */}
      <Footer />
    </div>
  );
}
