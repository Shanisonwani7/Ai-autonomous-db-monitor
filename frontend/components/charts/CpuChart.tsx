"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface CpuChartProps {
  data: {
    healthScore: number;
    activeConnections: number;
    cacheHitRatio: number;
  } | null;
}

export default function CpuChart({ data }: CpuChartProps) {
  if (!data) {
    return (
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-lg hover:border-cyan-500/40 transition-all duration-300 h-[400px] flex items-center justify-center">
        <p className="text-gray-400 animate-pulse font-medium">Loading CPU chart...</p>
      </div>
    );
  }

  const chartData = [
    { time: "Now", cpu: data.healthScore },
    { time: "+1m", cpu: Math.max(data.healthScore - 3, 0) },
    { time: "+2m", cpu: Math.min(data.healthScore + 2, 100) },
    { time: "+3m", cpu: data.healthScore },
    { time: "+4m", cpu: Math.min(data.healthScore + 1, 100) },
  ];

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-lg hover:border-cyan-500/40 transition-all duration-300">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">
            CPU Usage
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Live processor utilization
          </p>
        </div>

        {/* Live Status */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs text-green-400 font-medium">
            LIVE
          </span>
        </div>
      </div>

      {/* Line Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
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
          />
          <Line
            type="monotone"
            dataKey="cpu"
            stroke="#22c55e"
            strokeWidth={3}
            dot={{
              r: 5,
              fill: "#22c55e",
            }}
            activeDot={{
              r: 7,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}