"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Database,
  Lock,
  RefreshCw,
  AlertTriangle,
  BarChart3,
  Clock,
  HardDrive,
} from "lucide-react";

import { useDatabase } from "@/context/DatabaseContext";
import { getMonitoringHistory } from "@/services/monitoring";

interface MonitoringHistory {
  id: number;
  databaseId: number;
  timestamp: string;
  activeConnections: number;
  databaseSize: string | null;
  cacheHitRatio: number | null;
  commits: number;
  rollbacks: number;
  deadlocks: number;
  runningQueries: number;
  slowQueries: number;
  locks: number;
  longTransactions: number;
  idleSessions: number;
  healthScore: number | null;
}

export default function AnalyticsPage() {
  const { databases, selectedDatabaseId } = useDatabase();

  const [history, setHistory] = useState<MonitoringHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const selectedDatabase = databases.find(
    (db) => db.id === selectedDatabaseId
  );

  const loadHistory = async () => {
    if (!selectedDatabaseId) {
      setHistory([]);
      setLoading(false);
      return;
    }

    try {
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication token not found. Please login again.");
        setHistory([]);
        return;
      }

      setRefreshing(true);

      const response = await getMonitoringHistory(
        selectedDatabaseId,
        token
      );

      if (!response?.success) {
        throw new Error(
          response?.message || "Failed to load monitoring history."
        );
      }

      const records = Array.isArray(response.data)
        ? response.data
        : [];

      setHistory(records);
    } catch (err) {
      console.error("Analytics history error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load analytics data."
      );

      setHistory([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [selectedDatabaseId]);

  /*
   * Backend history newest -> oldest.
   * latest = newest monitoring record.
   */
  const latest = history.length > 0 ? history[0] : null;

  /*
   * Oldest record is useful for comparing
   * current state with historical state.
   */
  const oldest =
    history.length > 0
      ? history[history.length - 1]
      : null;

  const analytics = useMemo(() => {
    if (history.length === 0) {
      return {
        averageConnections: 0,
        maxConnections: 0,
        averageRunningQueries: 0,
        maxRunningQueries: 0,
        totalSlowQueries: 0,
        totalDeadlocks: 0,
        totalRollbacks: 0,
        totalLocks: 0,
      };
    }

    const totalConnections = history.reduce(
      (sum, item) => sum + (item.activeConnections || 0),
      0
    );

    const totalRunningQueries = history.reduce(
      (sum, item) => sum + (item.runningQueries || 0),
      0
    );

    const totalSlowQueries = history.reduce(
      (sum, item) => sum + (item.slowQueries || 0),
      0
    );

    const totalDeadlocks = history.reduce(
      (sum, item) => sum + (item.deadlocks || 0),
      0
    );

    const totalRollbacks = history.reduce(
      (sum, item) => sum + (item.rollbacks || 0),
      0
    );

    const totalLocks = history.reduce(
      (sum, item) => sum + (item.locks || 0),
      0
    );

    const maxConnections = Math.max(
      ...history.map((item) => item.activeConnections || 0)
    );

    const maxRunningQueries = Math.max(
      ...history.map((item) => item.runningQueries || 0)
    );

    return {
      averageConnections: (
        totalConnections / history.length
      ).toFixed(1),

      maxConnections,

      averageRunningQueries: (
        totalRunningQueries / history.length
      ).toFixed(1),

      maxRunningQueries,

      totalSlowQueries,

      totalDeadlocks,

      totalRollbacks,

      totalLocks,
    };
  }, [history]);

  /*
   * Real connection chart data.
   */
  const connectionChart = useMemo(() => {
    return [...history]
      .reverse()
      .map((item) => ({
        time: new Date(item.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        value: item.activeConnections || 0,
      }));
  }, [history]);

  /*
   * Real query activity data.
   */
  const queryChart = useMemo(() => {
    return [...history]
      .reverse()
      .map((item) => ({
        time: new Date(item.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        running: item.runningQueries || 0,
        slow: item.slowQueries || 0,
      }));
  }, [history]);

  /*
   * Current connection trend.
   */
  const connectionTrend = useMemo(() => {
    if (!latest || !oldest) return "No comparison";

    const difference =
      latest.activeConnections -
      oldest.activeConnections;

    if (difference > 0) {
      return `+${difference} from earliest record`;
    }

    if (difference < 0) {
      return `${difference} from earliest record`;
    }

    return "Stable";
  }, [latest, oldest]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-8">
        <div className="max-w-7xl mx-auto">

          <h1 className="text-3xl font-bold">
            Analytics
          </h1>

          <p className="text-slate-400 mt-2">
            Loading real database monitoring data...
          </p>

          <div className="flex items-center justify-center h-80">
            <RefreshCw
              size={32}
              className="text-cyan-400 animate-spin"
            />
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>
            <div className="flex items-center gap-3">

              <BarChart3
                size={30}
                className="text-cyan-400"
              />

              <h1 className="text-3xl font-bold">
                Analytics
              </h1>

            </div>

            <p className="text-slate-400 mt-2">
              Historical performance analysis for{" "}
              <span className="text-cyan-400 font-medium">
                {selectedDatabase?.name || "Selected Database"}
              </span>
            </p>
          </div>

          <button
            onClick={loadHistory}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 disabled:opacity-50 transition"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
            <AlertTriangle size={20} />

            <span>{error}</span>
          </div>
        )}

        {/* No database */}
        {!selectedDatabaseId && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">

            <Database
              size={45}
              className="mx-auto text-slate-500"
            />

            <h2 className="text-xl font-semibold mt-4">
              No Database Selected
            </h2>

            <p className="text-slate-400 mt-2">
              Select a monitored database from the navbar.
            </p>

          </div>
        )}

        {/* No history */}
        {selectedDatabaseId &&
          !error &&
          history.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">

              <Database
                size={45}
                className="mx-auto text-slate-500"
              />

              <h2 className="text-xl font-semibold mt-4">
                No Historical Data
              </h2>

              <p className="text-slate-400 mt-2">
                Monitoring records have not been collected
                for this database yet.
              </p>

            </div>
          )}

        {/* REAL DATA */}
        {history.length > 0 && (
          <>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

              <AnalyticsCard
                title="Active Connections"
                value={latest?.activeConnections ?? 0}
                subtitle={`Average ${analytics.averageConnections}`}
                icon={<Activity size={22} />}
              />

              <AnalyticsCard
                title="Running Queries"
                value={latest?.runningQueries ?? 0}
                subtitle={`Peak ${analytics.maxRunningQueries}`}
                icon={<Clock size={22} />}
              />

              <AnalyticsCard
                title="Slow Queries"
                value={latest?.slowQueries ?? 0}
                subtitle={`Total ${analytics.totalSlowQueries}`}
                icon={<AlertTriangle size={22} />}
              />

              <AnalyticsCard
                title="Deadlocks"
                value={latest?.deadlocks ?? 0}
                subtitle={`Total ${analytics.totalDeadlocks}`}
                icon={<Lock size={22} />}
              />

            </div>

            {/* Connection Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

                <div className="flex items-start justify-between mb-6">

                  <div>
                    <h2 className="text-xl font-semibold">
                      Connection Activity
                    </h2>

                    <p className="text-sm text-slate-400 mt-1">
                      Real active connection history
                    </p>
                  </div>

                  <Activity className="text-green-400" />
                </div>

                <div className="flex items-end gap-3">

                  <span className="text-4xl font-bold">
                    {latest?.activeConnections ?? 0}
                  </span>

                  <span className="text-sm text-slate-400 mb-1">
                    current
                  </span>

                </div>

                <p className="text-sm text-slate-400 mt-2">
                  {connectionTrend}
                </p>

                {/* Real CSS chart */}
                <div className="mt-8 h-48 flex items-end gap-1">

                  {connectionChart.map((point, index) => {

                    const maxValue = Math.max(
                      ...connectionChart.map(
                        (item) => item.value
                      ),
                      1
                    );

                    const height =
                      (point.value / maxValue) * 100;

                    return (
                      <div
                        key={`${point.time}-${index}`}
                        className="flex-1 h-full flex items-end group"
                        title={`${point.time}: ${point.value} connections`}
                      >
                        <div
                          className="w-full bg-green-500/70 hover:bg-green-400 rounded-t transition-all"
                          style={{
                            height: `${Math.max(
                              height,
                              3
                            )}%`,
                          }}
                        />
                      </div>
                    );
                  })}

                </div>

                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>
                    {connectionChart[0]?.time || ""}
                  </span>

                  <span>
                    {connectionChart[
                      connectionChart.length - 1
                    ]?.time || ""}
                  </span>
                </div>

              </div>

              {/* Query Activity */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

                <div className="flex items-start justify-between mb-6">

                  <div>
                    <h2 className="text-xl font-semibold">
                      Query Activity
                    </h2>

                    <p className="text-sm text-slate-400 mt-1">
                      Running and slow queries
                    </p>
                  </div>

                  <Activity className="text-cyan-400" />
                </div>

                <div className="grid grid-cols-2 gap-4">

                  <div className="bg-slate-800/60 rounded-xl p-4">

                    <p className="text-sm text-slate-400">
                      Running
                    </p>

                    <p className="text-3xl font-bold mt-1">
                      {latest?.runningQueries ?? 0}
                    </p>

                  </div>

                  <div className="bg-slate-800/60 rounded-xl p-4">

                    <p className="text-sm text-slate-400">
                      Slow
                    </p>

                    <p className="text-3xl font-bold text-orange-400 mt-1">
                      {latest?.slowQueries ?? 0}
                    </p>

                  </div>

                </div>

                <div className="mt-8 space-y-4">

                  {queryChart
                    .slice(-10)
                    .map((point, index) => {

                      const maxQuery = Math.max(
                        ...queryChart.map(
                          (item) =>
                            Math.max(
                              item.running,
                              item.slow
                            )
                        ),
                        1
                      );

                      return (
                        <div
                          key={`${point.time}-${index}`}
                        >
                          <div className="flex justify-between text-xs mb-1">

                            <span className="text-slate-500">
                              {point.time}
                            </span>

                            <span className="text-slate-400">
                              {point.running} running /{" "}
                              {point.slow} slow
                            </span>

                          </div>

                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">

                            <div
                              className="h-full bg-cyan-500 rounded-full"
                              style={{
                                width: `${
                                  (point.running /
                                    maxQuery) *
                                  100
                                }%`,
                              }}
                            />

                          </div>
                        </div>
                      );
                    })}

                </div>

              </div>

            </div>

            {/* Database Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

              {/* Database */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

                <div className="flex items-center gap-3 mb-6">

                  <div className="p-3 rounded-xl bg-cyan-500/10">
                    <HardDrive className="text-cyan-400" />
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold">
                      Database Metrics
                    </h2>

                    <p className="text-sm text-slate-400">
                      Latest monitoring snapshot
                    </p>
                  </div>

                </div>

                <MetricRow
                  label="Database Size"
                  value={
                    latest?.databaseSize || "N/A"
                  }
                />

                <MetricRow
                  label="Cache Hit Ratio"
                  value={
                    latest?.cacheHitRatio !== null &&
                    latest?.cacheHitRatio !== undefined
                      ? `${latest.cacheHitRatio}%`
                      : "N/A"
                  }
                />

                <MetricRow
                  label="Active Connections"
                  value={
                    latest?.activeConnections ?? 0
                  }
                />

                <MetricRow
                  label="Idle Sessions"
                  value={
                    latest?.idleSessions ?? 0
                  }
                />

                <MetricRow
                  label="Health Score"
                  value={
                    latest?.healthScore !== null &&
                    latest?.healthScore !== undefined
                      ? `${latest.healthScore}%`
                      : "N/A"
                  }
                />

              </div>

              {/* Transactions */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

                <div className="flex items-center gap-3 mb-6">

                  <div className="p-3 rounded-xl bg-purple-500/10">
                    <Activity className="text-purple-400" />
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold">
                      Transactions & Locks
                    </h2>

                    <p className="text-sm text-slate-400">
                      Latest database activity
                    </p>
                  </div>

                </div>

                <MetricRow
                  label="Commits"
                  value={latest?.commits ?? 0}
                />

                <MetricRow
                  label="Rollbacks"
                  value={latest?.rollbacks ?? 0}
                />

                <MetricRow
                  label="Locks"
                  value={latest?.locks ?? 0}
                />

                <MetricRow
                  label="Long Transactions"
                  value={
                    latest?.longTransactions ?? 0
                  }
                />

                <MetricRow
                  label="Deadlocks"
                  value={
                    latest?.deadlocks ?? 0
                  }
                />

              </div>

            </div>

            {/* Historical Table */}
            <div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-6">

              <div className="flex items-center justify-between mb-6">

                <div>
                  <h2 className="text-xl font-semibold">
                    Monitoring History
                  </h2>

                  <p className="text-sm text-slate-400 mt-1">
                    Real records returned by the monitoring API
                  </p>
                </div>

                <span className="px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 text-sm">
                  {history.length} records
                </span>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">

                      <th className="text-left py-3 px-3">
                        Time
                      </th>

                      <th className="text-left py-3 px-3">
                        Connections
                      </th>

                      <th className="text-left py-3 px-3">
                        Running
                      </th>

                      <th className="text-left py-3 px-3">
                        Slow
                      </th>

                      <th className="text-left py-3 px-3">
                        Locks
                      </th>

                      <th className="text-left py-3 px-3">
                        Deadlocks
                      </th>

                      <th className="text-left py-3 px-3">
                        Size
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {history
                      .slice(0, 20)
                      .map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-slate-800/60 hover:bg-slate-800/40 transition"
                        >

                          <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                            {new Date(
                              item.timestamp
                            ).toLocaleString([], {
                              month: "short",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </td>

                          <td className="py-3 px-3">
                            {item.activeConnections}
                          </td>

                          <td className="py-3 px-3">
                            {item.runningQueries}
                          </td>

                          <td
                            className={`py-3 px-3 ${
                              item.slowQueries > 0
                                ? "text-orange-400"
                                : "text-slate-300"
                            }`}
                          >
                            {item.slowQueries}
                          </td>

                          <td className="py-3 px-3">
                            {item.locks}
                          </td>

                          <td
                            className={`py-3 px-3 ${
                              item.deadlocks > 0
                                ? "text-red-400"
                                : "text-green-400"
                            }`}
                          >
                            {item.deadlocks}
                          </td>

                          <td className="py-3 px-3">
                            {item.databaseSize || "N/A"}
                          </td>

                        </tr>
                      ))}

                  </tbody>

                </table>

              </div>

            </div>

            {/* Last Updated */}
            {latest && (
              <div className="flex items-center justify-end gap-2 text-xs text-slate-500 mt-4">

                <Clock size={14} />

                Last monitoring record:{" "}
                {new Date(
                  latest.timestamp
                ).toLocaleString()}

              </div>
            )}

          </>
        )}

      </div>
    </div>
  );
}

/* -------------------------------- */
/* Reusable Analytics Card */
/* -------------------------------- */

function AnalyticsCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-cyan-500/40 transition">

      <div className="flex items-center justify-between">

        <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
          {icon}
        </div>

      </div>

      <p className="text-sm text-slate-400 mt-5">
        {title}
      </p>

      <p className="text-3xl font-bold mt-1">
        {value}
      </p>

      <p className="text-xs text-slate-500 mt-2">
        {subtitle}
      </p>

    </div>
  );
}
/* Metric Row */


function MetricRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-800 last:border-b-0">

      <span className="text-slate-400">
        {label}
      </span>

      <span className="text-white font-semibold">
        {value}
      </span>

    </div>
  );
}