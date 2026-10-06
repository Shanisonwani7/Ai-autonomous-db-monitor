"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  XCircle,
} from "lucide-react";

import {
  getAlerts,
  getAlertHistory,
  resolveAlert,
  type AlertItem,
} from "@/services/alertsService";

import { showBrowserNotification } from "@/services/notificationService";

interface RecentAlertsProps {
  databaseId: number;
  token: string;
  showHeader?: boolean;
}

export default function RecentAlerts({
  databaseId,
  token,
  showHeader = true,
}: RecentAlertsProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [databaseName, setDatabaseName] = useState("");
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const knownAlertIds = useRef<Set<number>>(new Set());
  const firstLoad = useRef(true);

  async function loadAlerts(showRefresh = false) {
    if (!databaseId || !token) {
      setAlerts([]);
      setLoadingAlerts(false);
      return;
    }

    try {
      if (showRefresh) {
        setRefreshing(true);
      } else if (firstLoad.current) {
        setLoadingAlerts(true);
      }

      const response = await getAlerts(
        databaseId,
        token
      );

      setAlerts(response.alerts || []);
      setDatabaseName(response.database || "");
      setError("");
    } catch (error) {
      console.error(
        "Failed to load alerts:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load alerts"
      );

      if (firstLoad.current) {
        setAlerts([]);
      }
    } finally {
      setLoadingAlerts(false);
      setRefreshing(false);
    }
  }

  async function checkForNewAlerts() {
    if (!databaseId || !token) {
      return;
    }

    try {
      const response = await getAlertHistory(
        databaseId,
        token,
        50
      );

      const historyAlerts = response.alerts || [];

      if (firstLoad.current) {
        historyAlerts.forEach((alert) => {
          knownAlertIds.current.add(alert.id);
        });

        firstLoad.current = false;
        return;
      }

      const newAlerts = historyAlerts.filter(
        (alert) =>
          !knownAlertIds.current.has(alert.id)
      );

      for (const alert of newAlerts) {
        showBrowserNotification(
          `${alert.severity} Database Alert`,
          {
            body: response.database
              ? `${response.database}: ${alert.message}`
              : alert.message,
            tag: `database-alert-${alert.id}`,
          }
        );
      }

      historyAlerts.forEach((alert) => {
        knownAlertIds.current.add(alert.id);
      });
    } catch (error) {
      console.error(
        "Failed to check alert history:",
        error
      );
    }
  }

  async function loadAll(showRefresh = false) {
    await loadAlerts(showRefresh);
    await checkForNewAlerts();
  }

  async function handleResolve(alertId: number) {
    try {
      setResolvingId(alertId);
      setError("");

      await resolveAlert(alertId, token);

      setAlerts((currentAlerts) =>
        currentAlerts.filter(
          (alert) => alert.id !== alertId
        )
      );
    } catch (error) {
      console.error(
        "Failed to resolve alert:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to resolve alert"
      );
    } finally {
      setResolvingId(null);
    }
  }

  useEffect(() => {
    firstLoad.current = true;
    knownAlertIds.current.clear();

    loadAll();

    const interval = setInterval(() => {
      loadAll();
    }, 30 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [databaseId, token]);

  if (loadingAlerts) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center gap-3 text-gray-300">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading alerts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Recent Alerts
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Latest database events
              {databaseName
                ? ` • ${databaseName}`
                : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadAll(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />
            Refresh
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          <XCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {alerts.length === 0 ? (
        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-10 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-400" />

          <h3 className="mt-4 text-lg font-semibold text-white">
            No Active Alerts
          </h3>

          <p className="mt-2 text-sm text-gray-400">
            No active database issues were detected from
            the latest PostgreSQL monitoring data.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="border-b border-white/10 bg-white/[0.03]">
                <tr className="text-left text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-4">Time</th>
                  <th className="px-5 py-4">Database</th>
                  <th className="px-5 py-4">Severity</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Message</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {alerts.map((alert) => (
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
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                          alert.severity ===
                          "Critical"
                            ? "bg-red-500/15 text-red-400"
                            : alert.severity ===
                              "High"
                            ? "bg-orange-500/15 text-orange-400"
                            : alert.severity ===
                              "Medium"
                            ? "bg-yellow-500/15 text-yellow-400"
                            : "bg-blue-500/15 text-blue-400"
                        }`}
                      >
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {alert.severity}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400">
                        {alert.status}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-300">
                      {alert.type}
                    </td>

                    <td className="max-w-md px-5 py-4 text-sm text-gray-400">
                      <div>{alert.message}</div>

                      {alert.metric && (
                        <div className="mt-1 text-xs text-gray-500">
                          {alert.metric}

                          {alert.actualValue !==
                            null &&
                          alert.actualValue !==
                            undefined
                            ? ` = ${alert.actualValue}`
                            : ""}

                          {alert.threshold !== null &&
                          alert.threshold !==
                            undefined
                            ? ` | Threshold: ${alert.threshold}`
                            : ""}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          handleResolve(
                            alert.id
                          )
                        }
                        disabled={
                          resolvingId ===
                          alert.id
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-xs font-medium text-green-400 transition hover:bg-green-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {resolvingId ===
                        alert.id ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            Resolving...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-3.5 w-3.5" />
                            Resolve
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-500">
        {alerts.length} active alert
        {alerts.length === 1 ? "" : "s"}
      </div>
    </div>
  );
}