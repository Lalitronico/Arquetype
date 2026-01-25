"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  FileText,
  Users,
  Play,
  BarChart3,
  ArrowRight,
  Check,
} from "lucide-react";

interface OnboardingDialogProps {
  open: boolean;
  onComplete: () => void;
}

const steps = [
  {
    title: "Welcome to Syntheia",
    description:
      "Get instant market research insights using AI-powered synthetic respondents. Let's walk through how it works.",
    icon: Sparkles,
    content: (
      <div className="space-y-4 text-center py-4">
        <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-emerald-100">
          <Sparkles className="h-10 w-10 text-blue-600" />
        </div>
        <div className="text-lg font-medium">Real insights. Synthetic speed.</div>
        <p className="text-gray-600">
          Syntheia uses our proprietary SSR (Semantic Similarity Rating)
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
      <div className="space-y-4 py-4">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium">Question Types Supported</div>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Likert scales (1-5 agreement)
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                NPS (Net Promoter Score, 0-10)
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Multiple choice questions
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Open-ended text responses
              </li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Configure Your Panel",
    description: "Define the demographics of your synthetic respondents.",
    icon: Users,
    content: (
      <div className="space-y-4 py-4">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
            <Users className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <div className="font-medium">Persona Presets</div>
            <p className="mt-1 text-sm text-gray-600">
              Choose from pre-built audience segments or create custom panels:
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
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
                  className="text-xs px-3 py-2 bg-gray-100 rounded-md text-gray-700"
                >
                  {preset}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Run Your Study",
    description: "Execute the simulation and get results in minutes.",
    icon: Play,
    content: (
      <div className="space-y-4 py-4">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100">
            <Play className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <div className="font-medium">How SSR Works</div>
            <ol className="mt-2 space-y-2 text-sm text-gray-600">
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                  1
                </span>
                AI personas generate natural text responses
              </li>
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                  2
                </span>
                Responses mapped to scale anchors via embeddings
              </li>
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                  3
                </span>
                Realistic distributions matching human patterns
              </li>
            </ol>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Analyze Results",
    description: "Get quantitative ratings AND qualitative explanations.",
    icon: BarChart3,
    content: (
      <div className="space-y-4 py-4">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100">
            <BarChart3 className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <div className="font-medium">What You&apos;ll Get</div>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Distribution charts and statistics
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                NPS scores and segment breakdown
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Qualitative explanations from each persona
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Export to CSV or JSON for further analysis
              </li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
];

export function OnboardingDialog({ open, onComplete }: OnboardingDialogProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
      router.push("/dashboard/studies/new");
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleSkip()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle>{step.title}</DialogTitle>
              <DialogDescription>{step.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2">{step.content}</div>

        <div className="space-y-4">
          <Progress value={progress} className="h-2" />

          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={handleSkip}>
              Skip Tour
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {currentStep + 1} of {steps.length}
              </span>
              <Button variant="gradient" onClick={handleNext}>
                {isLastStep ? (
                  <>
                    Create Your First Study
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
