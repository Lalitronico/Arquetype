"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const pricingPlans = [
  {
    name: "Starter",
    price: "$99",
    period: "/month",
    description: "Perfect for freelancers and small teams",
    credits: "1,000",
    costPerRespondent: "$0.10",
    features: [
      "1,000 synthetic respondents/mo",
      "5 concurrent studies",
      "Basic demographics",
      "CSV export",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Growth",
    price: "$499",
    period: "/month",
    description: "For growing agencies and brands",
    credits: "7,500",
    costPerRespondent: "$0.07",
    features: [
      "7,500 synthetic respondents/mo",
      "Unlimited studies",
      "Advanced psychographics",
      "Excel + SPSS export",
      "API access",
      "Priority support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Scale",
    price: "$1,499",
    period: "/month",
    description: "For research teams at scale",
    credits: "30,000",
    costPerRespondent: "$0.05",
    features: [
      "30,000 synthetic respondents/mo",
      "Unlimited everything",
      "Custom persona presets",
      "Team collaboration",
      "Integrations (Qualtrics, etc.)",
      "Dedicated success manager",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export function PricingSection() {
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
    <section id="pricing" className="relative py-24 bg-white overflow-hidden" ref={sectionRef}>
      {/* Decorative purple accents */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#7C3AED]/5 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-[#8B5CF6]/5 rounded-full blur-3xl translate-x-1/2" />
      <div className="absolute bottom-0 left-1/3 w-[350px] h-[350px] bg-[#6D28D9]/5 rounded-full blur-3xl translate-y-1/2" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="success" className="mb-4">
            Save up to $24,000/month
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1A2E]">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-[#4A4A5A]">
            Start free, scale as you grow. No hidden fees.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
          {pricingPlans.map((plan, i) => (
            <div
              key={i}
              className={`relative pricing-card p-8 ${
                plan.popular ? "pricing-card-popular lg:scale-105" : ""
              } ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 150}ms`, transition: "all 0.6s ease" }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge variant="primary">Most Popular</Badge>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-[#1A1A2E] mb-2">
                  {plan.name}
                </h3>
                <p className="text-[#6B7280] text-sm">{plan.description}</p>
                <div className="mt-6">
                  <span className="text-5xl font-bold text-[#1A1A2E]">
                    {plan.price}
                  </span>
                  <span className="text-[#6B7280]">{plan.period}</span>
                </div>
                <div className="mt-2 text-sm text-[#6B7280]">
                  {plan.credits} credits ({plan.costPerRespondent}/respondent)
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-[#4A4A5A] text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/signup" className="block">
                <Button
                  variant={plan.popular ? "gradient" : "outline"}
                  className="w-full"
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Enterprise callout */}
        <div className="mt-16 text-center">
          <p className="text-[#6B7280]">
            Need more volume or custom features?{" "}
            <Link
              href="/contact"
              className="text-[#7C3AED] font-medium hover:underline"
            >
              Contact us for enterprise pricing
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
