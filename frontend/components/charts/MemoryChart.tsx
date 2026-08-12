"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

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

interface MemoryChartProps {
  history: MonitoringHistory[];
}

export default function MemoryChart({ history }: MemoryChartProps) {
  if (!history || history.length === 0) {
    return (
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-lg hover:border-cyan-500/40 transition-all duration-300 h-[400px] flex items-center justify-center">
        <p className="text-gray-400 animate-pulse font-medium">
          Loading historical monitoring data...
        </p>
      </div>
    );
  }

  const chartData = [...history]
    .reverse()
    .filter((item) => item.databaseSize)
    .map((item) => {
      const sizeInKB = parseFloat(
        item.databaseSize?.replace(/[^\d.]/g, "") || "0"
      );

      return {
        time: new Date(item.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        databaseSize: sizeInKB,
      };
    });

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-lg hover:border-cyan-500/40 transition-all duration-300">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">
            Database Size
          </h2>

          <p className="text-sm text-gray-400 mt-1">
            Historical PostgreSQL database size
          </p>
        </div>

        {/* Historical Status */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>

          <span className="text-xs text-cyan-400 font-medium">
            HISTORICAL
          </span>
        </div>
      </div>

      {/* Area Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <CartesianGrid
            strokeDasharray="4 4"
            stroke="#334155"
          />

          <XAxis
            dataKey="time"
            stroke="#94a3b8"
          />

          <YAxis
            stroke="#94a3b8"
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              border: "1px solid #334155",
              borderRadius: "12px",
              color: "#fff",
            }}
           formatter={(value) => [
              `${value ?? 0} KB`,
               "Database Size",
            ]}
          />

          <Area
            type="monotone"
            dataKey="databaseSize"
            name="Database Size"
            stroke="#06b6d4"
            strokeWidth={3}
            fill="#06b6d4"
            fillOpacity={0.25}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}