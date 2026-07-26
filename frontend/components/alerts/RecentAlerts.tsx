"use client";
import { useEffect, useState } from "react";
import { getAlerts } from "@/services/alertsService";
import { AlertTriangle } from "lucide-react";
interface RecentAlertsProps {
  data: {
    name: string;
    healthScore: number;
    deadlocks: number;
    activeConnections: number;
    cacheHitRatio: number;
    status: string;
    lastCheck: string;
  } | null;

  databaseId: number;
  token: string;
  showHeader?: boolean;
}

export default function RecentAlerts({
  data,
  databaseId,
  token,
  showHeader = true,
}: RecentAlertsProps) {
  const [alerts, setAlerts] = useState<any[]>([]);
const [loadingAlerts, setLoadingAlerts] = useState(true);

useEffect(() => {
  async function loadAlerts() {
    try {
      const response = await getAlerts(databaseId, token);
      setAlerts(response.alerts || []);
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    } finally {
      setLoadingAlerts(false);
    }
  }

  loadAlerts();
}, [databaseId, token]);
  if (!data) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg hover:border-red-500/40 transition-all duration-300 h-full min-h-[300px] flex items-center justify-center">
        <p className="text-gray-400 animate-pulse font-medium">Loading alerts...</p>
      </div>
    );
  }
  if (loadingAlerts) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex items-center justify-center">
      <p className="text-gray-400">Loading alerts...</p>
    </div>
   );
  }
 const generatedAlerts = alerts;

return (
  <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg hover:border-red-500/40 transition-all duration-300">

    {showHeader && (
      <div className="flex items-center justify-between mb-6">

        {/* Left */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Recent Alerts
            </h2>

            <p className="text-sm text-gray-400">
              Latest database events
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
          {generatedAlerts.length} Alerts
        </div>

      </div>
    )}
      {/* Alerts Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-slate-700 text-gray-400 text-sm">
              <th className="text-left pb-4">Time</th>
              <th className="text-left pb-4">Database</th>
              <th className="text-left pb-4">Severity</th>
              <th className="text-left pb-4">Status</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {generatedAlerts.map((alert, index) => (
              <tr
                key={index}
                className="border-b border-slate-700/60 hover:bg-slate-700/30 transition-colors"
              >
                <td className="py-4 text-gray-300">
                 {alert.time
                  ? new Date(alert.time).toLocaleTimeString([], {
                     hour: "2-digit",
                     minute: "2-digit",
                    })
                  : "--"}
                </td>

                <td className="font-medium text-white">{alert.database}</td>

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      alert.severity === "High"
                        ? "bg-red-500/10 text-red-400"
                        : alert.severity === "Medium"
                        ? "bg-yellow-500/10 text-yellow-400"
                        : "bg-green-500/10 text-green-400"
                    }`}
                  >
                    {alert.severity}
                  </span>
                </td>

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      alert.status === "Healthy" || alert.status === "Resolved"
                        ? "bg-green-500/10 text-green-400"
                        : alert.status === "Investigating"
                        ? "bg-yellow-500/10 text-yellow-400"
                        : "bg-cyan-500/10 text-cyan-400"
                    }`}
                  >
                    {alert.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}