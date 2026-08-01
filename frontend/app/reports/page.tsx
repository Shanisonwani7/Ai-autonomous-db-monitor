"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Database,
  DatabaseZap,
  Loader2,
  XCircle,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { getReport } from "@/services/reportService";
import { ReportResponse } from "@/types/report";
import DownloadButton from "@/components/reports/DownloadButton";
import ReportSummary from "@/components/reports/ReportSummary";
import ReportTable from "@/components/reports/ReportTable";
import { useDatabase } from "@/context/DatabaseContext";

type HealthStatus = "healthy" | "warning" | "critical";

function getHealthStatus(report: ReportResponse): HealthStatus {
  const { monitoring } = report.report;

  const locks = monitoring.locks;
  const slowQueries = monitoring.slowQueries;
  const longTransactions = monitoring.longTransactions;
  // runningQueries may not exist on every report payload; default to 0 if absent.
  const runningQueries = (monitoring as { runningQueries?: number }).runningQueries ?? 0;

  const isCritical =
    locks >= 20 || longTransactions >= 5 || runningQueries >= 50;

  const isWarning =
    !isCritical && (locks >= 5 || slowQueries >= 5 || longTransactions > 0);

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

// Loading spinner
function CenteredSpinner({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
        <p className="text-sm text-slate-400">{label}</p>
      </div>
    </div>
  );
}

// No database yet
function NoDatabaseEmptyState() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-6">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl shadow-lg p-12 max-w-lg w-full text-center">
        <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
          <DatabaseZap className="w-10 h-10 text-cyan-400" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">
          No Database Connected
        </h2>

        <p className="text-gray-400 mb-8 leading-relaxed">
          Please add your first PostgreSQL database to generate reports.
        </p>

        <button
          onClick={() => router.push("/database")}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow-lg hover:shadow-cyan-500/30 hover:-translate-y-0.5 transition-all duration-300"
        >
          <Database className="w-5 h-5" />
          Add Database
        </button>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { selectedDatabaseId, loading: databaseLoading } = useDatabase();

  const [report, setReport] = useState<ReportResponse | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState("");

  // Report fetch: only runs when a real selectedDatabaseId exists.
  useEffect(() => {
    if (!selectedDatabaseId) {
      setReport(null);
      return;
    }

    async function fetchReport(id: number) {
      try {
        setReportLoading(true);
        setError("");
        const data = await getReport(id);
        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setReportLoading(false);
      }
    }

    fetchReport(selectedDatabaseId);
  }, [selectedDatabaseId]);

  return (
    <div className="flex bg-slate-950">
      <Sidebar />

      <main className="ml-72 flex-1 min-h-screen">
        <Navbar />

        {databaseLoading ? (
          // Loading State: DatabaseContext still resolving
          <CenteredSpinner label="Loading Your Workspace..." />
        ) : !selectedDatabaseId ? (
          // No Database State: user has no databases yet
          <NoDatabaseEmptyState />
        ) : reportLoading ? (
          // Report Loading State: fetching report for the selected database
          <CenteredSpinner label="Loading report..." />
        ) : error ? (
          <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
            <div className="flex max-w-md flex-col items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">
              <XCircle className="h-8 w-8 text-red-400" />
              <p className="font-medium text-red-400">{error}</p>
            </div>
          </div>
        ) : !report ? (
          <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
            <div className="flex max-w-md flex-col items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-10 text-center">
              <DatabaseZap className="h-10 w-10 text-slate-500" />
              <p className="text-lg font-semibold text-white">No report available</p>
              <p className="text-sm text-slate-400">
                Please try again later.
              </p>
            </div>
          </div>
        ) : (
          // Report State: report fetched successfully
          <div className="min-h-screen bg-slate-950 text-white">
            <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">
              {/* Header */}
              <div className="mb-10 flex flex-col gap-6 border-b border-slate-800 pb-8 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                      Database Report
                    </h1>
                    <HealthBadge status={getHealthStatus(report)} />
                  </div>
                  <p className="max-w-xl text-sm text-slate-400 sm:text-base">
                    Real-time monitoring report generated from your PostgreSQL database.
                  </p>
                  <p className="mt-2 text-xs font-medium text-slate-500 sm:text-sm">
                    Generated: {new Date(report.generatedAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex shrink-0 md:justify-end">
                  <DownloadButton databaseId={selectedDatabaseId} />
                </div>
              </div>

              {/* Content */}
              <div className="space-y-10">
                <ReportSummary report={report} />
                <ReportTable report={report} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}