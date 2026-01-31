"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTABanner() {
  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-br from-[#F8F6F4] via-[#FAFAFA] to-[#F3F0FF]">
      {/* Decorative concentric circles */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] pointer-events-none">
        <div className="absolute inset-0 rounded-full border border-[#E5E7EB]/60" />
        <div className="absolute inset-[80px] rounded-full border border-[#E5E7EB]/50" />
        <div className="absolute inset-[160px] rounded-full border border-[#E5E7EB]/40" />
        <div className="absolute inset-[240px] rounded-full border border-[#7C3AED]/20" />
        <div className="absolute inset-[320px] rounded-full border border-[#7C3AED]/10" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="max-w-xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F3F0FF] border border-[#7C3AED]/20 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
              <span className="text-sm font-medium text-[#7C3AED]">Start for free</span>
            </div>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1A1A2E] leading-tight mb-4">
              Ready to transform your research?
            </h2>

            {/* Description */}
            <p className="text-lg text-[#667085] mb-8 leading-relaxed">
              Join hundreds of researchers who are already using AI-powered synthetic respondents to get faster, more accurate insights.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-8">
              <Link href="/signup">
                <Button className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-8 py-3 h-12 text-base font-medium gap-2 group shadow-lg shadow-[#7C3AED]/25">
                  Get Started Free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline" className="border-[#E5E7EB] text-[#1A1A2E] hover:bg-[#F9FAFB] px-8 py-3 h-12 text-base font-medium gap-2">
                  <Play className="h-4 w-4 fill-current" />
                  Watch Demo
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#667085]">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                14-day free trial
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Cancel anytime
              </span>
            </div>
          </div>

          {/* Right Content - Product Mockup */}
          <div className="relative lg:pl-8">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Dashboard mockup card */}
              <div className="relative bg-white rounded-2xl shadow-2xl shadow-[#1A1A2E]/10 border border-[#E5E7EB] overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                    <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                    <div className="w-3 h-3 rounded-full bg-[#22C55E]" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="w-full max-w-xs mx-auto h-6 bg-white rounded-md border border-[#E5E7EB] flex items-center px-3">
                      <span className="text-xs text-[#9CA3AF]">app.arquetype.dev</span>
                    </div>
                  </div>
                </div>

                {/* Dashboard content preview */}
                <div className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#7C3AED]" />
                      <span className="text-sm font-semibold text-[#1A1A2E]">Arquetype</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#F3F0FF]" />
                  </div>

                  {/* Stats cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-[#F9FAFB] rounded-lg">
                      <div className="text-xs text-[#667085]">Responses</div>
                      <div className="text-lg font-semibold text-[#1A1A2E]">2,847</div>
                    </div>
                    <div className="p-3 bg-[#F3F0FF] rounded-lg">
                      <div className="text-xs text-[#667085]">Accuracy</div>
                      <div className="text-lg font-semibold text-[#7C3AED]">94%</div>
                    </div>
                    <div className="p-3 bg-[#F9FAFB] rounded-lg">
                      <div className="text-xs text-[#667085]">Time Saved</div>
                      <div className="text-lg font-semibold text-[#1A1A2E]">12hrs</div>
                    </div>
                  </div>

                  {/* Chart placeholder */}
                  <div className="h-32 bg-gradient-to-t from-[#F3F0FF] to-transparent rounded-lg flex items-end justify-around px-4 pb-4">
                    <div className="w-6 bg-[#7C3AED]/30 rounded-t" style={{ height: '40%' }} />
                    <div className="w-6 bg-[#7C3AED]/50 rounded-t" style={{ height: '60%' }} />
                    <div className="w-6 bg-[#7C3AED]/70 rounded-t" style={{ height: '45%' }} />
                    <div className="w-6 bg-[#7C3AED] rounded-t" style={{ height: '80%' }} />
                    <div className="w-6 bg-[#7C3AED]/60 rounded-t" style={{ height: '55%' }} />
                    <div className="w-6 bg-[#7C3AED]/80 rounded-t" style={{ height: '70%' }} />
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg border border-[#E5E7EB] px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F3F0FF] flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#7C3AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-[#667085]">Average time</div>
                  <div className="text-sm font-semibold text-[#1A1A2E]">&lt; 5 minutes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
