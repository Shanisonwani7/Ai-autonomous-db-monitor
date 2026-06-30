"use client";

import { AlertTriangle } from "lucide-react";

// Sample alerts data
// This will be replaced with backend API data later.
const alerts = [
  {
    time: "10:15 AM",
    database: "PostgreSQL",
    severity: "High",
    status: "Open",
  },
  {
    time: "10:40 AM",
    database: "MongoDB",
    severity: "Medium",
    status: "Investigating",
  },
  {
    time: "11:10 AM",
    database: "MySQL",
    severity: "Low",
    status: "Resolved",
  },
];

export default function RecentAlerts() {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg hover:border-red-500/40 transition-all duration-300">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">

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

        <div className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
          {alerts.length} Alerts
        </div>

      </div>

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

            {alerts.map((alert, index) => (

              <tr
                key={index}
                className="border-b border-slate-700/60 hover:bg-slate-700/30 transition-colors"
              >

                <td className="py-4 text-gray-300">
                  {alert.time}
                </td>

                <td className="font-medium text-white">
                  {alert.database}
                </td>

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
                      alert.status === "Resolved"
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