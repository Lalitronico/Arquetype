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
  Heart,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Hash,
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
import { aggregateSentiment } from "@/lib/sentiment-analysis";

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
          income?: string;
          education?: string;
          occupation?: string;
        };
        psychographics?: {
          values?: string[];
          lifestyle?: string;
          interests?: string[];
          personality?: string;
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

interface QuestionStat {
  id: string;
  text: string;
  type: string;
  totalResponses: number;
  mean: number;
  median: number;
  stdDev: number;
  distribution: number[];
  avgConfidence: number;
  npsData: {
    npsScore: number;
    promoters: number;
    passives: number;
    detractors: number;
  } | null;
  sampleResponses: Array<{
    rating: number | null;
    explanation: string | null;
    persona?: {
      demographics: {
        age: number;
        gender: string;
        location: string;
      };
    };
  }>;
}

// Demographics Analysis Component
function DemographicsAnalysis({
  study,
  questionStats,
}: {
  study: StudyData;
  questionStats: QuestionStat[];
}) {
  const [selectedDemographic, setSelectedDemographic] = useState<string>("gender");
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(
    questionStats.length > 0 ? questionStats[0].id : ""
  );

  if (!study.results) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Results Available
          </h3>
        </CardContent>
      </Card>
    );
  }

  const { respondents, responses } = study.results;

  // Get age group
  const getAgeGroup = (age: number): string => {
    if (age < 25) return "18-24";
    if (age < 35) return "25-34";
    if (age < 45) return "35-44";
    if (age < 55) return "45-54";
    if (age < 65) return "55-64";
    return "65+";
  };

  // Group respondents by demographic
  const groupRespondents = (demographic: string) => {
    const groups: Record<string, string[]> = {};

    respondents.forEach((r) => {
      let key: string;
      switch (demographic) {
        case "gender":
          key = r.personaData.demographics.gender || "Unknown";
          break;
        case "age":
          key = getAgeGroup(r.personaData.demographics.age);
          break;
        case "location":
          // Group by state (extract from location like "City, State")
          const loc = r.personaData.demographics.location || "Unknown";
          const parts = loc.split(", ");
          key = parts.length > 1 ? parts[1] : parts[0];
          break;
        default:
          key = "Unknown";
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(r.id);
    });

    return groups;
  };

  // Calculate stats for a group of respondent IDs
  const calculateGroupStats = (respondentIds: string[], questionId: string) => {
    const questionResponses = responses.filter(
      (r) => r.questionId === questionId && respondentIds.includes(r.respondentId)
    );
    const ratings = questionResponses
      .map((r) => r.rating)
      .filter((r): r is number => r !== null && r > 0);

    if (ratings.length === 0) {
      return { mean: 0, count: 0 };
    }

    const mean = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    return {
      mean: Math.round(mean * 100) / 100,
      count: ratings.length,
    };
  };

  const groups = groupRespondents(selectedDemographic);
  const question = questionStats.find((q) => q.id === selectedQuestionId);

  // Sort groups for display
  const sortedGroups = Object.entries(groups).sort((a, b) => {
    if (selectedDemographic === "age") {
      const ageOrder = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
      return ageOrder.indexOf(a[0]) - ageOrder.indexOf(b[0]);
    }
    return a[0].localeCompare(b[0]);
  });

  // Calculate demographic distribution
  const demographicCounts = sortedGroups.map(([name, ids]) => ({
    name,
    count: ids.length,
    percentage: Math.round((ids.length / respondents.length) * 100),
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Demographic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Panel Composition</CardTitle>
          <CardDescription>
            Distribution of respondents by demographic
          </CardDescription>
          <Select value={selectedDemographic} onValueChange={setSelectedDemographic}>
            <SelectTrigger className="w-40 mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gender">Gender</SelectItem>
              <SelectItem value="age">Age Group</SelectItem>
              <SelectItem value="location">Location</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {demographicCounts.map(({ name, count, percentage }) => (
              <div key={name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium capitalize">{name}</span>
                  <span className="text-gray-500">{count} ({percentage}%)</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Segment Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Segment Comparison</CardTitle>
          <CardDescription>
            Compare average ratings across demographic segments
          </CardDescription>
          <Select value={selectedQuestionId} onValueChange={setSelectedQuestionId}>
            <SelectTrigger className="w-full mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {questionStats
                .filter((q) => q.type !== "open_ended")
                .map((q, i) => (
                  <SelectItem key={q.id} value={q.id}>
                    Q{i + 1}: {q.text.substring(0, 40)}...
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {question && question.type !== "open_ended" ? (
            <div className="space-y-4">
              <div className="text-sm text-gray-500 mb-4">
                {question.text}
              </div>
              <div className="space-y-3">
                {sortedGroups.map(([name, ids]) => {
                  const stats = calculateGroupStats(ids, selectedQuestionId);
                  const maxRating = question.type === "nps" ? 10 : 5;
                  const barWidth = (stats.mean / maxRating) * 100;

                  return (
                    <div key={name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium capitalize">{name}</span>
                        <span className="text-blue-600 font-bold">
                          {stats.mean} <span className="text-gray-400 font-normal">({stats.count})</span>
                        </span>
                      </div>
                      <div className="h-6 bg-gray-100 rounded overflow-hidden relative">
                        <div
                          className={`h-full rounded transition-all ${
                            stats.mean >= 4 ? "bg-green-500" :
                            stats.mean >= 3 ? "bg-yellow-500" : "bg-red-500"
                          }`}
                          style={{ width: `${barWidth}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                          {stats.mean > 0 && `${stats.mean}/${maxRating}`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="pt-4 border-t text-xs text-gray-500">
                Overall mean: <span className="font-medium text-blue-600">{question.mean}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Select a rating-based question to see segment comparison
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights Card */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Key Demographic Insights</CardTitle>
          <CardDescription>
            Notable differences across demographic segments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DemographicInsights
            respondents={respondents}
            responses={responses}
            questionStats={questionStats}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for demographic insights
function DemographicInsights({
  respondents,
  responses,
  questionStats,
}: {
  respondents: StudyData["results"] extends null ? never : NonNullable<StudyData["results"]>["respondents"];
  responses: StudyData["results"] extends null ? never : NonNullable<StudyData["results"]>["responses"];
  questionStats: QuestionStat[];
}) {
  // Calculate insights
  const insights: Array<{ type: "positive" | "negative" | "neutral"; text: string }> = [];

  // Group by gender
  const genderGroups: Record<string, string[]> = {};
  respondents.forEach((r) => {
    const gender = r.personaData.demographics.gender || "Unknown";
    if (!genderGroups[gender]) genderGroups[gender] = [];
    genderGroups[gender].push(r.id);
  });

  // Find significant differences in ratings by gender
  questionStats.forEach((question) => {
    if (question.type === "open_ended") return;

    const genderMeans: Record<string, number> = {};
    Object.entries(genderGroups).forEach(([gender, ids]) => {
      const ratings = responses
        .filter((r) => r.questionId === question.id && ids.includes(r.respondentId))
        .map((r) => r.rating)
        .filter((r): r is number => r !== null && r > 0);

      if (ratings.length > 0) {
        genderMeans[gender] = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      }
    });

    // Check for significant differences (>0.5 difference)
    const genders = Object.keys(genderMeans);
    if (genders.length >= 2) {
      const values = Object.values(genderMeans);
      const maxDiff = Math.max(...values) - Math.min(...values);
      if (maxDiff > 0.5) {
        const highest = genders.reduce((a, b) =>
          genderMeans[a] > genderMeans[b] ? a : b
        );
        const lowest = genders.reduce((a, b) =>
          genderMeans[a] < genderMeans[b] ? a : b
        );
        insights.push({
          type: "neutral",
          text: `${highest} respondents rated "${question.text.substring(0, 50)}..." higher (${genderMeans[highest].toFixed(1)}) than ${lowest} (${genderMeans[lowest].toFixed(1)})`,
        });
      }
    }
  });

  // Find questions with highest and lowest ratings
  const ratingQuestions = questionStats.filter((q) => q.type !== "open_ended" && q.totalResponses > 0);
  if (ratingQuestions.length > 0) {
    const highest = ratingQuestions.reduce((a, b) => a.mean > b.mean ? a : b);
    const lowest = ratingQuestions.reduce((a, b) => a.mean < b.mean ? a : b);

    if (highest.mean >= 4) {
      insights.push({
        type: "positive",
        text: `Strongest positive response on "${highest.text.substring(0, 50)}..." with mean rating of ${highest.mean}`,
      });
    }

    if (lowest.mean <= 2.5) {
      insights.push({
        type: "negative",
        text: `Lowest rating on "${lowest.text.substring(0, 50)}..." with mean rating of ${lowest.mean}`,
      });
    }
  }

  if (insights.length === 0) {
    insights.push({
      type: "neutral",
      text: "No significant demographic differences detected. Responses are relatively consistent across segments.",
    });
  }

  return (
    <div className="space-y-3">
      {insights.slice(0, 5).map((insight, i) => (
        <div
          key={i}
          className={`flex items-start gap-3 p-3 rounded-lg ${
            insight.type === "positive"
              ? "bg-green-50 text-green-800"
              : insight.type === "negative"
              ? "bg-red-50 text-red-800"
              : "bg-blue-50 text-blue-800"
          }`}
        >
          {insight.type === "positive" && <ThumbsUp className="h-5 w-5 flex-shrink-0" />}
          {insight.type === "negative" && <ThumbsDown className="h-5 w-5 flex-shrink-0" />}
          {insight.type === "neutral" && <BarChart3 className="h-5 w-5 flex-shrink-0" />}
          <span className="text-sm">{insight.text}</span>
        </div>
      ))}
    </div>
  );
}

// Word Cloud Component
function WordCloud({ texts }: { texts: string[] }) {
  // Extract and count words
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "as", "is", "was", "are", "were", "been",
    "be", "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "must", "shall", "can", "need", "dare", "ought",
    "used", "i", "me", "my", "myself", "we", "our", "ours", "ourselves",
    "you", "your", "yours", "yourself", "yourselves", "he", "him", "his",
    "himself", "she", "her", "hers", "herself", "it", "its", "itself",
    "they", "them", "their", "theirs", "themselves", "what", "which", "who",
    "whom", "this", "that", "these", "those", "am", "been", "being", "having",
    "doing", "would", "could", "should", "might", "very", "just", "also",
    "more", "most", "other", "some", "such", "only", "own", "same", "so",
    "than", "too", "very", "just", "about", "into", "through", "during",
    "before", "after", "above", "below", "between", "under", "again",
    "further", "then", "once", "here", "there", "when", "where", "why", "how",
    "all", "each", "few", "many", "no", "nor", "not", "any", "both", "find",
    "think", "feel", "really", "like", "get", "make", "see", "know", "take",
  ]);

  const wordCounts: Record<string, number> = {};

  texts.forEach((text) => {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word));

    words.forEach((word) => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
  });

  // Get top words
  const sortedWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40);

  if (sortedWords.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Not enough text data to generate word cloud
      </div>
    );
  }

  const maxCount = sortedWords[0][1];
  const minCount = sortedWords[sortedWords.length - 1][1];

  // Generate colors and sizes
  const getWordStyle = (count: number, index: number) => {
    const normalizedCount = maxCount === minCount
      ? 1
      : (count - minCount) / (maxCount - minCount);

    // Size: 0.75rem to 2rem based on frequency
    const fontSize = 0.75 + normalizedCount * 1.25;

    // Color palette
    const colors = [
      "text-blue-600", "text-indigo-600", "text-purple-600",
      "text-pink-600", "text-emerald-600", "text-teal-600",
      "text-cyan-600", "text-sky-600", "text-violet-600",
    ];
    const colorClass = colors[index % colors.length];

    // Opacity based on rank
    const opacity = 0.6 + (1 - index / sortedWords.length) * 0.4;

    return {
      fontSize: `${fontSize}rem`,
      opacity,
      className: colorClass,
    };
  };

  // Shuffle for visual variety
  const shuffledWords = [...sortedWords].sort(() => Math.random() - 0.5);

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 py-4 min-h-[200px]">
      {shuffledWords.map(([word, count], index) => {
        const style = getWordStyle(count, sortedWords.findIndex(([w]) => w === word));
        return (
          <span
            key={word}
            className={`font-medium cursor-default hover:scale-110 transition-transform ${style.className}`}
            style={{ fontSize: style.fontSize, opacity: style.opacity }}
            title={`${word}: ${count} occurrences`}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
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

  // Sentiment analysis for open-ended and explanation responses
  const allTextResponses = study.results?.responses
    .flatMap((r) => [r.textResponse, r.explanation])
    .filter((t): t is string => !!t && t.length > 0) || [];

  const sentimentData = allTextResponses.length > 0
    ? aggregateSentiment(allTextResponses)
    : null;

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
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
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

        {/* Demographics Tab */}
        <TabsContent value="demographics" className="space-y-6">
          <DemographicsAnalysis
            study={study}
            questionStats={questionStats}
          />
        </TabsContent>

        {/* Sentiment Analysis Tab */}
        <TabsContent value="sentiment" className="space-y-6">
          {sentimentData ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Overall Sentiment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-pink-500" />
                    Overall Sentiment
                  </CardTitle>
                  <CardDescription>
                    Aggregate sentiment from {allTextResponses.length} text responses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center gap-8 py-4">
                    <div className="text-center">
                      <div className={`text-5xl font-bold ${
                        sentimentData.overall.label === "positive"
                          ? "text-green-600"
                          : sentimentData.overall.label === "negative"
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}>
                        {sentimentData.overall.label === "positive" && (
                          <ThumbsUp className="h-12 w-12 mx-auto mb-2" />
                        )}
                        {sentimentData.overall.label === "negative" && (
                          <ThumbsDown className="h-12 w-12 mx-auto mb-2" />
                        )}
                        {sentimentData.overall.label === "neutral" && (
                          <Minus className="h-12 w-12 mx-auto mb-2" />
                        )}
                        {sentimentData.overall.label.charAt(0).toUpperCase() + sentimentData.overall.label.slice(1)}
                      </div>
                      <div className="text-sm text-gray-500 mt-2">
                        Score: {(sentimentData.overall.score * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-400">
                        Confidence: {(sentimentData.overall.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sentiment Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Distribution</CardTitle>
                  <CardDescription>
                    Breakdown of positive, neutral, and negative responses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <ThumbsUp className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Positive</span>
                          <span className="font-medium">{sentimentData.distribution.positive}</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{
                              width: `${(sentimentData.distribution.positive / allTextResponses.length) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Minus className="h-5 w-5 text-gray-500" />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Neutral</span>
                          <span className="font-medium">{sentimentData.distribution.neutral}</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gray-400 rounded-full"
                            style={{
                              width: `${(sentimentData.distribution.neutral / allTextResponses.length) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <ThumbsDown className="h-5 w-5 text-red-600" />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Negative</span>
                          <span className="font-medium">{sentimentData.distribution.negative}</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500 rounded-full"
                            style={{
                              width: `${(sentimentData.distribution.negative / allTextResponses.length) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Word Cloud */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="h-5 w-5 text-blue-500" />
                    Word Cloud
                  </CardTitle>
                  <CardDescription>
                    Visual representation of most frequent terms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WordCloud texts={allTextResponses} />
                </CardContent>
              </Card>

              {/* Emotional Tone */}
              <Card>
                <CardHeader>
                  <CardTitle>Emotional Tone</CardTitle>
                  <CardDescription>
                    Distribution of emotional indicators in responses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(sentimentData.averageEmotionalTone)
                      .filter(([, value]) => value > 0)
                      .sort((a, b) => b[1] - a[1])
                      .map(([emotion, value]) => (
                        <div key={emotion} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="capitalize text-sm">{emotion}</span>
                          <span className="font-medium text-blue-600">
                            {(value * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    {Object.values(sentimentData.averageEmotionalTone).every(v => v === 0) && (
                      <p className="text-gray-500 text-sm col-span-2">
                        No strong emotional indicators detected
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Text Data for Analysis
                </h3>
                <p className="text-gray-500">
                  Sentiment analysis requires open-ended responses or explanations.
                </p>
              </CardContent>
            </Card>
          )}
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
