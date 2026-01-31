"use client";

import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "Syntheia cut our research cycle from 3 weeks to 2 days. The quality is indistinguishable from our traditional panels.",
    name: "Sarah Chen",
    role: "VP of Consumer Insights",
    company: "Global CPG Brand",
  },
  {
    quote: "Finally, a synthetic panel that actually delivers on its promises. The SSR methodology gives us confidence in every study.",
    name: "Michael Torres",
    role: "Director of Research",
    company: "Market Research Agency",
  },
  {
    quote: "We use Syntheia for rapid concept testing. Being able to get 500 responses in an hour has transformed how we iterate.",
    name: "Emily Watson",
    role: "Innovation Lead",
    company: "Fortune 500 Retailer",
  },
  {
    quote: "The qualitative insights are what sets Syntheia apart. We don't just get numbers - we understand the 'why' behind responses.",
    name: "David Park",
    role: "Head of Product Research",
    company: "Tech Startup",
  },
  {
    quote: "Integration with our existing Qualtrics workflow was seamless. Our team adopted it within a week.",
    name: "Jennifer Liu",
    role: "Research Operations Manager",
    company: "Healthcare Company",
  },
  {
    quote: "Cost savings aside, the speed advantage is what really matters. We can test more ideas and fail faster.",
    name: "Robert Martinez",
    role: "Chief Strategy Officer",
    company: "Consulting Firm",
  },
  {
    quote: "The accuracy is remarkable. Our validation studies show 90%+ correlation with traditional panel responses.",
    name: "Amanda Foster",
    role: "Senior Research Analyst",
    company: "Financial Services",
  },
  {
    quote: "Syntheia has become essential for our agile research sprints. We can iterate on concepts in real-time.",
    name: "Chris Anderson",
    role: "Product Manager",
    company: "SaaS Company",
  },
];

function TestimonialCard({ testimonial }: { testimonial: typeof testimonials[0] }) {
  return (
    <div className="flex-shrink-0 w-[350px] bg-white rounded-2xl border border-[#E5E7EB] p-5 mx-3 hover:border-[#7C3AED]/30 hover:shadow-lg transition-all duration-300">
      {/* Stars */}
      <div className="flex gap-0.5 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
        ))}
      </div>

      {/* Quote */}
      <p className="text-[#4A4A5A] text-sm leading-relaxed mb-4">
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] flex items-center justify-center text-white font-semibold text-sm">
          {testimonial.name.split(" ").map(n => n[0]).join("")}
        </div>
        <div>
          <p className="font-medium text-[#1A1A2E] text-sm">{testimonial.name}</p>
          <p className="text-xs text-[#6B7280]">{testimonial.role}</p>
          <p className="text-xs text-[#7C3AED]">{testimonial.company}</p>
        </div>
      </div>
    </div>
  );
}

function MarqueeRow({ testimonials, direction = "left" }: {
  testimonials: typeof testimonials[0][];
  direction?: "left" | "right";
}) {
  return (
    <div className="relative overflow-hidden py-3">
      {/* Gradient masks */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#FAFAFA] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#FAFAFA] to-transparent z-10 pointer-events-none" />

      {/* Scrolling content */}
      <div
        className={`flex ${direction === "left" ? "animate-marquee-left" : "animate-marquee-right"}`}
      >
        {/* Original items */}
        {testimonials.map((testimonial, i) => (
          <TestimonialCard key={`original-${i}`} testimonial={testimonial} />
        ))}
        {/* Duplicated items for seamless loop */}
        {testimonials.map((testimonial, i) => (
          <TestimonialCard key={`duplicate-${i}`} testimonial={testimonial} />
        ))}
      </div>
    </div>
  );
}

export function TestimonialsGrid() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Split testimonials into two rows
  const row1 = testimonials.slice(0, 4);
  const row2 = testimonials.slice(4, 8);

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
    <section className="relative py-24 bg-[#FAFAFA] overflow-hidden" ref={sectionRef}>
      {/* Decorative purple accents */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-[#8B5CF6]/5 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#7C3AED]/5 rounded-full blur-3xl translate-y-1/3" />

      <div className="relative">
        {/* Header */}
        <div
          className={`mx-auto max-w-2xl text-center mb-12 px-4 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="section-number mb-4">TESTIMONIALS</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1A2E]">
            Loved by research teams worldwide
          </h2>
          <p className="mt-4 text-lg text-[#4A4A5A]">
            See what leading researchers are saying about Syntheia
          </p>
        </div>

        {/* Marquee rows */}
        <div
          className={`space-y-2 transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <MarqueeRow testimonials={row1} direction="left" />
          <MarqueeRow testimonials={row2} direction="right" />
        </div>
      </div>
    </section>
  );
}
