"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  AlertCircle,
  Check,
  X,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
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
import { Checkbox } from "@/components/ui/checkbox";

interface Study {
  id: string;
  name: string;
  status: string;
  sampleSize: number;
  completedAt: string | null;
}

interface QuestionStats {
  questionId: string;
  questionText: string;
  type: string;
  mean: number;
  median: number;
  stdDev: number;
  totalResponses: number;
  npsScore?: number;
}

interface StudyComparison {
  id: string;
  name: string;
  completedAt: string | null;
  sampleSize: number;
  questions: QuestionStats[];
}

interface TrendData {
  questionText: string;
  type: string;
  dataPoints: Array<{
    studyId: string;
    studyName: string;
    date: string | null;
    mean: number;
    npsScore?: number;
  }>;
  trend: "improving" | "declining" | "stable";
  changePercent: number;
}

interface ComparisonData {
  studies: StudyComparison[];
  commonQuestions: Array<{ text: string; questionIds: Record<string, string> }>;
  trends: TrendData[];
  summary: {
    totalStudies: number;
    dateRange: {
      start: string | null;
      end: string | null;
    };
  };
}

export default function CompareStudiesPage() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [selectedStudies, setSelectedStudies] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch completed studies
  useEffect(() => {
    const fetchStudies = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/studies");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch studies");
        }

        // Filter to completed studies only
        const completedStudies = data.data.filter(
          (s: Study) => s.status === "completed"
        );
        setStudies(completedStudies);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudies();
  }, []);

  const toggleStudySelection = (studyId: string) => {
    setSelectedStudies((prev) => {
      if (prev.includes(studyId)) {
        return prev.filter((id) => id !== studyId);
      }
      if (prev.length >= 10) {
        return prev; // Max 10 studies
      }
      return [...prev, studyId];
    });
  };

  const compareStudies = async () => {
    if (selectedStudies.length < 2) return;

    setIsComparing(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/studies/compare?ids=${selectedStudies.join(",")}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to compare studies");
      }

      setComparisonData(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Comparison failed");
    } finally {
      setIsComparing(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTrendIcon = (trend: TrendData["trend"]) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case "declining":
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      default:
        return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: TrendData["trend"]) => {
    switch (trend) {
      case "improving":
        return "text-green-600 bg-green-50";
      case "declining":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-500">Loading studies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/studies">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compare Studies</h1>
          <p className="text-gray-500">
            Analyze trends and compare results across multiple studies
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Study Selection */}
      {!comparisonData && (
        <Card>
          <CardHeader>
            <CardTitle>Select Studies to Compare</CardTitle>
            <CardDescription>
              Choose 2-10 completed studies to analyze trends and compare results
            </CardDescription>
          </CardHeader>
          <CardContent>
            {studies.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No completed studies available for comparison</p>
                <Link href="/dashboard/studies/new">
                  <Button className="mt-4">Create a Study</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {studies.map((study) => (
                    <div
                      key={study.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedStudies.includes(study.id)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => toggleStudySelection(study.id)}
                    >
                      <Checkbox
                        checked={selectedStudies.includes(study.id)}
                        onCheckedChange={() => toggleStudySelection(study.id)}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{study.name}</h3>
                        <p className="text-sm text-gray-500">
                          {study.sampleSize} respondents | Completed{" "}
                          {formatDate(study.completedAt)}
                        </p>
                      </div>
                      {selectedStudies.includes(study.id) && (
                        <Badge className="bg-blue-100 text-blue-700">
                          Selected
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    {selectedStudies.length} of {studies.length} studies selected
                  </p>
                  <Button
                    onClick={compareStudies}
                    disabled={selectedStudies.length < 2 || isComparing}
                  >
                    {isComparing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Comparing...
                      </>
                    ) : (
                      <>
                        <LineChart className="h-4 w-4 mr-2" />
                        Compare Studies
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Comparison Results */}
      {comparisonData && (
        <>
          {/* Summary */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Comparison Results</h2>
              <p className="text-sm text-gray-500">
                {comparisonData.summary.totalStudies} studies |{" "}
                {formatDate(comparisonData.summary.dateRange.start)} -{" "}
                {formatDate(comparisonData.summary.dateRange.end)}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setComparisonData(null);
                setSelectedStudies([]);
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Clear Comparison
            </Button>
          </div>

          {/* Studies Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Studies Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Study</th>
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                      <th className="text-right py-3 px-4 font-medium">
                        Sample Size
                      </th>
                      <th className="text-right py-3 px-4 font-medium">
                        Questions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.studies.map((study, index) => (
                      <tr
                        key={study.id}
                        className={index % 2 === 0 ? "bg-gray-50" : ""}
                      >
                        <td className="py-3 px-4 font-medium">{study.name}</td>
                        <td className="py-3 px-4 text-gray-500">
                          {formatDate(study.completedAt)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {study.sampleSize}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {study.questions.length}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Trend Analysis */}
          {comparisonData.trends.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trend Analysis
                </CardTitle>
                <CardDescription>
                  Track how responses have changed over time for common questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {comparisonData.trends.map((trend, index) => (
                  <div key={index} className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{trend.questionText}</h4>
                        <Badge variant="outline" className="mt-1">
                          {trend.type === "nps" ? "NPS" : "Likert Scale"}
                        </Badge>
                      </div>
                      <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getTrendColor(
                          trend.trend
                        )}`}
                      >
                        {getTrendIcon(trend.trend)}
                        <span className="font-medium">
                          {trend.changePercent > 0 ? "+" : ""}
                          {trend.changePercent}%
                        </span>
                      </div>
                    </div>

                    {/* Data Points Chart */}
                    <div className="flex items-end gap-4 h-32 bg-gray-50 rounded-lg p-4">
                      {trend.dataPoints.map((point, i) => {
                        const value = point.npsScore ?? point.mean;
                        const maxValue = trend.type === "nps" ? 100 : 5;
                        const minValue = trend.type === "nps" ? -100 : 1;
                        const range = maxValue - minValue;
                        const normalizedValue = trend.type === "nps"
                          ? ((value + 100) / 200) * 100
                          : ((value - 1) / 4) * 100;
                        const height = Math.max(10, normalizedValue);

                        const prevPoint = trend.dataPoints[i - 1];
                        const prevValue = prevPoint
                          ? (prevPoint.npsScore ?? prevPoint.mean)
                          : value;
                        const isUp = value > prevValue;
                        const isDown = value < prevValue;

                        return (
                          <div
                            key={i}
                            className="flex-1 flex flex-col items-center gap-2"
                          >
                            <div className="relative flex items-center justify-center">
                              <span className="text-sm font-bold">
                                {trend.type === "nps" ? value : value.toFixed(1)}
                              </span>
                              {i > 0 && (
                                <span className="absolute -top-4 right-0">
                                  {isUp && (
                                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                                  )}
                                  {isDown && (
                                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                                  )}
                                </span>
                              )}
                            </div>
                            <div
                              className={`w-full rounded-t transition-all ${
                                i === trend.dataPoints.length - 1
                                  ? "bg-blue-500"
                                  : "bg-blue-300"
                              }`}
                              style={{ height: `${height}%` }}
                            />
                            <div className="text-xs text-gray-500 text-center truncate w-full">
                              {point.studyName.length > 15
                                ? point.studyName.substring(0, 15) + "..."
                                : point.studyName}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Common Questions Found
                </h3>
                <p className="text-gray-500">
                  The selected studies don&apos;t have matching questions for trend
                  analysis. Try selecting studies with similar surveys.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Question Comparison Table */}
          {comparisonData.commonQuestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Question-by-Question Comparison</CardTitle>
                <CardDescription>
                  Detailed comparison of common questions across studies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium min-w-[200px]">
                          Question
                        </th>
                        {comparisonData.studies.map((study) => (
                          <th
                            key={study.id}
                            className="text-center py-3 px-4 font-medium min-w-[120px]"
                          >
                            {study.name.length > 20
                              ? study.name.substring(0, 20) + "..."
                              : study.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonData.trends.map((trend, index) => (
                        <tr
                          key={index}
                          className={index % 2 === 0 ? "bg-gray-50" : ""}
                        >
                          <td className="py-3 px-4">
                            <span className="text-sm">
                              {trend.questionText.length > 60
                                ? trend.questionText.substring(0, 60) + "..."
                                : trend.questionText}
                            </span>
                          </td>
                          {comparisonData.studies.map((study) => {
                            const dataPoint = trend.dataPoints.find(
                              (dp) => dp.studyId === study.id
                            );
                            const value = dataPoint
                              ? (dataPoint.npsScore ?? dataPoint.mean)
                              : null;

                            return (
                              <td key={study.id} className="py-3 px-4 text-center">
                                {value !== null ? (
                                  <span
                                    className={`font-semibold ${
                                      trend.type === "nps"
                                        ? value >= 50
                                          ? "text-green-600"
                                          : value >= 0
                                          ? "text-yellow-600"
                                          : "text-red-600"
                                        : value >= 4
                                        ? "text-green-600"
                                        : value >= 3
                                        ? "text-yellow-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {trend.type === "nps"
                                      ? value
                                      : value.toFixed(2)}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Key Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Auto-generated insights */}
                {comparisonData.trends
                  .filter((t) => t.trend !== "stable")
                  .slice(0, 5)
                  .map((trend, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-3 rounded-lg ${
                        trend.trend === "improving"
                          ? "bg-green-50 text-green-800"
                          : "bg-red-50 text-red-800"
                      }`}
                    >
                      {trend.trend === "improving" ? (
                        <TrendingUp className="h-5 w-5 flex-shrink-0" />
                      ) : (
                        <TrendingDown className="h-5 w-5 flex-shrink-0" />
                      )}
                      <span className="text-sm">
                        <strong>
                          &quot;{trend.questionText.substring(0, 50)}
                          {trend.questionText.length > 50 ? "..." : ""}&quot;
                        </strong>{" "}
                        {trend.trend === "improving" ? "improved" : "declined"} by{" "}
                        {Math.abs(trend.changePercent)}% over the selected time
                        period.
                      </span>
                    </div>
                  ))}

                {comparisonData.trends.every((t) => t.trend === "stable") && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 text-blue-800">
                    <Minus className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">
                      Responses have remained relatively stable across all compared
                      studies. No significant trends detected.
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
