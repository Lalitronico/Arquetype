"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Check, User, Sparkles, MessageSquare, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Demo data for the animation
const demoQuestions = [
  "How likely are you to recommend this product to a friend?",
  "How satisfied are you with the ease of use?",
  "Would you purchase this product at the current price?",
];

const demoPersonas = [
  { name: "Sarah M.", age: 28, traits: ["Tech-savvy", "Urban", "Early adopter"] },
  { name: "James K.", age: 45, traits: ["Conservative", "Suburban", "Value-driven"] },
  { name: "Maria L.", age: 34, traits: ["Eco-conscious", "Professional", "Millennial"] },
];

const demoResponses = [
  { rating: 9, text: "The interface is incredibly intuitive. I've already told my colleagues about it." },
  { rating: 6, text: "It works well but I'd want to see more features before paying this price." },
  { rating: 8, text: "Love the sustainability focus. Would definitely recommend to like-minded friends." },
];

function HeroAnimation() {
  const [step, setStep] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResponse, setShowResponse] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [questionText, setQuestionText] = useState(demoQuestions[0]);

  useEffect(() => {
    let isCancelled = false;

    const sequence = async () => {
      for (let i = 0; i < 3; i++) {
        if (isCancelled) return;

        // Update question and persona
        setQuestionText(demoQuestions[i]);
        setCurrentIndex(i);
        setShowResponse(false);
        setTypedText("");

        // Step 0: Show question
        setStep(0);
        await delay(2000);
        if (isCancelled) return;

        // Step 1: Show persona
        setStep(1);
        await delay(1500);
        if (isCancelled) return;

        // Step 2: Processing
        setStep(2);
        await delay(1200);
        if (isCancelled) return;

        // Step 3: Show response with typing effect
        setStep(3);
        setShowResponse(true);
        const response = demoResponses[i].text;
        for (let j = 0; j <= response.length; j++) {
          if (isCancelled) return;
          setTypedText(response.slice(0, j));
          await delay(35);
        }
        await delay(3000);
        if (isCancelled) return;
      }

      // Loop
      if (!isCancelled) {
        sequence();
      }
    };

    sequence();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <div className="relative w-full h-[400px] lg:h-[420px]">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/10 via-transparent to-[#8B5CF6]/10 rounded-3xl" />

      {/* Main container */}
      <div className="relative h-full p-5">
        {/* Survey Question Card */}
        <div
          className={`absolute top-5 left-5 right-5 bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-lg transition-all duration-500 ${
            step >= 0 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4 text-[#7C3AED]" />
            <span className="text-xs font-medium text-[#6B7280]">Survey Question</span>
          </div>
          <p className="text-[#1A1A2E] font-medium text-sm lg:text-base">{questionText}</p>
        </div>

        {/* Persona Card */}
        <div
          className={`absolute top-[115px] left-5 lg:top-[120px] w-52 bg-white rounded-xl border border-[#E5E7EB] p-3 shadow-lg transition-all duration-500 ${
            step >= 1 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] text-white">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-[#1A1A2E] text-sm">{demoPersonas[currentIndex].name}</p>
              <p className="text-xs text-[#6B7280]">Age {demoPersonas[currentIndex].age}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {demoPersonas[currentIndex].traits.map((trait) => (
              <span
                key={trait}
                className="px-2 py-0.5 text-xs bg-[#7C3AED]/10 text-[#7C3AED] rounded-full"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>

        {/* Processing indicator */}
        <div
          className={`absolute top-[115px] right-5 lg:top-[120px] flex items-center gap-2 bg-[#7C3AED] text-white px-4 py-2 rounded-full shadow-lg transition-all duration-300 ${
            step === 2 ? "opacity-100 scale-100" : "opacity-0 scale-90"
          }`}
        >
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span className="text-sm font-medium">Generating...</span>
        </div>

        {/* Response Card */}
        <div
          className={`absolute top-[240px] left-5 right-5 lg:top-[250px] bg-white rounded-2xl border-2 border-[#7C3AED]/30 p-4 shadow-xl transition-all duration-500 ${
            showResponse ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] text-white text-xs font-bold">
                {demoPersonas[currentIndex].name.split(" ")[0][0]}
              </div>
              <span className="text-sm font-medium text-[#1A1A2E]">{demoPersonas[currentIndex].name}</span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 bg-[#7C3AED]/10 rounded-full">
              <Star className="h-3.5 w-3.5 fill-[#7C3AED] text-[#7C3AED]" />
              <span className="text-base font-bold text-[#7C3AED]">{demoResponses[currentIndex].rating}</span>
              <span className="text-xs text-[#6B7280]">/10</span>
            </div>
          </div>
          <p className="text-[#4A4A5A] text-sm leading-relaxed">
            &ldquo;{typedText}&rdquo;
            <span className={`inline-block w-0.5 h-4 bg-[#7C3AED] ml-0.5 align-middle ${typedText.length < demoResponses[currentIndex].text.length ? "animate-blink" : "opacity-0"}`} />
          </p>
        </div>

        {/* Decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-[#7C3AED]/10 rounded-full blur-2xl pointer-events-none" />
      </div>
    </div>
  );
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function Hero() {
  return (
    <section className="relative pt-28 pb-16 lg:pt-32 lg:pb-20 overflow-hidden bg-hero-light">
      {/* Subtle background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#7C3AED]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#8B5CF6]/5 rounded-full blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left side - Text content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="opacity-0 animate-fade-in mb-6 inline-block">
              <Badge variant="peer-reviewed" className="px-4 py-1.5 text-sm">
                Peer-Reviewed Methodology
              </Badge>
            </div>

            {/* Headline */}
            <h1 className="opacity-0 animate-slide-up-stagger delay-100">
              <span className="block text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1A1A2E]">
                Real insights.
              </span>
              <span className="block text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gradient-purple mt-2">
                Synthetic speed.
              </span>
            </h1>

            {/* Description */}
            <p className="opacity-0 animate-slide-up-stagger delay-200 mt-6 text-lg text-[#4A4A5A] leading-relaxed max-w-xl mx-auto lg:mx-0">
              Generate statistically valid survey responses from AI-powered synthetic panelists.
              Cut research costs by 90% and get results in minutes.
            </p>

            {/* CTAs */}
            <div className="opacity-0 animate-slide-up-stagger delay-300 mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link href="/signup">
                <Button variant="gradient" size="lg" className="gap-2 group">
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="#methodology">
                <Button variant="outline" size="lg" className="gap-2">
                  See How It Works
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="opacity-0 animate-slide-up-stagger delay-400 mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-[#6B7280]">
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                50 free respondents
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                Cancel anytime
              </span>
            </div>
          </div>

          {/* Right side - Interactive Animation */}
          <div className="opacity-0 animate-slide-in-right delay-300 lg:pl-4">
            <HeroAnimation />
          </div>
        </div>
      </div>
    </section>
  );
}
