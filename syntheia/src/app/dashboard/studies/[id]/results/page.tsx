"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Share2,
  Users,
  MessageSquare,
  BarChart3,
  TrendingUp,
  Loader2,
  AlertCircle,
  FileText,
  FileJson,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StudyData {
  id: string;
  name: string;
  description: string | null;
  status: string;
  sampleSize: number;
  creditsUsed: number;
  completedAt: string | null;
  questions: Array<{
    id: string;
    text: string;
    type: string;
  }>;
  results: {
    respondents: Array<{
      id: string;
      personaData: {
        demographics: {
          age: number;
          gender: string;
          location: string;
        };
      };
    }>;
    responses: Array<{
      id: string;
      questionId: string;
      respondentId: string;
      rating: number | null;
      textResponse: string | null;
      explanation: string | null;
      confidence: number | null;
      distribution: number[] | null;
    }>;
  } | null;
}

export default function StudyResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [study, setStudy] = useState<StudyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchStudy = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/studies/${resolvedParams.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch study");
        }

        setStudy(data.data);
        if (data.data.questions.length > 0) {
          setSelectedQuestion(data.data.questions[0].id);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudy();
  }, [resolvedParams.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-500">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !study) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/studies">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error || "Study not found"}
            </h3>
            <Link href="/dashboard/studies">
              <Button variant="outline">Back to Studies</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate statistics for each question
  const questionStats = study.questions.map((question) => {
    const questionResponses = study.results?.responses.filter(
      (r) => r.questionId === question.id
    ) || [];

    const ratings = questionResponses
      .map((r) => r.rating)
      .filter((r): r is number => r !== null && r > 0);

    const mean = ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;
    const sortedRatings = [...ratings].sort((a, b) => a - b);
    const median = sortedRatings.length > 0
      ? sortedRatings[Math.floor(sortedRatings.length / 2)]
      : 0;

    // Distribution calculation
    const maxRating = question.type === "nps" ? 11 : 5;
    const distribution = Array(maxRating).fill(0);
    ratings.forEach((r) => {
      const index = question.type === "nps" ? r : r - 1;
      if (index >= 0 && index < maxRating) {
        distribution[index]++;
      }
    });
    const distributionPercent = ratings.length > 0
      ? distribution.map((count) => Math.round((count / ratings.length) * 100))
      : distribution;

    // Standard deviation
    const variance = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / ratings.length
      : 0;
    const stdDev = Math.sqrt(variance);

    // NPS specific
    let npsData = null;
    if (question.type === "nps" && ratings.length > 0) {
      const promoters = ratings.filter((r) => r >= 9).length;
      const detractors = ratings.filter((r) => r <= 6).length;
      const passives = ratings.length - promoters - detractors;

      npsData = {
        npsScore: Math.round(((promoters - detractors) / ratings.length) * 100),
        promoters: Math.round((promoters / ratings.length) * 100),
        passives: Math.round((passives / ratings.length) * 100),
        detractors: Math.round((detractors / ratings.length) * 100),
      };
    }

    // Average confidence
    const confidences = questionResponses
      .map((r) => r.confidence)
      .filter((c): c is number => c !== null);
    const avgConfidence = confidences.length > 0
      ? Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length * 100)
      : 0;

    // Sample responses
    const sampleResponses = questionResponses.slice(0, 5).map((r) => {
      const respondent = study.results?.respondents.find(
        (resp) => resp.id === r.respondentId
      );
      return {
        ...r,
        persona: respondent?.personaData,
      };
    });

    return {
      ...question,
      totalResponses: ratings.length,
      mean: Math.round(mean * 100) / 100,
      median,
      stdDev: Math.round(stdDev * 100) / 100,
      distribution: distributionPercent,
      avgConfidence,
      npsData,
      sampleResponses,
    };
  });

  const totalResponses = study.results?.responses.length || 0;
  const avgConfidence = questionStats.length > 0
    ? Math.round(
        questionStats.reduce((sum, q) => sum + q.avgConfidence, 0) / questionStats.length
      )
    : 0;

  const currentQuestion = questionStats.find((q) => q.id === selectedQuestion);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleExport = async (format: "csv" | "json") => {
    setIsExporting(true);
    try {
      const response = await fetch(
        `/api/studies/${resolvedParams.id}/export?format=${format}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to export");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${study.name.replace(/[^a-zA-Z0-9]/g, "_")}_results.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export error:", err);
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

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
              <h2 className="text-2xl font-bold text-gray-900">{study.name}</h2>
              <Badge className="bg-green-100 text-green-700">Completed</Badge>
            </div>
            <p className="text-gray-600">
              {study.sampleSize} respondents | Completed {formatDate(study.completedAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isExporting}>
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                <FileText className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("json")}>
                <FileJson className="h-4 w-4 mr-2" />
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                <div className="text-2xl font-bold">{study.sampleSize}</div>
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
                <div className="text-2xl font-bold">{avgConfidence}%</div>
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
                <div className="text-2xl font-bold">{study.questions.length}</div>
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
                <div className="text-2xl font-bold">{totalResponses}</div>
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
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {questionStats.map((question, index) => (
              <Card key={question.id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    Q{index + 1}: {question.text}
                  </CardTitle>
                  <CardDescription>
                    {question.type === "nps"
                      ? "Net Promoter Score"
                      : question.type === "open_ended"
                      ? "Open-ended"
                      : "5-point Likert Scale"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {question.type === "likert" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        {question.distribution.map((pct, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="w-8 text-sm text-gray-500 text-right">
                              {i + 1}
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
                  {question.type === "nps" && question.npsData && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-blue-600">
                          {question.npsData.npsScore}
                        </div>
                        <div className="text-sm text-gray-500">NPS Score</div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-xl font-bold text-green-600">
                            {question.npsData.promoters}%
                          </div>
                          <div className="text-xs text-gray-500">Promoters</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-yellow-600">
                            {question.npsData.passives}%
                          </div>
                          <div className="text-xs text-gray-500">Passives</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-red-600">
                            {question.npsData.detractors}%
                          </div>
                          <div className="text-xs text-gray-500">Detractors</div>
                        </div>
                      </div>
                    </div>
                  )}
                  {question.type === "open_ended" && (
                    <div className="text-center py-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {question.totalResponses}
                      </div>
                      <div className="text-sm text-gray-500">
                        Text responses collected
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
                    {questionStats.map((q, i) => (
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
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {currentQuestion.totalResponses}
                      </div>
                      <div className="text-xs text-gray-500">Responses</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {currentQuestion.mean}
                      </div>
                      <div className="text-xs text-gray-500">Mean</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {currentQuestion.stdDev}
                      </div>
                      <div className="text-xs text-gray-500">Std Dev</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {currentQuestion.avgConfidence}%
                      </div>
                      <div className="text-xs text-gray-500">Avg Confidence</div>
                    </div>
                  </div>
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
              {questionStats.flatMap((q) =>
                q.sampleResponses.slice(0, 3).map((response, i) => (
                  <div
                    key={`${q.id}-${i}`}
                    className="p-4 rounded-lg border bg-gray-50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-medium">
                          {response.persona?.demographics?.age || "?"}
                        </div>
                        <div>
                          <div className="font-medium">
                            {response.persona?.demographics?.gender || "Unknown"},{" "}
                            {response.persona?.demographics?.age || "?"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {response.persona?.demographics?.location || "Unknown"}
                          </div>
                        </div>
                      </div>
                      {response.rating && (
                        <Badge
                          variant={
                            response.rating >= 4
                              ? "success"
                              : response.rating >= 3
                              ? "warning"
                              : "destructive"
                          }
                        >
                          Rating: {response.rating}/{q.type === "nps" ? 10 : 5}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      Q: {q.text}
                    </div>
                    {response.explanation && (
                      <p className="text-gray-700 italic">
                        &ldquo;{response.explanation}&rdquo;
                      </p>
                    )}
                  </div>
                ))
              )}
              {questionStats.every((q) => q.sampleResponses.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  No sample responses available
                </div>
              )}
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
