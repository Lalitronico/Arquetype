"use client";

import { useState } from "react";
import { GitBranch, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QuestionCondition {
  questionId: string;
  operator: "equals" | "notEquals" | "greaterThan" | "lessThan" | "contains";
  value: string | number;
}

interface Question {
  id: string;
  type: string;
  text: string;
  options?: string[];
}

interface ConditionalLogicConfigProps {
  condition: QuestionCondition | undefined;
  onChange: (condition: QuestionCondition | undefined) => void;
  availableQuestions: Question[]; // Questions that appear before this one
  currentQuestionId: string;
}

const OPERATORS = [
  { value: "equals", label: "equals", description: "Exact match or contains text" },
  { value: "notEquals", label: "does not equal", description: "Does not match" },
  { value: "greaterThan", label: "is greater than", description: "Rating is higher" },
  { value: "lessThan", label: "is less than", description: "Rating is lower" },
  { value: "contains", label: "contains", description: "Response contains text" },
];

export function ConditionalLogicConfig({
  condition,
  onChange,
  availableQuestions,
  currentQuestionId,
}: ConditionalLogicConfigProps) {
  const [isEnabled, setIsEnabled] = useState(!!condition);

  const handleToggle = (checked: boolean) => {
    setIsEnabled(checked);
    if (!checked) {
      onChange(undefined);
    } else if (availableQuestions.length > 0) {
      // Set default condition
      onChange({
        questionId: availableQuestions[0].id,
        operator: "equals",
        value: "",
      });
    }
  };

  const handleQuestionChange = (questionId: string) => {
    const question = availableQuestions.find((q) => q.id === questionId);
    onChange({
      questionId,
      operator: condition?.operator || "equals",
      value: condition?.value || (question?.type === "multiple_choice" ? "1" : ""),
    });
  };

  const handleOperatorChange = (operator: QuestionCondition["operator"]) => {
    onChange({
      ...condition!,
      operator,
    });
  };

  const handleValueChange = (value: string | number) => {
    onChange({
      ...condition!,
      value,
    });
  };

  const selectedQuestion = condition
    ? availableQuestions.find((q) => q.id === condition.questionId)
    : null;

  // Determine what value input to show based on question type and operator
  const getValueInput = () => {
    if (!condition || !selectedQuestion) return null;

    // For multiple choice, show options dropdown
    if (selectedQuestion.type === "multiple_choice" && selectedQuestion.options) {
      return (
        <Select
          value={String(condition.value)}
          onValueChange={(val) => handleValueChange(val)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            {selectedQuestion.options.map((option, index) => (
              <SelectItem key={index} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // For numeric comparisons (greaterThan, lessThan), show number input
    if (condition.operator === "greaterThan" || condition.operator === "lessThan") {
      const maxValue = selectedQuestion.type === "nps" ? 10 : selectedQuestion.type === "slider" ? 100 : 5;
      return (
        <Input
          type="number"
          value={condition.value}
          onChange={(e) => handleValueChange(parseInt(e.target.value) || 0)}
          min={0}
          max={maxValue}
          className="w-24"
        />
      );
    }

    // For equals with rating questions
    if (
      (selectedQuestion.type === "likert" || selectedQuestion.type === "nps" || selectedQuestion.type === "rating") &&
      (condition.operator === "equals" || condition.operator === "notEquals")
    ) {
      const maxValue = selectedQuestion.type === "nps" ? 10 : 5;
      return (
        <Input
          type="number"
          value={condition.value}
          onChange={(e) => handleValueChange(parseInt(e.target.value) || 0)}
          min={selectedQuestion.type === "nps" ? 0 : 1}
          max={maxValue}
          className="w-24"
          placeholder={`1-${maxValue}`}
        />
      );
    }

    // For contains or text-based conditions
    return (
      <Input
        type="text"
        value={String(condition.value)}
        onChange={(e) => handleValueChange(e.target.value)}
        placeholder="Enter value..."
        className="w-full"
      />
    );
  };

  // Generate preview text
  const getPreviewText = () => {
    if (!condition || !selectedQuestion) return "";

    const questionIndex = availableQuestions.findIndex((q) => q.id === condition.questionId) + 1;
    const operatorLabel = OPERATORS.find((o) => o.value === condition.operator)?.label || condition.operator;

    let valueDisplay = condition.value;
    if (selectedQuestion.type === "multiple_choice" && selectedQuestion.options) {
      const optionIndex = selectedQuestion.options.indexOf(String(condition.value));
      if (optionIndex >= 0) {
        valueDisplay = `"${condition.value}"`;
      }
    }

    return `Show this question only if Q${questionIndex} ${operatorLabel} ${valueDisplay}`;
  };

  if (availableQuestions.length === 0) {
    return (
      <div className="p-3 border rounded-lg bg-gray-50 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4" />
          <span>Conditional logic is available after adding at least one question before this one.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-amber-50/30">
      {/* Toggle */}
      <div className="flex items-center gap-3">
        <Checkbox
          id="conditional-toggle"
          checked={isEnabled}
          onCheckedChange={handleToggle}
        />
        <Label
          htmlFor="conditional-toggle"
          className="flex items-center gap-2 cursor-pointer text-sm font-medium text-amber-700"
        >
          <GitBranch className="h-4 w-4" />
          Show this question only if...
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3.5 w-3.5 text-amber-500" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Use conditional logic to show this question only when a previous
                  question has a specific answer. Questions that don&apos;t meet the
                  condition will be skipped.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Label>
      </div>

      {/* Condition Configuration */}
      {isEnabled && condition && (
        <div className="space-y-3 pl-7">
          {/* Question Selection */}
          <div className="space-y-2">
            <Label className="text-xs">Reference Question</Label>
            <Select
              value={condition.questionId}
              onValueChange={handleQuestionChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a question" />
              </SelectTrigger>
              <SelectContent>
                {availableQuestions.map((q, i) => (
                  <SelectItem key={q.id} value={q.id}>
                    Q{i + 1}: {q.text.substring(0, 50)}
                    {q.text.length > 50 ? "..." : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Operator and Value */}
          <div className="flex items-end gap-2">
            <div className="space-y-2">
              <Label className="text-xs">Condition</Label>
              <Select
                value={condition.operator}
                onValueChange={(val) => handleOperatorChange(val as QuestionCondition["operator"])}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPERATORS.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-2">
              <Label className="text-xs">Value</Label>
              {getValueInput()}
            </div>
          </div>

          {/* Preview */}
          {condition.value !== "" && (
            <div className="p-2 bg-white rounded border border-amber-200 text-xs text-amber-800">
              {getPreviewText()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ConditionalLogicConfig;
