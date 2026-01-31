"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { SSRFlowDiagram } from "./SSRFlowDiagram";
import { FlaskConical, Clock, BarChart3, CheckCircle2 } from "lucide-react";

const metrics = [
  {
    icon: BarChart3,
    value: "9,300+",
    label: "Validated Responses",
    description: "Used in peer review studies",
  },
  {
    icon: CheckCircle2,
    value: "90%",
    label: "Correlation Rate",
    description: "With human panel data",
  },
  {
    icon: Clock,
    value: "<5 min",
    label: "Response Time",
    description: "For complete surveys",
  },
];

export function SSRMethodology() {
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
    <section
      id="methodology"
      className="relative py-24 bg-[#FAFAFA] overflow-hidden"
      ref={sectionRef}
    >
      {/* Decorative purple accents */}
      <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-[#7C3AED]/5 rounded-full blur-3xl -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#8B5CF6]/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/4" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <Badge variant="peer-reviewed" className="mb-4 px-4 py-1.5">
            <FlaskConical className="h-3.5 w-3.5 mr-1.5" />
            Peer-Reviewed Methodology
          </Badge>
          <h2
            className={`text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1A2E] ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{ transition: "all 0.6s ease" }}
          >
            The Science Behind Synthetic Respondents
          </h2>
          <p
            className={`mt-4 text-lg text-[#4A4A5A] ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{ transition: "all 0.6s ease 100ms" }}
          >
            Our SSR (Semantic Similarity Rating) methodology transforms survey questions
            into AI responses that mirror real human behavior patterns.
          </p>
        </div>

        {/* Metrics */}
        <div
          className={`grid gap-6 md:grid-cols-3 mb-16 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transition: "all 0.6s ease 200ms" }}
        >
          {metrics.map((metric, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-[#E5E7EB]"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#7C3AED]/10">
                <metric.icon className="h-7 w-7 text-[#7C3AED]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#1A1A2E]">
                  {metric.value}
                </div>
                <div className="text-sm font-medium text-[#4A4A5A]">
                  {metric.label}
                </div>
                <div className="text-xs text-[#6B7280]">{metric.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Flow Diagram */}
        <div
          className={`bg-white rounded-3xl border border-[#E5E7EB] p-8 lg:p-12 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transition: "all 0.6s ease 300ms" }}
        >
          <h3 className="text-xl font-semibold text-[#1A1A2E] text-center mb-8">
            How SSR Generates Responses
          </h3>
          <SSRFlowDiagram />
        </div>

        {/* Example Interactive */}
        <div
          className={`mt-12 grid lg:grid-cols-2 gap-8 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transition: "all 0.6s ease 400ms" }}
        >
          {/* Input example */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#7C3AED]" />
              <span className="text-sm font-medium text-[#6B7280]">INPUT</span>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-[#6B7280] mb-1">Survey Question</p>
                <p className="text-[#1A1A2E] font-medium">
                  &ldquo;How satisfied are you with the product&apos;s ease of use?&rdquo;
                </p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280] mb-1">Persona Profile</p>
                <div className="flex flex-wrap gap-2">
                  {["Female", "32", "Marketing Manager", "Urban", "Tech-savvy"].map(
                    (tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-[#FAFAFA] text-[#4A4A5A] rounded-md border border-[#E5E7EB]"
                      >
                        {tag}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Output example */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium text-[#6B7280]">OUTPUT</span>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-[#6B7280] mb-1">Rating</p>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold text-[#7C3AED]">8</span>
                  <span className="text-lg text-[#6B7280]">/ 10</span>
                  <span className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-full">
                    Highly Satisfied
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-[#6B7280] mb-1">Qualitative Reasoning</p>
                <p className="text-sm text-[#4A4A5A] leading-relaxed">
                  &ldquo;As someone who uses many digital tools daily, I found the interface
                  intuitive. The onboarding was quick, though I&apos;d appreciate more
                  keyboard shortcuts for power users.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
