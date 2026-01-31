"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How accurate are synthetic respondents compared to real people?",
    answer:
      "Our SSR methodology has been validated through peer-reviewed research, showing 90% correlation with human panel responses. The AI generates responses that match demographic and psychographic patterns observed in real populations.",
  },
  {
    question: "What types of research can I conduct with Arquetype?",
    answer:
      "Arquetype works well for concept testing, brand perception studies, message testing, product feedback, and market sizing. It's ideal for exploratory research and rapid iteration. For regulatory or clinical research, we recommend using synthetic data alongside traditional methods.",
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
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="relative py-24 bg-white overflow-hidden">
      {/* Purple blur circles */}
      <div className="absolute top-20 -left-32 w-64 h-64 bg-[#7C3AED]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 -right-32 w-80 h-80 bg-[#7C3AED]/8 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-[#A78BFA]/10 rounded-full blur-2xl" />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold text-[#1A1A2E]">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-[#667085]">
            Everything you need to know about Arquetype
          </p>
        </div>

        {/* FAQ List */}
        <div className="divide-y divide-[#E5E7EB]">
          {faqs.map((faq, i) => (
            <div key={i} className="py-6">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-start justify-between text-left group"
              >
                <span className="font-medium text-[#1A1A2E] pr-8 group-hover:text-[#7C3AED] transition-colors">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-[#9CA3AF] shrink-0 mt-0.5 transition-transform duration-200 ${
                    openIndex === i ? "rotate-180 text-[#7C3AED]" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ease-out ${
                  openIndex === i ? "max-h-96 mt-4" : "max-h-0"
                }`}
              >
                <p className="text-[#667085] leading-relaxed pr-12">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
