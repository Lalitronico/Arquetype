"use client";

import { useEffect, useRef, useState } from "react";
import { Zap, Users, Clock, User, MessageSquare, Star, BarChart3, TrendingUp, PieChart } from "lucide-react";

// Mini illustration components for each feature
function InstantResultsIllustration() {
  return (
    <div className="relative h-48 bg-gradient-to-br from-[#FAFAFA] to-white rounded-xl overflow-hidden">
      {/* Timer/Speed visualization */}
      <div className="absolute top-4 left-4 right-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-[#7C3AED]" />
            </div>
            <span className="text-xs font-medium text-[#4A4A5A]">Response Time</span>
          </div>
          <span className="text-xs text-emerald-600 font-semibold">Live</span>
        </div>

        {/* Progress bars showing speed */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#6B7280] w-20">Traditional</span>
            <div className="flex-1 h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
              <div className="h-full w-[15%] bg-[#6B7280] rounded-full" />
            </div>
            <span className="text-[10px] text-[#6B7280]">3 weeks</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#7C3AED] font-medium w-20">Syntheia</span>
            <div className="flex-1 h-2 bg-[#7C3AED]/20 rounded-full overflow-hidden">
              <div className="h-full w-full bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] rounded-full animate-pulse" />
            </div>
            <span className="text-[10px] text-[#7C3AED] font-medium">5 min</span>
          </div>
        </div>
      </div>

      {/* Animated responses counter */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[#6B7280]">Responses collected</p>
              <p className="text-lg font-bold text-[#1A1A2E]">2,847</p>
            </div>
            <div className="flex items-center gap-1 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium">+142/min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnyDemographicIllustration() {
  const personas = [
    { name: "Sarah M.", age: 28, tags: ["Tech-savvy", "Urban"] },
    { name: "James K.", age: 52, tags: ["Executive", "Suburban"] },
    { name: "Maria L.", age: 34, tags: ["Gen Z", "Creative"] },
  ];

  return (
    <div className="relative h-48 bg-gradient-to-br from-[#FAFAFA] to-white rounded-xl overflow-hidden p-4">
      {/* Floating persona cards */}
      <div className="relative h-full">
        {personas.map((persona, i) => (
          <div
            key={persona.name}
            className="absolute bg-white rounded-lg border border-[#E5E7EB] p-2 shadow-sm hover:shadow-md hover:border-[#7C3AED]/30 transition-all cursor-default"
            style={{
              top: `${i * 28}%`,
              left: `${i * 15}%`,
              zIndex: 3 - i,
            }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] flex items-center justify-center text-white text-xs font-bold">
                {persona.name[0]}
              </div>
              <div>
                <p className="text-xs font-medium text-[#1A1A2E]">{persona.name}</p>
                <p className="text-[10px] text-[#6B7280]">Age {persona.age}</p>
              </div>
            </div>
            <div className="flex gap-1 mt-1.5">
              {persona.tags.map((tag) => (
                <span key={tag} className="px-1.5 py-0.5 text-[9px] bg-[#7C3AED]/10 text-[#7C3AED] rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}

        {/* Add persona button */}
        <div className="absolute bottom-0 right-0 bg-[#7C3AED] text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg shadow-[#7C3AED]/25 flex items-center gap-1">
          <Users className="w-3 h-3" />
          + Add Persona
        </div>
      </div>
    </div>
  );
}

function SSRMethodologyIllustration() {
  return (
    <div className="relative h-48 bg-gradient-to-br from-[#FAFAFA] to-white rounded-xl overflow-hidden p-4">
      {/* Flow diagram */}
      <div className="flex items-center justify-between h-full">
        {/* Input */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center shadow-sm">
            <MessageSquare className="w-5 h-5 text-[#7C3AED]" />
          </div>
          <span className="text-[9px] text-[#6B7280] mt-1">Question</span>
        </div>

        {/* Arrow */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full h-0.5 bg-gradient-to-r from-[#7C3AED]/50 to-[#7C3AED] relative">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-4 border-l-[#7C3AED] border-y-2 border-y-transparent" />
          </div>
        </div>

        {/* SSR Engine */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] flex items-center justify-center shadow-lg shadow-[#7C3AED]/30 animate-pulse">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-[9px] text-[#7C3AED] font-medium mt-1">SSR Engine</span>
        </div>

        {/* Arrow */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full h-0.5 bg-gradient-to-r from-[#7C3AED] to-emerald-500 relative">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-4 border-l-emerald-500 border-y-2 border-y-transparent" />
          </div>
        </div>

        {/* Output */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-white border-2 border-emerald-500 flex items-center justify-center shadow-sm">
            <Star className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-[9px] text-emerald-600 mt-1">Rating</span>
        </div>
      </div>

      {/* Correlation badge */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
        <span className="text-[10px] text-emerald-700 font-medium">90% correlation with human data</span>
      </div>
    </div>
  );
}

function RichAnalyticsIllustration() {
  return (
    <div className="relative h-48 bg-gradient-to-br from-[#FAFAFA] to-white rounded-xl overflow-hidden p-4">
      {/* Mini dashboard */}
      <div className="grid grid-cols-2 gap-2 h-full">
        {/* Chart */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-2">
          <div className="flex items-center gap-1 mb-2">
            <BarChart3 className="w-3 h-3 text-[#7C3AED]" />
            <span className="text-[9px] text-[#6B7280]">Distribution</span>
          </div>
          <div className="flex items-end gap-1 h-16">
            {[35, 55, 75, 90, 70, 45, 60].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-gradient-to-t from-[#7C3AED] to-[#8B5CF6]"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        {/* Pie chart mock */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-2">
          <div className="flex items-center gap-1 mb-2">
            <PieChart className="w-3 h-3 text-[#7C3AED]" />
            <span className="text-[9px] text-[#6B7280]">Segments</span>
          </div>
          <div className="flex items-center justify-center h-16">
            <div className="w-14 h-14 rounded-full border-4 border-[#7C3AED] border-t-emerald-500 border-r-amber-500" />
          </div>
        </div>

        {/* Stats row */}
        <div className="col-span-2 bg-white rounded-lg border border-[#E5E7EB] p-2 flex items-center justify-around">
          <div className="text-center">
            <p className="text-sm font-bold text-[#1A1A2E]">8.4</p>
            <p className="text-[9px] text-[#6B7280]">Avg Score</p>
          </div>
          <div className="w-px h-6 bg-[#E5E7EB]" />
          <div className="text-center">
            <p className="text-sm font-bold text-emerald-600">+12%</p>
            <p className="text-[9px] text-[#6B7280]">vs Target</p>
          </div>
          <div className="w-px h-6 bg-[#E5E7EB]" />
          <div className="text-center">
            <p className="text-sm font-bold text-[#1A1A2E]">94%</p>
            <p className="text-[9px] text-[#6B7280]">Confidence</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const benefits = [
  {
    title: "Instant Results",
    description: "Get survey responses in minutes, not weeks. Our AI panelists respond instantly to any research question.",
    Illustration: InstantResultsIllustration,
  },
  {
    title: "Any Demographic",
    description: "Create panelists for any profile - from Gen Z to executives, any location, any psychographic segment.",
    Illustration: AnyDemographicIllustration,
  },
  {
    title: "SSR Methodology",
    description: "Scientifically validated Semantic Similarity Rating ensures reliable, reproducible results every time.",
    Illustration: SSRMethodologyIllustration,
  },
  {
    title: "Rich Analytics",
    description: "Get both quantitative ratings and qualitative explanations. Understand not just what, but why.",
    Illustration: RichAnalyticsIllustration,
  },
];

export function BenefitsGrid() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" className="relative py-24 bg-white overflow-hidden" ref={sectionRef}>
      {/* Decorative purple accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#7C3AED]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#8B5CF6]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <p className="section-number mb-4">FEATURES</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1A2E]">
            All the tools you need for synthetic research
          </h2>
          <p className="mt-4 text-lg text-[#4A4A5A]">
            Built on peer-reviewed methodology, designed for research professionals
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {benefits.map((benefit, i) => (
            <div
              key={i}
              className={`group bg-white rounded-2xl border border-[#E5E7EB] p-6 hover:border-[#7C3AED]/30 hover:shadow-xl hover:shadow-[#7C3AED]/5 transition-all duration-300 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{
                transition: `all 0.6s ease ${i * 100}ms`,
              }}
            >
              {/* Illustration */}
              <benefit.Illustration />

              {/* Text content */}
              <div className="mt-5">
                <h3 className="text-xl font-semibold text-[#1A1A2E] mb-2">
                  {benefit.title}
                </h3>
                <p className="text-[#4A4A5A] leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
