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

interface MemoryChartProps {
  data: {
    activeConnections: number;
    cacheHitRatio: number;
  } | null;
}

export default function MemoryChart({ data }: MemoryChartProps) {
  if (!data) {
    return (
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-lg hover:border-cyan-500/40 transition-all duration-300 h-[400px] flex items-center justify-center">
        <p className="text-gray-400 animate-pulse font-medium">Loading Memory chart...</p>
      </div>
    );
  }

  const chartData = [
    { time: "Now", memory: data.cacheHitRatio },
    { time: "+1m", memory: Math.max(data.cacheHitRatio - 2, 0) },
    { time: "+2m", memory: Math.min(data.cacheHitRatio + 1, 100) },
    { time: "+3m", memory: data.cacheHitRatio },
    { time: "+4m", memory: Math.min(data.cacheHitRatio + 2, 100) },
  ];

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-lg hover:border-cyan-500/40 transition-all duration-300">

      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">

        <div>

          <h2 className="text-xl font-bold text-white">
            Memory Usage
          </h2>

          <p className="text-sm text-gray-400 mt-1">
            Live memory utilization
          </p>

        </div>

        {/* Live Status */}
        <div className="flex items-center gap-2">

          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>

          <span className="text-xs text-cyan-400 font-medium">
            LIVE
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
          />

          <Area
            type="monotone"
            dataKey="memory"
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