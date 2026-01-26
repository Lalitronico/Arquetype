"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface MatrixConfig {
  items: string[];
  scaleMin: number;
  scaleMax: number;
  scaleLabels: string[];
}

interface MatrixQuestionConfigProps {
  value: MatrixConfig;
  onChange: (config: MatrixConfig) => void;
}

const DEFAULT_SCALE_LABELS: Record<number, string[]> = {
  5: ["Very Poor", "Poor", "Average", "Good", "Excellent"],
  7: ["Strongly Disagree", "Disagree", "Somewhat Disagree", "Neutral", "Somewhat Agree", "Agree", "Strongly Agree"],
  10: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
};

export function MatrixQuestionConfig({ value, onChange }: MatrixQuestionConfigProps) {
  const [itemInput, setItemInput] = useState("");

  const handleAddItem = () => {
    if (itemInput.trim()) {
      onChange({
        ...value,
        items: [...value.items, itemInput.trim()],
      });
      setItemInput("");
    }
  };

  const handleRemoveItem = (index: number) => {
    onChange({
      ...value,
      items: value.items.filter((_, i) => i !== index),
    });
  };

  const handleItemsChange = (text: string) => {
    const items = text.split("\n").filter(Boolean);
    onChange({
      ...value,
      items,
    });
  };

  const handleScaleChange = (scaleMax: number) => {
    const defaultLabels = DEFAULT_SCALE_LABELS[scaleMax] || [];
    onChange({
      ...value,
      scaleMax,
      scaleLabels: defaultLabels,
    });
  };

  const handleLabelChange = (index: number, label: string) => {
    const newLabels = [...value.scaleLabels];
    newLabels[index] = label;
    onChange({
      ...value,
      scaleLabels: newLabels,
    });
  };

  // Generate scale labels array based on scale range
  const scalePoints = Array.from(
    { length: value.scaleMax - value.scaleMin + 1 },
    (_, i) => i + value.scaleMin
  );

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-blue-50/30">
      <div className="text-sm font-medium text-blue-700">Matrix Question Configuration</div>

      {/* Items to Rate */}
      <div className="space-y-2">
        <Label>Items to Rate (one per line)</Label>
        <Textarea
          placeholder="Price&#10;Quality&#10;Customer Service&#10;Delivery Speed"
          value={value.items.join("\n")}
          onChange={(e) => handleItemsChange(e.target.value)}
          rows={4}
          className="font-mono text-sm"
        />
        <p className="text-xs text-gray-500">
          Enter each item you want respondents to rate on a new line
        </p>
      </div>

      {/* Scale Configuration */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Scale Range</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={value.scaleMin}
              onChange={(e) => onChange({ ...value, scaleMin: parseInt(e.target.value) || 1 })}
              className="w-20"
              min={0}
              max={value.scaleMax - 1}
            />
            <span className="text-gray-500">to</span>
            <select
              value={value.scaleMax}
              onChange={(e) => handleScaleChange(parseInt(e.target.value))}
              className="h-10 rounded-md border border-gray-200 px-3"
            >
              <option value={5}>5</option>
              <option value={7}>7</option>
              <option value={10}>10</option>
            </select>
          </div>
        </div>
      </div>

      {/* Scale Labels */}
      <div className="space-y-2">
        <Label>Scale Labels (optional)</Label>
        <div className="grid gap-2">
          {scalePoints.map((point, index) => (
            <div key={point} className="flex items-center gap-2">
              <span className="w-8 text-center font-medium text-gray-500">{point}</span>
              <Input
                placeholder={`Label for ${point}`}
                value={value.scaleLabels[index] || ""}
                onChange={(e) => handleLabelChange(index, e.target.value)}
                className="flex-1"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      {value.items.length > 0 && (
        <div className="space-y-2">
          <Label>Preview</Label>
          <div className="border rounded-lg p-4 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left pb-2"></th>
                  {scalePoints.map((point, i) => (
                    <th key={point} className="text-center pb-2 px-2">
                      <div className="font-medium">{point}</div>
                      {value.scaleLabels[i] && (
                        <div className="text-xs font-normal text-gray-500 truncate max-w-16">
                          {value.scaleLabels[i]}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {value.items.slice(0, 4).map((item) => (
                  <tr key={item} className="border-t">
                    <td className="py-2 pr-4 font-medium">{item}</td>
                    {scalePoints.map((point) => (
                      <td key={point} className="text-center py-2">
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 mx-auto"></div>
                      </td>
                    ))}
                  </tr>
                ))}
                {value.items.length > 4 && (
                  <tr className="border-t">
                    <td colSpan={scalePoints.length + 1} className="py-2 text-center text-gray-500 text-xs">
                      + {value.items.length - 4} more items
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Default export for easier importing
export default MatrixQuestionConfig;
