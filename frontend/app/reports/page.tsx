"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { getReport } from "@/services/reportService";
import { ReportResponse } from "@/types/report";
import DownloadButton from "@/components/reports/DownloadButton";
import ReportSummary from "@/components/reports/ReportSummary";
import ReportTable from "@/components/reports/ReportTable";

type HealthStatus = "healthy" | "warning" | "critical";

function getHealthStatus(report: ReportResponse): HealthStatus {
  const { monitoring } = report.report;

  const isCritical = monitoring.locks > 0 || monitoring.longTransactions > 2;
  const isWarning =
    !isCritical && (monitoring.slowQueries > 0 || monitoring.longTransactions > 0);

  if (isCritical) return "critical";
  if (isWarning) return "warning";
  return "healthy";
}

const HEALTH_CONFIG: Record<
  HealthStatus,
  {
    label: string;
    icon: typeof CheckCircle2;
    className: string;
  }
> = {
  healthy: {
    label: "Healthy",
    icon: CheckCircle2,
    className: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  },
  warning: {
    label: "Needs Attention",
    icon: AlertCircle,
    className: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
  },
  critical: {
    label: "Critical",
    icon: XCircle,
    className: "bg-red-500/10 text-red-400 ring-red-500/20",
  },
};

function HealthBadge({ status }: { status: HealthStatus }) {
  const config = HEALTH_CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

export default function ReportsPage() {
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchReport() {
      try {
        // Abhi database id = 2
        const data = await getReport(2);

        setReport(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
          <p className="text-sm text-slate-400">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex max-w-md flex-col items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <XCircle className="h-8 w-8 text-red-400" />
          <p className="font-medium text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const status = getHealthStatus(report);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-6 border-b border-slate-800 pb-8 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Database Report
              </h1>
              <HealthBadge status={status} />
            </div>
            <p className="max-w-xl text-sm text-slate-400 sm:text-base">
              Real-time monitoring report generated from your PostgreSQL database.
            </p>
            <p className="mt-2 text-xs font-medium text-slate-500 sm:text-sm">
              Generated: {new Date(report.generatedAt).toLocaleString()}
            </p>
          </div>

          <div className="flex shrink-0 md:justify-end">
            <DownloadButton databaseId={2} />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-10">
          <ReportSummary report={report} />
          <ReportTable report={report} />
        </div>
      </div>
    </div>
  );
}