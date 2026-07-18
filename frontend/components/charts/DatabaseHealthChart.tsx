"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

// Chart colors
const COLORS = [
  "#22c55e",
  "#ef4444",
];

interface DatabaseHealthChartProps {
  data: {
    healthScore: number;
  } | null;
}

export default function DatabaseHealthChart({ data }: DatabaseHealthChartProps) {
  if (!data) {
    return (
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-lg hover:border-cyan-500/40 transition-all duration-300 h-[400px] flex items-center justify-center">
        <p className="text-gray-400 animate-pulse font-medium">Loading Database Health...</p>
      </div>
    );
  }

  const chartData = [
    {
      name: "Healthy",
      value: data.healthScore,
    },
    {
      name: "Issue",
      value: 100 - data.healthScore,
    },
  ];

  const isHealthy = data.healthScore >= 80;

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-lg hover:border-cyan-500/40 transition-all duration-300">

      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">

        <div>

          <h2 className="text-xl font-bold text-white">
            Database Health
          </h2>

          <p className="text-sm text-gray-400 mt-1">
            Overall database health status
          </p>

        </div>

        {/* Health Badge */}
        <div className="flex items-center gap-2">

          <span className={`w-2.5 h-2.5 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>

          <span className={`text-xs font-medium ${isHealthy ? 'text-green-400' : 'text-red-400'}`}>
            {isHealthy ? 'HEALTHY' : 'WARNING'}
          </span>

        </div>

      </div>

      {/* Donut Chart */}
      <ResponsiveContainer width="100%" height={320}>

        <PieChart>

          <Pie
            data={chartData}
            dataKey="value"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={4}
          >

            {chartData.map((entry, index) => (

              <Cell
                key={entry.name}
                fill={COLORS[index]}
              />

            ))}

          </Pie>

          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              border: "1px solid #334155",
              borderRadius: "12px",
              color: "#fff",
            }}
          />

          {/* Center Text */}
          <text
            x="50%"
            y="48%"
            textAnchor="middle"
            className="fill-white text-3xl font-bold"
          >
            {data.healthScore}%
          </text>

          <text
            x="50%"
            y="58%"
            textAnchor="middle"
            className="fill-slate-400 text-sm"
          >
            {isHealthy ? "Healthy" : "Needs Attention"}
          </text>

        </PieChart>

      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex justify-center gap-8 mt-2">

        <div className="flex items-center gap-2">

          <span className="w-3 h-3 rounded-full bg-green-500"></span>

          <span className="text-sm text-gray-300">
            Healthy
          </span>

        </div>

        <div className="flex items-center gap-2">

          <span className="w-3 h-3 rounded-full bg-red-500"></span>

          <span className="text-sm text-gray-300">
            Issues
          </span>

        </div>

      </div>

    </div>
  );
}