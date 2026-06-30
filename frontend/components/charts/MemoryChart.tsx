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

// Sample memory usage data
const data = [
  { time: "10 AM", memory: 35 },
  { time: "11 AM", memory: 42 },
  { time: "12 PM", memory: 48 },
  { time: "1 PM", memory: 45 },
  { time: "2 PM", memory: 50 },
];

export default function MemoryChart() {
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

        <AreaChart data={data}>

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