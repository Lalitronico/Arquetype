"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Users,
  TrendingUp,
  CreditCard,
  Loader2,
  RefreshCw,
  BarChart3,
  Key,
  Activity,
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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

interface OverviewData {
  overview: {
    totalStudies: number;
    completedStudies: number;
    totalResponses: number;
    avgSampleSize: number;
    studiesByStatus: {
      draft: number;
      running: number;
      completed: number;
    };
  };
  credits: {
    remaining: number;
    monthly: number;
    usedThisMonth: number;
  };
}

interface CreditsData {
  summary: {
    totalCreditsUsed: number;
    totalViaApi: number;
    totalViaDashboard: number;
    periodDays: number;
  };
  daily: Array<{
    date: string;
    creditsUsed: number;
    viaApi: number;
    viaDashboard: number;
  }>;
  topStudies: Array<{
    studyId: string;
    studyName: string;
    creditsUsed: number;
  }>;
}

interface ApiUsageData {
  totalCalls: number;
  creditsViaApi: number;
  activeApiKeys: number;
  recent: {
    calls: number;
    creditsUsed: number;
    periodDays: number;
  };
  byApiKey: Array<{
    keyId: string | null;
    keyName: string;
    keyPrefix: string;
    calls: number;
    creditsUsed: number;
  }>;
  byEndpoint: Array<{
    endpoint: string;
    calls: number;
    creditsUsed: number;
  }>;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
const STATUS_COLORS: Record<string, string> = {
  draft: "#9ca3af",
  running: "#3b82f6",
  completed: "#10b981",
};

export default function AnalyticsPage() {
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [creditsData, setCreditsData] = useState<CreditsData | null>(null);
  const [apiUsageData, setApiUsageData] = useState<ApiUsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [overviewRes, creditsRes, apiUsageRes] = await Promise.all([
        fetch("/api/analytics"),
        fetch("/api/analytics/credits?days=30"),
        fetch("/api/analytics/api-usage"),
      ]);

      const [overviewJson, creditsJson, apiUsageJson] = await Promise.all([
        overviewRes.json(),
        creditsRes.json(),
        apiUsageRes.json(),
      ]);

      if (overviewRes.ok && overviewJson.success) {
        setOverviewData(overviewJson.data);
      }
      if (creditsRes.ok && creditsJson.success) {
        setCreditsData(creditsJson.data);
      }
      if (apiUsageRes.ok && apiUsageJson.success) {
        setApiUsageData(apiUsageJson.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch analytics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  // Prepare pie chart data for studies distribution
  const studiesDistributionData = overviewData
    ? [
        { name: "Draft", value: overviewData.overview.studiesByStatus.draft },
        { name: "Running", value: overviewData.overview.studiesByStatus.running },
        { name: "Completed", value: overviewData.overview.studiesByStatus.completed },
      ].filter(d => d.value > 0)
    : [];

  // Prepare daily credits chart data (last 14 days for readability)
  const dailyCreditsData = creditsData?.daily.slice(-14).map(d => ({
    ...d,
    date: formatDate(d.date),
  })) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-gray-600">
            Monitor your usage and research performance
          </p>
        </div>
        <Button variant="outline" onClick={fetchData} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      {/* Overview Stats */}
      {overviewData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Studies
              </CardTitle>
              <FileText className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overviewData.overview.totalStudies}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {overviewData.overview.completedStudies} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Responses
              </CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(overviewData.overview.totalResponses)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Synthetic responses generated
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Credits Remaining
              </CardTitle>
              <CreditCard className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(overviewData.credits.remaining)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                of {formatNumber(overviewData.credits.monthly)} monthly
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg. Sample Size
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overviewData.overview.avgSampleSize}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                respondents per study
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Credit Usage Chart */}
        {creditsData && dailyCreditsData.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Credit Usage (Last 14 Days)
              </CardTitle>
              <CardDescription>
                Daily credit consumption across dashboard and API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyCreditsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="creditsUsed"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                      name="Total Credits"
                    />
                    <Line
                      type="monotone"
                      dataKey="viaDashboard"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                      name="Dashboard"
                    />
                    <Line
                      type="monotone"
                      dataKey="viaApi"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={false}
                      name="API"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-600">Total</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm text-gray-600">Dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-sm text-gray-600">API</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Studies Distribution */}
        {overviewData && studiesDistributionData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Studies by Status
              </CardTitle>
              <CardDescription>
                Distribution of your research studies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={studiesDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {studiesDistributionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            STATUS_COLORS[entry.name.toLowerCase()] ||
                            COLORS[index % COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                {studiesDistributionData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          STATUS_COLORS[entry.name.toLowerCase()] ||
                          COLORS[index % COLORS.length],
                      }}
                    />
                    <span className="text-sm text-gray-600">
                      {entry.name} ({entry.value})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Studies by Credits */}
        {creditsData && creditsData.topStudies.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Studies by Credits
              </CardTitle>
              <CardDescription>
                Most credit-intensive studies (last 30 days)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {creditsData.topStudies.map((study, index) => (
                  <div
                    key={study.studyId}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      >
                        {index + 1}
                      </div>
                      <span className="font-medium truncate max-w-[200px]">
                        {study.studyName}
                      </span>
                    </div>
                    <Badge variant="secondary">
                      {formatNumber(study.creditsUsed)} credits
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* API Usage Section */}
      {apiUsageData && apiUsageData.totalCalls > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Usage
            </CardTitle>
            <CardDescription>
              API access metrics and usage by endpoint
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(apiUsageData.totalCalls)}
                </div>
                <div className="text-sm text-gray-500">Total API Calls</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">
                  {formatNumber(apiUsageData.creditsViaApi)}
                </div>
                <div className="text-sm text-gray-500">Credits via API</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {apiUsageData.activeApiKeys}
                </div>
                <div className="text-sm text-gray-500">Active API Keys</div>
              </div>
            </div>

            {apiUsageData.byEndpoint.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Usage by Endpoint</h4>
                <div className="space-y-2">
                  {apiUsageData.byEndpoint.slice(0, 5).map((endpoint) => (
                    <div
                      key={endpoint.endpoint}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <code className="text-sm text-gray-700">
                        {endpoint.endpoint}
                      </code>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                          {formatNumber(endpoint.calls)} calls
                        </span>
                        <Badge variant="outline">
                          {formatNumber(endpoint.creditsUsed)} credits
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State for API Usage */}
      {apiUsageData && apiUsageData.totalCalls === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Key className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No API Usage Yet
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              API usage metrics will appear here once you start using the
              Syntheia API. Create an API key in Settings to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
