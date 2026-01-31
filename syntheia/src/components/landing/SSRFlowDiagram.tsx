"use client";

import { useEffect, useState, useRef } from "react";
import { FileQuestion, User, Cpu, Gauge, Star } from "lucide-react";

const flowSteps = [
  {
    id: "question",
    icon: FileQuestion,
    label: "Survey Question",
    example: '"How likely are you to recommend this product?"',
  },
  {
    id: "persona",
    icon: User,
    label: "Persona Context",
    example: "Female, 28, Urban, Tech-savvy, Early adopter",
  },
  {
    id: "llm",
    icon: Cpu,
    label: "LLM Generation",
    example: "Processing semantic understanding...",
  },
  {
    id: "engine",
    icon: Gauge,
    label: "SSR Engine",
    example: "Calibrating response to persona profile...",
  },
  {
    id: "rating",
    icon: Star,
    label: "Rating Output",
    example: "8/10 with qualitative reasoning",
  },
];

export function SSRFlowDiagram() {
  const [activeStep, setActiveStep] = useState(-1);
  const [isVisible, setIsVisible] = useState(false);
  const [matchPercent, setMatchPercent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // Animate through steps
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= flowSteps.length - 1) {
          return 0;
        }
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(stepInterval);
  }, [isVisible]);

  useEffect(() => {
    if (activeStep === flowSteps.length - 1) {
      // Animate match percentage when reaching final step
      let current = 0;
      const interval = setInterval(() => {
        current += 2;
        if (current >= 90) {
          setMatchPercent(90);
          clearInterval(interval);
        } else {
          setMatchPercent(current);
        }
      }, 20);
      return () => clearInterval(interval);
    }
  }, [activeStep]);

  return (
    <div ref={containerRef} className="w-full">
      {/* Flow diagram - Desktop */}
      <div className="hidden lg:block relative">
        {/* Connection line */}
        <svg
          className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-2 w-full pointer-events-none"
          preserveAspectRatio="none"
        >
          <line
            x1="10%"
            y1="50%"
            x2="90%"
            y2="50%"
            stroke="#E5E7EB"
            strokeWidth="2"
          />
          <line
            x1="10%"
            y1="50%"
            x2="90%"
            y2="50%"
            stroke="url(#gradient)"
            strokeWidth="2"
            className="ssr-path"
            style={{
              strokeDasharray: 1000,
              strokeDashoffset: isVisible ? 0 : 1000,
              transition: "stroke-dashoffset 2s ease-out",
            }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
        </svg>

        {/* Steps */}
        <div className="flex justify-between items-start relative z-10">
          {flowSteps.map((step, i) => (
            <div
              key={step.id}
              className={`flex flex-col items-center w-40 transition-all duration-500 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: `${i * 200}ms` }}
            >
              {/* Node */}
              <div
                className={`relative flex h-16 w-16 items-center justify-center rounded-2xl border-2 bg-white transition-all duration-300 ${
                  activeStep >= i
                    ? "border-[#7C3AED] shadow-lg shadow-[#7C3AED]/20"
                    : "border-[#E5E7EB]"
                } ${activeStep === i ? "animate-node-pulse" : ""}`}
              >
                <step.icon
                  className={`h-7 w-7 transition-colors duration-300 ${
                    activeStep >= i ? "text-[#7C3AED]" : "text-[#6B7280]"
                  }`}
                />
                {activeStep === i && (
                  <div className="absolute inset-0 rounded-2xl bg-[#7C3AED]/10 animate-pulse-slow" />
                )}
              </div>

              {/* Label */}
              <p
                className={`mt-4 text-sm font-medium text-center transition-colors duration-300 ${
                  activeStep >= i ? "text-[#1A1A2E]" : "text-[#6B7280]"
                }`}
              >
                {step.label}
              </p>

              {/* Example text */}
              <p
                className={`mt-2 text-xs text-center text-[#6B7280] max-w-[140px] h-12 transition-opacity duration-300 ${
                  activeStep === i ? "opacity-100" : "opacity-50"
                }`}
              >
                {step.example}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Flow diagram - Mobile */}
      <div className="lg:hidden space-y-4">
        {flowSteps.map((step, i) => (
          <div
            key={step.id}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${
              activeStep >= i
                ? "border-[#7C3AED] bg-[#7C3AED]/5"
                : "border-[#E5E7EB] bg-white"
            } ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-4"
            }`}
            style={{ transitionDelay: `${i * 150}ms` }}
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                activeStep >= i ? "bg-[#7C3AED]/10" : "bg-[#FAFAFA]"
              }`}
            >
              <step.icon
                className={`h-6 w-6 ${
                  activeStep >= i ? "text-[#7C3AED]" : "text-[#6B7280]"
                }`}
              />
            </div>
            <div>
              <p
                className={`font-medium ${
                  activeStep >= i ? "text-[#1A1A2E]" : "text-[#6B7280]"
                }`}
              >
                {step.label}
              </p>
              <p className="text-xs text-[#6B7280] mt-0.5">{step.example}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Match percentage result */}
      {activeStep === flowSteps.length - 1 && (
        <div className="mt-10 p-6 bg-[#F8F6F4] rounded-2xl border border-[#E5E7EB] animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-[#4A4A5A]">
              Semantic Match Score
            </span>
            <span className="text-2xl font-bold text-[#7C3AED]">
              {matchPercent}%
            </span>
          </div>
          <div className="match-bar">
            <div
              className="match-bar-fill"
              style={{ width: `${matchPercent}%` }}
            />
          </div>
          <p className="mt-4 text-sm text-[#6B7280]">
            High correlation with validated human responses
          </p>
        </div>
      )}
    </div>
  );
}
