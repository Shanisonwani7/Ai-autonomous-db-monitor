"use client";

import { Brain, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";

// AI Recommendation Panel
export default function AIRecommendation() {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg hover:border-cyan-500/40 transition-all duration-300">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">

        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
            <Brain className="w-6 h-6 text-cyan-400" />
          </div>

          <div>

            <h2 className="text-2xl font-bold text-white">
              AI Recommendation
            </h2>

            <p className="text-sm text-gray-400">
              Intelligent optimization suggestions
            </p>

          </div>

        </div>

        <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium">
          AI Active
        </div>

      </div>

      {/* AI Confidence */}
      <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 mb-5">

        <div className="flex items-center justify-between">

          <span className="text-gray-400">
            AI Confidence
          </span>

          <span className="text-cyan-400 font-bold">
            96%
          </span>

        </div>

        <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">

          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
            style={{ width: "96%" }}
          />

        </div>

      </div>

      {/* Recommendation List */}
      <div className="space-y-4">

        <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 hover:border-green-500/40 transition">

          <div className="flex items-center gap-3">

            <CheckCircle2 className="text-green-400 w-5 h-5" />

            <p className="text-green-400 font-semibold">
              CPU Usage is Normal
            </p>

          </div>

        </div>

        <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 hover:border-cyan-500/40 transition">

          <div className="flex items-center gap-3">

            <CheckCircle2 className="text-cyan-400 w-5 h-5" />

            <p className="text-cyan-400 font-semibold">
              Memory Usage Stable
            </p>

          </div>

        </div>

        <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 hover:border-yellow-500/40 transition">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <AlertTriangle className="text-yellow-400 w-5 h-5" />

              <p className="text-yellow-400 font-semibold">
                Slow Query Detected
              </p>

            </div>

            <span className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded-full">
              Medium
            </span>

          </div>

          <p className="text-gray-400 mt-3">
            Query execution time is higher than expected.
          </p>

        </div>

      </div>

      {/* AI Suggestion */}
      <div className="mt-6 bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-5">

        <div className="flex items-center gap-3 mb-3">

          <Sparkles className="text-cyan-400 w-5 h-5" />

          <h3 className="text-cyan-400 font-bold">
            AI Suggestion
          </h3>

        </div>

        <p className="text-gray-300 leading-7">
          Create an index on
          <span className="text-cyan-400 font-semibold">
            {" "}users.email
          </span>
          {" "}to improve query performance.
        </p>

        <div className="flex items-center justify-between mt-5">

          <span className="text-green-400 font-semibold">
            Estimated Gain: +35%
          </span>

          <button className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white text-sm transition">
            Apply Suggestion
          </button>

        </div>

      </div>

    </div>
  );
}