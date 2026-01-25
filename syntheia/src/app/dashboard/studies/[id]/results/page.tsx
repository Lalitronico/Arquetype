"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Share2,
  Filter,
  Users,
  MessageSquare,
  BarChart3,
  PieChart,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for demonstration
const studyData = {
  name: "Q1 Product Concept Test",
  status: "completed",
  respondents: 500,
  completedAt: "2025-01-20",
  avgConfidence: 87,
  questions: [
    {
      id: "1",
      text: "How likely are you to purchase this product?",
      type: "likert",
      distribution: [5, 12, 23, 35, 25],
      mean: 3.63,
      median: 4,
      stdDev: 1.12,
    },
    {
      id: "2",
      text: "How would you rate the packaging design?",
      type: "likert",
      distribution: [3, 8, 20, 42, 27],
      mean: 3.82,
      median: 4,
      stdDev: 1.01,
    },
    {
      id: "3",
      text: "How likely are you to recommend this to a friend?",
      type: "nps",
      distribution: [2, 1, 2, 3, 5, 8, 12, 18, 22, 15, 12],
      npsScore: 32,
      promoters: 49,
      passives: 32,
      detractors: 19,
    },
  ],
  insights: [
    {
      type: "positive",
      text: "Strong purchase intent among eco-conscious consumers (mean 4.2 vs 3.4 general)",
    },
    {
      type: "positive",
      text: "Packaging design rated highly across all demographics",
    },
    {
      type: "neutral",
      text: "Price sensitivity moderate - consider tiered pricing strategy",
    },
    {
      type: "negative",
      text: "Lower interest in 55+ age group - may need targeted messaging",
    },
  ],
  sampleResponses: [
    {
      personaAge: 32,
      personaGender: "female",
      personaLocation: "San Francisco, CA",
      questionId: "1",
      rating: 4,
      explanation:
        "As someone who prioritizes sustainability in my purchasing decisions, this product really appeals to me. The eco-friendly packaging is exactly what I look for, and the price point seems reasonable for the quality offered.",
    },
    {
      personaAge: 45,
      personaGender: "male",
      personaLocation: "Chicago, IL",
      questionId: "1",
      rating: 3,
      explanation:
        "The product looks interesting, but I'm not sure it offers enough differentiation from what I currently use. I'd need to see more concrete benefits or a compelling price advantage to make the switch.",
    },
    {
      personaAge: 28,
      personaGender: "non-binary",
      personaLocation: "Austin, TX",
      questionId: "1",
      rating: 5,
      explanation:
        "This is exactly what I've been looking for! The combination of quality ingredients and sustainable packaging is perfect. I would definitely purchase this and recommend it to friends.",
    },
  ],
};

export default function StudyResultsPage() {
  const [selectedQuestion, setSelectedQuestion] = useState(studyData.questions[0].id);

  const currentQuestion = studyData.questions.find(
    (q) => q.id === selectedQuestion
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/studies">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">
                {studyData.name}
              </h2>
              <Badge className="bg-green-100 text-green-700">Completed</Badge>
            </div>
            <p className="text-gray-600">
              {studyData.respondents} respondents | Completed{" "}
              {studyData.completedAt}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{studyData.respondents}</div>
                <div className="text-sm text-gray-500">Total Respondents</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{studyData.avgConfidence}%</div>
                <div className="text-sm text-gray-500">Avg. Confidence</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {studyData.questions.length}
                </div>
                <div className="text-sm text-gray-500">Questions</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                <MessageSquare className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {studyData.respondents * studyData.questions.length}
                </div>
                <div className="text-sm text-gray-500">Total Responses</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="questions">By Question</TabsTrigger>
          <TabsTrigger value="responses">Sample Responses</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {studyData.questions.map((question, index) => (
              <Card key={question.id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    Q{index + 1}: {question.text}
                  </CardTitle>
                  <CardDescription>
                    {question.type === "nps" ? "Net Promoter Score" : "5-point Likert Scale"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {question.type === "likert" && (
                    <div className="space-y-4">
                      {/* Distribution bars */}
                      <div className="space-y-2">
                        {question.distribution.map((pct, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="w-20 text-sm text-gray-500">
                              {i + 1} -{" "}
                              {
                                ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"][i]
                              }
                            </span>
                            <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-12 text-sm font-medium text-right">
                              {pct}%
                            </span>
                          </div>
                        ))}
                      </div>
                      {/* Stats */}
                      <div className="flex gap-6 pt-4 border-t">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {question.mean}
                          </div>
                          <div className="text-xs text-gray-500">Mean</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {question.median}
                          </div>
                          <div className="text-xs text-gray-500">Median</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {question.stdDev}
                          </div>
                          <div className="text-xs text-gray-500">Std Dev</div>
                        </div>
                      </div>
                    </div>
                  )}
                  {question.type === "nps" && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-blue-600">
                          {question.npsScore}
                        </div>
                        <div className="text-sm text-gray-500">NPS Score</div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-xl font-bold text-green-600">
                            {question.promoters}%
                          </div>
                          <div className="text-xs text-gray-500">Promoters</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-yellow-600">
                            {question.passives}%
                          </div>
                          <div className="text-xs text-gray-500">Passives</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-red-600">
                            {question.detractors}%
                          </div>
                          <div className="text-xs text-gray-500">Detractors</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Question Analysis</CardTitle>
                <Select
                  value={selectedQuestion}
                  onValueChange={setSelectedQuestion}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {studyData.questions.map((q, i) => (
                      <SelectItem key={q.id} value={q.id}>
                        Q{i + 1}: {q.text.substring(0, 40)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {currentQuestion && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">{currentQuestion.text}</h3>
                  {/* Add detailed charts and analysis here */}
                  <p className="text-gray-500">
                    Detailed breakdown by demographic segments coming soon...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sample Responses Tab */}
        <TabsContent value="responses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sample Qualitative Responses</CardTitle>
              <CardDescription>
                See how synthetic respondents explained their ratings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {studyData.sampleResponses.map((response, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg border bg-gray-50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-medium">
                        {response.personaAge}
                      </div>
                      <div>
                        <div className="font-medium">
                          {response.personaGender}, {response.personaAge}
                        </div>
                        <div className="text-sm text-gray-500">
                          {response.personaLocation}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        response.rating >= 4
                          ? "success"
                          : response.rating >= 3
                          ? "warning"
                          : "destructive"
                      }
                    >
                      Rating: {response.rating}/5
                    </Badge>
                  </div>
                  <p className="text-gray-700 italic">
                    &ldquo;{response.explanation}&rdquo;
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Insights</CardTitle>
              <CardDescription>
                Key findings extracted from response patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {studyData.insights.map((insight, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg border-l-4 ${
                    insight.type === "positive"
                      ? "border-green-500 bg-green-50"
                      : insight.type === "negative"
                      ? "border-red-500 bg-red-50"
                      : "border-yellow-500 bg-yellow-50"
                  }`}
                >
                  <p className="font-medium">{insight.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommended Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                    1
                  </span>
                  <span>
                    Consider developing targeted messaging for the 55+ demographic
                    to address lower interest levels
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                    2
                  </span>
                  <span>
                    Leverage strong eco-conscious appeal in marketing materials
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                    3
                  </span>
                  <span>
                    Explore tiered pricing strategy to address price sensitivity
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Watermark notice */}
      <div className="p-4 bg-gray-100 rounded-lg text-center text-sm text-gray-600">
        <strong>Note:</strong> This report was generated with synthetic
        respondents using Syntheia&apos;s SSR methodology. Results should be used for
        exploratory research and validated with human panels for critical
        decisions.
      </div>
    </div>
  );
}
