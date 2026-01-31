"use client";

import Link from "next/link";
import { ArrowRight, Shield, Headphones, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTABanner() {
  return (
    <section className="relative py-24 overflow-hidden bg-cta-dark">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#7C3AED]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#8B5CF6]/15 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
          Ready to transform your research?
        </h2>
        <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
          Join 500+ research teams already using Syntheia to get faster, more affordable insights.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup">
            <Button variant="white" size="xl" className="gap-2 group">
              Start Free Trial
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/demo">
            <Button variant="outline-light" size="xl">
              Book a Demo
            </Button>
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/60">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <span className="text-sm">SOC 2 Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <span className="text-sm">30-day money-back</span>
          </div>
          <div className="flex items-center gap-2">
            <Headphones className="h-5 w-5" />
            <span className="text-sm">24/7 Support</span>
          </div>
        </div>
      </div>
    </section>
  );
}
