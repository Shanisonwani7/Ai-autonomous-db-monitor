"use client";

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import type {
  TrendMetric,
  ReportResponse,
} from "@/types/report";

interface HistoricalAnalysisProps {
  analysis: ReportResponse["report"]["historicalAnalysis"];
}

function formatNumber(value: number, decimals = 2) {
  if (!Number.isFinite(value)) {
    return "N/A";
  }

  return value.toFixed(decimals);
}

function getTrendConfig(trend: string) {
  const normalized = trend.toLowerCase();

  if (
    normalized.includes("increas") ||
    normalized.includes("up") ||
    normalized.includes("improv")
  ) {
    return {
      label: "Increasing",
      icon: TrendingUp,
      className: "text-emerald-400 bg-emerald-500/10",
    };
  }

  if (
    normalized.includes("decreas") ||
    normalized.includes("down") ||
    normalized.includes("declin")
  ) {
    return {
      label: "Decreasing",
      icon: TrendingDown,
      className: "text-amber-400 bg-amber-500/10",
    };
  }

  if (
    normalized.includes("stable") ||
    normalized.includes("no change") ||
    normalized.includes("unchanged")
  ) {
    return {
      label: "Stable",
      icon: Minus,
      className: "text-sky-400 bg-sky-500/10",
    };
  }

  return {
    label: trend || "Insufficient Data",
    icon: Activity,
    className: "text-slate-400 bg-slate-500/10",
  };
}

function ChangeIndicator({
  metric,
}: {
  metric: TrendMetric;
}) {
  const change = Number(metric.absoluteChange ?? 0);

  if (!Number.isFinite(change) || change === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
        <Minus className="h-3.5 w-3.5" />
        No change
      </span>
    );
  }

  if (change > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
        <ArrowUpRight className="h-3.5 w-3.5" />
        {formatNumber(Math.abs(change))}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs text-amber-400">
      <ArrowDownRight className="h-3.5 w-3.5" />
      {formatNumber(Math.abs(change))}
    </span>
  );
}

function MetricCard({
  label,
  metric,
  unit = "",
}: {
  label: string;
  metric: TrendMetric;
  unit?: string;
}) {
  const trendConfig = getTrendConfig(metric.trend);
  const TrendIcon = trendConfig.icon;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm transition hover:border-slate-700 hover:bg-slate-900">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-300">
            {label}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Historical performance
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${trendConfig.className}`}
        >
          <TrendIcon className="h-3.5 w-3.5" />
          {trendConfig.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-500">First</p>

          <p className="mt-1 text-lg font-semibold text-white">
            {formatNumber(metric.first)}
            {unit}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">Latest</p>

          <p className="mt-1 text-lg font-semibold text-white">
            {formatNumber(metric.latest)}
            {unit}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">Minimum</p>

          <p className="mt-1 text-sm font-medium text-slate-300">
            {formatNumber(metric.min)}
            {unit}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">Maximum</p>

          <p className="mt-1 text-sm font-medium text-slate-300">
            {formatNumber(metric.max)}
            {unit}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">Average</p>

          <p className="mt-1 text-sm font-medium text-slate-300">
            {formatNumber(metric.average)}
            {unit}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">Change</p>

          <div className="mt-1">
            <ChangeIndicator metric={metric} />
          </div>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-800 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Percentage Change
          </span>

          <span className="text-sm font-semibold text-white">
            {formatNumber(metric.percentChange)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default function HistoricalAnalysis({
  analysis,
}: HistoricalAnalysisProps) {
  const hasData = analysis.recordCount >= 2;

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Historical Analysis
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Trend analysis based on collected database monitoring
            history.
          </p>
        </div>

        <div className="text-xs text-slate-500">
          Records analyzed:{" "}
          <span className="font-semibold text-slate-300">
            {analysis.recordCount}
          </span>
        </div>
      </div>

      {/* Analysis Period */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 px-5 py-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Earliest Record
            </p>

            <p className="mt-1 text-sm font-medium text-slate-300">
              {analysis.earliestTimestamp
                ? new Date(
                    analysis.earliestTimestamp
                  ).toLocaleString()
                : "N/A"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Latest Record
            </p>

            <p className="mt-1 text-sm font-medium text-slate-300">
              {analysis.latestTimestamp
                ? new Date(
                    analysis.latestTimestamp
                  ).toLocaleString()
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* No sufficient history */}
      {!hasData ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
          <div className="flex items-start gap-3">
            <Activity className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />

            <div>
              <h3 className="font-semibold text-amber-300">
                Insufficient Historical Data
              </h3>

              <p className="mt-1 text-sm leading-relaxed text-slate-400">
                More monitoring records are required to calculate
                meaningful database trends.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            label="Health Score"
            metric={analysis.metrics.healthScore}
          />

          <MetricCard
            label="Active Connections"
            metric={analysis.metrics.activeConnections}
          />

          <MetricCard
            label="Slow Queries"
            metric={analysis.metrics.slowQueries}
          />

          <MetricCard
            label="Locks"
            metric={analysis.metrics.locks}
          />

          <MetricCard
            label="Cache Hit Ratio"
            metric={analysis.metrics.cacheHitRatio}
            unit="%"
          />
        </div>
      )}
    </section>
  );
}