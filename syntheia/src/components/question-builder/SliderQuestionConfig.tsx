"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface SliderConfig {
  min: number;
  max: number;
  step: number;
  leftLabel: string;
  rightLabel: string;
}

interface SliderQuestionConfigProps {
  value: SliderConfig;
  onChange: (config: SliderConfig) => void;
}

// Common slider presets
const SLIDER_PRESETS = [
  { label: "Percentage (0-100)", min: 0, max: 100, step: 1, leftLabel: "0%", rightLabel: "100%" },
  { label: "Likelihood (0-10)", min: 0, max: 10, step: 1, leftLabel: "Not at all likely", rightLabel: "Extremely likely" },
  { label: "Agreement (-5 to +5)", min: -5, max: 5, step: 1, leftLabel: "Strongly Disagree", rightLabel: "Strongly Agree" },
  { label: "Satisfaction (1-100)", min: 1, max: 100, step: 1, leftLabel: "Very Dissatisfied", rightLabel: "Very Satisfied" },
];

export function SliderQuestionConfig({ value, onChange }: SliderQuestionConfigProps) {
  const [previewValue, setPreviewValue] = useState(Math.round((value.min + value.max) / 2));

  const handlePresetChange = (presetIndex: number) => {
    if (presetIndex >= 0 && presetIndex < SLIDER_PRESETS.length) {
      const preset = SLIDER_PRESETS[presetIndex];
      onChange({
        min: preset.min,
        max: preset.max,
        step: preset.step,
        leftLabel: preset.leftLabel,
        rightLabel: preset.rightLabel,
      });
      setPreviewValue(Math.round((preset.min + preset.max) / 2));
    }
  };

  const handleMinMaxChange = (field: "min" | "max", val: number) => {
    onChange({ ...value, [field]: val });
    // Adjust preview if out of bounds
    if (field === "min" && previewValue < val) {
      setPreviewValue(val);
    } else if (field === "max" && previewValue > val) {
      setPreviewValue(val);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-purple-50/30">
      <div className="text-sm font-medium text-purple-700">Slider Question Configuration</div>

      {/* Presets */}
      <div className="space-y-2">
        <Label>Quick Presets</Label>
        <div className="flex flex-wrap gap-2">
          {SLIDER_PRESETS.map((preset, index) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handlePresetChange(index)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                value.min === preset.min && value.max === preset.max
                  ? "bg-purple-100 border-purple-300 text-purple-700"
                  : "bg-white border-gray-200 text-gray-600 hover:border-purple-200"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scale Range */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label>Minimum</Label>
          <Input
            type="number"
            value={value.min}
            onChange={(e) => handleMinMaxChange("min", parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label>Maximum</Label>
          <Input
            type="number"
            value={value.max}
            onChange={(e) => handleMinMaxChange("max", parseInt(e.target.value) || 100)}
          />
        </div>
        <div className="space-y-2">
          <Label>Step</Label>
          <Input
            type="number"
            value={value.step}
            onChange={(e) => onChange({ ...value, step: parseInt(e.target.value) || 1 })}
            min={1}
          />
        </div>
      </div>

      {/* Labels */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Left Label (Minimum)</Label>
          <Input
            placeholder="e.g., Not at all likely"
            value={value.leftLabel}
            onChange={(e) => onChange({ ...value, leftLabel: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Right Label (Maximum)</Label>
          <Input
            placeholder="e.g., Extremely likely"
            value={value.rightLabel}
            onChange={(e) => onChange({ ...value, rightLabel: e.target.value })}
          />
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <Label>Preview</Label>
        <div className="border rounded-lg p-4 bg-white">
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{value.leftLabel || `${value.min}`}</span>
              <span>{value.rightLabel || `${value.max}`}</span>
            </div>
            <Slider
              value={[previewValue]}
              min={value.min}
              max={value.max}
              step={value.step}
              onValueChange={(vals) => setPreviewValue(vals[0])}
              className="w-full"
            />
            <div className="text-center">
              <span className="inline-flex items-center justify-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-bold text-lg">
                {previewValue}
              </span>
            </div>

            {/* Scale markers */}
            <div className="flex justify-between text-xs text-gray-400">
              {[0, 25, 50, 75, 100].map((pct) => {
                const markerValue = Math.round(value.min + (value.max - value.min) * (pct / 100));
                return <span key={pct}>{markerValue}</span>;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SliderQuestionConfig;
