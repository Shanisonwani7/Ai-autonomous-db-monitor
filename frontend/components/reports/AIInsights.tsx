"use client";

import {
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import type { ReportResponse } from "@/types/report";

interface AIInsightsProps {
  insights: ReportResponse["report"]["aiInsights"];
}

function getTrendStyle(trend: string) {
  const normalized = trend?.toLowerCase() || "";

  if (
    normalized.includes("improv") ||
    normalized.includes("increas") ||
    normalized.includes("positive") ||
    normalized.includes("healthy")
  ) {
    return {
      icon: TrendingUp,
      className: "bg-emerald-500/10 text-emerald-400",
    };
  }

  if (
    normalized.includes("declin") ||
    normalized.includes("decreas") ||
    normalized.includes("negative") ||
    normalized.includes("wors")
  ) {
    return {
      icon: TrendingDown,
      className: "bg-amber-500/10 text-amber-400",
    };
  }

  return {
    icon: CheckCircle2,
    className: "bg-sky-500/10 text-sky-400",
  };
}

function TrendBadge({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const config = getTrendStyle(value);
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3">
      {label ? (
        <span className="text-sm text-slate-400">
          {label}
        </span>
      ) : (
        <span />
      )}

      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.className}`}
      >
        <Icon className="h-3.5 w-3.5" />
        {value || "Unknown"}
      </span>
    </div>
  );
}

export default function AIInsights({
  insights,
}: AIInsightsProps) {
  const concerns = Array.isArray(insights?.concerns)
    ? insights.concerns
    : [];

  const recommendedActions = Array.isArray(
    insights?.recommendedActions
  )
    ? insights.recommendedActions
    : [];

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-violet-400" />

          <h2 className="text-2xl font-bold tracking-tight text-white">
            AI Insights
          </h2>
        </div>

        <p className="mt-1 text-sm text-slate-400">
          AI-generated analysis based on the database
          monitoring data and historical trends.
        </p>
      </div>

      {/* Overall Trend + Health Summary */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Overall Trend */}
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-violet-500/10 via-slate-900/60 to-slate-900/60 p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-400" />

              <h3 className="font-semibold text-white">
                Overall Trend
              </h3>
            </div>

            <TrendBadge
              label=""
              value={insights?.overallTrend || "Unknown"}
            />
          </div>
        </div>

        {/* Health Summary */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />

            <h3 className="font-semibold text-white">
              Health Summary
            </h3>
          </div>

          <p className="text-sm leading-7 text-slate-300">
            {insights?.healthSummary ||
              "No AI health summary available."}
          </p>
        </div>
      </div>

      {/* Metric Trends */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-white">
            AI Metric Trends
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            AI interpretation of the monitored metrics.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <TrendBadge
            label="Health Score"
            value={
              insights?.metricTrends?.healthScore ||
              "Unknown"
            }
          />

          <TrendBadge
            label="Connections"
            value={
              insights?.metricTrends?.connections ||
              "Unknown"
            }
          />

          <TrendBadge
            label="Slow Queries"
            value={
              insights?.metricTrends?.slowQueries ||
              "Unknown"
            }
          />

          <TrendBadge
            label="Locks"
            value={
              insights?.metricTrends?.locks ||
              "Unknown"
            }
          />

          <TrendBadge
            label="Cache Hit Ratio"
            value={
              insights?.metricTrends?.cacheHitRatio ||
              "Unknown"
            }
          />
        </div>
      </div>

      {/* Concerns + Recommendations */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Concerns */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="mb-5 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-400" />

            <h3 className="text-lg font-semibold text-white">
              AI Detected Concerns
            </h3>
          </div>

          {concerns.length === 0 ? (
            <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />

                <p className="text-sm leading-6 text-slate-300">
                  No significant concerns were identified
                  from the available monitoring data.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {concerns.map((concern, index) => (
                <div
                  key={`${concern}-${index}`}
                  className="flex items-start gap-3 rounded-xl border border-amber-500/10 bg-amber-500/5 p-4"
                >
                  <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-amber-400" />

                  <p className="text-sm leading-6 text-slate-300">
                    {concern}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Actions */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="mb-5 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-cyan-400" />

            <h3 className="text-lg font-semibold text-white">
              Recommended Actions
            </h3>
          </div>

          {recommendedActions.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <p className="text-sm leading-6 text-slate-400">
                No additional actions were recommended by
                the AI based on the current data.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendedActions.map(
                (action, index) => (
                  <div
                    key={`${action}-${index}`}
                    className="flex items-start gap-3 rounded-xl border border-cyan-500/10 bg-cyan-500/5 p-4"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-xs font-bold text-cyan-400">
                      {index + 1}
                    </span>

                    <p className="text-sm leading-6 text-slate-300">
                      {action}
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}