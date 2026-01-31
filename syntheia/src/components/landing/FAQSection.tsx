"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How accurate are synthetic respondents compared to real people?",
    answer:
      "Our SSR methodology has been validated through peer-reviewed research, showing 90% correlation with human panel responses. The AI generates responses that match demographic and psychographic patterns observed in real populations.",
  },
  {
    question: "What types of research can I conduct with Syntheia?",
    answer:
      "Syntheia works well for concept testing, brand perception studies, message testing, product feedback, and market sizing. It's ideal for exploratory research and rapid iteration. For regulatory or clinical research, we recommend using synthetic data alongside traditional methods.",
  },
  {
    question: "How do you ensure response quality?",
    answer:
      "Each response goes through our SSR (Semantic Similarity Rating) engine which calibrates answers based on persona context. We also perform consistency checks and flag any anomalous patterns. You get both quantitative ratings and qualitative reasoning for full transparency.",
  },
  {
    question: "Can I create custom personas?",
    answer:
      "Yes! You can define detailed personas with 50+ demographic attributes, psychographic profiles, and behavioral patterns. Growth and Scale plans allow you to save custom persona presets for reuse across studies.",
  },
  {
    question: "What export formats do you support?",
    answer:
      "Starter plans include CSV export. Growth and Scale plans add Excel, SPSS, and PDF reports. You can also access raw data via our REST API for custom integrations.",
  },
  {
    question: "Is my research data secure?",
    answer:
      "Absolutely. We're SOC 2 Type II certified and GDPR compliant. All data is encrypted in transit and at rest. We never use your research data to train our models, and you can request data deletion at any time.",
  },
  {
    question: "How fast can I get responses?",
    answer:
      "Most surveys receive complete responses within 5 minutes. For large-scale studies (1000+ respondents), expect results within 30 minutes. This is significantly faster than the 2-3 weeks typical of traditional panels.",
  },
  {
    question: "Do you offer a free trial?",
    answer:
      "Yes! All plans include a 14-day free trial with 50 free respondents. No credit card required to start. You can upgrade or cancel anytime.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
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
    <section id="faq" className="relative py-24 bg-[#FAFAFA] overflow-hidden" ref={sectionRef}>
      {/* Decorative purple accents */}
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-[#7C3AED]/5 rounded-full blur-3xl translate-x-1/2" />
      <div className="absolute bottom-1/4 left-0 w-[350px] h-[350px] bg-[#8B5CF6]/5 rounded-full blur-3xl -translate-x-1/2" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="section-number mb-4">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1A2E]">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-[#4A4A5A]">
            Everything you need to know about Syntheia
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`bg-white rounded-xl border border-[#E5E7EB] overflow-hidden ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: `${i * 50}ms`, transition: "all 0.4s ease" }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-[#FAFAFA] transition-colors"
              >
                <span className="font-medium text-[#1A1A2E] pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-[#6B7280] shrink-0 transition-transform duration-200 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openIndex === i ? "max-h-96" : "max-h-0"
                }`}
              >
                <div className="px-6 pb-6 text-[#4A4A5A] leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
