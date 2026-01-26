"use client";

import { useState, useEffect } from "react";
import { Calculator, HelpCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SampleSizeCalculatorProps {
  onCalculate: (size: number) => void;
  maxSampleSize?: number;
}

// Z-scores for confidence levels
const CONFIDENCE_LEVELS = [
  { value: "90", label: "90%", zScore: 1.645 },
  { value: "95", label: "95%", zScore: 1.96 },
  { value: "99", label: "99%", zScore: 2.576 },
];

export function SampleSizeCalculator({
  onCalculate,
  maxSampleSize = 1000,
}: SampleSizeCalculatorProps) {
  const [confidenceLevel, setConfidenceLevel] = useState("95");
  const [marginOfError, setMarginOfError] = useState(5);
  const [populationSize, setPopulationSize] = useState<string>("");
  const [calculatedSize, setCalculatedSize] = useState<number | null>(null);

  // Calculate sample size when parameters change
  useEffect(() => {
    calculateSampleSize();
  }, [confidenceLevel, marginOfError, populationSize]);

  const calculateSampleSize = () => {
    const confidence = CONFIDENCE_LEVELS.find((c) => c.value === confidenceLevel);
    if (!confidence) return;

    const z = confidence.zScore;
    const p = 0.5; // Maximum variability (50%)
    const e = marginOfError / 100;

    // Basic sample size formula: n = (Z² × p × (1-p)) / E²
    let n = (z * z * p * (1 - p)) / (e * e);

    // Apply finite population correction if population size is provided
    const popSize = parseInt(populationSize);
    if (popSize && popSize > 0) {
      n = n / (1 + (n - 1) / popSize);
    }

    // Round up and cap at max
    const finalSize = Math.min(Math.ceil(n), maxSampleSize);
    setCalculatedSize(finalSize);
  };

  const handleApply = () => {
    if (calculatedSize) {
      onCalculate(calculatedSize);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Calculator className="h-4 w-4 text-blue-600" />
        Sample Size Calculator
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Confidence Level */}
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Label className="text-sm">Confidence Level</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>How confident you want to be that your results reflect the true population. 95% is standard for most research.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select value={confidenceLevel} onValueChange={setConfidenceLevel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONFIDENCE_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Margin of Error */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Label className="text-sm">Margin of Error</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>The range within which the true value lies. Lower margin = more precision but requires larger sample. 5% is common.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-sm font-medium text-blue-600">±{marginOfError}%</span>
          </div>
          <Slider
            value={[marginOfError]}
            onValueChange={(v) => setMarginOfError(v[0])}
            min={1}
            max={10}
            step={1}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>1% (precise)</span>
            <span>10% (rough)</span>
          </div>
        </div>

        {/* Population Size (Optional) */}
        <div className="space-y-2 sm:col-span-2">
          <div className="flex items-center gap-1">
            <Label className="text-sm">Population Size (optional)</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>The total number of people in your target market. Leave blank for large/unknown populations (assumes infinite).</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            type="number"
            placeholder="e.g., 10000 (leave blank for unknown)"
            value={populationSize}
            onChange={(e) => setPopulationSize(e.target.value)}
            min={1}
          />
        </div>
      </div>

      {/* Result */}
      {calculatedSize && (
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div>
            <div className="text-sm text-gray-600">Recommended sample size:</div>
            <div className="text-2xl font-bold text-blue-600">
              {calculatedSize.toLocaleString()}
              <span className="text-sm font-normal text-gray-500 ml-1">respondents</span>
            </div>
          </div>
          <Button onClick={handleApply} className="gap-2">
            Apply
          </Button>
        </div>
      )}

      {/* Info note */}
      <div className="flex items-start gap-2 text-xs text-gray-500">
        <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
        <p>
          Calculation uses standard statistical formula assuming maximum variability (p=0.5).
          For synthetic panels, smaller samples (50-100) often suffice for directional insights.
        </p>
      </div>
    </div>
  );
}
