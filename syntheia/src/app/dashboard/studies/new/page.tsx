"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  GripVertical,
  Play,
  Save,
  Loader2,
  AlertCircle,
  FileText,
  TrendingUp,
  Smile,
  Package,
  BarChart2,
  Award,
  Lightbulb,
  DollarSign,
  MousePointer,
  Sparkles,
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { surveyTemplates, templateCategories, type SurveyTemplate } from "@/lib/survey-templates";
import { PersonaBuilder } from "@/components/persona-builder";
import { PersonaConfig, PERSONA_PRESETS } from "@/lib/persona-generator";
import {
  MatrixQuestionConfig,
  SliderQuestionConfig,
  ConditionalLogicConfig,
} from "@/components/question-builder";

// Question condition for conditional logic
interface QuestionCondition {
  questionId: string;
  operator: "equals" | "notEquals" | "greaterThan" | "lessThan" | "contains";
  value: string | number;
}

interface Question {
  id: string;
  type: "likert" | "nps" | "multiple_choice" | "open_ended" | "rating" | "open" | "matrix" | "slider";
  text: string;
  options?: string[];
  required: boolean;
  scale?: { min: number; max: number; labels?: { min: string; max: string } };
  // Matrix question fields
  items?: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: string[];
  // Slider question fields
  min?: number;
  max?: number;
  step?: number;
  leftLabel?: string;
  rightLabel?: string;
  // Conditional logic
  showIf?: QuestionCondition;
}

const QUESTION_TYPES = [
  { value: "likert", label: "Likert Scale (1-5)", description: "Agreement scale" },
  { value: "nps", label: "NPS (0-10)", description: "Net Promoter Score" },
  { value: "multiple_choice", label: "Multiple Choice", description: "Select one option" },
  { value: "open_ended", label: "Open Ended", description: "Free text response" },
  { value: "matrix", label: "Matrix", description: "Rate multiple items" },
  { value: "slider", label: "Slider (0-100)", description: "Continuous scale" },
];

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Retail",
  "Education",
  "Entertainment",
  "Food & Beverage",
  "Automotive",
  "Travel & Hospitality",
  "Real Estate",
  "Manufacturing",
  "Professional Services",
  "Non-profit",
  "Other",
];

const PRODUCT_CATEGORIES = [
  "SaaS / Software",
  "Mobile App",
  "Consumer Electronics",
  "E-commerce",
  "Subscription Service",
  "Physical Product",
  "Professional Service",
  "Content / Media",
  "Marketplace",
  "Financial Product",
  "Health & Wellness",
  "Other",
];

// Icon mapping for templates
const iconMap: Record<string, React.ElementType> = {
  TrendingUp,
  Smile,
  Package,
  BarChart2,
  Award,
  Lightbulb,
  DollarSign,
  MousePointer,
};

export default function NewStudyPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // Start at 0 for template selection
  const [selectedTemplate, setSelectedTemplate] = useState<SurveyTemplate | null>(null);
  const [studyName, setStudyName] = useState("");
  const [studyDescription, setStudyDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    { id: crypto.randomUUID(), type: "likert", text: "", required: true },
  ]);
  const [panelConfig, setPanelConfig] = useState<PersonaConfig>(() => ({
    ...PERSONA_PRESETS.generalPopulation,
    count: 100,
  }));
  const [sampleSize, setSampleSize] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Product/Service context fields
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [customContextInstructions, setCustomContextInstructions] = useState("");

  const applyTemplate = (template: SurveyTemplate) => {
    setSelectedTemplate(template);
    setStudyName(template.name);
    setStudyDescription(template.description);
    setQuestions(template.questions.map(q => ({
      id: q.id,
      type: q.type === "rating" ? "likert" : q.type === "open" ? "open_ended" : q.type,
      text: q.text,
      options: q.options,
      required: q.required,
      scale: q.scale,
    })));
    setSampleSize(template.suggestedSampleSize);
    setStep(1);
  };

  const startFromScratch = () => {
    setSelectedTemplate(null);
    setStudyName("");
    setStudyDescription("");
    setQuestions([{ id: crypto.randomUUID(), type: "likert", text: "", required: true }]);
    setSampleSize(100);
    setStep(1);
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
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

  const handleSaveDraft = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const validQuestions = questions.filter((q) => q.text.trim());

      const response = await fetch("/api/studies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: studyName,
          description: studyDescription,
          questions: validQuestions,
          panelConfig: {
            ...panelConfig,
            count: sampleSize,
          },
          sampleSize,
          // Product/Service context
          productName: productName || undefined,
          productDescription: productDescription || undefined,
          brandName: brandName || undefined,
          industry: industry || panelConfig.context?.industry || undefined,
          productCategory: productCategory || undefined,
          customContextInstructions: customContextInstructions || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save study");
      }

      router.push("/dashboard/studies");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunStudy = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const validQuestions = questions.filter((q) => q.text.trim());

      // First create the study
      const createResponse = await fetch("/api/studies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: studyName,
          description: studyDescription,
          questions: validQuestions,
          panelConfig: {
            ...panelConfig,
            count: sampleSize,
          },
          sampleSize,
          // Product/Service context
          productName: productName || undefined,
          productDescription: productDescription || undefined,
          brandName: brandName || undefined,
          industry: industry || panelConfig.context?.industry || undefined,
          productCategory: productCategory || undefined,
          customContextInstructions: customContextInstructions || undefined,
        }),
      });

      const createData = await createResponse.json();

      if (!createResponse.ok) {
        throw new Error(createData.error || "Failed to create study");
      }

      const studyId = createData.data.id;

      // Start the simulation (don't await - let it run in background)
      fetch(`/api/studies/${studyId}/run`, {
        method: "POST",
      }).catch(console.error);

      // Redirect to running page immediately to show progress
      router.push(`/dashboard/studies/${studyId}/running`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  const totalSteps = 4;
  const progress = (step / (totalSteps - 1)) * 100;

  const filteredTemplates = selectedCategory
    ? surveyTemplates.filter((t) => t.category === selectedCategory)
    : surveyTemplates;

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

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3 text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Progress */}
      {step > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Step {step} of {totalSteps - 1}
            </span>
            <span className="text-sm text-gray-500">
              {step === 1 && "Study Details"}
              {step === 2 && "Survey Questions"}
              {step === 3 && "Panel Configuration"}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Step 0: Template Selection */}
      {step === 0 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Create New Study</h1>
            <p className="text-gray-600 mt-2">
              Start with a template or create from scratch
            </p>
          </div>

          {/* Start from Scratch Option */}
          <Card
            className="border-2 border-dashed hover:border-blue-300 cursor-pointer transition-colors"
            onClick={startFromScratch}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                <Sparkles className="h-6 w-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Start from Scratch</h3>
                <p className="text-sm text-gray-500">Create a custom study with your own questions</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </CardContent>
          </Card>

          {/* Category Filter */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Or choose a template</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              {templateCategories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {filteredTemplates.map((template) => {
              const IconComponent = iconMap[template.icon] || FileText;
              return (
                <Card
                  key={template.id}
                  className="hover:border-blue-300 cursor-pointer transition-colors"
                  onClick={() => applyTemplate(template)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                        <IconComponent className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {templateCategories.find((c) => c.id === template.category)?.name}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-500 mb-3">{template.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>{template.questions.length} questions</span>
                      <span>{template.suggestedSampleSize} suggested respondents</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 1: Study Details */}
      {step === 1 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedTemplate ? `Customize: ${selectedTemplate.name}` : "Study Details"}
              </CardTitle>
              <CardDescription>
                {selectedTemplate
                  ? "Customize the template to fit your needs"
                  : "Start by giving your study a name and description"}
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
            </CardContent>
          </Card>

          {/* Product/Service Context Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product/Service Context
              </CardTitle>
              <CardDescription>
                Help synthetic personas understand what they&apos;re evaluating for more relevant responses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product/Service Name</Label>
                  <Input
                    id="productName"
                    placeholder="e.g., Acme Analytics Pro"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brandName">Brand Name</Label>
                  <Input
                    id="brandName"
                    placeholder="e.g., Acme Inc."
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((ind) => (
                        <SelectItem key={ind} value={ind}>
                          {ind}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productCategory">Product Category</Label>
                  <Select value={productCategory} onValueChange={setProductCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="productDescription">Product/Service Description</Label>
                <Textarea
                  id="productDescription"
                  placeholder="Describe your product or service. What does it do? Who is it for? What problem does it solve?"
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customContext">Custom Context Instructions (optional)</Label>
                <Textarea
                  id="customContext"
                  placeholder="Any additional context or instructions for how personas should approach your survey. e.g., 'Assume respondents have used the product for at least 3 months'"
                  value={customContextInstructions}
                  onChange={(e) => setCustomContextInstructions(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  These instructions will be included in the persona prompt to guide responses.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(0)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Templates
            </Button>
            <Button
              variant="gradient"
              onClick={() => setStep(2)}
              disabled={!studyName.trim()}
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Questions */}
      {step === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Survey Questions</CardTitle>
              <CardDescription>
                {selectedTemplate
                  ? "Review and customize the template questions"
                  : "Add the questions you want synthetic respondents to answer"}
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

                    {/* Matrix Question Configuration */}
                    {question.type === "matrix" && (
                      <MatrixQuestionConfig
                        value={{
                          items: question.items || [],
                          scaleMin: question.scaleMin || 1,
                          scaleMax: question.scaleMax || 5,
                          scaleLabels: question.scaleLabels || ["Very Poor", "Poor", "Average", "Good", "Excellent"],
                        }}
                        onChange={(config) =>
                          updateQuestion(question.id, {
                            items: config.items,
                            scaleMin: config.scaleMin,
                            scaleMax: config.scaleMax,
                            scaleLabels: config.scaleLabels,
                          })
                        }
                      />
                    )}

                    {/* Slider Question Configuration */}
                    {question.type === "slider" && (
                      <SliderQuestionConfig
                        value={{
                          min: question.min ?? 0,
                          max: question.max ?? 100,
                          step: question.step ?? 1,
                          leftLabel: question.leftLabel || "Not at all likely",
                          rightLabel: question.rightLabel || "Extremely likely",
                        }}
                        onChange={(config) =>
                          updateQuestion(question.id, {
                            min: config.min,
                            max: config.max,
                            step: config.step,
                            leftLabel: config.leftLabel,
                            rightLabel: config.rightLabel,
                          })
                        }
                      />
                    )}

                    {/* Conditional Logic Configuration */}
                    {index > 0 && (
                      <ConditionalLogicConfig
                        condition={question.showIf}
                        onChange={(condition) =>
                          updateQuestion(question.id, { showIf: condition })
                        }
                        availableQuestions={questions.slice(0, index)}
                        currentQuestionId={question.id}
                      />
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
          <div>
            <h2 className="text-2xl font-bold">Panel Configuration</h2>
            <p className="text-gray-600 mt-1">
              Define your synthetic panel demographics, psychographics, and sample size
            </p>
          </div>

          {/* PersonaBuilder Component */}
          <PersonaBuilder
            value={panelConfig}
            onChange={setPanelConfig}
            sampleSize={sampleSize}
            onSampleSizeChange={setSampleSize}
          />

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
                {selectedTemplate && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Template</dt>
                    <dd className="font-medium">{selectedTemplate.name}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-500">Questions</dt>
                  <dd className="font-medium">{questions.filter(q => q.text.trim()).length}</dd>
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
            <Button variant="outline" onClick={() => setStep(2)} disabled={isLoading}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleSaveDraft} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save as Draft
              </Button>
              <Button
                variant="gradient"
                onClick={handleRunStudy}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
