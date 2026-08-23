"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Database,
  Gauge,
  Link2,
  ListChecks,
  Lock,
  Loader2,
  Percent,
  RefreshCw,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";

// ---------- Types ----------

interface MetricTrends {
  healthScore: string;
  connections: string;
  slowQueries: string;
  locks: string;
  cacheHitRatio: string;
}

interface HealthInsightsData {
  success: boolean;
  overallTrend: string;
  healthSummary: string;
  metricTrends: MetricTrends;
  concerns: string[];
  recommendedActions: string[];
}

interface HealthInsightsResponse {
  success: boolean;
  database: string;
  insights: HealthInsightsData;
}

interface HealthInsightsProps {
  databaseId: number | string;
}

// ---------- Config ----------

// Matches the existing project pattern (see user service):
// hardcoded API base URL + token read directly from localStorage.
const API_URL = "http://localhost:5000/api/health-insights";

// Get JWT Token
function getToken() {
  return localStorage.getItem("token");
}

// ---------- Presentation helpers ----------

function trendBadgeStyles(trend: string): string {
  const normalized = trend.toLowerCase();

  if (normalized.includes("improv")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (normalized.includes("degrad")) {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (normalized.includes("insufficient")) {
    return "bg-gray-100 text-gray-600 border-gray-200";
  }

  // Stable / default
  return "bg-blue-50 text-blue-700 border-blue-200";
}

function trendIcon(trend: string) {
  const normalized = trend.toLowerCase();

  if (normalized.includes("improv")) {
    return <TrendingUp className="h-4 w-4" />;
  }

  if (normalized.includes("degrad")) {
    return <TrendingDown className="h-4 w-4" />;
  }

  if (normalized.includes("insufficient")) {
    return <ShieldAlert className="h-4 w-4" />;
  }

  return <Activity className="h-4 w-4" />;
}

// ---------- Component ----------

export default function HealthInsights({ databaseId }: HealthInsightsProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<HealthInsightsResponse | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/${databaseId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setData(data as HealthInsightsResponse);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load health insights."
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (databaseId === undefined || databaseId === null || databaseId === "") {
      return;
    }

    fetchInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [databaseId]);

  // ---------- Loading state ----------

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm font-medium">
            Generating AI health insights...
          </p>
        </div>
      </div>
    );
  }

  // ---------- Error state ----------

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">
              Unable to load health insights
            </p>
            <p className="mt-1 text-sm text-red-600">{error}</p>
          </div>
          <button
            type="button"
            onClick={fetchInsights}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { database, insights } = data;

  const metricCards: {
    label: string;
    value: string;
    icon: ReactNode;
  }[] = [
    {
      label: "Health Score Trend",
      value: insights.metricTrends?.healthScore || "N/A",
      icon: <Gauge className="h-4 w-4 text-indigo-500" />,
    },
    {
      label: "Connections Trend",
      value: insights.metricTrends?.connections || "N/A",
      icon: <Link2 className="h-4 w-4 text-sky-500" />,
    },
    {
      label: "Slow Queries Trend",
      value: insights.metricTrends?.slowQueries || "N/A",
      icon: <Zap className="h-4 w-4 text-amber-500" />,
    },
    {
      label: "Locks Trend",
      value: insights.metricTrends?.locks || "N/A",
      icon: <Lock className="h-4 w-4 text-rose-500" />,
    },
    {
      label: "Cache Hit Ratio Trend",
      value: insights.metricTrends?.cacheHitRatio || "N/A",
      icon: <Percent className="h-4 w-4 text-emerald-500" />,
    },
  ];

  const hasConcerns = insights.concerns && insights.concerns.length > 0;
  const hasRecommendations =
    insights.recommendedActions && insights.recommendedActions.length > 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-gray-400" />
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              AI Health Insights
            </h3>
            <p className="text-xs text-gray-500">{database}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${trendBadgeStyles(
              insights.overallTrend
            )}`}
          >
            {trendIcon(insights.overallTrend)}
            {insights.overallTrend}
          </span>

          <button
            type="button"
            onClick={fetchInsights}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
            title="Refresh insights"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-6 p-5">
        {/* Health summary */}
        <div>
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Health Summary
          </h4>
          <p className="text-sm leading-relaxed text-gray-700">
            {insights.healthSummary || "No summary available."}
          </p>
        </div>

        {/* Metric trends */}
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Metric Trends
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {metricCards.map((metric) => (
              <div
                key={metric.label}
                className="rounded-lg border border-gray-100 bg-gray-50 p-3"
              >
                <div className="mb-1 flex items-center gap-2">
                  {metric.icon}
                  <span className="text-xs font-medium text-gray-500">
                    {metric.label}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-800">
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Concerns */}
        <div>
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            Concerns
          </h4>

          {hasConcerns ? (
            <ul className="space-y-2">
              {insights.concerns.map((concern, idx) => (
                <li
                  key={`concern-${idx}`}
                  className="flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm text-amber-800"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                  <span>{concern}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span>No significant concerns detected.</span>
            </div>
          )}
        </div>

        {/* Recommended actions */}
        <div>
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
            <ListChecks className="h-3.5 w-3.5" />
            Recommended Actions
          </h4>

          {hasRecommendations ? (
            <ul className="space-y-2">
              {insights.recommendedActions.map((action, idx) => (
                <li
                  key={`action-${idx}`}
                  className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800"
                >
                  <ListChecks className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-gray-600">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-gray-400" />
              <span>No additional actions recommended.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}