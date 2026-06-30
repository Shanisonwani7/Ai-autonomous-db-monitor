"use client";

import { Database } from "lucide-react";

// Sample database status data
// This data will come from the backend API in future.
const databases = [
  {
    name: "PostgreSQL",
    status: "Online",
    uptime: "99.99%",
    response: "12 ms",
    connections: 128,
    color: "bg-green-500",
    badge: "text-green-400 bg-green-500/10",
  },
  {
    name: "MongoDB",
    status: "Online",
    uptime: "99.97%",
    response: "18 ms",
    connections: 96,
    color: "bg-green-500",
    badge: "text-green-400 bg-green-500/10",
  },
  {
    name: "MySQL",
    status: "Online",
    uptime: "99.95%",
    response: "20 ms",
    connections: 84,
    color: "bg-green-500",
    badge: "text-green-400 bg-green-500/10",
  },
  {
    name: "Redis",
    status: "Warning",
    uptime: "98.80%",
    response: "42 ms",
    connections: 35,
    color: "bg-yellow-500",
    badge: "text-yellow-400 bg-yellow-500/10",
  },
];

export default function DatabaseStatus() {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg hover:border-cyan-500/40 transition-all duration-300">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">

        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
            <Database className="w-6 h-6 text-cyan-400" />
          </div>

          <div>

            <h2 className="text-2xl font-bold text-white">
              Database Status
            </h2>

            <p className="text-sm text-gray-400">
              Live database availability
            </p>

          </div>

        </div>

        <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-medium">
          {databases.length} Databases
        </div>

      </div>

      {/* Database List */}
      <div className="space-y-4">

        {databases.map((db) => (

          <div
            key={db.name}
            className="bg-slate-900 rounded-xl border border-slate-700 hover:border-cyan-500/30 p-5 transition-all duration-300"
          >

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <span
                  className={`w-3 h-3 rounded-full ${db.color}`}
                ></span>

                <h3 className="text-white font-semibold">
                  {db.name}
                </h3>

              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${db.badge}`}
              >
                {db.status}
              </span>

            </div>

            <div className="grid grid-cols-3 gap-4 mt-5 text-sm">

              <div>

                <p className="text-gray-400">
                  Uptime
                </p>

                <p className="text-white font-medium">
                  {db.uptime}
                </p>

              </div>

              <div>

                <p className="text-gray-400">
                  Response
                </p>

                <p className="text-cyan-400 font-medium">
                  {db.response}
                </p>

              </div>

              <div>

                <p className="text-gray-400">
                  Connections
                </p>

                <p className="text-white font-medium">
                  {db.connections}
                </p>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}