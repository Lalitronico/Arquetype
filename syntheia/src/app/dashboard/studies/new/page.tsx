"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  GripVertical,
  Users,
  Play,
  Save,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Question {
  id: string;
  type: "likert" | "nps" | "multiple_choice" | "open_ended";
  text: string;
  options?: string[];
  required: boolean;
}

const QUESTION_TYPES = [
  { value: "likert", label: "Likert Scale (1-5)", description: "Agreement scale" },
  { value: "nps", label: "NPS (0-10)", description: "Net Promoter Score" },
  { value: "multiple_choice", label: "Multiple Choice", description: "Select one option" },
  { value: "open_ended", label: "Open Ended", description: "Free text response" },
];

const PERSONA_PRESETS = [
  { value: "general", label: "General Population", description: "US adults 18-75" },
  { value: "millennials", label: "Millennials", description: "Ages 28-43" },
  { value: "genZ", label: "Gen Z", description: "Ages 18-27" },
  { value: "highIncome", label: "High Income", description: "$125K+ household income" },
  { value: "techWorkers", label: "Tech Workers", description: "Software & tech professionals" },
  { value: "parents", label: "Parents & Families", description: "Adults with children" },
  { value: "healthConscious", label: "Health Conscious", description: "Wellness-focused consumers" },
  { value: "ecoConscious", label: "Eco Conscious", description: "Sustainability-minded" },
];

const SAMPLE_SIZES = [
  { value: "50", label: "50 respondents", credits: 50, description: "Quick pulse check" },
  { value: "100", label: "100 respondents", credits: 100, description: "Standard study" },
  { value: "250", label: "250 respondents", credits: 250, description: "Detailed analysis" },
  { value: "500", label: "500 respondents", credits: 500, description: "Statistical significance" },
  { value: "1000", label: "1,000 respondents", credits: 1000, description: "Enterprise scale" },
];

export default function NewStudyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [studyName, setStudyName] = useState("");
  const [studyDescription, setStudyDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    { id: "1", type: "likert", text: "", required: true },
  ]);
  const [selectedPreset, setSelectedPreset] = useState("general");
  const [sampleSize, setSampleSize] = useState("100");
  const [isRunning, setIsRunning] = useState(false);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: "likert",
      text: "",
      required: true,
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id));
    }
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const handleRunStudy = async () => {
    setIsRunning(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    router.push("/dashboard/studies/1/results");
  };

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/studies">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Studies
          </Button>
        </Link>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Step {step} of {totalSteps}
          </span>
          <span className="text-sm text-gray-500">
            {step === 1 && "Study Details"}
            {step === 2 && "Survey Questions"}
            {step === 3 && "Panel Configuration"}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step 1: Study Details */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Study</CardTitle>
            <CardDescription>
              Start by giving your study a name and description
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Study Name</Label>
              <Input
                id="name"
                placeholder="e.g., Q1 Product Concept Test"
                value={studyName}
                onChange={(e) => setStudyName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe the purpose and goals of this study..."
                value={studyDescription}
                onChange={(e) => setStudyDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end">
              <Button
                variant="gradient"
                onClick={() => setStep(2)}
                disabled={!studyName.trim()}
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Questions */}
      {step === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Survey Questions</CardTitle>
              <CardDescription>
                Add the questions you want synthetic respondents to answer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="flex gap-4 p-4 border rounded-lg bg-gray-50"
                >
                  <div className="flex items-center text-gray-400">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary">Q{index + 1}</Badge>
                      <Select
                        value={question.type}
                        onValueChange={(value) =>
                          updateQuestion(question.id, {
                            type: value as Question["type"],
                          })
                        }
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {QUESTION_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div>
                                <div>{type.label}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {questions.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(question.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <Textarea
                      placeholder="Enter your question..."
                      value={question.text}
                      onChange={(e) =>
                        updateQuestion(question.id, { text: e.target.value })
                      }
                      rows={2}
                    />
                    {question.type === "multiple_choice" && (
                      <div className="space-y-2">
                        <Label>Options (one per line)</Label>
                        <Textarea
                          placeholder="Option 1&#10;Option 2&#10;Option 3"
                          value={question.options?.join("\n") || ""}
                          onChange={(e) =>
                            updateQuestion(question.id, {
                              options: e.target.value.split("\n").filter(Boolean),
                            })
                          }
                          rows={4}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={addQuestion}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              variant="gradient"
              onClick={() => setStep(3)}
              disabled={!questions.some((q) => q.text.trim())}
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Panel Configuration */}
      {step === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Panel Configuration</CardTitle>
              <CardDescription>
                Define your synthetic panel demographics and sample size
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Persona Preset</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {PERSONA_PRESETS.map((preset) => (
                    <div
                      key={preset.value}
                      onClick={() => setSelectedPreset(preset.value)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedPreset === preset.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{preset.label}</div>
                          <div className="text-sm text-gray-500">
                            {preset.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label>Sample Size</Label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {SAMPLE_SIZES.map((size) => (
                    <div
                      key={size.value}
                      onClick={() => setSampleSize(size.value)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        sampleSize === size.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="font-medium">{size.label}</div>
                      <div className="text-sm text-gray-500">
                        {size.description}
                      </div>
                      <div className="mt-2 text-sm font-medium text-blue-600">
                        {size.credits} credits
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Study Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Study Name</dt>
                  <dd className="font-medium">{studyName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Questions</dt>
                  <dd className="font-medium">{questions.filter(q => q.text.trim()).length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Panel</dt>
                  <dd className="font-medium">
                    {PERSONA_PRESETS.find((p) => p.value === selectedPreset)?.label}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Sample Size</dt>
                  <dd className="font-medium">{sampleSize} respondents</dd>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <dt className="text-gray-900 font-medium">Credits Required</dt>
                  <dd className="font-bold text-blue-600">{sampleSize}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex gap-3">
              <Button variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
              <Button
                variant="gradient"
                onClick={handleRunStudy}
                disabled={isRunning}
              >
                {isRunning ? (
                  <>
                    <span className="animate-spin mr-2">...</span>
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Study
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
