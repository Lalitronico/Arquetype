"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Users,
  Play,
  BarChart3,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";

function BrandDot({ className }: { className?: string }) {
  return <div className={`rounded-full bg-current ${className ?? ""}`} />;
}

interface OnboardingDialogProps {
  open: boolean;
  onComplete: () => void;
}

const stepThemes = [
  {
    gradient: "from-[#7C3AED]/10 via-[#8B5CF6]/5 to-transparent",
    iconBg: "bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6]",
    iconColor: "text-white",
    accent: "bg-[#7C3AED]",
  },
  {
    gradient: "from-blue-500/10 via-blue-400/5 to-transparent",
    iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
    iconColor: "text-white",
    accent: "bg-blue-500",
  },
  {
    gradient: "from-emerald-500/10 via-emerald-400/5 to-transparent",
    iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    iconColor: "text-white",
    accent: "bg-emerald-500",
  },
  {
    gradient: "from-violet-500/10 via-violet-400/5 to-transparent",
    iconBg: "bg-gradient-to-br from-violet-500 to-violet-600",
    iconColor: "text-white",
    accent: "bg-violet-500",
  },
  {
    gradient: "from-orange-500/10 via-orange-400/5 to-transparent",
    iconBg: "bg-gradient-to-br from-orange-500 to-orange-600",
    iconColor: "text-white",
    accent: "bg-orange-500",
  },
];

const steps = [
  {
    title: "Welcome to Arquetype",
    description:
      "Get instant market research insights using AI-powered synthetic respondents.",
    icon: BrandDot,
    content: (
      <div className="space-y-3 text-center">
        <div className="text-lg font-semibold text-gray-900">
          Real insights. Synthetic speed.
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          Arquetype uses our proprietary SSR (Semantic Similarity Rating)
          methodology to generate statistically valid survey responses that
          match human patterns.
        </p>
      </div>
    ),
  },
  {
    title: "Create Your Survey",
    description: "Design your research questions using our intuitive editor.",
    icon: FileText,
    content: (
      <div className="space-y-3">
        <div className="font-semibold text-gray-900">
          Question Types Supported
        </div>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center gap-2.5">
            <Check className="h-4 w-4 text-emerald-500 shrink-0" />
            Likert scales (1-5 agreement)
          </li>
          <li className="flex items-center gap-2.5">
            <Check className="h-4 w-4 text-emerald-500 shrink-0" />
            NPS (Net Promoter Score, 0-10)
          </li>
          <li className="flex items-center gap-2.5">
            <Check className="h-4 w-4 text-emerald-500 shrink-0" />
            Multiple choice questions
          </li>
          <li className="flex items-center gap-2.5">
            <Check className="h-4 w-4 text-emerald-500 shrink-0" />
            Open-ended text responses
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "Configure Your Panel",
    description: "Define the demographics of your synthetic respondents.",
    icon: Users,
    content: (
      <div className="space-y-3">
        <div className="font-semibold text-gray-900">Persona Presets</div>
        <p className="text-sm text-gray-600">
          Choose from pre-built audience segments or create custom panels:
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            "General Population",
            "Millennials",
            "Gen Z",
            "High Income",
            "Tech Workers",
            "Health Conscious",
          ].map((preset) => (
            <div
              key={preset}
              className="text-xs px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-gray-700 font-medium"
            >
              {preset}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: "Run Your Study",
    description: "Execute the simulation and get results in minutes.",
    icon: Play,
    content: (
      <div className="space-y-3">
        <div className="font-semibold text-gray-900">How SSR Works</div>
        <ol className="space-y-3 text-sm text-gray-600">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-600">
              1
            </span>
            AI personas generate natural text responses
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-600">
              2
            </span>
            Responses mapped to scale anchors via embeddings
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-600">
              3
            </span>
            Realistic distributions matching human patterns
          </li>
        </ol>
      </div>
    ),
  },
  {
    title: "Analyze Results",
    description: "Get quantitative ratings AND qualitative explanations.",
    icon: BarChart3,
    content: (
      <div className="space-y-3">
        <div className="font-semibold text-gray-900">
          What You&apos;ll Get
        </div>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center gap-2.5">
            <Check className="h-4 w-4 text-emerald-500 shrink-0" />
            Distribution charts and statistics
          </li>
          <li className="flex items-center gap-2.5">
            <Check className="h-4 w-4 text-emerald-500 shrink-0" />
            NPS scores and segment breakdown
          </li>
          <li className="flex items-center gap-2.5">
            <Check className="h-4 w-4 text-emerald-500 shrink-0" />
            Qualitative explanations from each persona
          </li>
          <li className="flex items-center gap-2.5">
            <Check className="h-4 w-4 text-emerald-500 shrink-0" />
            Export to CSV or JSON for further analysis
          </li>
        </ul>
      </div>
    ),
  },
];

export function OnboardingDialog({ open, onComplete }: OnboardingDialogProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [isAnimating, setIsAnimating] = useState(false);

  const isLastStep = currentStep === steps.length - 1;

  const handleNext = useCallback(() => {
    if (isAnimating) return;
    if (isLastStep) {
      onComplete();
      router.push("/dashboard/studies/new");
    } else {
      setDirection("forward");
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setIsAnimating(false);
      }, 200);
    }
  }, [isAnimating, isLastStep, onComplete, router]);

  const handleBack = useCallback(() => {
    if (isAnimating || currentStep === 0) return;
    setDirection("back");
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep((prev) => prev - 1);
      setIsAnimating(false);
    }, 200);
  }, [isAnimating, currentStep]);

  const handleDotClick = useCallback(
    (index: number) => {
      if (isAnimating || index === currentStep) return;
      setDirection(index > currentStep ? "forward" : "back");
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(index);
        setIsAnimating(false);
      }, 200);
    },
    [isAnimating, currentStep]
  );

  const handleSkip = () => {
    onComplete();
  };

  const step = steps[currentStep];
  const theme = stepThemes[currentStep];
  const Icon = step.icon;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleSkip()}>
      <DialogContent className="sm:max-w-[540px] p-0 gap-0 rounded-2xl border border-gray-200/80 shadow-2xl overflow-hidden">
        {/* Hero area with gradient background */}
        <div
          className={`relative bg-gradient-to-b ${theme.gradient} px-8 pt-8 pb-6`}
        >
          <DialogHeader className="items-center text-center space-y-4">
            {/* Large icon */}
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl ${theme.iconBg} shadow-lg`}
              style={{
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
            >
              <Icon className={`h-7 w-7 ${theme.iconColor}`} />
            </div>
            <div className="space-y-1.5">
              <DialogTitle className="text-xl font-bold text-gray-900">
                {step.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 max-w-[380px] mx-auto">
                {step.description}
              </DialogDescription>
            </div>
          </DialogHeader>
        </div>

        {/* Step content with transition */}
        <div className="px-8 py-6 min-h-[200px]">
          <div
            key={currentStep}
            className="transition-all duration-200 ease-out"
            style={{
              opacity: isAnimating ? 0 : 1,
              transform: isAnimating
                ? direction === "forward"
                  ? "translateX(24px)"
                  : "translateX(-24px)"
                : "translateX(0)",
            }}
          >
            {step.content}
          </div>
        </div>

        {/* Footer with dots and navigation */}
        <div className="px-8 pb-6 pt-2">
          <div className="flex items-center justify-between">
            {/* Left: Back button or Skip link */}
            <div className="w-[100px]">
              {currentStep > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="text-gray-400 hover:text-gray-600 gap-1 px-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              ) : (
                <button
                  onClick={handleSkip}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Skip Tour
                </button>
              )}
            </div>

            {/* Center: Dot indicators */}
            <div className="flex items-center gap-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className="group relative p-1"
                  aria-label={`Go to step ${index + 1}`}
                >
                  <div
                    className={`rounded-full transition-all duration-300 ${
                      index === currentStep
                        ? `w-2.5 h-2.5 ${theme.accent} shadow-md`
                        : index < currentStep
                          ? "w-2 h-2 bg-[#7C3AED]/40"
                          : "w-2 h-2 bg-gray-200 group-hover:bg-gray-300"
                    }`}
                  />
                  {index === currentStep && (
                    <div
                      className={`absolute inset-0 m-auto w-4 h-4 rounded-full ${theme.accent} opacity-20 animate-ping`}
                      style={{ animationDuration: "2s" }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Right: Next / Get Started button */}
            <div className="w-[100px] flex justify-end">
              <Button
                variant="gradient"
                size="sm"
                onClick={handleNext}
                className="gap-1.5"
              >
                {isLastStep ? "Get Started" : "Next"}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
