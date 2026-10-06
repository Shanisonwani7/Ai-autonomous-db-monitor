"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle,
  Clock,
  RefreshCw,
  XCircle,
} from "lucide-react";
import {
  getAlertHistory,
  type AlertItem,
} from "@/services/alertsService";

interface AlertHistoryProps {
  databaseId: number;
  token: string;
}

export default function AlertHistory({
  databaseId,
  token,
}: AlertHistoryProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [databaseName, setDatabaseName] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<
    "all" | "active" | "resolved"
  >("all");

  async function loadHistory(showRefresh = false) {
    if (!databaseId || !token) {
      setAlerts([]);
      setLoading(false);
      return;
    }

    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getAlertHistory(
        databaseId,
        token,
        50
      );

      setAlerts(response.alerts || []);
      setDatabaseName(response.database || "");
    } catch (error) {
      console.error("Failed to load alert history:", error);

      setAlerts([]);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load alert history"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, [databaseId, token]);

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === "active") {
      return alert.status !== "Resolved";
    }

    if (filter === "resolved") {
      return alert.status === "Resolved";
    }

    return true;
  });

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center gap-3 text-gray-300">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading alert history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Alert History
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Previous database alerts
            {databaseName ? ` • ${databaseName}` : ""}
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadHistory(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              refreshing ? "animate-spin" : ""
            }`}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          <XCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`rounded-lg px-4 py-2 text-sm transition ${
            filter === "all"
              ? "bg-white text-black"
              : "border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
          }`}
        >
          All ({alerts.length})
        </button>

        <button
          type="button"
          onClick={() => setFilter("active")}
          className={`rounded-lg px-4 py-2 text-sm transition ${
            filter === "active"
              ? "bg-white text-black"
              : "border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
          }`}
        >
          Active (
          {
            alerts.filter(
              (alert) => alert.status !== "Resolved"
            ).length
          }
          )
        </button>

        <button
          type="button"
          onClick={() => setFilter("resolved")}
          className={`rounded-lg px-4 py-2 text-sm transition ${
            filter === "resolved"
              ? "bg-white text-black"
              : "border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
          }`}
        >
          Resolved (
          {
            alerts.filter(
              (alert) => alert.status === "Resolved"
            ).length
          }
          )
        </button>
      </div>

      {filteredAlerts.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
          <Clock className="mx-auto h-12 w-12 text-gray-500" />

          <h3 className="mt-4 text-lg font-semibold text-white">
            No Alert History
          </h3>

          <p className="mt-2 text-sm text-gray-400">
            No alerts are available for this database yet.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead className="border-b border-white/10 bg-white/[0.03]">
                <tr className="text-left text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-4">Created</th>
                  <th className="px-5 py-4">Database</th>
                  <th className="px-5 py-4">Severity</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Message</th>
                  <th className="px-5 py-4">Resolved</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {filteredAlerts.map((alert) => (
                  <tr
                    key={alert.id}
                    className="transition hover:bg-white/[0.02]"
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-300">
                      {new Date(
                        alert.createdAt
                      ).toLocaleString()}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-300">
                      {databaseName ||
                        `Database #${alert.databaseId}`}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          alert.severity === "Critical"
                            ? "bg-red-500/15 text-red-400"
                            : alert.severity === "High"
                            ? "bg-orange-500/15 text-orange-400"
                            : alert.severity === "Medium"
                            ? "bg-yellow-500/15 text-yellow-400"
                            : "bg-blue-500/15 text-blue-400"
                        }`}
                      >
                        {alert.severity}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {alert.status === "Resolved" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Resolved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400">
                          <Clock className="h-3.5 w-3.5" />
                          {alert.status}
                        </span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-300">
                      {alert.type}
                    </td>

                    <td className="max-w-md px-5 py-4 text-sm text-gray-400">
                      <div>{alert.message}</div>

                      {alert.metric && (
                        <div className="mt-1 text-xs text-gray-500">
                          {alert.metric}
                          {alert.actualValue !== null &&
                          alert.actualValue !== undefined
                            ? ` = ${alert.actualValue}`
                            : ""}
                          {alert.threshold !== null &&
                          alert.threshold !== undefined
                            ? ` | Threshold: ${alert.threshold}`
                            : ""}
                        </div>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-400">
                      {alert.resolvedAt
                        ? new Date(
                            alert.resolvedAt
                          ).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-500">
        Showing {filteredAlerts.length} of {alerts.length} alerts
      </div>
    </div>
  );
}