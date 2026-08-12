"use client";
import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMonitoring } from "../../hooks/useMonitoring";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/layout/Navbar";

import CpuChart from "../../components/charts/CpuChart";
import MemoryChart from "../../components/charts/MemoryChart";
import DatabaseHealthChart from "../../components/charts/DatabaseHealthChart";
import QueryOptimizer from "../../components/Ai/QueryOptimizer";
import AIRecommendation from "../../components/Ai/AIRecommendation";
import RecentAlerts from "../../components/alerts/RecentAlerts";
import DatabaseStatus from "../../components/database/DatabaseStatus";
import { useMonitoringHistory } from "../../hooks/useMonitoringHistory";
import {
  Cpu,
  MemoryStick,
  Database,
  AlertTriangle,
  DatabaseZap,
  LucideIcon,
} from "lucide-react";
import { useDatabase } from "@/context/DatabaseContext";

// Dashboard Card Properties
interface StatCardProps {
  title: string;
  value: string;
  status: string;
  valueColor: string;
  statusColor: string;
  icon: LucideIcon;
  iconBg: string;
  progress: number;
}

// Reusable Dashboard Card
function StatCard({
  title,
  value,
  status,
  valueColor,
  statusColor,
  icon: Icon,
  iconBg,
  progress,
}: StatCardProps) {
  return (
    <div className="group bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-6 shadow-lg hover:shadow-cyan-500/20 hover:border-cyan-500/40 hover:-translate-y-2 transition-all duration-300">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <div
          className={`p-3 rounded-xl ${iconBg} group-hover:scale-110 transition`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {/* Card Value */}
      <h2 className={`text-4xl font-bold mt-5 ${valueColor}`}>{value}</h2>

      {/* Card Status */}
      <div className="flex items-center justify-between mt-4">
        <p className={`text-sm font-medium ${statusColor}`}>{status}</p>
        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
      </div>

      {/* Progress Bar */}
      <div className="mt-5 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
    </div>
  );
}

// Section Heading
function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-5">
      <h3 className="text-2xl font-semibold text-white">{title}</h3>
      {subtitle && (
        <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>
      )}
    </div>
  );
}

// Shared full-page centered spinner shell — used both while
// DatabaseContext is resolving and while monitoring data is loading,
// so the two loading states look identical to the user but are
// triggered by completely independent conditions.
function CenteredSpinner({ label }: { label: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-cyan-400 font-medium text-lg">{label}</p>
      </div>
    </div>
  );
}

// Empty State — shown only once DatabaseContext has finished loading
// and confirmed the user has no connected database. Lives outside
// DashboardContent so useMonitoring (and the monitoring API) is never
// invoked in this branch.
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
          You have not added any database yet. Please connect your first
          PostgreSQL database to begin monitoring.
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

// Dashboard Content — only ever mounted when a real selectedDatabaseId
// exists. Owns the useMonitoring call and all monitoring-dependent UI,
// so the hook and its underlying API calls only ever run for users who
// actually have a connected database. Monitoring loading/error states
// are handled entirely independently of DatabaseContext's own loading
// state, which is resolved before this component is ever rendered.
function DashboardContent({
  selectedDatabaseId,
  token,
}: {
  selectedDatabaseId: number;
  token: string;
}) {
  const {
  history,
  loading: historyLoading,
  error: historyError,
} = useMonitoringHistory(selectedDatabaseId, token);
console.log("HISTORY FROM HOOK:", history);
  const { data, loading, error } = useMonitoring(selectedDatabaseId, token);

  // Dashboard Statistics — recomputed only when the underlying
  // monitoring data actually changes, not on every render.
  const stats: StatCardProps[] = useMemo(
    () => [
      {
        title: "Database Health",
        value: data?.healthScore !== undefined ? `${data.healthScore}%` : "0%",
        status: data?.healthScore >= 80 ? "● Excellent" : "Requires Attention",
        valueColor: data?.healthScore >= 80 ? "text-green-400" : "text-red-400",
        statusColor: data?.healthScore >= 80 ? "text-green-400" : "text-red-400",
        icon: Database,
        iconBg: data?.healthScore >= 80 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400",
        progress: data?.healthScore || 0,
      },
      {
        title: "Active Connections",
        value: data?.activeConnections !== undefined ? `${data.activeConnections}` : "0",
        status: "▲ Stable",
        valueColor: "text-cyan-400",
        statusColor: "text-cyan-400",
        icon: Cpu,
        iconBg: "bg-cyan-500/10 text-cyan-400",
        progress: data?.activeConnections !== undefined ? Math.min(data.activeConnections * 10, 100) : 0,
      },
      {
        title: "Cache Hit Ratio",
        value: data?.cacheHitRatio !== undefined ? `${data.cacheHitRatio}%` : "0%",
        status: data?.cacheHitRatio >= 90 ? "● Optimal" : "▲ Fair",
        valueColor: data?.cacheHitRatio >= 90 ? "text-green-400" : "text-cyan-400",
        statusColor: data?.cacheHitRatio >= 90 ? "text-green-400" : "text-cyan-400",
        icon: MemoryStick,
        iconBg: data?.cacheHitRatio >= 90 ? "bg-green-500/10 text-green-400" : "bg-cyan-500/10 text-cyan-400",
        progress: data?.cacheHitRatio || 0,
      },
      {
        title: "Deadlocks",
        value: data?.deadlocks !== undefined ? `${data.deadlocks}` : "0",
        status: data?.deadlocks > 0 ? "Requires Attention" : "● Clear",
        valueColor: data?.deadlocks > 0 ? "text-red-400" : "text-green-400",
        statusColor: data?.deadlocks > 0 ? "text-red-400" : "text-green-400",
        icon: AlertTriangle,
        iconBg: data?.deadlocks > 0 ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400",
        progress: data?.deadlocks === 0 ? 100 : 20,
      },
    ],
    [data]
  );

  // Current Date — only needs to be computed once per mount, not on
  // every re-render triggered by monitoring data updates.
  const today = useMemo(
    () =>
      new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    []
  );

  if (loading) {
    return <CenteredSpinner label="Loading Monitoring Data..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/50 p-8 rounded-2xl text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-400 mb-2">
            System Error
          </h2>
          <p className="text-gray-400">
            {String(error || "Failed to load database monitoring data. Please try again later.")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Dashboard Header */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-10">
        <div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-white via-cyan-300 to-blue-400 bg-clip-text text-transparent">
            AI Autonomous Database Monitoring Platform
          </h1>
          <p className="text-gray-400 mt-3 text-lg">
            Real-time AI-powered monitoring, prediction and optimization for cloud databases.
          </p>
        </div>

        <div className="bg-slate-800/70 backdrop-blur-md px-6 py-5 rounded-2xl border border-slate-700 shadow-lg">
          <p className="text-xs uppercase tracking-widest text-gray-400">
            Date
          </p>
          <h2 className="text-2xl font-bold text-cyan-400 mt-2">{today}</h2>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="mt-12">
        <SectionHeader
          title="Performance Trends"
          subtitle="Historical database performance monitoring"
        />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/30 transition">
            <CpuChart history={history} />
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/30 transition">
            <MemoryChart history={history} />
          </div>
        </div>
      </div>

      {/* Database Health */}
      <div className="mt-12">
        <SectionHeader
          title="Database Health Overview"
          subtitle="Overall database health and performance"
        />
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/30 transition">
          <DatabaseHealthChart data={data} />
        </div>
      </div>

      {/* AI Recommendation */}
      <div className="mt-12">
        <SectionHeader
          title="AI Recommendations"
          subtitle="AI-generated optimization recommendations"
        />
        <AIRecommendation data={data} />
      </div>
      {/* AI Query Optimizer */}
      <div className="mt-12">
        <SectionHeader
          title="AI Query Optimizer"
          subtitle="Analyze SQL queries and receive AI-powered optimization suggestions"
        />
        <QueryOptimizer />
      </div>
      {/* Bottom Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-12">
        {/* Recent Alerts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">
              Recent Alerts
            </h2>

            <Link
              href="/alerts"
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
            >
              View All →
            </Link>
          </div>

         <RecentAlerts
            databaseId={selectedDatabaseId}
            token={token}
          />
        </div>

        {/* Database Status */}
        <DatabaseStatus data={data} />
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800 pt-6 pb-2">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-gray-500 text-sm">
            © 2026 AI Autonomous Database Monitoring Platform
          </p>
          <p className="text-gray-500 text-sm">
            Built with Next.js • Tailwind CSS • Spring Boot • PostgreSQL
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function Dashboard() {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || ""
      : "";

  // `loading` here is DatabaseContext's own loading state — completely
  // independent from useMonitoring's loading state inside
  // DashboardContent. They are never conflated.
  const { selectedDatabaseId, loading: databaseLoading } = useDatabase();

  return (
    <div className="flex bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="ml-72 flex-1 min-h-screen text-white">
        <Navbar />

        {databaseLoading ? (
          // Step 1: DatabaseContext is still resolving which
          // database(s) belong to this user — never render the empty
          // state or the dashboard until this finishes.
          <CenteredSpinner label="Loading Your Workspace..." />
        ) : selectedDatabaseId ? (
          // Step 3: A database is selected — safe to load monitoring.
          <DashboardContent
            selectedDatabaseId={selectedDatabaseId}
            token={token}
          />
        ) : (
          // Step 2: DatabaseContext finished and confirmed there is no
          // database for this user.
          <NoDatabaseEmptyState />
        )}
      </main>
    </div>
  );
}